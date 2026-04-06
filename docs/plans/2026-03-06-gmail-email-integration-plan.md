# Gmail Email Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let users connect their Gmail, view filtered emails from opposing counsel per case, and get AI-drafted reply suggestions.

**Architecture:** Google OAuth 2.0 with `gmail.readonly` scope stores encrypted tokens in a `connected_accounts` table. Per-case email filters define which senders to monitor. Emails are fetched live from Gmail API (never stored locally). Claude generates reply drafts using case context.

**Tech Stack:** Next.js 16 App Router, Supabase/Postgres, Google OAuth 2.0, Gmail API (REST), Anthropic SDK (Claude), AES-256 encryption via Node.js `crypto`

---

### Task 1: Database Migration — Connected Accounts & Email Filters

**Files:**
- Create: `supabase/migrations/20260306000001_gmail_integration.sql`

**Context:** The app uses Supabase with RLS. All migrations are in `supabase/migrations/`. Latest migration is `20260305200001`. RLS policies join through `cases.user_id = auth.uid()`.

**Step 1: Write the migration**

```sql
-- Gmail integration: connected accounts + email filters

-- 1. Connected accounts (stores encrypted OAuth tokens)
CREATE TABLE public.connected_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider text NOT NULL CHECK (provider IN ('gmail')),
  email text NOT NULL,
  access_token_encrypted text NOT NULL,
  refresh_token_encrypted text NOT NULL,
  token_expires_at timestamptz NOT NULL,
  scopes text[] NOT NULL DEFAULT '{}',
  connected_at timestamptz DEFAULT now(),
  revoked_at timestamptz
);

-- Only one active connection per provider per user
CREATE UNIQUE INDEX idx_connected_accounts_active
  ON public.connected_accounts (user_id, provider)
  WHERE revoked_at IS NULL;

-- RLS
ALTER TABLE public.connected_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own connected accounts"
  ON public.connected_accounts FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own connected accounts"
  ON public.connected_accounts FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own connected accounts"
  ON public.connected_accounts FOR UPDATE
  USING (user_id = auth.uid());

-- 2. Case email filters (which senders to monitor per case)
CREATE TABLE public.case_email_filters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  email_address text NOT NULL,
  label text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_case_email_filters_case
  ON public.case_email_filters (case_id);

-- Prevent duplicate email per case
CREATE UNIQUE INDEX idx_case_email_filters_unique
  ON public.case_email_filters (case_id, email_address);

-- RLS (join through cases)
ALTER TABLE public.case_email_filters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own case email filters"
  ON public.case_email_filters FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.cases WHERE cases.id = case_email_filters.case_id AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own case email filters"
  ON public.case_email_filters FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.cases WHERE cases.id = case_email_filters.case_id AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own case email filters"
  ON public.case_email_filters FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.cases WHERE cases.id = case_email_filters.case_id AND cases.user_id = auth.uid()
  ));
```

**Step 2: Apply migration locally**

Run: `npx supabase migration up` (or `npx supabase db reset` if local)
Expected: Tables created, RLS enabled

**Step 3: Regenerate Supabase types**

Run: `npx supabase gen types typescript --local > src/lib/supabase/database.types.ts`
Expected: New types for `connected_accounts` and `case_email_filters`

**Step 4: Commit**

```bash
git add supabase/migrations/20260306000001_gmail_integration.sql src/lib/supabase/database.types.ts
git commit -m "feat: add connected_accounts and case_email_filters tables"
```

---

### Task 2: Token Encryption Utility

**Files:**
- Create: `src/lib/crypto/tokens.ts`

**Context:** OAuth tokens must be encrypted at rest. Use Node.js `crypto` module with AES-256-GCM. The key comes from `ENCRYPTION_KEY` env var.

**Step 1: Create the encryption utility**

```typescript
import { randomBytes, createCipheriv, createDecipheriv } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const TAG_LENGTH = 16

function getKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY
  if (!key || key.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be a 64-character hex string (32 bytes)')
  }
  return Buffer.from(key, 'hex')
}

export function encryptToken(plaintext: string): string {
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, getKey(), iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  // Format: iv:tag:ciphertext (all hex)
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`
}

export function decryptToken(encrypted: string): string {
  const [ivHex, tagHex, ciphertextHex] = encrypted.split(':')
  if (!ivHex || !tagHex || !ciphertextHex) {
    throw new Error('Invalid encrypted token format')
  }
  const iv = Buffer.from(ivHex, 'hex')
  const tag = Buffer.from(tagHex, 'hex')
  const ciphertext = Buffer.from(ciphertextHex, 'hex')
  const decipher = createDecipheriv(ALGORITHM, getKey(), iv)
  decipher.setAuthTag(tag)
  return decipher.update(ciphertext).toString('utf8') + decipher.final('utf8')
}
```

**Step 2: Verify build**

Run: `npx tsc --noEmit --pretty 2>&1 | grep "tokens.ts" || echo "No errors"`
Expected: No errors

**Step 3: Commit**

```bash
git add src/lib/crypto/tokens.ts
git commit -m "feat: add AES-256-GCM token encryption utility"
```

---

### Task 3: Google OAuth Flow — Initiate + Callback

**Files:**
- Create: `src/app/api/auth/google/route.ts` (initiate OAuth)
- Create: `src/app/api/auth/google/callback/route.ts` (handle callback)

**Context:** The app uses `getAuthenticatedClient()` from `src/lib/supabase/route-handler.ts` for auth in all API routes. OAuth callback exchanges code for tokens, encrypts them, and stores in `connected_accounts`. After success, redirect to `/settings`.

**Step 1: Create the OAuth initiation endpoint**

File: `src/app/api/auth/google/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'

export async function GET() {
  const auth = await getAuthenticatedClient()
  if (!auth.ok) return auth.error

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/gmail.readonly',
    access_type: 'offline',
    prompt: 'consent',
    state: auth.user.id, // CSRF: verify in callback
  })

  return NextResponse.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`)
}
```

**Step 2: Create the OAuth callback endpoint**

File: `src/app/api/auth/google/callback/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { encryptToken } from '@/lib/crypto/tokens'

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo'

export async function GET(request: NextRequest) {
  const auth = await getAuthenticatedClient()
  if (!auth.ok) return auth.error
  const { supabase, user } = auth

  const code = request.nextUrl.searchParams.get('code')
  const state = request.nextUrl.searchParams.get('state')
  const error = request.nextUrl.searchParams.get('error')

  // Handle Google errors
  if (error) {
    const params = new URLSearchParams({ gmail_error: error })
    return NextResponse.redirect(new URL(`/settings?${params}`, request.url))
  }

  if (!code || state !== user.id) {
    return NextResponse.redirect(new URL('/settings?gmail_error=invalid_request', request.url))
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenRes.ok) {
      return NextResponse.redirect(new URL('/settings?gmail_error=token_exchange_failed', request.url))
    }

    const tokens = await tokenRes.json()

    // Get user's Gmail address
    const profileRes = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })
    const profile = await profileRes.json()

    // Revoke any existing connection for this user
    await supabase
      .from('connected_accounts')
      .update({ revoked_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('provider', 'gmail')
      .is('revoked_at', null)

    // Store encrypted tokens
    const { error: insertError } = await supabase
      .from('connected_accounts')
      .insert({
        user_id: user.id,
        provider: 'gmail',
        email: profile.email,
        access_token_encrypted: encryptToken(tokens.access_token),
        refresh_token_encrypted: encryptToken(tokens.refresh_token),
        token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        scopes: ['https://www.googleapis.com/auth/gmail.readonly'],
      })

    if (insertError) {
      console.error('[gmail-oauth] Failed to store tokens:', insertError.message)
      return NextResponse.redirect(new URL('/settings?gmail_error=storage_failed', request.url))
    }

    return NextResponse.redirect(new URL('/settings?gmail_connected=true', request.url))
  } catch (err) {
    console.error('[gmail-oauth] Unexpected error:', err)
    return NextResponse.redirect(new URL('/settings?gmail_error=unexpected', request.url))
  }
}
```

**Step 3: Verify build**

Run: `npx tsc --noEmit --pretty 2>&1 | grep -E "auth/google" || echo "No errors"`

**Step 4: Commit**

```bash
git add src/app/api/auth/google/route.ts src/app/api/auth/google/callback/route.ts
git commit -m "feat: add Google OAuth initiate and callback endpoints"
```

---

### Task 4: Gmail API Client Utility

**Files:**
- Create: `src/lib/gmail/client.ts`

**Context:** This utility handles token refresh and Gmail API calls. Used by all email-fetching endpoints. Uses the admin Supabase client (`src/lib/supabase/admin.ts`) to update tokens since RLS won't work in server-side token refresh contexts.

**Step 1: Create the Gmail client**

```typescript
import { createAdminClient } from '@/lib/supabase/admin'
import { encryptToken, decryptToken } from '@/lib/crypto/tokens'

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GMAIL_API_BASE = 'https://gmail.googleapis.com/gmail/v1/users/me'

interface GmailConnection {
  accessToken: string
  accountId: string
}

/**
 * Get a valid Gmail access token for a user, refreshing if expired.
 */
export async function getGmailConnection(userId: string): Promise<GmailConnection | null> {
  const admin = createAdminClient()

  const { data: account } = await admin
    .from('connected_accounts')
    .select('id, access_token_encrypted, refresh_token_encrypted, token_expires_at')
    .eq('user_id', userId)
    .eq('provider', 'gmail')
    .is('revoked_at', null)
    .single()

  if (!account) return null

  // Check if token needs refresh (5-minute buffer)
  const expiresAt = new Date(account.token_expires_at).getTime()
  const needsRefresh = Date.now() > expiresAt - 5 * 60 * 1000

  if (needsRefresh) {
    const refreshToken = decryptToken(account.refresh_token_encrypted)
    const res = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    })

    if (!res.ok) {
      // Refresh failed — token may be revoked by user in Google settings
      console.error('[gmail] Token refresh failed:', await res.text())
      await admin
        .from('connected_accounts')
        .update({ revoked_at: new Date().toISOString() })
        .eq('id', account.id)
      return null
    }

    const tokens = await res.json()
    await admin
      .from('connected_accounts')
      .update({
        access_token_encrypted: encryptToken(tokens.access_token),
        token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      })
      .eq('id', account.id)

    return { accessToken: tokens.access_token, accountId: account.id }
  }

  return {
    accessToken: decryptToken(account.access_token_encrypted),
    accountId: account.id,
  }
}

/**
 * Search Gmail messages matching a query.
 */
export async function searchGmailMessages(
  accessToken: string,
  query: string,
  pageToken?: string,
  maxResults = 20
) {
  const params = new URLSearchParams({
    q: query,
    maxResults: String(maxResults),
  })
  if (pageToken) params.set('pageToken', pageToken)

  const res = await fetch(`${GMAIL_API_BASE}/messages?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!res.ok) {
    throw new Error(`Gmail API error: ${res.status} ${await res.text()}`)
  }

  return res.json() as Promise<{
    messages?: { id: string; threadId: string }[]
    nextPageToken?: string
    resultSizeEstimate?: number
  }>
}

/**
 * Get a single Gmail message with full body.
 */
export async function getGmailMessage(accessToken: string, messageId: string) {
  const res = await fetch(`${GMAIL_API_BASE}/messages/${messageId}?format=full`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!res.ok) {
    throw new Error(`Gmail API error: ${res.status} ${await res.text()}`)
  }

  return res.json()
}

/**
 * Get a Gmail thread with all messages.
 */
export async function getGmailThread(accessToken: string, threadId: string) {
  const res = await fetch(`${GMAIL_API_BASE}/threads/${threadId}?format=full`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!res.ok) {
    throw new Error(`Gmail API error: ${res.status} ${await res.text()}`)
  }

  return res.json()
}

/**
 * Parse email body from Gmail message payload.
 * Gmail returns base64url-encoded parts.
 */
export function parseEmailBody(payload: Record<string, unknown>): string {
  // Simple text/plain messages
  const body = payload.body as { data?: string; size?: number } | undefined
  if (body?.data) {
    return Buffer.from(body.data, 'base64url').toString('utf8')
  }

  // Multipart messages — find text/plain or text/html
  const parts = payload.parts as Array<{
    mimeType: string
    body?: { data?: string }
    parts?: Array<{ mimeType: string; body?: { data?: string } }>
  }> | undefined

  if (!parts) return ''

  // Prefer text/plain
  for (const part of parts) {
    if (part.mimeType === 'text/plain' && part.body?.data) {
      return Buffer.from(part.body.data, 'base64url').toString('utf8')
    }
    // Check nested parts (multipart/alternative)
    if (part.parts) {
      for (const sub of part.parts) {
        if (sub.mimeType === 'text/plain' && sub.body?.data) {
          return Buffer.from(sub.body.data, 'base64url').toString('utf8')
        }
      }
    }
  }

  // Fallback to text/html
  for (const part of parts) {
    if (part.mimeType === 'text/html' && part.body?.data) {
      return Buffer.from(part.body.data, 'base64url').toString('utf8')
    }
  }

  return ''
}

/**
 * Extract headers from Gmail message payload.
 */
export function parseHeaders(
  headers: Array<{ name: string; value: string }>
): Record<string, string> {
  const result: Record<string, string> = {}
  for (const h of headers) {
    const key = h.name.toLowerCase()
    if (['from', 'to', 'subject', 'date', 'cc', 'message-id'].includes(key)) {
      result[key] = h.value
    }
  }
  return result
}
```

**Step 2: Verify build**

Run: `npx tsc --noEmit --pretty 2>&1 | grep "gmail/client" || echo "No errors"`

**Step 3: Commit**

```bash
git add src/lib/gmail/client.ts
git commit -m "feat: add Gmail API client with token refresh and message parsing"
```

---

### Task 5: Gmail Status & Disconnect Endpoints

**Files:**
- Create: `src/app/api/gmail/status/route.ts`
- Create: `src/app/api/auth/google/disconnect/route.ts`

**Step 1: Create status check endpoint**

File: `src/app/api/gmail/status/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'

export async function GET() {
  const auth = await getAuthenticatedClient()
  if (!auth.ok) return auth.error
  const { supabase, user } = auth

  const { data: account } = await supabase
    .from('connected_accounts')
    .select('id, email, connected_at')
    .eq('user_id', user.id)
    .eq('provider', 'gmail')
    .is('revoked_at', null)
    .maybeSingle()

  return NextResponse.json({
    connected: !!account,
    email: account?.email ?? null,
    connectedAt: account?.connected_at ?? null,
  })
}
```

**Step 2: Create disconnect endpoint**

File: `src/app/api/auth/google/disconnect/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { decryptToken } from '@/lib/crypto/tokens'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST() {
  const auth = await getAuthenticatedClient()
  if (!auth.ok) return auth.error
  const { user } = auth
  const admin = createAdminClient()

  // Get the active connection
  const { data: account } = await admin
    .from('connected_accounts')
    .select('id, access_token_encrypted')
    .eq('user_id', user.id)
    .eq('provider', 'gmail')
    .is('revoked_at', null)
    .single()

  if (!account) {
    return NextResponse.json({ error: 'No Gmail connection found' }, { status: 404 })
  }

  // Revoke the token at Google
  try {
    const token = decryptToken(account.access_token_encrypted)
    await fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, {
      method: 'POST',
    })
  } catch {
    // Non-fatal: continue even if Google revocation fails
  }

  // Mark as revoked in our DB
  await admin
    .from('connected_accounts')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', account.id)

  return NextResponse.json({ success: true })
}
```

**Step 3: Commit**

```bash
git add src/app/api/gmail/status/route.ts src/app/api/auth/google/disconnect/route.ts
git commit -m "feat: add Gmail status check and disconnect endpoints"
```

---

### Task 6: Email Filters CRUD Endpoints

**Files:**
- Create: `src/app/api/cases/[id]/email-filters/route.ts`
- Create: `src/app/api/cases/[id]/email-filters/[filterId]/route.ts`

**Context:** Follow the same auth pattern as other case endpoints. Validate case ownership via RLS.

**Step 1: Create list + add endpoint**

File: `src/app/api/cases/[id]/email-filters/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { z } from 'zod/v4'

const addFilterSchema = z.object({
  email_address: z.email(),
  label: z.string().max(100).optional(),
})

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthenticatedClient()
  if (!auth.ok) return auth.error
  const { supabase } = auth
  const { id: caseId } = await params

  const { data, error } = await supabase
    .from('case_email_filters')
    .select('id, email_address, label, created_at')
    .eq('case_id', caseId)
    .order('created_at')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthenticatedClient()
  if (!auth.ok) return auth.error
  const { supabase } = auth
  const { id: caseId } = await params

  const body = await request.json()
  const parsed = addFilterSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('case_email_filters')
    .insert({
      case_id: caseId,
      email_address: parsed.data.email_address.toLowerCase(),
      label: parsed.data.label ?? null,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'This email is already being monitored' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
```

**Step 2: Create delete endpoint**

File: `src/app/api/cases/[id]/email-filters/[filterId]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; filterId: string }> }
) {
  const auth = await getAuthenticatedClient()
  if (!auth.ok) return auth.error
  const { supabase } = auth
  const { filterId } = await params

  const { error } = await supabase
    .from('case_email_filters')
    .delete()
    .eq('id', filterId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
```

**Step 3: Commit**

```bash
git add src/app/api/cases/\[id\]/email-filters/route.ts src/app/api/cases/\[id\]/email-filters/\[filterId\]/route.ts
git commit -m "feat: add email filter CRUD endpoints"
```

---

### Task 7: Email Fetching Endpoints

**Files:**
- Create: `src/app/api/cases/[id]/emails/route.ts` (list filtered emails)
- Create: `src/app/api/cases/[id]/emails/[messageId]/route.ts` (get full email + thread)

**Context:** These endpoints fetch emails live from Gmail API using the user's stored tokens. They build a query from the case's email filters.

**Step 1: Create email list endpoint**

File: `src/app/api/cases/[id]/emails/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { getGmailConnection, searchGmailMessages, getGmailMessage, parseHeaders } from '@/lib/gmail/client'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthenticatedClient()
  if (!auth.ok) return auth.error
  const { supabase, user } = auth
  const { id: caseId } = await params

  // Get Gmail connection
  const gmail = await getGmailConnection(user.id)
  if (!gmail) {
    return NextResponse.json({ error: 'Gmail not connected' }, { status: 403 })
  }

  // Get email filters for this case
  const { data: filters } = await supabase
    .from('case_email_filters')
    .select('email_address')
    .eq('case_id', caseId)

  if (!filters || filters.length === 0) {
    return NextResponse.json({ emails: [], nextPageToken: null })
  }

  // Build Gmail search query
  const fromQuery = filters.map((f) => `from:${f.email_address}`).join(' OR ')
  const pageToken = request.nextUrl.searchParams.get('pageToken') ?? undefined

  try {
    const result = await searchGmailMessages(gmail.accessToken, fromQuery, pageToken)

    if (!result.messages || result.messages.length === 0) {
      return NextResponse.json({ emails: [], nextPageToken: null })
    }

    // Fetch headers for each message (subject, from, date)
    const emails = await Promise.all(
      result.messages.map(async (msg) => {
        const full = await getGmailMessage(gmail.accessToken, msg.id)
        const headers = parseHeaders(full.payload?.headers ?? [])
        return {
          id: msg.id,
          threadId: msg.threadId,
          from: headers.from ?? '',
          subject: headers.subject ?? '(no subject)',
          date: headers.date ?? '',
          snippet: full.snippet ?? '',
        }
      })
    )

    return NextResponse.json({
      emails,
      nextPageToken: result.nextPageToken ?? null,
    })
  } catch (err) {
    console.error('[gmail-fetch] Error:', err)
    return NextResponse.json({ error: 'Failed to fetch emails' }, { status: 502 })
  }
}
```

**Step 2: Create single email + thread endpoint**

File: `src/app/api/cases/[id]/emails/[messageId]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { getGmailConnection, getGmailThread, parseHeaders, parseEmailBody } from '@/lib/gmail/client'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  const auth = await getAuthenticatedClient()
  if (!auth.ok) return auth.error
  const { user } = auth
  const { messageId } = await params

  const gmail = await getGmailConnection(user.id)
  if (!gmail) {
    return NextResponse.json({ error: 'Gmail not connected' }, { status: 403 })
  }

  try {
    // First get the message to find its thread
    const { default: gmailClient } = await import('@/lib/gmail/client')
    const message = await gmailClient.getGmailMessage(gmail.accessToken, messageId)
    const threadId = message.threadId

    // Get full thread
    const thread = await getGmailThread(gmail.accessToken, threadId)

    const messages = (thread.messages ?? []).map((msg: Record<string, unknown>) => {
      const payload = msg.payload as Record<string, unknown>
      const headers = parseHeaders((payload?.headers ?? []) as Array<{ name: string; value: string }>)
      return {
        id: msg.id as string,
        from: headers.from ?? '',
        to: headers.to ?? '',
        subject: headers.subject ?? '',
        date: headers.date ?? '',
        body: parseEmailBody(payload),
      }
    })

    return NextResponse.json({ threadId, messages })
  } catch (err) {
    console.error('[gmail-thread] Error:', err)
    return NextResponse.json({ error: 'Failed to fetch email' }, { status: 502 })
  }
}
```

**Step 3: Commit**

```bash
git add src/app/api/cases/\[id\]/emails/route.ts src/app/api/cases/\[id\]/emails/\[messageId\]/route.ts
git commit -m "feat: add email list and thread fetching endpoints"
```

---

### Task 8: AI Reply Draft Endpoint

**Files:**
- Create: `src/app/api/cases/[id]/emails/[messageId]/draft-reply/route.ts`

**Context:** Uses Claude (Anthropic SDK) like the research `/ask` endpoint. Rate limited at 10/hour (ai tier). Loads case context for the prompt.

**Step 1: Create the draft reply endpoint**

File: `src/app/api/cases/[id]/emails/[messageId]/draft-reply/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { getGmailConnection, getGmailThread, parseHeaders, parseEmailBody } from '@/lib/gmail/client'
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rate-limit'

const AI_MODEL = 'claude-sonnet-4-20250514'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  const auth = await getAuthenticatedClient()
  if (!auth.ok) return auth.error
  const { supabase, user } = auth
  const { id: caseId, messageId } = await params

  // Rate limit
  const rl = checkRateLimit(user.id, 'ai_email_reply', RATE_LIMITS.ai.maxRequests, RATE_LIMITS.ai.windowMs)
  if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

  // Get Gmail connection
  const gmail = await getGmailConnection(user.id)
  if (!gmail) {
    return NextResponse.json({ error: 'Gmail not connected' }, { status: 403 })
  }

  // Get case context
  const { data: caseRow } = await supabase
    .from('cases')
    .select('dispute_type, role, county, court_type, status')
    .eq('id', caseId)
    .single()

  if (!caseRow) {
    return NextResponse.json({ error: 'Case not found' }, { status: 404 })
  }

  try {
    // Get the full message to find thread
    const { getGmailMessage } = await import('@/lib/gmail/client')
    const message = await getGmailMessage(gmail.accessToken, messageId)

    // Get full thread for context
    const thread = await getGmailThread(gmail.accessToken, message.threadId)

    // Format thread for the prompt
    const threadMessages = (thread.messages ?? []).map((msg: Record<string, unknown>) => {
      const payload = msg.payload as Record<string, unknown>
      const headers = parseHeaders((payload?.headers ?? []) as Array<{ name: string; value: string }>)
      return `From: ${headers.from}\nDate: ${headers.date}\nSubject: ${headers.subject}\n\n${parseEmailBody(payload)}`
    })

    const roleLabel = caseRow.role === 'plaintiff' ? 'plaintiff' : 'defendant'
    const disputeLabel = (caseRow.dispute_type ?? 'civil').replace(/_/g, ' ')

    const systemPrompt = `You are a legal communication assistant helping a self-represented ${roleLabel} in a ${disputeLabel} case in ${caseRow.county ?? 'Texas'}. The user needs to reply to an email from opposing counsel.

Guidelines:
- Draft a professional, measured reply
- Never admit liability or fault
- Never make concessions or agree to terms without explicit instruction from the user
- Be factual and reference specific dates or facts when relevant
- Keep the tone professional but firm — not aggressive, not passive
- If the email contains a settlement offer, acknowledge receipt but do not accept or reject
- If the email contains a deadline or legal demand, note it clearly
- If the email contains anything potentially concerning (threats, misrepresentations, or complex legal issues), add a note at the end flagging it for the user
- Add "[REVIEW BEFORE SENDING - AI-generated draft]" at the very top
- Do not include legal citations or case law references
- Keep the reply concise — match the length and formality of the incoming email`

    const userPrompt = `Here is the email thread (oldest first):\n\n${threadMessages.join('\n\n---\n\n')}\n\nPlease draft a reply to the most recent message.`

    const anthropic = new Anthropic()
    const response = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const draft = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('\n')

    // Audit log (no email content stored)
    const lastHeaders = parseHeaders(
      ((thread.messages?.at(-1) as Record<string, unknown>)?.payload as Record<string, unknown>)?.headers as Array<{ name: string; value: string }> ?? []
    )
    console.log(`[email-reply-audit] user=${user.id} case=${caseId} subject="${lastHeaders.subject ?? 'unknown'}"`)

    return NextResponse.json({ draft })
  } catch (err) {
    console.error('[email-reply] Error:', err)
    return NextResponse.json({ error: 'Failed to generate reply' }, { status: 500 })
  }
}
```

**Step 2: Commit**

```bash
git add src/app/api/cases/\[id\]/emails/\[messageId\]/draft-reply/route.ts
git commit -m "feat: add AI email reply draft endpoint with Claude"
```

---

### Task 9: Settings Page — Gmail Connection UI

**Files:**
- Modify: `src/app/(authenticated)/settings/page.tsx`

**Context:** Add a "Connected Services" card between the Notification Preferences and Data Export cards (after line 295, before line 297 in the current file). The settings page is a client component using `useState` for form state.

**Step 1: Add Gmail connection card to settings page**

Add the following section. The page already has `useState` and fetch patterns. Add a new state variable `gmailStatus` and a `useEffect` to fetch `/api/gmail/status` on mount.

At the top of the component, add state:
```typescript
const [gmailStatus, setGmailStatus] = useState<{
  connected: boolean
  email: string | null
} | null>(null)
const [disconnecting, setDisconnecting] = useState(false)
```

Add useEffect to fetch Gmail status:
```typescript
useEffect(() => {
  fetch('/api/gmail/status')
    .then((r) => r.json())
    .then(setGmailStatus)
    .catch(() => setGmailStatus({ connected: false, email: null }))
}, [])
```

Add the card JSX (between Notification Preferences and Data Export):
```tsx
{/* Connected Services */}
<Card>
  <CardHeader>
    <CardTitle className="text-lg">Connected Services</CardTitle>
    <p className="text-sm text-warm-muted">
      Connect your email to monitor communications from opposing counsel.
    </p>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warm-bg">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
            <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-warm-text">Gmail</p>
          {gmailStatus?.connected ? (
            <p className="text-xs text-warm-muted">{gmailStatus.email}</p>
          ) : (
            <p className="text-xs text-warm-muted">Not connected</p>
          )}
        </div>
      </div>
      {gmailStatus?.connected ? (
        <Button
          variant="outline"
          size="sm"
          disabled={disconnecting}
          onClick={async () => {
            setDisconnecting(true)
            try {
              await fetch('/api/auth/google/disconnect', { method: 'POST' })
              setGmailStatus({ connected: false, email: null })
            } finally {
              setDisconnecting(false)
            }
          }}
        >
          {disconnecting ? 'Disconnecting...' : 'Disconnect'}
        </Button>
      ) : (
        <Button
          size="sm"
          onClick={() => {
            window.location.href = '/api/auth/google'
          }}
        >
          Connect
        </Button>
      )}
    </div>
    {gmailStatus?.connected && (
      <p className="text-xs text-warm-muted">
        Read-only access. We can view your emails but cannot send, delete, or modify them.
      </p>
    )}
  </CardContent>
</Card>
```

Also handle URL params for success/error feedback after OAuth redirect. Add to the existing `useEffect` or a new one:
```typescript
useEffect(() => {
  const params = new URLSearchParams(window.location.search)
  if (params.get('gmail_connected') === 'true') {
    // Refresh Gmail status
    fetch('/api/gmail/status')
      .then((r) => r.json())
      .then(setGmailStatus)
    // Clean URL
    window.history.replaceState({}, '', '/settings')
  }
  if (params.get('gmail_error')) {
    // Could show a toast here; for now just clean URL
    window.history.replaceState({}, '', '/settings')
  }
}, [])
```

**Step 2: Verify build**

Run: `npx next build 2>&1 | tail -5`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/app/\(authenticated\)/settings/page.tsx
git commit -m "feat: add Gmail connection UI to settings page"
```

---

### Task 10: Case Emails Page — Email List & Filters UI

**Files:**
- Create: `src/app/(authenticated)/case/[id]/emails/page.tsx`

**Context:** New page at `/case/[id]/emails`. Server component that checks Gmail connection status, then renders a client component for the interactive email list. Follow the pattern of other case sub-pages (evidence, deadlines).

**Step 1: Create the emails page**

File: `src/app/(authenticated)/case/[id]/emails/page.tsx`

```tsx
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SupportiveHeader } from '@/components/layout/supportive-header'
import { CaseEmailsClient } from '@/components/emails/case-emails-client'

export default async function CaseEmailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: caseId } = await params
  const supabase = await createClient()

  // Check if user has Gmail connected
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: gmailAccount } = await supabase
    .from('connected_accounts')
    .select('email')
    .eq('user_id', user.id)
    .eq('provider', 'gmail')
    .is('revoked_at', null)
    .maybeSingle()

  // Get existing filters
  const { data: filters } = await supabase
    .from('case_email_filters')
    .select('id, email_address, label, created_at')
    .eq('case_id', caseId)
    .order('created_at')

  // Get case info for context
  const { data: caseRow } = await supabase
    .from('cases')
    .select('dispute_type, role')
    .eq('id', caseId)
    .single()

  return (
    <div className="min-h-screen bg-warm-bg">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link
          href={`/case/${caseId}`}
          className="text-sm text-warm-muted hover:text-warm-text mb-6 inline-block"
        >
          &larr; Back to dashboard
        </Link>

        <SupportiveHeader
          title="Email Monitor"
          subtitle="Track and respond to emails from opposing counsel."
        />

        {!gmailAccount ? (
          <Card className="mt-6">
            <CardContent className="pt-6 text-center py-12">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-warm-bg">
                <svg className="h-6 w-6 text-warm-muted" viewBox="0 0 24 24" fill="none">
                  <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-warm-text mb-2">
                Connect your Gmail
              </h2>
              <p className="text-sm text-warm-muted mb-4 max-w-md mx-auto">
                Connect your Gmail account to monitor emails from opposing counsel
                and get AI-powered reply suggestions.
              </p>
              <Link
                href="/settings"
                className="inline-flex items-center justify-center rounded-md bg-calm-indigo px-4 py-2 text-sm font-medium text-white hover:bg-calm-indigo/90 transition-colors"
              >
                Go to Settings to Connect
              </Link>
            </CardContent>
          </Card>
        ) : (
          <CaseEmailsClient
            caseId={caseId}
            gmailEmail={gmailAccount.email}
            initialFilters={filters ?? []}
            disputeType={caseRow?.dispute_type ?? null}
          />
        )}
      </div>
    </div>
  )
}
```

**Step 2: Commit** (just the page — client component in next task)

```bash
git add src/app/\(authenticated\)/case/\[id\]/emails/page.tsx
git commit -m "feat: add case emails page with Gmail connection check"
```

---

### Task 11: Case Emails Client Component

**Files:**
- Create: `src/components/emails/case-emails-client.tsx`

**Context:** This is the main interactive component for the emails tab. Handles: adding/removing email filters, fetching emails, showing email list, expanding email detail, and triggering AI reply drafts.

**Step 1: Create the client component**

File: `src/components/emails/case-emails-client.tsx`

```tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface EmailFilter {
  id: string
  email_address: string
  label: string | null
  created_at: string
}

interface EmailSummary {
  id: string
  threadId: string
  from: string
  subject: string
  date: string
  snippet: string
}

interface ThreadMessage {
  id: string
  from: string
  to: string
  subject: string
  date: string
  body: string
}

interface CaseEmailsClientProps {
  caseId: string
  gmailEmail: string
  initialFilters: EmailFilter[]
  disputeType: string | null
}

export function CaseEmailsClient({
  caseId,
  gmailEmail,
  initialFilters,
  disputeType,
}: CaseEmailsClientProps) {
  const [filters, setFilters] = useState<EmailFilter[]>(initialFilters)
  const [newEmail, setNewEmail] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [addingFilter, setAddingFilter] = useState(false)

  const [emails, setEmails] = useState<EmailSummary[]>([])
  const [loadingEmails, setLoadingEmails] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)

  const [selectedEmail, setSelectedEmail] = useState<string | null>(null)
  const [thread, setThread] = useState<ThreadMessage[] | null>(null)
  const [loadingThread, setLoadingThread] = useState(false)

  const [draft, setDraft] = useState<string | null>(null)
  const [loadingDraft, setLoadingDraft] = useState(false)
  const [copied, setCopied] = useState(false)

  const fetchEmails = useCallback(async () => {
    if (filters.length === 0) return
    setLoadingEmails(true)
    setEmailError(null)
    try {
      const res = await fetch(`/api/cases/${caseId}/emails`)
      if (!res.ok) throw new Error('Failed to fetch emails')
      const data = await res.json()
      setEmails(data.emails)
    } catch {
      setEmailError('Could not load emails. Please try again.')
    } finally {
      setLoadingEmails(false)
    }
  }, [caseId, filters.length])

  useEffect(() => {
    fetchEmails()
  }, [fetchEmails])

  async function addFilter() {
    if (!newEmail) return
    setAddingFilter(true)
    try {
      const res = await fetch(`/api/cases/${caseId}/email-filters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email_address: newEmail,
          label: newLabel || undefined,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        setEmailError(err.error ?? 'Failed to add filter')
        return
      }
      const filter = await res.json()
      setFilters([...filters, filter])
      setNewEmail('')
      setNewLabel('')
    } finally {
      setAddingFilter(false)
    }
  }

  async function removeFilter(filterId: string) {
    await fetch(`/api/cases/${caseId}/email-filters/${filterId}`, {
      method: 'DELETE',
    })
    setFilters(filters.filter((f) => f.id !== filterId))
  }

  async function openEmail(emailId: string) {
    setSelectedEmail(emailId)
    setThread(null)
    setDraft(null)
    setLoadingThread(true)
    try {
      const res = await fetch(`/api/cases/${caseId}/emails/${emailId}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setThread(data.messages)
    } catch {
      setThread([])
    } finally {
      setLoadingThread(false)
    }
  }

  async function generateDraft() {
    if (!selectedEmail) return
    setLoadingDraft(true)
    setDraft(null)
    try {
      const res = await fetch(
        `/api/cases/${caseId}/emails/${selectedEmail}/draft-reply`,
        { method: 'POST' }
      )
      if (!res.ok) {
        const err = await res.json()
        setDraft(`Error: ${err.error ?? 'Failed to generate draft'}`)
        return
      }
      const data = await res.json()
      setDraft(data.draft)
    } finally {
      setLoadingDraft(false)
    }
  }

  async function copyDraft() {
    if (!draft) return
    await navigator.clipboard.writeText(draft)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mt-6 space-y-6">
      {/* Connected account info */}
      <p className="text-sm text-warm-muted">
        Monitoring emails via <span className="font-medium text-warm-text">{gmailEmail}</span>
      </p>

      {/* Email Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monitored Email Addresses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {filters.length > 0 && (
            <ul className="space-y-2">
              {filters.map((f) => (
                <li key={f.id} className="flex items-center justify-between rounded-lg border border-warm-border p-3">
                  <div>
                    <p className="text-sm font-medium text-warm-text">{f.email_address}</p>
                    {f.label && <p className="text-xs text-warm-muted">{f.label}</p>}
                  </div>
                  <button
                    onClick={() => removeFilter(f.id)}
                    className="text-xs text-warm-muted hover:text-red-500 transition-colors"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="flex gap-2">
            <input
              type="email"
              placeholder="opposing@lawfirm.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="flex-1 rounded-md border border-warm-border bg-white px-3 py-2 text-sm text-warm-text placeholder:text-warm-muted focus:outline-none focus:ring-2 focus:ring-calm-indigo/30"
              onKeyDown={(e) => e.key === 'Enter' && addFilter()}
            />
            <input
              type="text"
              placeholder="Label (optional)"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="w-40 rounded-md border border-warm-border bg-white px-3 py-2 text-sm text-warm-text placeholder:text-warm-muted focus:outline-none focus:ring-2 focus:ring-calm-indigo/30"
            />
            <Button size="sm" onClick={addFilter} disabled={!newEmail || addingFilter}>
              {addingFilter ? 'Adding...' : 'Add'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Email List */}
      {filters.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Emails</CardTitle>
            <Button variant="outline" size="sm" onClick={fetchEmails} disabled={loadingEmails}>
              {loadingEmails ? 'Loading...' : 'Refresh'}
            </Button>
          </CardHeader>
          <CardContent>
            {emailError && (
              <p className="text-sm text-red-500 mb-4">{emailError}</p>
            )}

            {loadingEmails && emails.length === 0 ? (
              <p className="text-sm text-warm-muted text-center py-8">Loading emails...</p>
            ) : emails.length === 0 ? (
              <p className="text-sm text-warm-muted text-center py-8">
                No emails found from these addresses.
              </p>
            ) : (
              <ul className="divide-y divide-warm-border">
                {emails.map((email) => (
                  <li key={email.id}>
                    <button
                      onClick={() => openEmail(email.id)}
                      className={`w-full text-left px-3 py-3 hover:bg-warm-bg transition-colors ${
                        selectedEmail === email.id ? 'bg-warm-bg' : ''
                      }`}
                    >
                      <div className="flex items-baseline justify-between gap-4">
                        <p className="text-sm font-medium text-warm-text truncate">
                          {email.from.replace(/<[^>]+>/, '').trim()}
                        </p>
                        <p className="text-xs text-warm-muted whitespace-nowrap">
                          {new Date(email.date).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="text-sm text-warm-text truncate">{email.subject}</p>
                      <p className="text-xs text-warm-muted truncate mt-0.5">{email.snippet}</p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      {/* Email Detail + Thread */}
      {selectedEmail && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Conversation</CardTitle>
            <button
              onClick={() => {
                setSelectedEmail(null)
                setThread(null)
                setDraft(null)
              }}
              className="text-sm text-warm-muted hover:text-warm-text"
            >
              Close
            </button>
          </CardHeader>
          <CardContent>
            {loadingThread ? (
              <p className="text-sm text-warm-muted text-center py-8">Loading conversation...</p>
            ) : thread && thread.length > 0 ? (
              <div className="space-y-4">
                {thread.map((msg, i) => (
                  <div
                    key={msg.id}
                    className={`rounded-lg border p-4 ${
                      i === thread.length - 1
                        ? 'border-calm-indigo/30 bg-indigo-50/50'
                        : 'border-warm-border'
                    }`}
                  >
                    <div className="flex items-baseline justify-between mb-2">
                      <p className="text-sm font-medium text-warm-text">
                        {msg.from.replace(/<[^>]+>/, '').trim()}
                      </p>
                      <p className="text-xs text-warm-muted">
                        {new Date(msg.date).toLocaleString()}
                      </p>
                    </div>
                    <pre className="text-sm text-warm-text whitespace-pre-wrap font-sans">
                      {msg.body}
                    </pre>
                  </div>
                ))}

                {/* Draft Reply Section */}
                <div className="border-t border-warm-border pt-4">
                  {!draft && !loadingDraft && (
                    <Button onClick={generateDraft} className="w-full">
                      Draft a Reply with AI
                    </Button>
                  )}

                  {loadingDraft && (
                    <div className="text-center py-4">
                      <p className="text-sm text-warm-muted">Generating reply draft...</p>
                    </div>
                  )}

                  {draft && (
                    <div className="space-y-3">
                      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                        <p className="text-xs font-medium text-amber-700">
                          AI-generated draft — review carefully before sending from your Gmail.
                        </p>
                      </div>

                      <textarea
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        className="w-full min-h-[200px] rounded-md border border-warm-border bg-white p-3 text-sm text-warm-text font-sans focus:outline-none focus:ring-2 focus:ring-calm-indigo/30"
                      />

                      <div className="flex gap-2">
                        <Button onClick={copyDraft} variant={copied ? 'outline' : 'default'} className="flex-1">
                          {copied ? 'Copied!' : 'Copy to Clipboard'}
                        </Button>
                        <Button onClick={generateDraft} variant="outline">
                          Regenerate
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-warm-muted text-center py-8">
                Could not load this conversation.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
```

**Step 2: Verify build**

Run: `npx next build 2>&1 | tail -5`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/emails/case-emails-client.tsx
git commit -m "feat: add case emails client component with filters, list, thread, and AI reply"
```

---

### Task 12: Add Emails Link to Case Dashboard

**Files:**
- Modify: `src/app/(authenticated)/case/[id]/page.tsx`

**Context:** The case dashboard shows navigation cards/links to sub-pages (evidence, deadlines, research, etc.). Add an "Emails" link/card that links to `/case/[id]/emails`. Check the dashboard layout to find where navigation links are rendered and add the emails link in a logical position.

**Step 1: Find and add the emails link**

Read the case dashboard page to find how navigation links are structured. Add an "Emails" card or link alongside the existing ones (deadlines, research, evidence, discovery, etc.).

The link should:
- Go to `/case/${caseId}/emails`
- Show an email icon
- Have label "Emails" with subtitle "Monitor opposing counsel"
- Fit the existing card/link pattern used by other navigation items

**Step 2: Verify build and commit**

```bash
git add src/app/\(authenticated\)/case/\[id\]/page.tsx
git commit -m "feat: add Emails link to case dashboard"
```

---

### Task 13: Final Verification & Cleanup

**Step 1: Add env vars to .env.example (if it exists)**

Add:
```env
# Gmail OAuth (optional — enables email monitoring)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# Token encryption (generate with: openssl rand -hex 32)
ENCRYPTION_KEY=
```

**Step 2: Full build verification**

Run: `npx next build`
Expected: Build succeeds with no errors

**Step 3: Manual test checklist**

- [ ] Settings page shows "Connected Services" card
- [ ] "Connect" button redirects to Google OAuth
- [ ] After OAuth, redirects back to settings with "Connected" status
- [ ] Case emails page shows "Connect Gmail" prompt when not connected
- [ ] Can add email filter with opposing counsel's address
- [ ] Emails from that address appear in the list
- [ ] Clicking an email shows the full thread
- [ ] "Draft Reply" generates an AI reply
- [ ] "Copy to Clipboard" works
- [ ] "Disconnect" revokes Gmail access

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete Gmail email integration"
```
