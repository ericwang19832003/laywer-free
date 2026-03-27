# Quick Resolve Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a "Quick Resolve" fast-path that lets users describe their dispute in plain text, get an AI-drafted demand letter, and send it via certified mail — all in 5 minutes.

**Architecture:** Story-first AI intake → OpenCorporates entity lookup → case creation (reusing existing API) → demand letter generation (reusing existing API) → Lob.com certified mail delivery with tracking → 14-day auto follow-up cron.

**Tech Stack:** Next.js API routes, OpenAI GPT-4o-mini, OpenCorporates REST API, Lob.com SDK, Stripe Checkout (existing), Supabase + RLS.

---

## Sprint 1: Database + API Foundation

### Task 1: Database Migration

**Files:**
- Create: `supabase/migrations/20260324000001_quick_resolve.sql`

**Step 1: Write the migration**

```sql
-- Quick Resolve: demand letter delivery tracking
CREATE TABLE IF NOT EXISTS demand_letter_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  lob_letter_id text NOT NULL,
  tracking_number text,
  status text NOT NULL DEFAULT 'created'
    CHECK (status IN ('created', 'mailed', 'in_transit', 'delivered', 'returned', 'failed')),
  recipient_name text NOT NULL,
  recipient_address jsonb NOT NULL,
  sender_address jsonb NOT NULL,
  amount_charged_cents integer NOT NULL,
  stripe_payment_id text,
  letter_content_url text,
  sent_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE demand_letter_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own deliveries"
  ON demand_letter_deliveries FOR SELECT
  USING (case_id IN (SELECT id FROM cases WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own deliveries"
  ON demand_letter_deliveries FOR INSERT
  WITH CHECK (case_id IN (SELECT id FROM cases WHERE user_id = auth.uid()));

-- Index for cron job: find delivered letters older than 14 days
CREATE INDEX idx_deliveries_followup
  ON demand_letter_deliveries (status, delivered_at)
  WHERE status = 'delivered';

-- Add quick_resolve flag to cases for tracking entry point
ALTER TABLE cases ADD COLUMN IF NOT EXISTS entry_point text DEFAULT 'wizard'
  CHECK (entry_point IN ('wizard', 'quick_resolve'));
```

**Step 2: Verify migration syntax**

Run: `cd supabase && grep -c "CREATE TABLE" migrations/20260324000001_quick_resolve.sql`
Expected: `1`

**Step 3: Commit**

```bash
git add supabase/migrations/20260324000001_quick_resolve.sql
git commit -m "feat(quick-resolve): add demand_letter_deliveries table + entry_point column"
```

---

### Task 2: Zod Schemas for Quick Resolve

**Files:**
- Create: `src/lib/schemas/quick-resolve.ts`
- Test: `tests/unit/schemas/quick-resolve.test.ts`

**Step 1: Write the failing test**

```typescript
import { describe, it, expect } from 'vitest'
import { storyInputSchema, analysisResultSchema, entityLookupSchema, sendLetterSchema } from '@/lib/schemas/quick-resolve'

describe('storyInputSchema', () => {
  it('accepts valid input', () => {
    const result = storyInputSchema.safeParse({ story: 'My landlord kept my deposit of $2400 after I moved out in good condition.' })
    expect(result.success).toBe(true)
  })

  it('rejects story under 50 chars', () => {
    const result = storyInputSchema.safeParse({ story: 'Too short.' })
    expect(result.success).toBe(false)
  })

  it('rejects story over 5000 chars', () => {
    const result = storyInputSchema.safeParse({ story: 'a'.repeat(5001) })
    expect(result.success).toBe(false)
  })
})

describe('analysisResultSchema', () => {
  it('accepts valid analysis', () => {
    const result = analysisResultSchema.safeParse({
      disputeType: 'landlord_tenant',
      role: 'plaintiff',
      opposingParty: { name: 'John Smith', type: 'person' },
      approximateAmount: 2400,
      state: 'TX',
      summary: 'Security deposit dispute.',
      confidence: 'high',
    })
    expect(result.success).toBe(true)
  })

  it('accepts business opposing party with entity details', () => {
    const result = analysisResultSchema.safeParse({
      disputeType: 'small_claims',
      role: 'plaintiff',
      opposingParty: {
        name: 'Acme LLC',
        type: 'business',
        legalName: 'Acme Properties LLC',
        registeredAgent: { name: 'John Doe', address: '123 Main St, Houston TX' },
        entityType: 'LLC',
        entityStatus: 'Active',
      },
      approximateAmount: 5000,
      state: 'TX',
      summary: 'Contract breach.',
      confidence: 'medium',
    })
    expect(result.success).toBe(true)
  })
})

describe('sendLetterSchema', () => {
  it('accepts valid send request', () => {
    const result = sendLetterSchema.safeParse({
      caseId: '123e4567-e89b-12d3-a456-426614174000',
      recipientName: 'John Smith',
      recipientAddress: { line1: '123 Main St', city: 'Houston', state: 'TX', zip: '77001' },
      senderAddress: { line1: '456 Oak Ave', city: 'Austin', state: 'TX', zip: '78701' },
      letterHtml: '<p>Dear John...</p>',
    })
    expect(result.success).toBe(true)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/schemas/quick-resolve.test.ts`
Expected: FAIL — module not found

**Step 3: Write the schemas**

```typescript
// src/lib/schemas/quick-resolve.ts
import { z } from 'zod'

export const storyInputSchema = z.object({
  story: z.string().min(50, 'Please describe your situation in at least a few sentences.').max(5000),
})

const addressSchema = z.object({
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().length(2),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/),
})

const opposingPartySchema = z.object({
  name: z.string().min(1),
  type: z.enum(['person', 'business']),
  legalName: z.string().optional(),
  registeredAgent: z.object({
    name: z.string(),
    address: z.string(),
  }).optional(),
  entityType: z.string().optional(),
  entityStatus: z.string().optional(),
})

export const analysisResultSchema = z.object({
  disputeType: z.string(),
  subType: z.string().optional(),
  role: z.enum(['plaintiff', 'defendant']),
  opposingParty: opposingPartySchema,
  approximateAmount: z.number().positive(),
  state: z.string().length(2),
  summary: z.string(),
  confidence: z.enum(['high', 'medium', 'low']),
})

export const entityLookupSchema = z.object({
  name: z.string().min(1),
  state: z.string().length(2),
})

export const sendLetterSchema = z.object({
  caseId: z.string().uuid(),
  recipientName: z.string().min(1),
  recipientAddress: addressSchema,
  senderAddress: addressSchema,
  letterHtml: z.string().min(10),
})

export type StoryInput = z.infer<typeof storyInputSchema>
export type AnalysisResult = z.infer<typeof analysisResultSchema>
export type EntityLookupInput = z.infer<typeof entityLookupSchema>
export type SendLetterInput = z.infer<typeof sendLetterSchema>
```

**Step 4: Run tests**

Run: `npx vitest run tests/unit/schemas/quick-resolve.test.ts`
Expected: ALL PASS

**Step 5: Commit**

```bash
git add src/lib/schemas/quick-resolve.ts tests/unit/schemas/quick-resolve.test.ts
git commit -m "feat(quick-resolve): add Zod schemas with tests"
```

---

### Task 3: OpenCorporates Entity Lookup API

**Files:**
- Create: `src/lib/entity-lookup/opencorporates.ts`
- Create: `src/app/api/quick-resolve/entity-lookup/route.ts`
- Test: `tests/unit/entity-lookup/opencorporates.test.ts`

**Step 1: Write the failing test**

```typescript
import { describe, it, expect, vi } from 'vitest'
import { lookupBusinessEntity } from '@/lib/entity-lookup/opencorporates'

// Mock global fetch
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('lookupBusinessEntity', () => {
  it('returns entity details when found', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        results: {
          companies: [{
            company: {
              name: 'ACME PROPERTIES LLC',
              company_type: 'Limited Liability Company',
              current_status: 'Active',
              registered_address_in_full: '123 Main St, Houston, TX 77001',
              agent_name: 'John Doe',
              agent_address: '123 Main St, Houston, TX 77001',
              opencorporates_url: 'https://opencorporates.com/companies/us_tx/123',
              incorporation_date: '2020-01-15',
            },
          }],
        },
      }),
    })

    const result = await lookupBusinessEntity('Acme Properties', 'TX')
    expect(result).not.toBeNull()
    expect(result!.legalName).toBe('ACME PROPERTIES LLC')
    expect(result!.entityType).toBe('Limited Liability Company')
    expect(result!.status).toBe('Active')
  })

  it('returns null when no results', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ results: { companies: [] } }),
    })

    const result = await lookupBusinessEntity('Nonexistent Corp', 'TX')
    expect(result).toBeNull()
  })

  it('returns null on API error', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 429 })

    const result = await lookupBusinessEntity('Acme', 'TX')
    expect(result).toBeNull()
  })
})
```

**Step 2: Run test — verify fails**

Run: `npx vitest run tests/unit/entity-lookup/opencorporates.test.ts`

**Step 3: Write the implementation**

```typescript
// src/lib/entity-lookup/opencorporates.ts
export interface EntityResult {
  legalName: string
  entityType: string
  status: string
  registeredAgent: { name: string; address: string } | null
  filingDate: string | null
  opencorporatesUrl: string
}

const OPENCORPORATES_BASE = 'https://api.opencorporates.com/v0.4'

export async function lookupBusinessEntity(
  name: string,
  state: string,
): Promise<EntityResult | null> {
  try {
    const jurisdiction = `us_${state.toLowerCase()}`
    const params = new URLSearchParams({
      q: name,
      jurisdiction_code: jurisdiction,
      per_page: '1',
    })
    const apiKey = process.env.OPENCORPORATES_API_KEY
    if (apiKey) params.set('api_token', apiKey)

    const res = await fetch(`${OPENCORPORATES_BASE}/companies/search?${params}`, {
      signal: AbortSignal.timeout(10000),
    })

    if (!res.ok) return null

    const data = await res.json()
    const companies = data?.results?.companies
    if (!companies?.length) return null

    const co = companies[0].company
    return {
      legalName: co.name ?? name,
      entityType: co.company_type ?? 'Unknown',
      status: co.current_status ?? 'Unknown',
      registeredAgent: co.agent_name
        ? { name: co.agent_name, address: co.agent_address ?? '' }
        : null,
      filingDate: co.incorporation_date ?? null,
      opencorporatesUrl: co.opencorporates_url ?? '',
    }
  } catch {
    return null
  }
}
```

**Step 4: Write the API route**

```typescript
// src/app/api/quick-resolve/entity-lookup/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { entityLookupSchema } from '@/lib/schemas/quick-resolve'
import { lookupBusinessEntity } from '@/lib/entity-lookup/opencorporates'
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { user } = auth

    const rl = checkRateLimit(user.id, 'ai', RATE_LIMITS.ai.maxRequests, RATE_LIMITS.ai.windowMs)
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

    const body = await request.json()
    const parsed = entityLookupSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const result = await lookupBusinessEntity(parsed.data.name, parsed.data.state)

    return NextResponse.json({ entity: result })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**Step 5: Run tests**

Run: `npx vitest run tests/unit/entity-lookup/opencorporates.test.ts`
Expected: ALL PASS

**Step 6: Build**

Run: `npx next build 2>&1 | grep -iE "error TS|Type error" | head -5`
Expected: No errors

**Step 7: Commit**

```bash
git add src/lib/entity-lookup/opencorporates.ts src/app/api/quick-resolve/entity-lookup/route.ts tests/unit/entity-lookup/opencorporates.test.ts
git commit -m "feat(quick-resolve): add OpenCorporates entity lookup with tests"
```

---

### Task 4: AI Story Analysis API

**Files:**
- Create: `src/lib/ai/story-analysis.ts`
- Create: `src/app/api/quick-resolve/analyze/route.ts`
- Test: `tests/unit/ai/story-analysis.test.ts`

**Step 1: Write the AI prompt builder + parser**

```typescript
// src/lib/ai/story-analysis.ts
import { type AnalysisResult, analysisResultSchema } from '@/lib/schemas/quick-resolve'

const DISPUTE_TYPES = [
  'small_claims', 'personal_injury', 'landlord_tenant', 'family',
  'debt_collection', 'contract', 'property', 'real_estate', 'business', 'other',
]

export function buildAnalysisSystemPrompt(): string {
  return `You are a legal intake assistant. Extract structured case data from a user's description of their legal situation.

Return a JSON object with these fields:
- disputeType: one of ${JSON.stringify(DISPUTE_TYPES)}
- subType: optional specific sub-type (e.g., "security_deposit", "breach_of_contract")
- role: "plaintiff" (the user is suing/making a claim) or "defendant" (being sued)
- opposingParty: { name: string (best guess from context), type: "person" | "business" }
- approximateAmount: number in dollars (0 if not monetary)
- state: 2-letter US state code (extract from context, default "TX" if unclear)
- summary: one-sentence summary of the dispute
- confidence: "high" if all fields are clear, "medium" if some inferred, "low" if mostly guessed

Rules:
- Extract the opposing party name from context (e.g., "my landlord John" → "John")
- If a business name contains LLC, Inc, Corp, or similar → type: "business"
- Amounts like "$2,400" or "two thousand" should be parsed to numbers
- Return ONLY valid JSON, no markdown
`
}

export function buildAnalysisUserPrompt(story: string): string {
  return `Here is the user's description of their legal situation:\n\n${story}`
}

export function parseAnalysisResult(raw: string): AnalysisResult | null {
  try {
    const cleaned = raw.replace(/```json?\s*/g, '').replace(/```\s*/g, '').trim()
    const parsed = JSON.parse(cleaned)
    const result = analysisResultSchema.safeParse(parsed)
    return result.success ? result.data : null
  } catch {
    return null
  }
}
```

**Step 2: Write the test**

```typescript
// tests/unit/ai/story-analysis.test.ts
import { describe, it, expect } from 'vitest'
import { buildAnalysisSystemPrompt, parseAnalysisResult } from '@/lib/ai/story-analysis'

describe('buildAnalysisSystemPrompt', () => {
  it('includes all dispute types', () => {
    const prompt = buildAnalysisSystemPrompt()
    expect(prompt).toContain('small_claims')
    expect(prompt).toContain('landlord_tenant')
    expect(prompt).toContain('personal_injury')
  })
})

describe('parseAnalysisResult', () => {
  it('parses valid JSON', () => {
    const json = JSON.stringify({
      disputeType: 'landlord_tenant',
      role: 'plaintiff',
      opposingParty: { name: 'John Smith', type: 'person' },
      approximateAmount: 2400,
      state: 'TX',
      summary: 'Security deposit dispute.',
      confidence: 'high',
    })
    const result = parseAnalysisResult(json)
    expect(result).not.toBeNull()
    expect(result!.disputeType).toBe('landlord_tenant')
  })

  it('handles markdown-wrapped JSON', () => {
    const raw = '```json\n{"disputeType":"small_claims","role":"plaintiff","opposingParty":{"name":"Acme","type":"business"},"approximateAmount":5000,"state":"TX","summary":"Contract breach.","confidence":"medium"}\n```'
    const result = parseAnalysisResult(raw)
    expect(result).not.toBeNull()
  })

  it('returns null for invalid JSON', () => {
    expect(parseAnalysisResult('not json')).toBeNull()
  })

  it('returns null for invalid schema', () => {
    expect(parseAnalysisResult('{"foo":"bar"}')).toBeNull()
  })
})
```

**Step 3: Write the API route**

```typescript
// src/app/api/quick-resolve/analyze/route.ts
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { storyInputSchema } from '@/lib/schemas/quick-resolve'
import { buildAnalysisSystemPrompt, buildAnalysisUserPrompt, parseAnalysisResult } from '@/lib/ai/story-analysis'
import { lookupBusinessEntity } from '@/lib/entity-lookup/opencorporates'
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rate-limit'

export const maxDuration = 30

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { user } = auth

    const rl = checkRateLimit(user.id, 'ai', RATE_LIMITS.ai.maxRequests, RATE_LIMITS.ai.windowMs)
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

    const body = await request.json()
    const parsed = storyInputSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const openai = new OpenAI()
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: buildAnalysisSystemPrompt() },
        { role: 'user', content: buildAnalysisUserPrompt(parsed.data.story) },
      ],
      temperature: 0.2,
      max_tokens: 500,
    })

    const raw = completion.choices[0]?.message?.content
    if (!raw) {
      return NextResponse.json({ error: 'AI returned empty response' }, { status: 502 })
    }

    const analysis = parseAnalysisResult(raw)
    if (!analysis) {
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 502 })
    }

    // Auto-lookup business entity
    if (analysis.opposingParty.type === 'business') {
      const entity = await lookupBusinessEntity(analysis.opposingParty.name, analysis.state)
      if (entity) {
        analysis.opposingParty.legalName = entity.legalName
        analysis.opposingParty.registeredAgent = entity.registeredAgent ?? undefined
        analysis.opposingParty.entityType = entity.entityType
        analysis.opposingParty.entityStatus = entity.status
      }
    }

    return NextResponse.json({ analysis })
  } catch (err) {
    console.error('Quick Resolve analyze error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**Step 4: Run tests + build**

Run: `npx vitest run tests/unit/ai/story-analysis.test.ts && npx next build 2>&1 | tail -3`

**Step 5: Commit**

```bash
git add src/lib/ai/story-analysis.ts src/app/api/quick-resolve/analyze/route.ts tests/unit/ai/story-analysis.test.ts
git commit -m "feat(quick-resolve): add AI story analysis API with tests"
```

---

## Sprint 2: Lob.com Certified Mail Integration

### Task 5: Install Lob SDK + Send Letter API

**Files:**
- Modify: `package.json` (add `lob` dependency)
- Create: `src/lib/mail/lob-client.ts`
- Create: `src/app/api/quick-resolve/send-letter/route.ts`
- Test: `tests/unit/mail/lob-client.test.ts`

**Step 1: Install Lob**

Run: `cd "/Users/minwang/lawyer free" && npm install lob`

**Step 2: Write the Lob client wrapper**

```typescript
// src/lib/mail/lob-client.ts
const LOB_BASE = 'https://api.lob.com/v1'

interface LobLetterInput {
  recipientName: string
  recipientAddress: { line1: string; line2?: string; city: string; state: string; zip: string }
  senderName: string
  senderAddress: { line1: string; line2?: string; city: string; state: string; zip: string }
  htmlContent: string
}

interface LobLetterResult {
  id: string
  trackingNumber: string | null
  expectedDeliveryDate: string | null
  url: string
}

export async function sendCertifiedLetter(input: LobLetterInput): Promise<LobLetterResult> {
  const apiKey = process.env.LOB_API_KEY
  if (!apiKey) throw new Error('LOB_API_KEY not configured')

  const res = await fetch(`${LOB_BASE}/letters`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(`${apiKey}:`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: {
        name: input.recipientName,
        address_line1: input.recipientAddress.line1,
        address_line2: input.recipientAddress.line2 || undefined,
        address_city: input.recipientAddress.city,
        address_state: input.recipientAddress.state,
        address_zip: input.recipientAddress.zip,
      },
      from: {
        name: input.senderName,
        address_line1: input.senderAddress.line1,
        address_line2: input.senderAddress.line2 || undefined,
        address_city: input.senderAddress.city,
        address_state: input.senderAddress.state,
        address_zip: input.senderAddress.zip,
      },
      file: input.htmlContent,
      color: false,
      mail_type: 'usps_certified',
      extra_service: 'certified',
      return_envelope: false,
    }),
    signal: AbortSignal.timeout(30000),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Lob API error: ${res.status} — ${JSON.stringify(err)}`)
  }

  const letter = await res.json()
  return {
    id: letter.id,
    trackingNumber: letter.tracking_number ?? null,
    expectedDeliveryDate: letter.expected_delivery_date ?? null,
    url: letter.url ?? '',
  }
}
```

**Step 3: Write the send-letter API route**

```typescript
// src/app/api/quick-resolve/send-letter/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { sendLetterSchema } from '@/lib/schemas/quick-resolve'
import { sendCertifiedLetter } from '@/lib/mail/lob-client'

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase, user } = auth

    const body = await request.json()
    const parsed = sendLetterSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    // Verify case ownership
    const { data: caseRow } = await supabase
      .from('cases')
      .select('id, user_id')
      .eq('id', parsed.data.caseId)
      .single()

    if (!caseRow || caseRow.user_id !== user.id) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    // Get user display name for sender
    const displayName = user.user_metadata?.display_name || user.user_metadata?.full_name || user.email || 'Lawyer Free User'

    // Send via Lob
    const lobResult = await sendCertifiedLetter({
      recipientName: parsed.data.recipientName,
      recipientAddress: parsed.data.recipientAddress,
      senderName: displayName,
      senderAddress: parsed.data.senderAddress,
      htmlContent: parsed.data.letterHtml,
    })

    // Store delivery record
    const { data: delivery, error: insertError } = await supabase
      .from('demand_letter_deliveries')
      .insert({
        case_id: parsed.data.caseId,
        lob_letter_id: lobResult.id,
        tracking_number: lobResult.trackingNumber,
        status: 'created',
        recipient_name: parsed.data.recipientName,
        recipient_address: parsed.data.recipientAddress,
        sender_address: parsed.data.senderAddress,
        amount_charged_cents: 799,
        letter_content_url: lobResult.url,
        sent_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('Failed to store delivery:', insertError)
      return NextResponse.json({ error: 'Letter sent but tracking failed to save' }, { status: 500 })
    }

    return NextResponse.json({
      deliveryId: delivery.id,
      trackingNumber: lobResult.trackingNumber,
      expectedDelivery: lobResult.expectedDeliveryDate,
    })
  } catch (err) {
    console.error('Send letter error:', err)
    return NextResponse.json({ error: 'Failed to send letter' }, { status: 500 })
  }
}
```

**Step 4: Build**

Run: `npx next build 2>&1 | tail -3`

**Step 5: Commit**

```bash
git add package.json package-lock.json src/lib/mail/lob-client.ts src/app/api/quick-resolve/send-letter/route.ts
git commit -m "feat(quick-resolve): add Lob certified mail integration"
```

---

### Task 6: Lob Webhook for Delivery Status Updates

**Files:**
- Create: `src/app/api/webhooks/lob/route.ts`

**Step 1: Write the webhook handler**

```typescript
// src/app/api/webhooks/lob/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const STATUS_MAP: Record<string, string> = {
  'letter.created': 'created',
  'letter.rendered_pdf': 'created',
  'letter.mailed': 'mailed',
  'letter.in_transit': 'in_transit',
  'letter.in_local_area': 'in_transit',
  'letter.processed_for_delivery': 'in_transit',
  'letter.delivered': 'delivered',
  'letter.re-routed': 'in_transit',
  'letter.returned_to_sender': 'returned',
}

function verifyWebhookSignature(payload: string, signature: string): boolean {
  const secret = process.env.LOB_WEBHOOK_SECRET
  if (!secret) return false
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('lob-signature') ?? ''

    if (process.env.LOB_WEBHOOK_SECRET && !verifyWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = JSON.parse(rawBody)
    const eventType = event.event_type?.id as string | undefined
    const letterId = event.body?.id as string | undefined

    if (!eventType || !letterId) {
      return NextResponse.json({ ok: true }) // Ignore unrecognized events
    }

    const newStatus = STATUS_MAP[eventType]
    if (!newStatus) {
      return NextResponse.json({ ok: true }) // Ignore unmapped events
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    const updates: Record<string, unknown> = { status: newStatus }
    if (newStatus === 'delivered') updates.delivered_at = new Date().toISOString()
    if (event.body?.tracking_number) updates.tracking_number = event.body.tracking_number

    await supabase
      .from('demand_letter_deliveries')
      .update(updates)
      .eq('lob_letter_id', letterId)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Lob webhook error:', err)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
```

**Step 2: Build + Commit**

```bash
npx next build 2>&1 | tail -3
git add src/app/api/webhooks/lob/route.ts
git commit -m "feat(quick-resolve): add Lob webhook for delivery status tracking"
```

---

## Sprint 3: UI Components

### Task 7: Story Input Component

**Files:**
- Create: `src/components/quick-resolve/story-input.tsx`

**Step 1: Write the component**

A client component with a textarea, character counter, optional file upload area, and an "Analyze" button. Uses the existing warm design tokens. Calls `POST /api/quick-resolve/analyze` on submit. Shows loading spinner during AI analysis.

**Key props:** `onAnalysisComplete: (result: AnalysisResult) => void`

**Step 2: Build + Commit**

---

### Task 8: Analysis Review Component

**Files:**
- Create: `src/components/quick-resolve/analysis-review.tsx`

Displays extracted case data as editable fields. Shows OpenCorporates entity info if business. Edit mode toggles fields to inputs. "Looks right — draft my letter" button proceeds.

**Key props:** `analysis: AnalysisResult, onConfirm: (edited: AnalysisResult) => void`

---

### Task 9: Delivery Options Component

**Files:**
- Create: `src/components/quick-resolve/delivery-options.tsx`

Three delivery cards (certified mail $7.99, PDF download free, email free). Certified mail card triggers Stripe Checkout → on success calls send-letter API. Download card generates PDF. Shows tracking status after send.

---

### Task 10: Quick Resolve Page

**Files:**
- Create: `src/app/(authenticated)/quick-resolve/page.tsx`

Multi-step page orchestrating the flow: StoryInput → AnalysisReview → (case creation via existing API) → letter generation → DeliveryOptions. Uses `useState` for step management. Creates a real case on confirm with `entry_point: 'quick_resolve'`.

---

### Task 11: Add Quick Resolve Entry Point to Cases Page

**Files:**
- Modify: `src/app/(authenticated)/cases/page.tsx`

Add a "Quick Resolve" card/button alongside the existing "New Case" button. Links to `/quick-resolve`. Show it prominently in the empty state and as a secondary CTA when cases exist.

---

## Sprint 4: Follow-Up Cron + Polish

### Task 12: 14-Day Follow-Up Cron Job

**Files:**
- Create: `src/app/api/cron/demand-followup/route.ts`
- Modify: `vercel.json` (add cron schedule)

Queries `demand_letter_deliveries` where `status = 'delivered'` and `delivered_at < now() - 14 days`. For each, checks if case has an outcome recorded. If not, creates a notification prompting the user to update.

---

### Task 13: Delivery Tracking on Case Dashboard

**Files:**
- Create: `src/components/dashboard/delivery-tracking-card.tsx`
- Modify: `src/app/(authenticated)/case/[id]/focus-tab.tsx` (add card if delivery exists)

Shows delivery status (created → mailed → in transit → delivered) with timeline visualization, tracking number, and expected delivery date.

---

### Task 14: Integration Tests

**Files:**
- Create: `tests/e2e/quick-resolve/quick-resolve.spec.ts`

E2E test: navigate to /quick-resolve → fill in story → verify analysis renders → confirm → verify case created. Mock Lob API for certified mail test.

---

## Summary

| Sprint | Tasks | New Files | Effort (CC) |
|--------|-------|-----------|-------------|
| 1: Foundation | Tasks 1-4 | 8 files | ~45 min |
| 2: Lob Integration | Tasks 5-6 | 3 files | ~20 min |
| 3: UI Components | Tasks 7-11 | 5 files + 1 edit | ~30 min |
| 4: Polish | Tasks 12-14 | 3 files + 2 edits | ~20 min |
| **Total** | **14 tasks** | **~19 new files** | **~2 hours** |
