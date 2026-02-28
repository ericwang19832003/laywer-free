# AI Risk Explanation Generator Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an AI-powered endpoint that explains case risk scores in plain language, with a static fallback when AI is unavailable.

**Architecture:** API route loads latest risk score, builds a structured OpenAI prompt, validates output with Zod + safety checks, stores explanation in the existing `breakdown` JSONB. Static fallback generates a template-based explanation if AI fails.

**Tech Stack:** TypeScript, OpenAI SDK, Zod, Vitest, Next.js API routes, Supabase.

---

### Task 1: Zod schemas for AI risk explanation

**Files:**
- Create: `src/lib/schemas/ai-risk-explanation.ts`

**Step 1: Write the schema file**

Create `src/lib/schemas/ai-risk-explanation.ts`:

```typescript
import { z } from 'zod'

// ── AI output schema ─────────────────────────────────────

export const aiRiskExplanationSchema = z.object({
  summary: z.string().min(1),
  focus_areas: z.array(z.string().min(1)).min(1).max(3),
  tone: z.literal('calm'),
})

export type AiRiskExplanation = z.infer<typeof aiRiskExplanationSchema>
```

**Step 2: Commit**

```bash
git add src/lib/schemas/ai-risk-explanation.ts
git commit -m "feat: add Zod schema for AI risk explanation output"
```

---

### Task 2: Safety check + static fallback + prompt builder (TDD)

**Files:**
- Create: `src/lib/risk/explain.ts`
- Create: `tests/unit/risk/explain.test.ts`

**Step 1: Write the failing test**

Create `tests/unit/risk/explain.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import {
  isExplanationSafe,
  buildStaticExplanation,
  buildExplanationPrompt,
  EXPLANATION_BLOCKED_PHRASES,
} from '@/lib/risk/explain'
import type { RiskLevel } from '@/lib/rules/case-risk-engine'

// ── isExplanationSafe ────────────────────────────────────────────

describe('isExplanationSafe', () => {
  it('returns true for a clean explanation', () => {
    expect(
      isExplanationSafe('Your case has a moderate risk level. Focus on gathering evidence.')
    ).toBe(true)
  })

  it('returns true for empty string', () => {
    expect(isExplanationSafe('')).toBe(true)
  })

  it.each([
    ['you must', 'You must file your answer immediately'],
    ['you should', 'You should contact a lawyer right away'],
    ['file a motion', 'You need to file a motion for summary judgment'],
    ['file immediately', 'File immediately to avoid penalties'],
    ['sanctions', 'The court may impose sanctions'],
    ['legal penalty', 'There could be a legal penalty'],
    ['automatic judgment', 'This could result in automatic judgment'],
    ['guaranteed outcome', 'There is no guaranteed outcome'],
    ['winning', 'Your chances of winning are good'],
    ['losing', 'You risk losing the case'],
    ['you are required', 'You are required to respond'],
    ['failure to comply', 'Failure to comply will result in penalties'],
    ['urgent', 'URGENT: Take action now'],
    ['immediately', 'Act immediately before it is too late'],
  ] as const)('returns false when message contains "%s"', (_phrase, message) => {
    expect(isExplanationSafe(message)).toBe(false)
  })

  it('is case-insensitive', () => {
    expect(isExplanationSafe('YOU MUST respond')).toBe(false)
    expect(isExplanationSafe('Winning is possible')).toBe(false)
  })

  it('EXPLANATION_BLOCKED_PHRASES is frozen', () => {
    expect(Object.isFrozen(EXPLANATION_BLOCKED_PHRASES)).toBe(true)
  })
})

// ── buildStaticExplanation ───────────────────────────────────────

describe('buildStaticExplanation', () => {
  it('returns valid structure for "low" risk level', () => {
    const result = buildStaticExplanation({
      overall_score: 90,
      risk_level: 'low' as RiskLevel,
      deadline_risk: 0,
      response_risk: 0,
      evidence_risk: 10,
      activity_risk: 0,
      breakdown: [
        { rule: 'deadline_within_7_days', points: 10, detail: 'Deadline in 5 days' },
      ],
    })

    expect(result.summary).toBeTruthy()
    expect(result.focus_areas).toBeInstanceOf(Array)
    expect(result.focus_areas.length).toBeGreaterThanOrEqual(1)
    expect(result.tone).toBe('calm')
  })

  it('returns valid structure for "high" risk level', () => {
    const result = buildStaticExplanation({
      overall_score: 10,
      risk_level: 'high' as RiskLevel,
      deadline_risk: 40,
      response_risk: 50,
      evidence_risk: 0,
      activity_risk: 0,
      breakdown: [
        { rule: 'deadline_overdue', points: 40, detail: 'Deadline overdue by 5 days' },
        { rule: 'discovery_response_overdue', points: 50, detail: 'Response overdue' },
      ],
    })

    expect(result.summary).toBeTruthy()
    expect(result.focus_areas.length).toBeGreaterThanOrEqual(1)
    expect(result.tone).toBe('calm')
  })

  it('extracts focus areas from highest-point breakdown items', () => {
    const result = buildStaticExplanation({
      overall_score: 20,
      risk_level: 'high' as RiskLevel,
      deadline_risk: 40,
      response_risk: 50,
      evidence_risk: 15,
      activity_risk: 0,
      breakdown: [
        { rule: 'discovery_response_overdue', points: 50, detail: 'Response overdue' },
        { rule: 'deadline_overdue', points: 40, detail: 'Deadline overdue' },
        { rule: 'low_evidence_count', points: 15, detail: 'Low evidence' },
      ],
    })

    expect(result.focus_areas.length).toBeLessThanOrEqual(3)
    expect(result.focus_areas.length).toBeGreaterThanOrEqual(1)
  })

  it('is always safe (passes isExplanationSafe)', () => {
    const levels: RiskLevel[] = ['low', 'moderate', 'elevated', 'high']
    for (const risk_level of levels) {
      const result = buildStaticExplanation({
        overall_score: 50,
        risk_level,
        deadline_risk: 20,
        response_risk: 0,
        evidence_risk: 15,
        activity_risk: 20,
        breakdown: [
          { rule: 'deadline_within_3_days', points: 20, detail: 'Deadline soon' },
          { rule: 'low_evidence_count', points: 15, detail: 'Low evidence' },
          { rule: 'inactive_14_days', points: 20, detail: 'No activity' },
        ],
      })

      expect(isExplanationSafe(result.summary)).toBe(true)
      for (const area of result.focus_areas) {
        expect(isExplanationSafe(area)).toBe(true)
      }
    }
  })

  it('returns focus areas even with empty breakdown', () => {
    const result = buildStaticExplanation({
      overall_score: 100,
      risk_level: 'low' as RiskLevel,
      deadline_risk: 0,
      response_risk: 0,
      evidence_risk: 0,
      activity_risk: 0,
      breakdown: [],
    })

    expect(result.focus_areas.length).toBeGreaterThanOrEqual(1)
    expect(result.tone).toBe('calm')
  })
})

// ── buildExplanationPrompt ───────────────────────────────────────

describe('buildExplanationPrompt', () => {
  it('includes overall score and risk level', () => {
    const prompt = buildExplanationPrompt({
      overall_score: 60,
      risk_level: 'moderate' as RiskLevel,
      deadline_risk: 20,
      response_risk: 0,
      evidence_risk: 15,
      activity_risk: 0,
      breakdown: [
        { rule: 'deadline_within_3_days', points: 20, detail: 'Deadline soon' },
        { rule: 'low_evidence_count', points: 15, detail: 'Low evidence' },
      ],
    })

    expect(prompt).toContain('60')
    expect(prompt).toContain('moderate')
  })

  it('includes sub-score labels', () => {
    const prompt = buildExplanationPrompt({
      overall_score: 50,
      risk_level: 'elevated' as RiskLevel,
      deadline_risk: 20,
      response_risk: 30,
      evidence_risk: 0,
      activity_risk: 0,
      breakdown: [],
    })

    expect(prompt).toContain('Deadline risk')
    expect(prompt).toContain('Response risk')
    expect(prompt).toContain('Evidence risk')
    expect(prompt).toContain('Activity risk')
  })

  it('includes breakdown count', () => {
    const prompt = buildExplanationPrompt({
      overall_score: 50,
      risk_level: 'elevated' as RiskLevel,
      deadline_risk: 20,
      response_risk: 30,
      evidence_risk: 0,
      activity_risk: 0,
      breakdown: [
        { rule: 'a', points: 20, detail: 'x' },
        { rule: 'b', points: 30, detail: 'y' },
      ],
    })

    expect(prompt).toContain('2 risk factor')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd "/Users/minwang/lawyer free" && npx vitest run tests/unit/risk/explain.test.ts`
Expected: FAIL — module not found

**Step 3: Write the implementation**

Create `src/lib/risk/explain.ts`:

```typescript
/**
 * AI Risk Explanation Helpers
 *
 * Safety validation, static fallback, and prompt builder for the
 * AI risk explanation endpoint. All functions are pure and testable.
 */

import type { RiskBreakdownItem, RiskLevel } from '@/lib/rules/case-risk-engine'
import type { AiRiskExplanation } from '@/lib/schemas/ai-risk-explanation'

// ── Safety ───────────────────────────────────────────────────────

export const EXPLANATION_BLOCKED_PHRASES = Object.freeze([
  // From escalation engine
  'you must',
  'file immediately',
  'sanctions',
  'legal penalty',
  'automatic judgment',
  'guaranteed outcome',
  // Legal advice / strategy
  'you should',
  'file a motion',
  'winning',
  'losing',
  'you are required',
  'failure to comply',
  // Scary / urgent language (UX guide)
  'urgent',
  'immediately',
] as const)

export function isExplanationSafe(text: string): boolean {
  const lower = text.toLowerCase()
  return !EXPLANATION_BLOCKED_PHRASES.some((phrase) => lower.includes(phrase))
}

// ── Static Fallback ──────────────────────────────────────────────

interface RiskScoreInput {
  overall_score: number
  risk_level: RiskLevel
  deadline_risk: number
  response_risk: number
  evidence_risk: number
  activity_risk: number
  breakdown: RiskBreakdownItem[]
}

const LEVEL_SUMMARIES: Record<RiskLevel, string> = {
  low: 'Your case is in good shape. Your deadlines, evidence, and activity levels look healthy. Keep up the momentum and continue tracking your progress.',
  moderate: 'Your case has a few areas that could use attention. Nothing alarming, but staying on top of the items below will help keep things on track.',
  elevated: 'Your case needs some attention in a few key areas. Taking time to address the items below, one step at a time, can help improve your position.',
  high: 'Your case has several areas that need attention. Focus on the items below, one step at a time. Small, steady progress can make a meaningful difference.',
}

const RULE_LABELS: Record<string, string> = {
  deadline_overdue: 'Deadline management',
  deadline_within_3_days: 'Upcoming deadlines',
  deadline_within_7_days: 'Upcoming deadlines',
  discovery_response_overdue: 'Discovery responses',
  discovery_response_due_soon: 'Discovery responses',
  low_evidence_count: 'Evidence gathering',
  no_exhibit_set: 'Exhibit organization',
  low_exhibit_count: 'Exhibit organization',
  no_trial_binder: 'Trial preparation',
  no_activity: 'Case activity',
  inactive_30_days: 'Case activity',
  inactive_14_days: 'Case activity',
}

export function buildStaticExplanation(input: RiskScoreInput): AiRiskExplanation {
  const summary = LEVEL_SUMMARIES[input.risk_level]

  // Extract unique focus areas from breakdown, sorted by points desc
  const sorted = [...input.breakdown].sort((a, b) => b.points - a.points)
  const seen = new Set<string>()
  const focus_areas: string[] = []

  for (const item of sorted) {
    const label = RULE_LABELS[item.rule] ?? item.rule
    if (!seen.has(label)) {
      seen.add(label)
      focus_areas.push(label)
    }
    if (focus_areas.length >= 3) break
  }

  if (focus_areas.length === 0) {
    focus_areas.push('Continue monitoring your case')
  }

  return { summary, focus_areas, tone: 'calm' }
}

// ── Prompt Builder ───────────────────────────────────────────────

export const RISK_EXPLANATION_SYSTEM_PROMPT = `You are a supportive case organizer assistant. You explain case risk scores in plain, everyday language to help people understand where their case stands.

RULES YOU MUST FOLLOW:
- Write one short paragraph (2-4 sentences) summarizing the risk posture.
- Identify 1-3 focus areas based on which risk dimensions are contributing most.
- Use a calm, warm, encouraging tone. Think "one step at a time."
- NEVER give legal advice or legal strategy.
- NEVER mention winning, losing, or case outcomes.
- NEVER use directives like "file a motion", "you must", "you should", "you are required".
- NEVER use scary language: "urgent", "warning", "immediately", "critical", "overdue".
- NEVER mention sanctions, penalties, or consequences.
- This is purely informational — help the person understand, not act.
- Include no disclaimers (those are handled separately by the app).

OUTPUT FORMAT — respond with valid JSON only:
{
  "summary": "A short, calm paragraph explaining what the score means",
  "focus_areas": ["area1", "area2"],
  "tone": "calm"
}`

export function buildExplanationPrompt(input: RiskScoreInput): string {
  const parts: string[] = []

  parts.push(`Case risk score: ${input.overall_score} out of 100 (risk level: ${input.risk_level}).`)
  parts.push('')
  parts.push('Sub-scores (higher number = more risk points):')
  parts.push(`- Deadline risk: ${input.deadline_risk}`)
  parts.push(`- Response risk: ${input.response_risk}`)
  parts.push(`- Evidence risk: ${input.evidence_risk}`)
  parts.push(`- Activity risk: ${input.activity_risk}`)
  parts.push('')
  parts.push(`${input.breakdown.length} risk factor${input.breakdown.length !== 1 ? 's' : ''} detected.`)

  if (input.breakdown.length > 0) {
    parts.push('')
    parts.push('Contributing factors:')
    for (const item of input.breakdown) {
      parts.push(`- ${item.detail} (+${item.points} points)`)
    }
  }

  return parts.join('\n')
}
```

**Step 4: Run tests to verify they pass**

Run: `cd "/Users/minwang/lawyer free" && npx vitest run tests/unit/risk/explain.test.ts`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add src/lib/risk/explain.ts tests/unit/risk/explain.test.ts src/lib/schemas/ai-risk-explanation.ts
git commit -m "feat: add risk explanation helpers (safety, fallback, prompt builder + tests)"
```

---

### Task 3: API route

**Files:**
- Create: `src/app/api/cases/[id]/risk/explain/route.ts`

**Step 1: Write the API route**

Create `src/app/api/cases/[id]/risk/explain/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { aiRiskExplanationSchema } from '@/lib/schemas/ai-risk-explanation'
import {
  isExplanationSafe,
  buildStaticExplanation,
  buildExplanationPrompt,
  RISK_EXPLANATION_SYSTEM_PROMPT,
} from '@/lib/risk/explain'

const PROMPT_VERSION = '1.0.0'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const { supabase, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    // Load latest risk score for this case
    const { data: riskScore, error: riskError } = await supabase!
      .from('case_risk_scores')
      .select('id, overall_score, deadline_risk, response_risk, evidence_risk, activity_risk, risk_level, breakdown')
      .eq('case_id', caseId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (riskError || !riskScore) {
      return NextResponse.json(
        { error: 'No risk score found. Run risk scoring first.' },
        { status: 404 }
      )
    }

    const breakdown = Array.isArray(riskScore.breakdown) ? riskScore.breakdown : []
    const riskInput = {
      overall_score: riskScore.overall_score,
      risk_level: riskScore.risk_level as 'low' | 'moderate' | 'elevated' | 'high',
      deadline_risk: riskScore.deadline_risk,
      response_risk: riskScore.response_risk,
      evidence_risk: riskScore.evidence_risk,
      activity_risk: riskScore.activity_risk,
      breakdown,
    }

    let explanation = buildStaticExplanation(riskInput)
    let source: 'ai' | 'static' = 'static'

    // Try AI generation if configured
    if (process.env.OPENAI_API_KEY) {
      try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
        const userPrompt = buildExplanationPrompt(riskInput)

        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          temperature: 0.4,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: RISK_EXPLANATION_SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
        })

        const raw = completion.choices[0]?.message?.content
        if (raw) {
          const parsed = JSON.parse(raw)
          const validated = aiRiskExplanationSchema.safeParse(parsed)

          if (validated.success) {
            // Safety check all text fields
            const allText = [validated.data.summary, ...validated.data.focus_areas].join(' ')
            if (isExplanationSafe(allText)) {
              explanation = validated.data
              source = 'ai'
            }
          }
        }
      } catch {
        // AI failed — static fallback already set
      }
    }

    // Persist explanation into the breakdown JSONB
    const updatedBreakdown = {
      ...(typeof riskScore.breakdown === 'object' && !Array.isArray(riskScore.breakdown)
        ? riskScore.breakdown
        : { items: breakdown }),
      ai_explanation: explanation,
      _meta: {
        model: source === 'ai' ? 'gpt-4o-mini' : null,
        prompt_version: PROMPT_VERSION,
        source,
      },
    }

    await supabase!
      .from('case_risk_scores')
      .update({ breakdown: updatedBreakdown })
      .eq('id', riskScore.id)

    return NextResponse.json({
      ...explanation,
      _meta: {
        model: source === 'ai' ? 'gpt-4o-mini' : null,
        prompt_version: PROMPT_VERSION,
        source,
      },
    })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

**Step 2: Commit**

```bash
git add src/app/api/cases/[id]/risk/explain/route.ts
git commit -m "feat: add POST /api/cases/[id]/risk/explain endpoint"
```

---

### Task 4: Run all tests and build to verify no regressions

**Step 1: Run full unit test suite**

Run: `cd "/Users/minwang/lawyer free" && npx vitest run`
Expected: All tests PASS (existing + new)

**Step 2: Build to verify compilation**

Run: `cd "/Users/minwang/lawyer free" && npx next build`
Expected: Build succeeds, route registered at `/api/cases/[id]/risk/explain`

---
