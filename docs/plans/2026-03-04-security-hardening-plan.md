# Security Hardening Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Close 12 security findings (3 HIGH, 5 MEDIUM, 4 LOW) identified during audit, hardening the application for production.

**Architecture:** Layered defense — each finding is fixed at its natural layer (migrations, middleware, config, utilities, route handlers). Fixes are independent and testable.

**Tech Stack:** Next.js 16, Supabase RLS, TypeScript, Zod, vitest

---

## Task 1: Security Headers in next.config.ts (HIGH-3)

**Files:**
- Modify: `next.config.ts`

**Implementation:**

```typescript
import type { NextConfig } from "next";

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      "frame-ancestors 'none'",
    ].join('; '),
  },
]

const nextConfig: NextConfig = {
  serverExternalPackages: ['tesseract.js', 'pdf-parse'],
  poweredByHeader: false,
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
};

export default nextConfig;
```

**Verify:** `npx next build` — should compile cleanly. Then `curl -I http://localhost:3000` to see headers.

---

## Task 2: Rate Limiter Utility (HIGH-2, TDD)

**Files:**
- Create: `src/lib/security/rate-limit.ts`
- Create: `tests/unit/security/rate-limit.test.ts`

### Implementation

```typescript
// src/lib/security/rate-limit.ts

import { NextResponse } from 'next/server'

interface RateLimitEntry {
  timestamps: number[]
}

const store = new Map<string, RateLimitEntry>()

// Cleanup expired entries every 5 minutes
let lastCleanup = Date.now()
const CLEANUP_INTERVAL = 5 * 60 * 1000

function cleanup(windowMs: number) {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return
  lastCleanup = now
  const cutoff = now - windowMs
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff)
    if (entry.timestamps.length === 0) store.delete(key)
  }
}

export function checkRateLimit(
  userId: string,
  endpoint: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; retryAfterMs: number } {
  cleanup(windowMs)
  const key = `${userId}:${endpoint}`
  const now = Date.now()
  const cutoff = now - windowMs

  const entry = store.get(key) ?? { timestamps: [] }
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff)

  if (entry.timestamps.length >= maxRequests) {
    const oldest = entry.timestamps[0]
    const retryAfterMs = oldest + windowMs - now
    return { allowed: false, retryAfterMs: Math.max(retryAfterMs, 1000) }
  }

  entry.timestamps.push(now)
  store.set(key, entry)
  return { allowed: true, retryAfterMs: 0 }
}

export function rateLimitResponse(retryAfterMs: number): NextResponse {
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    {
      status: 429,
      headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) },
    }
  )
}

// Pre-configured rate limit tiers
export const RATE_LIMITS = {
  ai: { maxRequests: 10, windowMs: 60 * 60 * 1000 },      // 10/hour
  email: { maxRequests: 5, windowMs: 60 * 60 * 1000 },     // 5/hour
  standard: { maxRequests: 60, windowMs: 60 * 1000 },      // 60/min
} as const
```

### Tests (6 tests)

```typescript
// tests/unit/security/rate-limit.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { checkRateLimit } from '@/lib/security/rate-limit'

describe('checkRateLimit', () => {
  // Use unique user IDs per test to avoid cross-contamination
  let userId: string
  beforeEach(() => {
    userId = `user-${Math.random()}`
  })

  it('allows requests under the limit', () => {
    const result = checkRateLimit(userId, '/test', 3, 60000)
    expect(result.allowed).toBe(true)
  })

  it('blocks requests over the limit', () => {
    for (let i = 0; i < 3; i++) {
      checkRateLimit(userId, '/test', 3, 60000)
    }
    const result = checkRateLimit(userId, '/test', 3, 60000)
    expect(result.allowed).toBe(false)
    expect(result.retryAfterMs).toBeGreaterThan(0)
  })

  it('tracks endpoints separately', () => {
    for (let i = 0; i < 3; i++) {
      checkRateLimit(userId, '/a', 3, 60000)
    }
    const result = checkRateLimit(userId, '/b', 3, 60000)
    expect(result.allowed).toBe(true)
  })

  it('tracks users separately', () => {
    for (let i = 0; i < 3; i++) {
      checkRateLimit('alice', '/test', 3, 60000)
    }
    const result = checkRateLimit('bob', '/test', 3, 60000)
    expect(result.allowed).toBe(true)
  })

  it('allows requests after window expires', () => {
    // Use a 1ms window so it expires immediately
    for (let i = 0; i < 3; i++) {
      checkRateLimit(userId, '/expire', 3, 1)
    }
    // Wait 2ms for window to expire
    const start = Date.now()
    while (Date.now() - start < 5) { /* busy wait */ }
    const result = checkRateLimit(userId, '/expire', 3, 1)
    expect(result.allowed).toBe(true)
  })

  it('returns retryAfterMs when blocked', () => {
    for (let i = 0; i < 2; i++) {
      checkRateLimit(userId, '/retry', 2, 60000)
    }
    const result = checkRateLimit(userId, '/retry', 2, 60000)
    expect(result.allowed).toBe(false)
    expect(result.retryAfterMs).toBeGreaterThanOrEqual(1000)
  })
})
```

---

## Task 3: Apply Rate Limiting to AI Routes (HIGH-2)

**Files (11 routes — add rate limit check after auth):**
- Modify: `src/app/api/cases/[id]/generate-filing/route.ts`
- Modify: `src/app/api/cases/[id]/strategy/route.ts`
- Modify: `src/app/api/cases/[id]/research/ask/route.ts`
- Modify: `src/app/api/cases/[id]/risk/tips/route.ts`
- Modify: `src/app/api/cases/[id]/risk/explain/route.ts`
- Modify: `src/app/api/cases/[id]/timeline/summary/route.ts`
- Modify: `src/app/api/cases/[id]/evidence/categorize/route.ts`
- Modify: `src/app/api/cases/[id]/task-description/route.ts`
- Modify: `src/app/api/cases/[id]/answer/extract/route.ts`
- Modify: `src/app/api/objections/reviews/[reviewId]/classify/route.ts`
- Modify: `src/app/api/ai/preservation-letter/route.ts`

**Pattern to apply in each route (add after `getAuthenticatedClient()` check):**

```typescript
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rate-limit'

// After auth check:
const { supabase, user, error: authError } = await getAuthenticatedClient()
if (authError) return authError

// Add this:
const rl = checkRateLimit(user!.id, 'ai', RATE_LIMITS.ai.maxRequests, RATE_LIMITS.ai.windowMs)
if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)
```

For `ai/preservation-letter/route.ts`, the user access pattern differs — check how user is available and use `user!.id`.

---

## Task 4: Apply Rate Limiting to Email Routes (MEDIUM-4)

**Files:**
- Modify: `src/app/api/cases/[id]/preservation-letter/send/route.ts`
- Modify: `src/app/api/objections/reviews/[reviewId]/meet-and-confer/send/route.ts`

**Pattern (same as Task 3 but with email tier):**

```typescript
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rate-limit'

// After auth check:
const rl = checkRateLimit(user!.id, 'email', RATE_LIMITS.email.maxRequests, RATE_LIMITS.email.windowMs)
if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)
```

Also add audit logging after successful email send in each route:
```typescript
console.log(`[email-audit] user=${user!.id} to=${recipientEmail} type=preservation_letter`)
```

---

## Task 5: Shared Case RLS Fix (HIGH-1)

**Files:**
- Create: `supabase/migrations/20260304200001_fix_shared_case_rls.sql`
- Modify: `src/app/shared/[token]/page.tsx`

### Migration

```sql
-- Drop the overly broad policy that exposes ALL shared cases to ALL users
DROP POLICY IF EXISTS "Anyone can read shared cases by token" ON public.cases;

-- Create a SECURITY DEFINER function that validates the token
-- This bypasses RLS intentionally — the function itself enforces access control
CREATE OR REPLACE FUNCTION public.get_shared_case(p_token uuid)
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'id', id,
    'county', county,
    'court_type', court_type,
    'role', role,
    'dispute_type', dispute_type,
    'status', status,
    'created_at', created_at
  )
  FROM public.cases
  WHERE share_token = p_token AND share_enabled = true;
$$;

-- Function to get deadlines for a shared case (validates token)
CREATE OR REPLACE FUNCTION public.get_shared_case_deadlines(p_token uuid)
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(json_agg(row_to_json(d)), '[]'::json)
  FROM (
    SELECT key, due_at, source
    FROM public.deadlines
    WHERE case_id = (
      SELECT id FROM public.cases
      WHERE share_token = p_token AND share_enabled = true
    )
    ORDER BY due_at ASC
    LIMIT 10
  ) d;
$$;

-- Function to get timeline events for a shared case (validates token)
CREATE OR REPLACE FUNCTION public.get_shared_case_events(p_token uuid)
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(json_agg(row_to_json(e)), '[]'::json)
  FROM (
    SELECT kind, payload, created_at
    FROM public.task_events
    WHERE case_id = (
      SELECT id FROM public.cases
      WHERE share_token = p_token AND share_enabled = true
    )
    ORDER BY created_at DESC
    LIMIT 10
  ) e;
$$;
```

### Updated shared page

Replace the entire `src/app/shared/[token]/page.tsx` with:

```typescript
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'

interface SharedCase {
  id: string
  county: string | null
  court_type: string
  role: string
  dispute_type: string | null
  status: string
  created_at: string
}

interface SharedDeadline {
  key: string
  due_at: string
  source: string | null
}

interface SharedEvent {
  kind: string
  payload: unknown
  created_at: string
}

export default async function SharedCasePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const supabase = await createClient()

  // Use SECURITY DEFINER functions — validates token server-side
  const { data: caseData } = await supabase.rpc('get_shared_case', { p_token: token })

  if (!caseData) {
    return (
      <div className="min-h-screen bg-warm-bg flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-sm font-medium text-warm-text">Link not available</p>
            <p className="text-xs text-warm-muted mt-2">
              This shared link is no longer active or doesn&apos;t exist.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const caseRow = caseData as SharedCase

  // Fetch child data via token-validated RPC functions
  const [deadlinesResult, eventsResult] = await Promise.all([
    supabase.rpc('get_shared_case_deadlines', { p_token: token }),
    supabase.rpc('get_shared_case_events', { p_token: token }),
  ])

  const deadlines = (deadlinesResult.data ?? []) as SharedDeadline[]
  const events = (eventsResult.data ?? []) as SharedEvent[]

  const courtLabels: Record<string, string> = {
    jp: 'Justice Court',
    county: 'County Court',
    district: 'District Court',
    unknown: 'Court TBD',
  }

  return (
    <div className="min-h-screen bg-warm-bg">
      <nav className="w-full border-b border-warm-border bg-warm-bg/95 px-4 py-3">
        <p className="text-sm font-semibold text-warm-text text-center">Lawyer Free — Shared Case View</p>
      </nav>
      <main className="mx-auto max-w-2xl px-4 py-10 space-y-6">
        <div>
          <p className="text-xs text-warm-muted uppercase tracking-wide">Read-only view</p>
          <h1 className="text-lg font-semibold text-warm-text mt-1">
            {caseRow.dispute_type ?? 'Legal Case'} — {caseRow.county ? `${caseRow.county} County` : 'County TBD'}
          </h1>
          <p className="text-sm text-warm-muted mt-1">
            {courtLabels[caseRow.court_type] ?? 'Court TBD'} · {caseRow.role === 'plaintiff' ? 'Plaintiff' : 'Defendant'} · Created {new Date(caseRow.created_at).toLocaleDateString()}
          </p>
        </div>

        <Card>
          <CardContent className="pt-5 pb-4">
            <h2 className="text-sm font-semibold text-warm-text mb-3">Deadlines</h2>
            {deadlines.length === 0 ? (
              <p className="text-sm text-warm-muted">No deadlines set.</p>
            ) : (
              <div className="space-y-2">
                {deadlines.map((d, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-warm-text">{d.key.replace(/_/g, ' ')}</span>
                    <span className="text-warm-muted">{new Date(d.due_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 pb-4">
            <h2 className="text-sm font-semibold text-warm-text mb-3">Recent Activity</h2>
            {events.length === 0 ? (
              <p className="text-sm text-warm-muted">No activity yet.</p>
            ) : (
              <div className="space-y-2">
                {events.map((e, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-warm-text">{e.kind.replace(/_/g, ' ')}</span>
                    <span className="text-warm-muted">{new Date(e.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-xs text-warm-muted text-center">
          This is a read-only view. Lawyer Free does not provide legal advice.
        </p>
      </main>
    </div>
  )
}
```

---

## Task 6: Safe Error Logging Utility + Apply (MEDIUM-2, MEDIUM-3)

**Files:**
- Create: `src/lib/security/safe-log.ts`
- Modify: 13 API routes (replace `console.error(..., err)` with `safeError()`)

### Utility

```typescript
// src/lib/security/safe-log.ts

/**
 * Log an error safely — only the message, never the full error object.
 * Prevents API keys and stack traces from leaking into log systems.
 */
export function safeError(context: string, err: unknown): void {
  const message = err instanceof Error ? err.message : String(err)
  console.error(`[${context}]`, message)
}
```

### Routes to modify (find-replace pattern)

Replace `console.error('[context] ...:', err)` with `safeError('context', err)` in these files:

| File | Old | New |
|------|-----|-----|
| `api/cron/health/route.ts` | `console.error(\`[cron/health] Failed for case ${batch[j].id}:\`, err)` | `safeError('cron/health', err)` |
| `api/exhibit-sets/[setId]/export/route.ts` | `console.error('Exhibit export error:', err)` | `safeError('exhibit-export', err)` |
| `api/discovery/packs/[packId]/export/route.ts` | `console.error('Discovery pack export error:', err)` | `safeError('discovery-export', err)` |
| `api/cases/[id]/strategy/route.ts` | `console.error('[strategy] Claude call failed:', err)` | `safeError('strategy', err)` |
| `api/cases/[id]/timeline/summary/route.ts` | `console.error('[timeline-summary] AI call failed:', err)` | `safeError('timeline-summary', err)` |
| `api/cases/[id]/generate-filing/route.ts` | `console.error('[generate-filing] Error:', err)` | `safeError('generate-filing', err)` |
| `api/cases/[id]/task-description/route.ts` | `console.error('[task-description] AI call failed, using static fallback:', err)` | `safeError('task-description', err)` |
| `api/cases/[id]/evidence/export/route.ts` | `console.error('Evidence export error:', err)` | `safeError('evidence-export', err)` |
| `api/cases/[id]/risk/tips/route.ts` | `console.error('[health-tips] AI call failed:', err)` | `safeError('health-tips', err)` |
| `api/cases/[id]/research/authority/route.ts` | `console.error('[research/authority] Pipeline error:', err)` | `safeError('research/authority', err)` |
| `api/cases/[id]/evidence/categorize/route.ts` | `console.error('[evidence-categorize] AI call failed:', err)` | `safeError('evidence-categorize', err)` |
| `api/cases/[id]/research/ask/route.ts` | `console.error('[research/ask] Error:', err)` | `safeError('research/ask', err)` |
| `api/cases/[id]/research/search/route.ts` | `console.error('[research/search] Error:', err)` | `safeError('research/search', err)` |

Each file also needs: `import { safeError } from '@/lib/security/safe-log'`

### Cron response cleanup

In `src/app/api/cron/health/route.ts`, change the response to exclude case IDs:
```typescript
// Before:
return NextResponse.json({ processed: allCases.length, succeeded, failed, healthAlertsTriggered, errors })
// After:
return NextResponse.json({ processed: allCases.length, succeeded, failed, healthAlertsTriggered, errorCount: errors.length })
```

---

## Task 7: Middleware Auth Tightening + CSRF (MEDIUM-1, LOW-2)

**Files:**
- Modify: `src/middleware.ts`

Replace the middleware with:

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Paths that don't require authentication
const PUBLIC_PATHS = ['/', '/login', '/signup', '/reset-password']
const PUBLIC_PATH_PREFIXES = ['/shared', '/api/cron']

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true
  return PUBLIC_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // CSRF: Check Origin header on state-mutating requests
  const method = request.method
  if (method === 'POST' || method === 'PATCH' || method === 'PUT' || method === 'DELETE') {
    const origin = request.headers.get('origin')
    const host = request.headers.get('host')
    if (origin && host) {
      const originHost = new URL(origin).host
      if (originHost !== host) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }
  }

  const { data: { user } } = await supabase.auth.getUser()

  // Redirect unauthenticated users (pages and API routes alike)
  if (!user && !isPublicPath(request.nextUrl.pathname)) {
    // API routes get 401, pages get redirected
    if (request.nextUrl.pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

---

## Task 8: Auth Types Refactoring (MEDIUM-5)

**Files:**
- Modify: `src/lib/supabase/route-handler.ts`
- Modify: All 65 API route files that use `getAuthenticatedClient()`

### Updated route-handler.ts

```typescript
import { createServerClient, type SupabaseClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { User } from '@supabase/supabase-js'

type AuthSuccess = { ok: true; supabase: SupabaseClient; user: User }
type AuthFailure = { ok: false; error: NextResponse }
export type AuthResult = AuthSuccess | AuthFailure

export async function getAuthenticatedClient(): Promise<AuthResult> {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignore
          }
        },
      },
    }
  )

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return { ok: false, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  return { ok: true, supabase, user }
}
```

### Consumer pattern update (apply to all 65 routes)

Find-replace pattern across all files:

**Before:**
```typescript
const { supabase, user, error: authError } = await getAuthenticatedClient()
if (authError) return authError
```
(Then uses `supabase!` and `user!` throughout)

**After:**
```typescript
const auth = await getAuthenticatedClient()
if (!auth.ok) return auth.error
const { supabase, user } = auth
```
(Then uses `supabase` and `user` directly — no `!` needed)

The find-replace should also remove all `supabase!` → `supabase` and `user!` → `user` in each file.

---

## Task 9: Password Minimum + LIKE Escaping + Audit Script (LOW-1, LOW-3, LOW-4)

**Files:**
- Modify: `src/lib/auth/password-strength.ts`
- Modify: `src/app/reset-password/page.tsx`
- Modify: `src/app/api/search/route.ts`
- Modify: `package.json`

### Password minimum 6 → 8

In `src/lib/auth/password-strength.ts`, change line 19:
```typescript
// Before:
if (password.length < 6) {
// After:
if (password.length < 8) {
```

And remove the `password.length < 8` → 'fair' block (lines 23-25), since passwords < 8 are now 'weak'.

In `src/app/reset-password/page.tsx`, change line 45:
```typescript
// Before:
if (password.length < 6) {
  setError('Password needs at least 6 characters.')
// After:
if (password.length < 8) {
  setError('Password needs at least 8 characters.')
```

Also update the placeholder on the input from "At least 6 characters" to "At least 8 characters" and `minLength={6}` → `minLength={8}`.

### LIKE wildcard escaping

In `src/app/api/search/route.ts`, escape user input:
```typescript
// Before:
const pattern = `%${q}%`
// After:
const escaped = q.replace(/%/g, '\\%').replace(/_/g, '\\_')
const pattern = `%${escaped}%`
```

### Audit script

In `package.json`, add to scripts:
```json
"audit": "npm audit --production"
```

---

## Task 10: Build & Test Verification

1. Run all unit tests: `npx vitest run` — expect all passing including new rate-limit tests
2. Run `npx next build` — no type errors
3. Push the Supabase migration: `npx supabase db push`
4. Manual verification:
   - `curl -I http://localhost:3000` — verify security headers present
   - Test shared link still works via RPC functions
   - Test an AI route returns 429 after 10 rapid requests

---

## Task Dependencies

```
T1 (headers) ─────────────────────┐
T2 (rate-limit utility) ─┐        │
                          ├── T3 (apply to AI routes)
                          ├── T4 (apply to email routes)
T5 (RLS fix) ─────────────────────┤
T6 (safe logging) ────────────────┤
T7 (middleware) ───────────────────┤
T8 (auth types) ───────────────────┤
T9 (minor fixes) ─────────────────┤
                                   └── T10 (verify)
```

**Parallelizable batches:**
- Batch 1: T1, T2, T5, T6 (utility), T7, T9 (all independent)
- Batch 2: T3, T4 (depend on T2)
- Batch 3: T8 (auth refactor — large but independent)
- Batch 4: T6 (apply to routes — after utility created)
- Batch 5: T10 (final verification)
