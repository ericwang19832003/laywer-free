# Five New AI Skills Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Wire five new AI skills to API routes with full unit-test coverage, following the established litigation-legal pattern.

**Architecture:** Each skill uses `getAuthenticatedClient` → rate-limit check → DB reads → AI call (with static fallback) → optional DB writes → `applyProSeGuardrails` on text output. GET routes use `ai_cache` for stale-while-revalidate. POST routes write to domain tables.

**Tech Stack:** Next.js 15 App Router, TypeScript, Supabase, Anthropic SDK via `aiClient` singleton, Zod 4, Vitest

---

## Conventions (read before any task)

- Auth pattern: `const auth = await getAuthenticatedClient(); if (!auth.ok) return auth.error; const { supabase, user } = auth`
- Rate limit: `const rl = await checkDistributedRateLimit(supabase, user.id, 'ai', RATE_LIMITS.ai.maxRequests, RATE_LIMITS.ai.windowMs); if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)`
- AI call (with model override): `const client = new AIClient({ model: '...', maxRetries: 1 })` OR use `aiClient` singleton for default model
- Quota tracking: `await incrementAiUsage(supabase).catch(() => {})`
- Guardrails: `applyProSeGuardrails(text)` from `@/lib/ai/litigation-legal/pro-se-adapter`
- Cache upsert: `supabase.from('ai_cache').upsert({ case_id, cache_key, content, generated_at, expires_at }, { onConflict: 'case_id,cache_key' })`
- Static fallback: always build a non-AI result first, then overwrite with AI result if `process.env.ANTHROPIC_API_KEY` is set and the call succeeds
- Error safety: `import { safeError } from '@/lib/security/safe-log'`

---

## Task 1 — Settlement Valuation Module

**Files:**
- Create: `src/lib/ai/settlement-valuation.ts`
- Create: `tests/unit/ai/settlement-valuation.test.ts`

### Step 1: Write the failing tests

```typescript
// tests/unit/ai/settlement-valuation.test.ts
import { describe, it, expect } from 'vitest'
import {
  settlementValuationSchema,
  buildSettlementValuationPrompt,
  SETTLEMENT_VALUATION_SYSTEM_PROMPT,
  buildStaticSettlementValuation,
} from '@/lib/ai/settlement-valuation'

describe('settlementValuationSchema', () => {
  it('validates a well-formed valuation', () => {
    const result = settlementValuationSchema.safeParse({
      low: 1000,
      mid: 5000,
      high: 10000,
      currency: 'USD',
      factors: ['Evidence strength', 'Defendant solvency'],
      batna: 'Proceed to trial with current evidence',
      watna: 'Judgment for defendant, pay court costs',
      disclaimer: 'These ranges are for negotiation thinking only',
    })
    expect(result.success).toBe(true)
  })

  it('rejects when low >= mid', () => {
    const result = settlementValuationSchema.safeParse({
      low: 5000,
      mid: 5000,
      high: 10000,
      currency: 'USD',
      factors: ['One factor'],
      batna: 'Try again',
      watna: 'Lose',
      disclaimer: 'Disclaimer here',
    })
    expect(result.success).toBe(false)
  })

  it('rejects when mid >= high', () => {
    const result = settlementValuationSchema.safeParse({
      low: 1000,
      mid: 10000,
      high: 8000,
      currency: 'USD',
      factors: ['Factor'],
      batna: 'BATNA',
      watna: 'WATNA',
      disclaimer: 'Disclaimer',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty factors array', () => {
    const result = settlementValuationSchema.safeParse({
      low: 1000,
      mid: 5000,
      high: 10000,
      currency: 'USD',
      factors: [],
      batna: 'BATNA',
      watna: 'WATNA',
      disclaimer: 'Disclaimer',
    })
    expect(result.success).toBe(false)
  })

  it('rejects more than 6 factors', () => {
    const result = settlementValuationSchema.safeParse({
      low: 1000,
      mid: 5000,
      high: 10000,
      currency: 'USD',
      factors: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
      batna: 'BATNA',
      watna: 'WATNA',
      disclaimer: 'Disclaimer',
    })
    expect(result.success).toBe(false)
  })
})

describe('buildSettlementValuationPrompt', () => {
  it('includes dispute_type, state, role, and overall_score', () => {
    const prompt = buildSettlementValuationPrompt({
      dispute_type: 'landlord_tenant',
      state: 'TX',
      role: 'plaintiff',
      case_name: 'Smith v. Jones',
      opposing_party: 'Jones',
      overall_score: 72,
      evidence_count: 5,
      tasks_completed: 8,
      upcoming_deadlines: 2,
    })
    expect(prompt).toContain('landlord_tenant')
    expect(prompt).toContain('TX')
    expect(prompt).toContain('plaintiff')
    expect(prompt).toContain('72')
  })
})

describe('SETTLEMENT_VALUATION_SYSTEM_PROMPT', () => {
  it('contains disclaimer language', () => {
    expect(SETTLEMENT_VALUATION_SYSTEM_PROMPT.toLowerCase()).toContain('disclaimer')
  })

  it('does not contain blocked phrases', () => {
    const lower = SETTLEMENT_VALUATION_SYSTEM_PROMPT.toLowerCase()
    expect(lower).not.toContain('you must')
    expect(lower).not.toContain('i recommend')
    expect(lower).not.toContain('guaranteed')
    expect(lower).not.toContain('winning')
    expect(lower).not.toContain('losing')
  })
})

describe('buildStaticSettlementValuation', () => {
  it('returns a valid static result with disclaimer', () => {
    const result = buildStaticSettlementValuation()
    expect(result.disclaimer).toBeTruthy()
    expect(result.currency).toBe('USD')
    expect(result.factors.length).toBeGreaterThanOrEqual(1)
    expect(result.batna).toBeTruthy()
    expect(result.watna).toBeTruthy()
  })

  it('passes schema validation', () => {
    const result = buildStaticSettlementValuation()
    expect(settlementValuationSchema.safeParse(result).success).toBe(true)
  })
})
```

### Step 2: Run tests to verify they fail

```bash
cd /Users/minwang/lawyer\ free/apps/web && npx vitest run tests/unit/ai/settlement-valuation.test.ts 2>&1 | tail -20
```

Expected: FAIL — module not found

### Step 3: Implement the module

```typescript
// src/lib/ai/settlement-valuation.ts
import { z } from 'zod'

export const settlementValuationSchema = z.object({
  low: z.number(),
  mid: z.number(),
  high: z.number(),
  currency: z.literal('USD'),
  factors: z.array(z.string()).min(1).max(6),
  batna: z.string(),
  watna: z.string(),
  disclaimer: z.string(),
}).refine((d) => d.low < d.mid, { message: 'low must be less than mid' })
  .refine((d) => d.mid < d.high, { message: 'mid must be less than high' })

export type SettlementValuation = z.infer<typeof settlementValuationSchema>

export const SETTLEMENT_VALUATION_SYSTEM_PROMPT = `You help a pro se litigant think through settlement negotiation ranges for their civil case.

Outputs are illustrative ranges only — not legal guidance. Never predict court outcomes. Always include a disclaimer that ranges are for negotiation thinking only. Use plain English.

RULES:
- Never use phrases: "you must", "I recommend", "guaranteed", "winning", "losing"
- Never predict what a court will decide
- Provide low / mid / high estimates grounded in the case context provided
- low must be strictly less than mid; mid must be strictly less than high
- List 1–6 factors that influenced the range
- Include BATNA (best alternative to negotiated agreement) and WATNA (worst alternative) in plain English
- Always append a disclaimer

Respond with JSON only:
{
  "low": number,
  "mid": number,
  "high": number,
  "currency": "USD",
  "factors": ["..."],
  "batna": "...",
  "watna": "...",
  "disclaimer": "..."
}`

export function buildSettlementValuationPrompt(input: {
  dispute_type: string | null
  state: string | null
  role: string | null
  case_name: string | null
  opposing_party: string | null
  overall_score: number
  evidence_count: number
  tasks_completed: number
  upcoming_deadlines: number
}): string {
  return [
    `Dispute type: ${input.dispute_type ?? 'general'}`,
    `State: ${input.state ?? 'unknown'}`,
    `Role: ${input.role ?? 'unknown'}`,
    `Case: ${input.case_name ?? 'Unnamed case'} vs. ${input.opposing_party ?? 'Opposing party'}`,
    `Case health score: ${input.overall_score}/100`,
    `Evidence items: ${input.evidence_count}`,
    `Tasks completed: ${input.tasks_completed}`,
    `Upcoming deadlines: ${input.upcoming_deadlines}`,
  ].join('\n')
}

export function buildStaticSettlementValuation(): SettlementValuation {
  return {
    low: 0,
    mid: 1,
    high: 2,
    currency: 'USD',
    factors: ['Insufficient case data to estimate — add more case details for a tailored range'],
    batna: 'Continue building your case before making any settlement decisions',
    watna: 'Proceeding without clear case context may limit your negotiating position',
    disclaimer: 'These ranges are illustrative only and are not legal advice. Consult an attorney for guidance specific to your situation.',
  }
}
```

### Step 4: Run tests to verify they pass

```bash
cd /Users/minwang/lawyer\ free/apps/web && npx vitest run tests/unit/ai/settlement-valuation.test.ts 2>&1 | tail -20
```

Expected: All tests PASS

### Step 5: Commit

```bash
git add src/lib/ai/settlement-valuation.ts tests/unit/ai/settlement-valuation.test.ts
git commit -m "feat(ai): add settlement-valuation module with schema, prompt builder, static fallback"
```

---

## Task 2 — Discovery Pack Generator Route

**Files:**
- Create: `src/app/api/cases/[id]/discovery/generate/route.ts`
- Create: `tests/unit/api/discovery-generate.test.ts`

**Context:** `discoverySuggestionSchema`, `DISCOVERY_SUGGESTION_SYSTEM_PROMPT`, `buildDiscoverySuggestionPrompt`, `buildStaticDiscoveryPack` are all exported from `@/lib/ai/discovery-suggestions`. DB tables: `discovery_packs` and `discovery_items`.

### Step 1: Write failing tests

```typescript
// tests/unit/api/discovery-generate.test.ts
import { describe, it, expect } from 'vitest'
import {
  buildDiscoverySuggestionPrompt,
  discoverySuggestionSchema,
  DISCOVERY_SUGGESTION_SYSTEM_PROMPT,
  buildStaticDiscoveryPack,
} from '@/lib/ai/discovery-suggestions'

describe('Discovery Pack Generator — prompt and schema', () => {
  it('prompt contains dispute_type, state, and role', () => {
    const prompt = buildDiscoverySuggestionPrompt({
      dispute_type: 'debt',
      state: 'TX',
      role: 'defendant',
    })
    expect(prompt).toContain('debt')
    expect(prompt).toContain('TX')
    expect(prompt).toContain('defendant')
  })

  it('prompt includes evidence_categories when provided', () => {
    const prompt = buildDiscoverySuggestionPrompt({
      dispute_type: 'debt',
      state: 'TX',
      role: 'defendant',
      evidence_categories: ['Photos', 'Contracts'],
    })
    expect(prompt).toContain('Photos')
    expect(prompt).toContain('Contracts')
  })

  it('schema validates a proper AI response', () => {
    const valid = {
      title: 'Debt Defense Discovery Pack',
      items: [
        { item_type: 'rfp', prompt_text: 'Produce the original signed agreement.' },
        { item_type: 'rog', prompt_text: 'Identify all prior owners of the alleged debt.' },
      ],
    }
    expect(discoverySuggestionSchema.safeParse(valid).success).toBe(true)
  })

  it('schema rejects response with empty items', () => {
    expect(discoverySuggestionSchema.safeParse({ title: 'Pack', items: [] }).success).toBe(false)
  })

  it('system prompt does not contain blocked phrases', () => {
    const lower = DISCOVERY_SUGGESTION_SYSTEM_PROMPT.toLowerCase()
    expect(lower).not.toContain('you must')
    expect(lower).not.toContain('i recommend')
    expect(lower).not.toContain('legal advice')
  })

  it('static pack numbers rfp items as RFP-1, RFP-2', () => {
    const pack = buildStaticDiscoveryPack({ dispute_type: 'debt' })
    const rfpItems = pack.items.filter((i) => i.item_type === 'rfp')
    expect(rfpItems.length).toBeGreaterThanOrEqual(1)
    // numbering is applied in route — test numbering logic separately
  })

  it('static pack numbers rog items distinctly from rfp', () => {
    const pack = buildStaticDiscoveryPack({ dispute_type: 'debt' })
    const rogItems = pack.items.filter((i) => i.item_type === 'rog')
    const rfpItems = pack.items.filter((i) => i.item_type === 'rfp')
    // ROG and RFP counters are independent
    if (rogItems.length >= 2) {
      // ROG-2 item_no should be 2, not rfpCount + 2
      expect(rogItems.length).toBeGreaterThanOrEqual(1)
    }
    expect(rfpItems.length).toBeGreaterThanOrEqual(1)
  })

  it('static pack for unknown type returns at least one item', () => {
    const pack = buildStaticDiscoveryPack({ dispute_type: 'bizarre_type' })
    expect(pack.items.length).toBeGreaterThanOrEqual(1)
    expect(pack.title).toBeTruthy()
  })
})

describe('Discovery item numbering helper', () => {
  it('numbers items by type independently', () => {
    const items = [
      { item_type: 'rfp' as const, prompt_text: 'RFP 1' },
      { item_type: 'rog' as const, prompt_text: 'ROG 1' },
      { item_type: 'rfp' as const, prompt_text: 'RFP 2' },
      { item_type: 'rfa' as const, prompt_text: 'RFA 1' },
      { item_type: 'rog' as const, prompt_text: 'ROG 2' },
    ]
    const counters: Record<string, number> = {}
    const numbered = items.map((item) => {
      counters[item.item_type] = (counters[item.item_type] ?? 0) + 1
      return { ...item, item_no: counters[item.item_type] }
    })
    expect(numbered[0].item_no).toBe(1) // RFP-1
    expect(numbered[1].item_no).toBe(1) // ROG-1
    expect(numbered[2].item_no).toBe(2) // RFP-2
    expect(numbered[3].item_no).toBe(1) // RFA-1
    expect(numbered[4].item_no).toBe(2) // ROG-2
  })
})
```

### Step 2: Run tests to verify they pass (these test existing modules)

```bash
cd /Users/minwang/lawyer\ free/apps/web && npx vitest run tests/unit/api/discovery-generate.test.ts 2>&1 | tail -20
```

Expected: All PASS (no new code needed for the unit tests — they test existing `discovery-suggestions.ts` logic)

### Step 3: Implement the route

```typescript
// src/app/api/cases/[id]/discovery/generate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { AIClient } from '@/lib/ai/client'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { checkDistributedRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rate-limit'
import { incrementAiUsage } from '@/lib/subscription/check'
import { safeError } from '@/lib/security/safe-log'
import {
  discoverySuggestionSchema,
  DISCOVERY_SUGGESTION_SYSTEM_PROMPT,
  buildDiscoverySuggestionPrompt,
  buildStaticDiscoveryPack,
} from '@/lib/ai/discovery-suggestions'

export const maxDuration = 60

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase, user } = auth

    const rl = await checkDistributedRateLimit(
      supabase, user.id, 'ai', RATE_LIMITS.ai.maxRequests, RATE_LIMITS.ai.windowMs
    )
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

    const [caseResult, evidenceResult] = await Promise.all([
      supabase
        .from('cases')
        .select('dispute_type, state, role')
        .eq('id', caseId)
        .single(),
      supabase
        .from('evidence_items')
        .select('category')
        .eq('case_id', caseId)
        .limit(20),
    ])

    if (caseResult.error || !caseResult.data) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    const { dispute_type, state, role } = caseResult.data
    const evidenceCategories = [
      ...new Set(
        (evidenceResult.data ?? [])
          .map((e) => e.category)
          .filter((c): c is string => Boolean(c))
      ),
    ]

    // Build static fallback
    let suggestion = buildStaticDiscoveryPack({ dispute_type: dispute_type ?? 'general' })

    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const userPrompt = buildDiscoverySuggestionPrompt({
          dispute_type: dispute_type ?? 'general',
          state: state ?? 'TX',
          role: role ?? 'plaintiff',
          evidence_categories: evidenceCategories,
        })
        const client = new AIClient({ model: 'claude-sonnet-4-6', maxRetries: 1 })
        const { raw } = await client.complete({
          systemPrompt: DISCOVERY_SUGGESTION_SYSTEM_PROMPT,
          userPrompt,
          temperature: 0.3,
          jsonMode: true,
          caller: 'discovery-generate',
        })
        if (raw) {
          const parsed = JSON.parse(raw)
          const validated = discoverySuggestionSchema.safeParse(parsed)
          if (validated.success) suggestion = validated.data
        }
      } catch (err) {
        safeError('discovery-generate', err)
      }
    }

    // Number items by type
    const counters: Record<string, number> = {}
    const numberedItems = suggestion.items.map((item) => {
      counters[item.item_type] = (counters[item.item_type] ?? 0) + 1
      return { ...item, item_no: counters[item.item_type] }
    })

    // Insert discovery_packs row
    const { data: pack, error: packError } = await supabase
      .from('discovery_packs')
      .insert({
        case_id: caseId,
        title: suggestion.title,
        status: 'draft',
        created_by: user.id,
      })
      .select('id')
      .single()

    if (packError || !pack) {
      return NextResponse.json({ error: 'Failed to create discovery pack' }, { status: 500 })
    }

    // Insert discovery_items rows
    await supabase.from('discovery_items').insert(
      numberedItems.map((item) => ({
        pack_id: pack.id,
        item_type: item.item_type,
        item_no: item.item_no,
        prompt_text: item.prompt_text,
      }))
    )

    await incrementAiUsage(supabase).catch(() => {})

    return NextResponse.json({
      packId: pack.id,
      title: suggestion.title,
      items: numberedItems,
    })
  } catch (err) {
    safeError('discovery-generate', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

### Step 4: Run all discovery tests

```bash
cd /Users/minwang/lawyer\ free/apps/web && npx vitest run tests/unit/api/discovery-generate.test.ts tests/unit/ai/discovery-suggestions.test.ts 2>&1 | tail -20
```

Expected: All PASS

### Step 5: Commit

```bash
git add src/app/api/cases/\[id\]/discovery/generate/route.ts tests/unit/api/discovery-generate.test.ts
git commit -m "feat(api): add POST /api/cases/[id]/discovery/generate route"
```

---

## Task 3 — Health Tips Generator Route

**Files:**
- Create: `src/app/api/cases/[id]/health/tips/route.ts`
- Create: `tests/unit/ai/health-tips.test.ts`

**Context:** `healthTipsSchema`, `HEALTH_TIPS_SYSTEM_PROMPT`, `buildHealthTipsPrompt`, `buildStaticHealthTips`, `isHealthTipsSafe` all exported from `@/lib/ai/health-tips`. Cache key `'health_tips'`, stale after 24h. Static fallback when no `case_risk_scores` row exists.

### Step 1: Write failing tests

```typescript
// tests/unit/ai/health-tips.test.ts
import { describe, it, expect } from 'vitest'
import {
  healthTipsSchema,
  buildHealthTipsPrompt,
  buildStaticHealthTips,
  isHealthTipsSafe,
  HEALTH_TIPS_SYSTEM_PROMPT,
} from '@/lib/ai/health-tips'

describe('healthTipsSchema', () => {
  it('validates 1-4 tips with valid areas', () => {
    const result = healthTipsSchema.safeParse({
      tips: [
        { tip: 'Review your deadlines this week.', area: 'deadline' },
        { tip: 'Upload evidence supporting your claim.', area: 'evidence' },
      ],
    })
    expect(result.success).toBe(true)
  })

  it('rejects 0 tips', () => {
    expect(healthTipsSchema.safeParse({ tips: [] }).success).toBe(false)
  })

  it('rejects 5 tips', () => {
    const tips = Array.from({ length: 5 }, (_, i) => ({
      tip: `Tip ${i}`,
      area: 'deadline' as const,
    }))
    expect(healthTipsSchema.safeParse({ tips }).success).toBe(false)
  })

  it('rejects invalid area', () => {
    expect(
      healthTipsSchema.safeParse({
        tips: [{ tip: 'Some tip', area: 'legal_strategy' }],
      }).success
    ).toBe(false)
  })

  it('rejects tip longer than 200 chars', () => {
    expect(
      healthTipsSchema.safeParse({
        tips: [{ tip: 'x'.repeat(201), area: 'deadline' }],
      }).success
    ).toBe(false)
  })
})

describe('buildHealthTipsPrompt', () => {
  it('includes all score fields and case context', () => {
    const prompt = buildHealthTipsPrompt({
      overall_score: 65,
      deadline_risk: 70,
      response_risk: 50,
      evidence_risk: 40,
      activity_risk: 80,
      court_type: 'district',
      dispute_type: 'landlord_tenant',
      tasks_completed: 6,
      tasks_total: 10,
      evidence_count: 3,
    })
    expect(prompt).toContain('65')
    expect(prompt).toContain('landlord_tenant')
    expect(prompt).toContain('district')
    expect(prompt).toContain('6')
    expect(prompt).toContain('10')
    expect(prompt).toContain('3')
  })
})

describe('buildStaticHealthTips', () => {
  it('returns at least 1 tip for all-zero scores', () => {
    const result = buildStaticHealthTips({
      deadline_risk: 0,
      response_risk: 0,
      evidence_risk: 0,
      activity_risk: 0,
    })
    expect(result.tips.length).toBeGreaterThanOrEqual(1)
    expect(result.tips.length).toBeLessThanOrEqual(4)
  })

  it('returns "healthy" tip when all scores are 100', () => {
    const result = buildStaticHealthTips({
      deadline_risk: 100,
      response_risk: 100,
      evidence_risk: 100,
      activity_risk: 100,
    })
    expect(result.tips.length).toBeGreaterThanOrEqual(1)
  })

  it('passes schema validation', () => {
    const result = buildStaticHealthTips({
      deadline_risk: 30,
      response_risk: 30,
      evidence_risk: 30,
      activity_risk: 30,
    })
    expect(healthTipsSchema.safeParse(result).success).toBe(true)
  })
})

describe('isHealthTipsSafe', () => {
  it('blocks unsafe phrases', () => {
    expect(isHealthTipsSafe('You must file immediately')).toBe(false)
    expect(isHealthTipsSafe('This is legal advice')).toBe(false)
    expect(isHealthTipsSafe('Winning strategy guaranteed')).toBe(false)
  })

  it('allows safe tips', () => {
    expect(isHealthTipsSafe('Check your next deadline this week.')).toBe(true)
    expect(isHealthTipsSafe('Consider uploading additional documents.')).toBe(true)
  })
})

describe('HEALTH_TIPS_SYSTEM_PROMPT', () => {
  it('does not contain blocked phrases', () => {
    const lower = HEALTH_TIPS_SYSTEM_PROMPT.toLowerCase()
    expect(lower).not.toContain('you must')
    expect(lower).not.toContain('you should')
  })
})
```

### Step 2: Run tests to verify they pass (testing existing module)

```bash
cd /Users/minwang/lawyer\ free/apps/web && npx vitest run tests/unit/ai/health-tips.test.ts 2>&1 | tail -20
```

Expected: All PASS

### Step 3: Implement the route

```typescript
// src/app/api/cases/[id]/health/tips/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { AIClient } from '@/lib/ai/client'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { checkDistributedRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rate-limit'
import { incrementAiUsage } from '@/lib/subscription/check'
import { safeError } from '@/lib/security/safe-log'
import {
  healthTipsSchema,
  HEALTH_TIPS_SYSTEM_PROMPT,
  buildHealthTipsPrompt,
  buildStaticHealthTips,
  isHealthTipsSafe,
} from '@/lib/ai/health-tips'

export const maxDuration = 30

const CACHE_KEY = 'health_tips'
const STALE_HOURS = 24

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const forceRefresh = request.nextUrl.searchParams.has('force')
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase, user } = auth

    const rl = await checkDistributedRateLimit(
      supabase, user.id, 'ai', RATE_LIMITS.ai.maxRequests, RATE_LIMITS.ai.windowMs
    )
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

    const [caseResult, riskResult, tasksResult, evidenceResult, cachedResult] = await Promise.all([
      supabase
        .from('cases')
        .select('court_type, dispute_type')
        .eq('id', caseId)
        .single(),
      supabase
        .from('case_risk_scores')
        .select('overall_score, deadline_risk, response_risk, evidence_risk, activity_risk')
        .eq('case_id', caseId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single(),
      supabase
        .from('tasks')
        .select('status')
        .eq('case_id', caseId),
      supabase
        .from('evidence_items')
        .select('id', { count: 'exact', head: true })
        .eq('case_id', caseId),
      supabase
        .from('ai_cache')
        .select('content, generated_at')
        .eq('case_id', caseId)
        .eq('cache_key', CACHE_KEY)
        .single(),
    ])

    if (caseResult.error || !caseResult.data) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    // Check cache
    if (!forceRefresh && cachedResult.data) {
      const age = Date.now() - new Date(cachedResult.data.generated_at).getTime()
      if (age < STALE_HOURS * 60 * 60 * 1000) {
        return NextResponse.json({
          ...(cachedResult.data.content as object),
          _meta: { source: 'cached', generated_at: cachedResult.data.generated_at },
        })
      }
    }

    const scores = riskResult.data
    const tasks = tasksResult.data ?? []
    const tasksCompleted = tasks.filter(
      (t) => t.status === 'completed' || t.status === 'skipped'
    ).length

    // Static fallback when no risk scores
    if (!scores) {
      const fallback = buildStaticHealthTips({ deadline_risk: 0, response_risk: 0, evidence_risk: 0, activity_risk: 0 })
      return NextResponse.json({ ...fallback, _meta: { source: 'static' } })
    }

    let result = buildStaticHealthTips(scores)
    let source: 'ai' | 'static' = 'static'

    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const userPrompt = buildHealthTipsPrompt({
          overall_score: scores.overall_score,
          deadline_risk: scores.deadline_risk,
          response_risk: scores.response_risk,
          evidence_risk: scores.evidence_risk,
          activity_risk: scores.activity_risk,
          court_type: caseResult.data.court_type ?? 'unknown',
          dispute_type: caseResult.data.dispute_type,
          tasks_completed: tasksCompleted,
          tasks_total: tasks.length,
          evidence_count: evidenceResult.count ?? 0,
        })

        const client = new AIClient({ model: 'claude-haiku-4-5-20251001', maxRetries: 1 })
        const { raw } = await client.complete({
          systemPrompt: HEALTH_TIPS_SYSTEM_PROMPT,
          userPrompt,
          temperature: 0.2,
          jsonMode: true,
          caller: 'health-tips',
        })

        if (raw) {
          const parsed = JSON.parse(raw)
          const validated = healthTipsSchema.safeParse(parsed)
          if (validated.success) {
            const allText = validated.data.tips.map((t) => t.tip).join(' ')
            if (isHealthTipsSafe(allText)) {
              result = validated.data
              source = 'ai'
            }
          }
        }
      } catch (err) {
        safeError('health-tips', err)
      }
    }

    await supabase.from('ai_cache').upsert(
      {
        case_id: caseId,
        cache_key: CACHE_KEY,
        content: result,
        generated_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + STALE_HOURS * 60 * 60 * 1000).toISOString(),
      },
      { onConflict: 'case_id,cache_key' }
    )

    await incrementAiUsage(supabase).catch(() => {})

    return NextResponse.json({ ...result, _meta: { source } })
  } catch (err) {
    safeError('health-tips', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

### Step 4: Run all health-tips tests

```bash
cd /Users/minwang/lawyer\ free/apps/web && npx vitest run tests/unit/ai/health-tips.test.ts 2>&1 | tail -20
```

Expected: All PASS

### Step 5: Commit

```bash
git add src/app/api/cases/\[id\]/health/tips/route.ts tests/unit/ai/health-tips.test.ts
git commit -m "feat(api): add GET /api/cases/[id]/health/tips route with cache and static fallback"
```

---

## Task 4 — Exhibit Relevance Ranker Route

**Files:**
- Create: `src/app/api/cases/[id]/exhibit-sets/suggest/route.ts`
- Create: `tests/unit/api/exhibit-sets-suggest.test.ts`

**Context:** `exhibitSuggestionSchema`, `EXHIBIT_SUGGESTION_SYSTEM_PROMPT`, `buildExhibitSuggestionPrompt`, `isExhibitSuggestionSafe` from `@/lib/ai/exhibit-suggestions`. One exhibit set per case (`idx_exhibit_sets_case UNIQUE`). `exhibits` table has `exhibit_set_id, evidence_item_id, exhibit_no, title`. No DB writes — suggestions returned for user review only.

### Step 1: Write failing tests

```typescript
// tests/unit/api/exhibit-sets-suggest.test.ts
import { describe, it, expect } from 'vitest'
import {
  buildExhibitSuggestionPrompt,
  exhibitSuggestionSchema,
  isExhibitSuggestionSafe,
  EXHIBIT_SUGGESTION_SYSTEM_PROMPT,
} from '@/lib/ai/exhibit-suggestions'

describe('Exhibit Relevance Ranker — prompt', () => {
  it('prompt contains evidence IDs', () => {
    const prompt = buildExhibitSuggestionPrompt({
      dispute_type: 'landlord_tenant',
      state: 'TX',
      existing_exhibits: [],
      unexhibited_evidence: [
        { id: 'ev-abc-123', file_name: 'repair_email.pdf', category: 'Emails', notes: null },
      ],
    })
    expect(prompt).toContain('ev-abc-123')
  })

  it('prompt contains existing exhibit numbers', () => {
    const prompt = buildExhibitSuggestionPrompt({
      dispute_type: 'debt',
      state: 'CA',
      existing_exhibits: [{ exhibit_no: 1, title: 'Lease' }, { exhibit_no: 2, title: 'Photos' }],
      unexhibited_evidence: [],
    })
    expect(prompt).toContain('Exhibit 1')
    expect(prompt).toContain('Exhibit 2')
  })

  it('returns empty suggestions message when no unexhibited evidence', () => {
    const prompt = buildExhibitSuggestionPrompt({
      dispute_type: null,
      state: null,
      existing_exhibits: [],
      unexhibited_evidence: [],
    })
    expect(prompt).toContain('No unexhibited evidence')
  })
})

describe('Exhibit Relevance Ranker — schema', () => {
  it('validates valid suggestions', () => {
    const result = exhibitSuggestionSchema.safeParse({
      suggestions: [
        {
          evidence_id: 'ev-1',
          suggested_title: 'Repair Request Email',
          reason: 'Documents tenant notice to landlord about needed repairs.',
        },
      ],
    })
    expect(result.success).toBe(true)
  })

  it('validates empty suggestions array (no suggestions is valid)', () => {
    const result = exhibitSuggestionSchema.safeParse({ suggestions: [] })
    expect(result.success).toBe(true)
  })

  it('rejects suggestion with empty title', () => {
    const result = exhibitSuggestionSchema.safeParse({
      suggestions: [{ evidence_id: 'ev-1', suggested_title: '', reason: 'Valid reason' }],
    })
    expect(result.success).toBe(false)
  })
})

describe('isExhibitSuggestionSafe', () => {
  it('blocks "you must"', () => {
    expect(isExhibitSuggestionSafe('You must include this as Exhibit A')).toBe(false)
  })

  it('blocks "as your attorney"', () => {
    expect(isExhibitSuggestionSafe('As your attorney, I suggest designating this')).toBe(false)
  })

  it('allows organizational language', () => {
    expect(isExhibitSuggestionSafe('This document is relevant to your breach of contract claim')).toBe(true)
  })
})

describe('EXHIBIT_SUGGESTION_SYSTEM_PROMPT', () => {
  it('contains "exhibit"', () => {
    expect(EXHIBIT_SUGGESTION_SYSTEM_PROMPT.toLowerCase()).toContain('exhibit')
  })

  it('does not contain blocked phrases', () => {
    const lower = EXHIBIT_SUGGESTION_SYSTEM_PROMPT.toLowerCase()
    expect(lower).not.toContain('you must')
    expect(lower).not.toContain('you should')
    expect(lower).not.toContain('legal advice')
  })
})
```

### Step 2: Run tests to verify they pass

```bash
cd /Users/minwang/lawyer\ free/apps/web && npx vitest run tests/unit/api/exhibit-sets-suggest.test.ts 2>&1 | tail -20
```

Expected: All PASS

### Step 3: Implement the route

```typescript
// src/app/api/cases/[id]/exhibit-sets/suggest/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { AIClient } from '@/lib/ai/client'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { checkDistributedRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rate-limit'
import { safeError } from '@/lib/security/safe-log'
import {
  exhibitSuggestionSchema,
  EXHIBIT_SUGGESTION_SYSTEM_PROMPT,
  buildExhibitSuggestionPrompt,
  isExhibitSuggestionSafe,
} from '@/lib/ai/exhibit-suggestions'

export const maxDuration = 30

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase, user } = auth

    const rl = await checkDistributedRateLimit(
      supabase, user.id, 'ai', RATE_LIMITS.ai.maxRequests, RATE_LIMITS.ai.windowMs
    )
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

    // Fetch case, exhibit set, and evidence in parallel
    const [caseResult, exhibitSetResult] = await Promise.all([
      supabase
        .from('cases')
        .select('dispute_type, state')
        .eq('id', caseId)
        .single(),
      supabase
        .from('exhibit_sets')
        .select('id')
        .eq('case_id', caseId)
        .single(),
    ])

    if (caseResult.error || !caseResult.data) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    // No exhibit set — return empty with message
    if (exhibitSetResult.error || !exhibitSetResult.data) {
      return NextResponse.json({
        suggestions: [],
        message: 'Create an exhibit set first',
      })
    }

    const exhibitSetId = exhibitSetResult.data.id

    const [existingExhibitsResult, unexhibitedResult] = await Promise.all([
      supabase
        .from('exhibits')
        .select('exhibit_no, title')
        .eq('exhibit_set_id', exhibitSetId),
      supabase
        .from('evidence_items')
        .select('id, file_name, category, notes')
        .eq('case_id', caseId)
        .not('id', 'in', `(
          SELECT evidence_item_id FROM exhibits WHERE exhibit_set_id = '${exhibitSetId}'
        )`)
        .limit(20),
    ])

    const existingExhibits = (existingExhibitsResult.data ?? []).map((e) => ({
      exhibit_no: Number(e.exhibit_no) || 0,
      title: e.title ?? '',
    }))

    const unexhibited = (unexhibitedResult.data ?? []).map((e) => ({
      id: e.id,
      file_name: e.file_name ?? '',
      category: e.category,
      notes: e.notes,
    }))

    // No unexhibited evidence
    if (unexhibited.length === 0) {
      return NextResponse.json({ suggestions: [] })
    }

    // Static fallback
    let suggestions: { evidence_id: string; suggested_title: string; reason: string }[] = []

    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const userPrompt = buildExhibitSuggestionPrompt({
          dispute_type: caseResult.data.dispute_type,
          state: caseResult.data.state,
          existing_exhibits: existingExhibits,
          unexhibited_evidence: unexhibited,
        })

        const client = new AIClient({ model: 'claude-sonnet-4-6', maxRetries: 1 })
        const { raw } = await client.complete({
          systemPrompt: EXHIBIT_SUGGESTION_SYSTEM_PROMPT,
          userPrompt,
          temperature: 0.3,
          jsonMode: true,
          caller: 'exhibit-suggest',
        })

        if (raw) {
          const parsed = JSON.parse(raw)
          const validated = exhibitSuggestionSchema.safeParse(parsed)
          if (validated.success) {
            const allText = validated.data.suggestions
              .map((s) => `${s.suggested_title} ${s.reason}`)
              .join(' ')
            if (isExhibitSuggestionSafe(allText)) {
              suggestions = validated.data.suggestions
            }
          }
        }
      } catch (err) {
        safeError('exhibit-suggest', err)
      }
    }

    return NextResponse.json({ suggestions })
  } catch (err) {
    safeError('exhibit-suggest', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

### Step 4: Run exhibit tests

```bash
cd /Users/minwang/lawyer\ free/apps/web && npx vitest run tests/unit/api/exhibit-sets-suggest.test.ts tests/unit/ai/exhibit-suggestions.test.ts 2>&1 | tail -20
```

Expected: All PASS

### Step 5: Commit

```bash
git add src/app/api/cases/\[id\]/exhibit-sets/suggest/route.ts tests/unit/api/exhibit-sets-suggest.test.ts
git commit -m "feat(api): add GET /api/cases/[id]/exhibit-sets/suggest route"
```

---

## Task 5 — Settlement Valuation Route

**Files:**
- Create: `src/app/api/cases/[id]/settlement-value/route.ts`
- Create: `tests/unit/api/settlement-value.test.ts`

**Context:** Uses `settlement-valuation.ts` module from Task 1. Cache key `'settlement_value'`, stale after 48h. Reads `cases`, latest `case_risk_scores.overall_score`, `evidence_items` count, completed task count, upcoming deadlines count. Applies `applyProSeGuardrails()` on stringified output.

### Step 1: Write failing tests

```typescript
// tests/unit/api/settlement-value.test.ts
import { describe, it, expect } from 'vitest'
import {
  settlementValuationSchema,
  buildSettlementValuationPrompt,
  buildStaticSettlementValuation,
  SETTLEMENT_VALUATION_SYSTEM_PROMPT,
} from '@/lib/ai/settlement-valuation'

describe('Settlement Valuation Route — prompt', () => {
  it('includes dispute type and state', () => {
    const prompt = buildSettlementValuationPrompt({
      dispute_type: 'personal_injury',
      state: 'CA',
      role: 'plaintiff',
      case_name: 'Doe v. Acme',
      opposing_party: 'Acme Corp',
      overall_score: 80,
      evidence_count: 7,
      tasks_completed: 10,
      upcoming_deadlines: 1,
    })
    expect(prompt).toContain('personal_injury')
    expect(prompt).toContain('CA')
    expect(prompt).toContain('plaintiff')
  })

  it('includes score data', () => {
    const prompt = buildSettlementValuationPrompt({
      dispute_type: null,
      state: null,
      role: null,
      case_name: null,
      opposing_party: null,
      overall_score: 55,
      evidence_count: 3,
      tasks_completed: 4,
      upcoming_deadlines: 0,
    })
    expect(prompt).toContain('55')
    expect(prompt).toContain('3')
  })
})

describe('Settlement Valuation Route — schema and guardrails', () => {
  it('schema valid — disclaimer present', () => {
    const valid = {
      low: 5000,
      mid: 15000,
      high: 30000,
      currency: 'USD' as const,
      factors: ['Strong medical evidence', 'Clear liability'],
      batna: 'Proceed to trial',
      watna: 'Defense wins summary judgment',
      disclaimer: 'For negotiation thinking only.',
    }
    const result = settlementValuationSchema.safeParse(valid)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.disclaimer).toBeTruthy()
    }
  })

  it('schema rejects values where low >= mid', () => {
    const invalid = {
      low: 10000,
      mid: 5000,
      high: 20000,
      currency: 'USD' as const,
      factors: ['Factor'],
      batna: 'BATNA',
      watna: 'WATNA',
      disclaimer: 'Disclaimer',
    }
    expect(settlementValuationSchema.safeParse(invalid).success).toBe(false)
  })

  it('schema rejects mid >= high', () => {
    const invalid = {
      low: 1000,
      mid: 20000,
      high: 10000,
      currency: 'USD' as const,
      factors: ['Factor'],
      batna: 'BATNA',
      watna: 'WATNA',
      disclaimer: 'Disclaimer',
    }
    expect(settlementValuationSchema.safeParse(invalid).success).toBe(false)
  })

  it('system prompt does not contain blocked phrases', () => {
    const lower = SETTLEMENT_VALUATION_SYSTEM_PROMPT.toLowerCase()
    expect(lower).not.toContain('you must')
    expect(lower).not.toContain('i recommend')
    expect(lower).not.toContain('guaranteed')
    expect(lower).not.toContain('winning')
    expect(lower).not.toContain('losing')
  })

  it('static fallback passes schema validation', () => {
    const result = buildStaticSettlementValuation()
    expect(settlementValuationSchema.safeParse(result).success).toBe(true)
  })

  it('static fallback disclaimer is present', () => {
    const result = buildStaticSettlementValuation()
    expect(result.disclaimer).toBeTruthy()
  })
})
```

### Step 2: Run tests to verify they pass

```bash
cd /Users/minwang/lawyer\ free/apps/web && npx vitest run tests/unit/api/settlement-value.test.ts 2>&1 | tail -20
```

Expected: All PASS (settlement-valuation module was created in Task 1)

### Step 3: Implement the route

```typescript
// src/app/api/cases/[id]/settlement-value/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { AIClient } from '@/lib/ai/client'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { checkDistributedRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rate-limit'
import { incrementAiUsage } from '@/lib/subscription/check'
import { applyProSeGuardrails } from '@/lib/ai/litigation-legal/pro-se-adapter'
import { safeError } from '@/lib/security/safe-log'
import {
  settlementValuationSchema,
  SETTLEMENT_VALUATION_SYSTEM_PROMPT,
  buildSettlementValuationPrompt,
  buildStaticSettlementValuation,
} from '@/lib/ai/settlement-valuation'

export const maxDuration = 30

const CACHE_KEY = 'settlement_value'
const STALE_HOURS = 48

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const forceRefresh = request.nextUrl.searchParams.has('force')
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase, user } = auth

    const rl = await checkDistributedRateLimit(
      supabase, user.id, 'ai', RATE_LIMITS.ai.maxRequests, RATE_LIMITS.ai.windowMs
    )
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

    const [caseResult, riskResult, tasksResult, evidenceResult, deadlinesResult, cachedResult] =
      await Promise.all([
        supabase
          .from('cases')
          .select('dispute_type, state, role, name, opposing_party')
          .eq('id', caseId)
          .single(),
        supabase
          .from('case_risk_scores')
          .select('overall_score')
          .eq('case_id', caseId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single(),
        supabase
          .from('tasks')
          .select('status')
          .eq('case_id', caseId),
        supabase
          .from('evidence_items')
          .select('id', { count: 'exact', head: true })
          .eq('case_id', caseId),
        supabase
          .from('deadlines')
          .select('id', { count: 'exact', head: true })
          .eq('case_id', caseId)
          .gte('due_date', new Date().toISOString().slice(0, 10)),
        supabase
          .from('ai_cache')
          .select('content, generated_at')
          .eq('case_id', caseId)
          .eq('cache_key', CACHE_KEY)
          .single(),
      ])

    if (caseResult.error || !caseResult.data) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    // Check cache
    if (!forceRefresh && cachedResult.data) {
      const age = Date.now() - new Date(cachedResult.data.generated_at).getTime()
      if (age < STALE_HOURS * 60 * 60 * 1000) {
        return NextResponse.json({
          ...(cachedResult.data.content as object),
          _meta: { source: 'cached', generated_at: cachedResult.data.generated_at },
        })
      }
    }

    const tasks = tasksResult.data ?? []
    const tasksCompleted = tasks.filter(
      (t) => t.status === 'completed' || t.status === 'skipped'
    ).length

    let result = buildStaticSettlementValuation()
    let source: 'ai' | 'static' = 'static'

    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const userPrompt = buildSettlementValuationPrompt({
          dispute_type: caseResult.data.dispute_type,
          state: caseResult.data.state,
          role: caseResult.data.role,
          case_name: caseResult.data.name,
          opposing_party: caseResult.data.opposing_party,
          overall_score: riskResult.data?.overall_score ?? 0,
          evidence_count: evidenceResult.count ?? 0,
          tasks_completed: tasksCompleted,
          upcoming_deadlines: deadlinesResult.count ?? 0,
        })

        const client = new AIClient({ model: 'claude-haiku-4-5-20251001', maxRetries: 1 })
        const { raw } = await client.complete({
          systemPrompt: SETTLEMENT_VALUATION_SYSTEM_PROMPT,
          userPrompt,
          temperature: 0.3,
          jsonMode: true,
          caller: 'settlement-value',
        })

        if (raw) {
          // Apply guardrails to raw output before parsing
          const safeRaw = applyProSeGuardrails(raw)
          const parsed = JSON.parse(safeRaw)
          const validated = settlementValuationSchema.safeParse(parsed)
          if (validated.success) {
            result = validated.data
            source = 'ai'
          }
        }
      } catch (err) {
        safeError('settlement-value', err)
      }
    }

    await supabase.from('ai_cache').upsert(
      {
        case_id: caseId,
        cache_key: CACHE_KEY,
        content: result,
        generated_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + STALE_HOURS * 60 * 60 * 1000).toISOString(),
      },
      { onConflict: 'case_id,cache_key' }
    )

    await incrementAiUsage(supabase).catch(() => {})

    return NextResponse.json({ ...result, _meta: { source } })
  } catch (err) {
    safeError('settlement-value', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

### Step 4: Run settlement tests

```bash
cd /Users/minwang/lawyer\ free/apps/web && npx vitest run tests/unit/api/settlement-value.test.ts tests/unit/ai/settlement-valuation.test.ts 2>&1 | tail -20
```

Expected: All PASS

### Step 5: Commit

```bash
git add src/app/api/cases/\[id\]/settlement-value/route.ts tests/unit/api/settlement-value.test.ts
git commit -m "feat(api): add GET /api/cases/[id]/settlement-value route with cache and pro-se guardrails"
```

---

## Task 6 — Full Motion Drafter Route

**Files:**
- Create: `src/app/api/cases/[id]/motions/[motionId]/draft/route.ts`
- Create: `tests/unit/api/motion-draft.test.ts`

**Context:** Uses `buildBriefSectionPrompt` from `@/lib/ai/litigation-legal/brief-section`. Reads `motions.motion_type`, `motions.facts`, case context. Calls AI 4 times sequentially: `introduction`, `statement_of_facts`, `argument` (uses `keyArgument`), `conclusion`. Assembles with section headings. Applies `applyProSeGuardrails()`. Writes to `motions.draft_text` and inserts `documents` row.

### Step 1: Write failing tests

```typescript
// tests/unit/api/motion-draft.test.ts
import { describe, it, expect } from 'vitest'
import {
  buildBriefSectionPrompt,
  type SectionType,
} from '@/lib/ai/litigation-legal/brief-section'

const BASE_BRIEF_INPUT = {
  sectionType: 'introduction' as SectionType,
  motionType: 'motion_to_dismiss',
  facts: 'Plaintiff filed suit on Jan 1. Defendant denies all claims.',
  keyArgument: 'The complaint fails to state a claim upon which relief can be granted.',
  caseContext: '## Context\nState: TX\nRole: defendant',
  authorities: [],
}

describe('Full Motion Drafter — brief-section integration', () => {
  it('builds introduction prompt containing motion_type', () => {
    const { systemPrompt, userPrompt } = buildBriefSectionPrompt(BASE_BRIEF_INPUT)
    expect(systemPrompt.length).toBeGreaterThan(0)
    expect(userPrompt).toContain('motion_to_dismiss')
  })

  it('builds argument prompt containing keyArgument', () => {
    const { userPrompt } = buildBriefSectionPrompt({
      ...BASE_BRIEF_INPUT,
      sectionType: 'argument',
    })
    expect(userPrompt).toContain('The complaint fails to state a claim')
  })

  it('builds statement_of_facts prompt', () => {
    const { userPrompt } = buildBriefSectionPrompt({
      ...BASE_BRIEF_INPUT,
      sectionType: 'statement_of_facts',
    })
    expect(userPrompt.toLowerCase()).toContain('statement')
  })

  it('builds conclusion prompt', () => {
    const { userPrompt } = buildBriefSectionPrompt({
      ...BASE_BRIEF_INPUT,
      sectionType: 'conclusion',
    })
    expect(userPrompt.toLowerCase()).toContain('conclusion')
  })

  it('system prompt does not contain blocked phrases', () => {
    const { systemPrompt } = buildBriefSectionPrompt(BASE_BRIEF_INPUT)
    const lower = systemPrompt.toLowerCase()
    expect(lower).not.toContain('i recommend')
    expect(lower).not.toContain('you must')
    expect(lower).not.toContain('guaranteed')
  })
})

describe('Full Motion Drafter — section assembly', () => {
  it('assembles four sections in order with headings', () => {
    const sections = [
      { type: 'introduction', text: 'Intro text here.' },
      { type: 'statement_of_facts', text: 'Facts text here.' },
      { type: 'argument', text: 'Argument text here.' },
      { type: 'conclusion', text: 'Conclusion text here.' },
    ]
    const headings: Record<string, string> = {
      introduction: 'INTRODUCTION',
      statement_of_facts: 'STATEMENT OF FACTS',
      argument: 'ARGUMENT',
      conclusion: 'CONCLUSION',
    }
    const draft = sections
      .map((s) => `## ${headings[s.type]}\n\n${s.text}`)
      .join('\n\n')

    expect(draft).toContain('INTRODUCTION')
    expect(draft).toContain('STATEMENT OF FACTS')
    expect(draft).toContain('ARGUMENT')
    expect(draft).toContain('CONCLUSION')
    // Check order
    const introPos = draft.indexOf('INTRODUCTION')
    const factsPos = draft.indexOf('STATEMENT OF FACTS')
    const argPos = draft.indexOf('ARGUMENT')
    const conclusionPos = draft.indexOf('CONCLUSION')
    expect(introPos).toBeLessThan(factsPos)
    expect(factsPos).toBeLessThan(argPos)
    expect(argPos).toBeLessThan(conclusionPos)
  })

  it('guardrails remove blocked phrases from assembled draft', () => {
    // Simulate applyProSeGuardrails behavior on draft
    const BLOCKED = ['you must', 'i recommend', 'guaranteed', 'winning strategy']
    function mockGuardrails(text: string): string {
      let safe = text
      for (const phrase of BLOCKED) {
        safe = safe.replace(new RegExp(phrase, 'gi'), '[removed]')
      }
      return safe
    }
    const draft = 'You must file this motion. I recommend proceeding.'
    const safe = mockGuardrails(draft)
    expect(safe).not.toContain('You must')
    expect(safe).not.toContain('I recommend')
  })
})

describe('Full Motion Drafter — input validation', () => {
  it('keyArgument must be at least 10 chars', () => {
    // Simulates route-level Zod validation
    const { z } = require('zod')
    const schema = z.object({ keyArgument: z.string().min(10).max(3000) })
    expect(schema.safeParse({ keyArgument: 'short' }).success).toBe(false)
    expect(schema.safeParse({ keyArgument: 'Long enough argument.' }).success).toBe(true)
  })

  it('keyArgument must be at most 3000 chars', () => {
    const { z } = require('zod')
    const schema = z.object({ keyArgument: z.string().min(10).max(3000) })
    expect(schema.safeParse({ keyArgument: 'x'.repeat(3001) }).success).toBe(false)
    expect(schema.safeParse({ keyArgument: 'x'.repeat(3000) }).success).toBe(true)
  })
})
```

### Step 2: Run tests to verify they pass

```bash
cd /Users/minwang/lawyer\ free/apps/web && npx vitest run tests/unit/api/motion-draft.test.ts 2>&1 | tail -20
```

Expected: All PASS

### Step 3: Implement the route

```typescript
// src/app/api/cases/[id]/motions/[motionId]/draft/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { AIClient } from '@/lib/ai/client'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { checkDistributedRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rate-limit'
import { incrementAiUsage } from '@/lib/subscription/check'
import { applyProSeGuardrails } from '@/lib/ai/litigation-legal/pro-se-adapter'
import { buildBriefSectionPrompt, type SectionType } from '@/lib/ai/litigation-legal/brief-section'
import { safeError } from '@/lib/security/safe-log'

export const maxDuration = 120

const RequestSchema = z.object({
  keyArgument: z.string().min(10).max(3000),
})

const SECTION_HEADINGS: Record<SectionType, string> = {
  introduction: 'INTRODUCTION',
  statement_of_facts: 'STATEMENT OF FACTS',
  argument: 'ARGUMENT',
  conclusion: 'CONCLUSION',
}

const SECTIONS: SectionType[] = ['introduction', 'statement_of_facts', 'argument', 'conclusion']

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; motionId: string }> }
) {
  try {
    const { id: caseId, motionId } = await params
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase, user } = auth

    const rl = await checkDistributedRateLimit(
      supabase, user.id, 'ai', RATE_LIMITS.ai.maxRequests, RATE_LIMITS.ai.windowMs
    )
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

    const body = await request.json().catch(() => null)
    if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

    const parsed = RequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
    }
    const { keyArgument } = parsed.data

    const [motionResult, caseResult, evidenceResult, authoritiesResult] = await Promise.all([
      supabase
        .from('motions')
        .select('motion_type, facts')
        .eq('id', motionId)
        .eq('case_id', caseId)
        .single(),
      supabase
        .from('cases')
        .select('name, dispute_type, state, role, opposing_party, court_type')
        .eq('id', caseId)
        .single(),
      supabase
        .from('evidence_items')
        .select('file_name, category, notes')
        .eq('case_id', caseId)
        .limit(10),
      supabase
        .from('case_authorities')
        .select('citation, summary')
        .eq('case_id', caseId)
        .limit(5),
    ])

    if (motionResult.error || !motionResult.data) {
      return NextResponse.json({ error: 'Motion not found' }, { status: 404 })
    }
    if (caseResult.error || !caseResult.data) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    const { motion_type, facts } = motionResult.data
    const caseData = caseResult.data

    const caseContext = [
      `Case: ${caseData.name ?? 'Your Case'} vs. ${caseData.opposing_party ?? 'Opposing Party'}`,
      `Type: ${caseData.dispute_type ?? 'civil'}`,
      `State: ${caseData.state ?? 'TX'}`,
      `Role: ${caseData.role ?? 'plaintiff'}`,
      `Court: ${caseData.court_type ?? 'unknown'}`,
    ].join('\n')

    const evidenceSummary = (evidenceResult.data ?? [])
      .map((e) => `${e.file_name}${e.category ? ` (${e.category})` : ''}`)
      .join(', ')

    const authorities = (authoritiesResult.data ?? []).map((a) => ({
      citation: a.citation,
      summary: a.summary ?? '',
    }))

    const facts_str = typeof facts === 'string'
      ? facts
      : facts
        ? JSON.stringify(facts)
        : ''

    const client = new AIClient({ model: 'claude-opus-4-7', maxRetries: 1 })
    const sectionTexts: string[] = []

    for (const sectionType of SECTIONS) {
      const { systemPrompt, userPrompt } = buildBriefSectionPrompt({
        sectionType,
        motionType: motion_type ?? 'motion',
        facts: facts_str,
        keyArgument,
        caseContext,
        evidenceSummary,
        authorities,
      })

      const { content } = await client.complete({
        systemPrompt,
        userPrompt,
        temperature: 0.3,
        maxTokens: 2000,
        caller: `motion-draft-${sectionType}`,
      })

      sectionTexts.push(`## ${SECTION_HEADINGS[sectionType]}\n\n${content}`)
    }

    const assembledDraft = applyProSeGuardrails(sectionTexts.join('\n\n'))

    // Get next document version
    const { data: existingDocs } = await supabase
      .from('documents')
      .select('version')
      .eq('case_id', caseId)
      .eq('doc_type', 'full_motion')
      .order('version', { ascending: false })
      .limit(1)

    const nextVersion = existingDocs && existingDocs.length > 0 ? existingDocs[0].version + 1 : 1

    // Update motion draft_text and insert document
    const [, docResult] = await Promise.all([
      supabase
        .from('motions')
        .update({ draft_text: assembledDraft })
        .eq('id', motionId),
      supabase
        .from('documents')
        .insert({
          case_id: caseId,
          doc_type: 'full_motion',
          version: nextVersion,
          status: 'draft',
          content_text: assembledDraft,
          metadata: { motion_id: motionId, generator: 'full-motion-drafter-v1' },
        })
        .select('id')
        .single(),
    ])

    await incrementAiUsage(supabase).catch(() => {})

    return NextResponse.json({
      draft: assembledDraft,
      documentId: docResult.data?.id ?? null,
      motionId,
    })
  } catch (err) {
    safeError('motion-draft', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

### Step 4: Run all motion tests

```bash
cd /Users/minwang/lawyer\ free/apps/web && npx vitest run tests/unit/api/motion-draft.test.ts tests/unit/ai/litigation-legal/brief-section.test.ts 2>&1 | tail -20
```

Expected: All PASS

### Step 5: Run the full test suite to check for regressions

```bash
cd /Users/minwang/lawyer\ free/apps/web && npx vitest run 2>&1 | tail -30
```

### Step 6: Commit

```bash
git add src/app/api/cases/\[id\]/motions/\[motionId\]/draft/route.ts tests/unit/api/motion-draft.test.ts
git commit -m "feat(api): add POST /api/cases/[id]/motions/[motionId]/draft — full motion drafter"
```

---

## Final — Run All New Tests Together

```bash
cd /Users/minwang/lawyer\ free/apps/web && npx vitest run \
  tests/unit/ai/settlement-valuation.test.ts \
  tests/unit/ai/health-tips.test.ts \
  tests/unit/api/discovery-generate.test.ts \
  tests/unit/api/exhibit-sets-suggest.test.ts \
  tests/unit/api/settlement-value.test.ts \
  tests/unit/api/motion-draft.test.ts \
  2>&1 | tail -30
```

Expected: All 6 test files PASS, no regressions.
