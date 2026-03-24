# Deterministic Case Risk Engine Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace AI-based risk scoring with a deterministic, pure-function engine that computes consistent case risk scores from DB data.

**Architecture:** Pure function `calculateCaseRisk(input, now)` returns risk result with zero side effects. Orchestrator `runCaseRiskScoring(supabase, caseId)` loads DB state, calls pure function, persists to `case_risk_scores`. API route exposes it at `POST /api/cases/[id]/rules/run-risk-score`.

**Tech Stack:** TypeScript, Vitest, Next.js API routes, Supabase client, existing `daysUntil` from escalation-engine.

---

### Task 1: Pure function — types and scoring logic

**Files:**
- Create: `src/lib/rules/case-risk-engine.ts`

**Step 1: Write the failing test**

Create `tests/unit/rules/case-risk-engine.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import {
  calculateCaseRisk,
  type RiskInput,
} from '@/lib/rules/case-risk-engine'

// ── Helpers ──────────────────────────────────────────────────────

function makeInput(overrides: Partial<RiskInput> = {}): RiskInput {
  return {
    deadlines: [],
    taskEvents: [],
    evidenceCount: 0,
    exhibitSets: [],
    exhibitCount: 0,
    trialBinders: [],
    discoveryResponseDeadlines: [],
    ...overrides,
  }
}

const NOW = new Date('2026-03-15T12:00:00Z')

// ── Deadline Risk ────────────────────────────────────────────────

describe('calculateCaseRisk — deadline risk', () => {
  it('scores +40 for an overdue deadline', () => {
    const result = calculateCaseRisk(
      makeInput({
        deadlines: [{ key: 'answer_deadline_confirmed', due_at: '2026-03-10T00:00:00Z' }],
      }),
      NOW
    )
    expect(result.deadline_risk).toBe(40)
    expect(result.breakdown).toContainEqual(
      expect.objectContaining({ rule: 'deadline_overdue', points: 40 })
    )
  })

  it('scores +20 for a deadline within 3 days', () => {
    const result = calculateCaseRisk(
      makeInput({
        deadlines: [{ key: 'answer_deadline_confirmed', due_at: '2026-03-17T00:00:00Z' }],
      }),
      NOW
    )
    expect(result.deadline_risk).toBe(20)
  })

  it('scores +10 for a deadline within 7 days', () => {
    const result = calculateCaseRisk(
      makeInput({
        deadlines: [{ key: 'answer_deadline_confirmed', due_at: '2026-03-20T00:00:00Z' }],
      }),
      NOW
    )
    expect(result.deadline_risk).toBe(10)
  })

  it('scores 0 for a deadline more than 7 days away', () => {
    const result = calculateCaseRisk(
      makeInput({
        deadlines: [{ key: 'answer_deadline_confirmed', due_at: '2026-03-30T00:00:00Z' }],
      }),
      NOW
    )
    expect(result.deadline_risk).toBe(0)
  })

  it('takes max across multiple deadlines (not cumulative)', () => {
    const result = calculateCaseRisk(
      makeInput({
        deadlines: [
          { key: 'answer_deadline_confirmed', due_at: '2026-03-10T00:00:00Z' }, // overdue +40
          { key: 'discovery_deadline', due_at: '2026-03-17T00:00:00Z' },        // 2 days +20
        ],
      }),
      NOW
    )
    expect(result.deadline_risk).toBe(40) // max, not 60
  })
})

// ── Response Risk ────────────────────────────────────────────────

describe('calculateCaseRisk — response risk', () => {
  it('scores +50 for overdue discovery response with no response', () => {
    const result = calculateCaseRisk(
      makeInput({
        discoveryResponseDeadlines: [
          { due_at: '2026-03-10T00:00:00Z', hasResponse: false },
        ],
      }),
      NOW
    )
    expect(result.response_risk).toBe(50)
  })

  it('scores 0 for overdue discovery response when response exists', () => {
    const result = calculateCaseRisk(
      makeInput({
        discoveryResponseDeadlines: [
          { due_at: '2026-03-10T00:00:00Z', hasResponse: true },
        ],
      }),
      NOW
    )
    expect(result.response_risk).toBe(0)
  })

  it('scores +30 for discovery response due within 3 days with no response', () => {
    const result = calculateCaseRisk(
      makeInput({
        discoveryResponseDeadlines: [
          { due_at: '2026-03-17T00:00:00Z', hasResponse: false },
        ],
      }),
      NOW
    )
    expect(result.response_risk).toBe(30)
  })

  it('scores 0 for discovery response due in more than 3 days', () => {
    const result = calculateCaseRisk(
      makeInput({
        discoveryResponseDeadlines: [
          { due_at: '2026-03-25T00:00:00Z', hasResponse: false },
        ],
      }),
      NOW
    )
    expect(result.response_risk).toBe(0)
  })

  it('takes max across multiple discovery response deadlines', () => {
    const result = calculateCaseRisk(
      makeInput({
        discoveryResponseDeadlines: [
          { due_at: '2026-03-10T00:00:00Z', hasResponse: false }, // overdue +50
          { due_at: '2026-03-17T00:00:00Z', hasResponse: false }, // 2 days +30
        ],
      }),
      NOW
    )
    expect(result.response_risk).toBe(50) // max, not 80
  })
})

// ── Evidence Risk ────────────────────────────────────────────────

describe('calculateCaseRisk — evidence risk', () => {
  it('scores +15 when evidence count < 3', () => {
    const result = calculateCaseRisk(
      makeInput({ evidenceCount: 2 }),
      NOW
    )
    expect(result.evidence_risk).toBeGreaterThanOrEqual(15)
    expect(result.breakdown).toContainEqual(
      expect.objectContaining({ rule: 'low_evidence_count', points: 15 })
    )
  })

  it('scores +10 when no exhibit set', () => {
    const result = calculateCaseRisk(
      makeInput({ exhibitSets: [] }),
      NOW
    )
    expect(result.breakdown).toContainEqual(
      expect.objectContaining({ rule: 'no_exhibit_set', points: 10 })
    )
  })

  it('scores +10 when exhibit count < 2', () => {
    const result = calculateCaseRisk(
      makeInput({ exhibitSets: [{ id: 'set-1' }], exhibitCount: 1 }),
      NOW
    )
    expect(result.breakdown).toContainEqual(
      expect.objectContaining({ rule: 'low_exhibit_count', points: 10 })
    )
  })

  it('scores +5 when no trial binder', () => {
    const result = calculateCaseRisk(
      makeInput({ trialBinders: [] }),
      NOW
    )
    expect(result.breakdown).toContainEqual(
      expect.objectContaining({ rule: 'no_trial_binder', points: 5 })
    )
  })

  it('scores 0 evidence risk when fully prepared', () => {
    const result = calculateCaseRisk(
      makeInput({
        evidenceCount: 5,
        exhibitSets: [{ id: 'set-1' }],
        exhibitCount: 3,
        trialBinders: [{ id: 'binder-1' }],
      }),
      NOW
    )
    expect(result.evidence_risk).toBe(0)
  })

  it('accumulates all evidence sub-risks (max 40)', () => {
    const result = calculateCaseRisk(
      makeInput({
        evidenceCount: 0,
        exhibitSets: [],
        exhibitCount: 0,
        trialBinders: [],
      }),
      NOW
    )
    expect(result.evidence_risk).toBe(40) // 15 + 10 + 10 + 5
  })
})

// ── Activity Risk ────────────────────────────────────────────────

describe('calculateCaseRisk — activity risk', () => {
  it('scores +40 when no task event in 30 days', () => {
    const result = calculateCaseRisk(
      makeInput({
        taskEvents: [{ created_at: '2026-02-01T00:00:00Z' }], // 42 days ago
      }),
      NOW
    )
    expect(result.activity_risk).toBe(40)
  })

  it('scores +20 when no task event in 14 days (but within 30)', () => {
    const result = calculateCaseRisk(
      makeInput({
        taskEvents: [{ created_at: '2026-02-25T00:00:00Z' }], // 18 days ago
      }),
      NOW
    )
    expect(result.activity_risk).toBe(20)
  })

  it('scores 0 when recent task event within 14 days', () => {
    const result = calculateCaseRisk(
      makeInput({
        taskEvents: [{ created_at: '2026-03-10T00:00:00Z' }], // 5 days ago
      }),
      NOW
    )
    expect(result.activity_risk).toBe(0)
  })

  it('scores +40 when no task events at all', () => {
    const result = calculateCaseRisk(
      makeInput({ taskEvents: [] }),
      NOW
    )
    expect(result.activity_risk).toBe(40)
  })

  it('uses the most recent task event', () => {
    const result = calculateCaseRisk(
      makeInput({
        taskEvents: [
          { created_at: '2026-01-01T00:00:00Z' }, // old
          { created_at: '2026-03-14T00:00:00Z' }, // yesterday
        ],
      }),
      NOW
    )
    expect(result.activity_risk).toBe(0)
  })
})

// ── Overall Score & Risk Level ───────────────────────────────────

describe('calculateCaseRisk — overall score & risk level', () => {
  it('computes overall_score = 100 - risk_points', () => {
    // Only evidence risk fires: 15 + 10 + 10 + 5 = 40, activity +40 = 80
    // recent event → activity 0, full evidence → evidence 0
    const result = calculateCaseRisk(
      makeInput({
        evidenceCount: 5,
        exhibitSets: [{ id: 'set-1' }],
        exhibitCount: 3,
        trialBinders: [{ id: 'binder-1' }],
        taskEvents: [{ created_at: '2026-03-14T00:00:00Z' }],
      }),
      NOW
    )
    expect(result.overall_score).toBe(100)
    expect(result.risk_level).toBe('low')
  })

  it('clamps overall_score to 0 minimum', () => {
    // overdue deadline +40, overdue discovery +50, empty evidence +40, stale +40 = 170
    const result = calculateCaseRisk(
      makeInput({
        deadlines: [{ key: 'x', due_at: '2026-03-01T00:00:00Z' }],
        discoveryResponseDeadlines: [{ due_at: '2026-03-01T00:00:00Z', hasResponse: false }],
        evidenceCount: 0,
        exhibitSets: [],
        exhibitCount: 0,
        trialBinders: [],
        taskEvents: [],
      }),
      NOW
    )
    expect(result.overall_score).toBe(0)
    expect(result.risk_level).toBe('high')
  })

  it('maps score >= 80 to "low"', () => {
    const result = calculateCaseRisk(
      makeInput({
        evidenceCount: 5,
        exhibitSets: [{ id: 'set-1' }],
        exhibitCount: 3,
        trialBinders: [{ id: 'binder-1' }],
        taskEvents: [{ created_at: '2026-03-14T00:00:00Z' }],
        deadlines: [{ key: 'x', due_at: '2026-03-20T00:00:00Z' }], // +10
      }),
      NOW
    )
    // 100 - 10 = 90 → low
    expect(result.overall_score).toBe(90)
    expect(result.risk_level).toBe('low')
  })

  it('maps score 60-79 to "moderate"', () => {
    const result = calculateCaseRisk(
      makeInput({
        evidenceCount: 5,
        exhibitSets: [{ id: 'set-1' }],
        exhibitCount: 3,
        trialBinders: [{ id: 'binder-1' }],
        taskEvents: [{ created_at: '2026-03-14T00:00:00Z' }],
        deadlines: [{ key: 'x', due_at: '2026-03-10T00:00:00Z' }], // overdue +40
      }),
      NOW
    )
    // 100 - 40 = 60 → moderate
    expect(result.overall_score).toBe(60)
    expect(result.risk_level).toBe('moderate')
  })

  it('maps score 40-59 to "elevated"', () => {
    const result = calculateCaseRisk(
      makeInput({
        evidenceCount: 5,
        exhibitSets: [{ id: 'set-1' }],
        exhibitCount: 3,
        trialBinders: [{ id: 'binder-1' }],
        taskEvents: [{ created_at: '2026-03-14T00:00:00Z' }],
        discoveryResponseDeadlines: [{ due_at: '2026-03-10T00:00:00Z', hasResponse: false }], // +50
      }),
      NOW
    )
    // 100 - 50 = 50 → elevated
    expect(result.overall_score).toBe(50)
    expect(result.risk_level).toBe('elevated')
  })

  it('maps score < 40 to "high"', () => {
    const result = calculateCaseRisk(
      makeInput({
        evidenceCount: 0,       // +15
        exhibitSets: [],        // +10
        exhibitCount: 0,        // +10
        trialBinders: [],       // +5
        taskEvents: [],         // +40
        // total = 80 → 100-80 = 20
      }),
      NOW
    )
    expect(result.overall_score).toBe(20)
    expect(result.risk_level).toBe('high')
  })
})

// ── Determinism ──────────────────────────────────────────────────

describe('calculateCaseRisk — determinism', () => {
  it('returns identical results for identical inputs', () => {
    const input = makeInput({
      deadlines: [{ key: 'x', due_at: '2026-03-17T00:00:00Z' }],
      discoveryResponseDeadlines: [{ due_at: '2026-03-17T00:00:00Z', hasResponse: false }],
      evidenceCount: 2,
      exhibitSets: [{ id: 'set-1' }],
      exhibitCount: 1,
      trialBinders: [],
      taskEvents: [{ created_at: '2026-03-10T00:00:00Z' }],
    })

    const result1 = calculateCaseRisk(input, NOW)
    const result2 = calculateCaseRisk(input, NOW)

    expect(result1).toEqual(result2)
  })

  it('defaults now to current time when not provided', () => {
    const input = makeInput()
    const result = calculateCaseRisk(input)
    expect(result.overall_score).toBeGreaterThanOrEqual(0)
    expect(result.overall_score).toBeLessThanOrEqual(100)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd "/Users/minwang/lawyer free" && npx vitest run tests/unit/rules/case-risk-engine.test.ts`
Expected: FAIL — module `@/lib/rules/case-risk-engine` not found

**Step 3: Write the implementation**

Create `src/lib/rules/case-risk-engine.ts`:

```typescript
/**
 * Deterministic Case Risk Engine
 *
 * Pure function that computes case risk scores from structured input.
 * Zero side effects — trivially unit-testable.
 *
 * Reuses daysUntil from escalation-engine for consistent date math.
 */

import { daysUntil } from './escalation-engine'

// ── Types ────────────────────────────────────────────────────────

export interface RiskInput {
  deadlines: { key: string; due_at: string }[]
  taskEvents: { created_at: string }[]
  evidenceCount: number
  exhibitSets: { id: string }[]
  exhibitCount: number
  trialBinders: { id: string }[]
  discoveryResponseDeadlines: { due_at: string; hasResponse: boolean }[]
}

export interface RiskBreakdownItem {
  rule: string
  points: number
  detail: string
}

export type RiskLevel = 'low' | 'moderate' | 'elevated' | 'high'

export interface RiskResult {
  overall_score: number
  deadline_risk: number
  response_risk: number
  evidence_risk: number
  activity_risk: number
  risk_level: RiskLevel
  breakdown: RiskBreakdownItem[]
}

// ── Scoring ──────────────────────────────────────────────────────

function scoreDeadlineRisk(
  deadlines: RiskInput['deadlines'],
  now: Date
): { score: number; items: RiskBreakdownItem[] } {
  let maxScore = 0
  const items: RiskBreakdownItem[] = []

  for (const dl of deadlines) {
    const days = daysUntil(now, new Date(dl.due_at))
    let points = 0
    let rule = ''
    let detail = ''

    if (days < 0) {
      points = 40
      rule = 'deadline_overdue'
      detail = `Deadline "${dl.key}" is ${Math.abs(days)} day(s) overdue`
    } else if (days <= 3) {
      points = 20
      rule = 'deadline_within_3_days'
      detail = `Deadline "${dl.key}" is due in ${days} day(s)`
    } else if (days <= 7) {
      points = 10
      rule = 'deadline_within_7_days'
      detail = `Deadline "${dl.key}" is due in ${days} day(s)`
    }

    if (points > maxScore) {
      maxScore = points
      items.length = 0
      items.push({ rule, points, detail })
    }
  }

  return { score: maxScore, items }
}

function scoreResponseRisk(
  discoveryResponseDeadlines: RiskInput['discoveryResponseDeadlines'],
  now: Date
): { score: number; items: RiskBreakdownItem[] } {
  let maxScore = 0
  const items: RiskBreakdownItem[] = []

  for (const drd of discoveryResponseDeadlines) {
    if (drd.hasResponse) continue

    const days = daysUntil(now, new Date(drd.due_at))
    let points = 0
    let rule = ''
    let detail = ''

    if (days < 0) {
      points = 50
      rule = 'discovery_response_overdue'
      detail = `Discovery response is ${Math.abs(days)} day(s) overdue with no response`
    } else if (days <= 3) {
      points = 30
      rule = 'discovery_response_due_soon'
      detail = `Discovery response due in ${days} day(s) with no response`
    }

    if (points > maxScore) {
      maxScore = points
      items.length = 0
      items.push({ rule, points, detail })
    }
  }

  return { score: maxScore, items }
}

function scoreEvidenceRisk(input: RiskInput): { score: number; items: RiskBreakdownItem[] } {
  let score = 0
  const items: RiskBreakdownItem[] = []

  if (input.evidenceCount < 3) {
    score += 15
    items.push({
      rule: 'low_evidence_count',
      points: 15,
      detail: `Only ${input.evidenceCount} evidence item(s) uploaded (recommend at least 3)`,
    })
  }

  if (input.exhibitSets.length === 0) {
    score += 10
    items.push({
      rule: 'no_exhibit_set',
      points: 10,
      detail: 'No exhibit set created',
    })
  }

  if (input.exhibitCount < 2) {
    score += 10
    items.push({
      rule: 'low_exhibit_count',
      points: 10,
      detail: `Only ${input.exhibitCount} exhibit(s) in set (recommend at least 2)`,
    })
  }

  if (input.trialBinders.length === 0) {
    score += 5
    items.push({
      rule: 'no_trial_binder',
      points: 5,
      detail: 'No trial binder generated',
    })
  }

  return { score, items }
}

function scoreActivityRisk(
  taskEvents: RiskInput['taskEvents'],
  now: Date
): { score: number; items: RiskBreakdownItem[] } {
  const items: RiskBreakdownItem[] = []

  if (taskEvents.length === 0) {
    return {
      score: 40,
      items: [{ rule: 'no_activity', points: 40, detail: 'No task events recorded' }],
    }
  }

  const mostRecent = taskEvents.reduce((latest, ev) => {
    return new Date(ev.created_at) > new Date(latest.created_at) ? ev : latest
  })

  const daysSince = daysUntil(new Date(mostRecent.created_at), now)

  if (daysSince >= 30) {
    return {
      score: 40,
      items: [{ rule: 'inactive_30_days', points: 40, detail: `No activity in ${daysSince} days` }],
    }
  }

  if (daysSince >= 14) {
    return {
      score: 20,
      items: [{ rule: 'inactive_14_days', points: 20, detail: `No activity in ${daysSince} days` }],
    }
  }

  return { score: 0, items }
}

function toRiskLevel(score: number): RiskLevel {
  if (score >= 80) return 'low'
  if (score >= 60) return 'moderate'
  if (score >= 40) return 'elevated'
  return 'high'
}

// ── Main ─────────────────────────────────────────────────────────

export function calculateCaseRisk(input: RiskInput, now?: Date): RiskResult {
  const effectiveNow = now ?? new Date()

  const deadline = scoreDeadlineRisk(input.deadlines, effectiveNow)
  const response = scoreResponseRisk(input.discoveryResponseDeadlines, effectiveNow)
  const evidence = scoreEvidenceRisk(input)
  const activity = scoreActivityRisk(input.taskEvents, effectiveNow)

  const riskPoints = deadline.score + response.score + evidence.score + activity.score
  const overall_score = Math.max(0, Math.min(100, 100 - riskPoints))

  return {
    overall_score,
    deadline_risk: deadline.score,
    response_risk: response.score,
    evidence_risk: evidence.score,
    activity_risk: activity.score,
    risk_level: toRiskLevel(overall_score),
    breakdown: [...deadline.items, ...response.items, ...evidence.items, ...activity.items],
  }
}
```

**Step 4: Run tests to verify they pass**

Run: `cd "/Users/minwang/lawyer free" && npx vitest run tests/unit/rules/case-risk-engine.test.ts`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add src/lib/rules/case-risk-engine.ts tests/unit/rules/case-risk-engine.test.ts
git commit -m "feat: add deterministic case risk engine (pure function + tests)"
```

---

### Task 2: Orchestrator — load DB state, score, persist

**Files:**
- Create: `src/lib/rules/run-case-risk.ts`

**Step 1: Write the orchestrator**

Create `src/lib/rules/run-case-risk.ts`:

```typescript
/**
 * Case Risk Scoring Orchestrator
 *
 * Loads case data from Supabase, calls the pure calculateCaseRisk function,
 * and persists the result to case_risk_scores.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { calculateCaseRisk, type RiskResult } from './case-risk-engine'

export async function runCaseRiskScoring(
  supabase: SupabaseClient,
  caseId: string,
  now?: Date
): Promise<RiskResult> {
  // Load deadlines
  const { data: deadlines, error: dlError } = await supabase
    .from('deadlines')
    .select('key, due_at')
    .eq('case_id', caseId)

  if (dlError) throw new Error(`Failed to load deadlines: ${dlError.message}`)

  // Load task events
  const { data: taskEvents, error: teError } = await supabase
    .from('task_events')
    .select('created_at')
    .eq('case_id', caseId)

  if (teError) throw new Error(`Failed to load task events: ${teError.message}`)

  // Load evidence count
  const { count: evidenceCount, error: evError } = await supabase
    .from('evidence_items')
    .select('id', { count: 'exact', head: true })
    .eq('case_id', caseId)

  if (evError) throw new Error(`Failed to count evidence: ${evError.message}`)

  // Load exhibit sets
  const { data: exhibitSets, error: esError } = await supabase
    .from('exhibit_sets')
    .select('id')
    .eq('case_id', caseId)

  if (esError) throw new Error(`Failed to load exhibit sets: ${esError.message}`)

  // Load exhibit count (across all sets for this case)
  const setIds = (exhibitSets ?? []).map((s) => s.id)
  let exhibitCount = 0
  if (setIds.length > 0) {
    const { count, error: exError } = await supabase
      .from('exhibits')
      .select('id', { count: 'exact', head: true })
      .in('exhibit_set_id', setIds)

    if (exError) throw new Error(`Failed to count exhibits: ${exError.message}`)
    exhibitCount = count ?? 0
  }

  // Load trial binders
  const { data: trialBinders, error: tbError } = await supabase
    .from('trial_binders')
    .select('id')
    .eq('case_id', caseId)

  if (tbError) throw new Error(`Failed to load trial binders: ${tbError.message}`)

  // Load discovery response deadlines with response status
  const discoveryDeadlines = (deadlines ?? []).filter((d) =>
    d.key.startsWith('discovery_response_due')
  )

  const discoveryResponseDeadlines: { due_at: string; hasResponse: boolean }[] = []
  for (const dd of discoveryDeadlines) {
    const { count: responseCount, error: drError } = await supabase
      .from('task_events')
      .select('id', { count: 'exact', head: true })
      .eq('case_id', caseId)
      .eq('kind', 'discovery_response_uploaded')

    if (drError) throw new Error(`Failed to check discovery responses: ${drError.message}`)
    discoveryResponseDeadlines.push({
      due_at: dd.due_at,
      hasResponse: (responseCount ?? 0) > 0,
    })
  }

  // Non-discovery deadlines for deadline risk
  const nonDiscoveryDeadlines = (deadlines ?? []).filter(
    (d) => !d.key.startsWith('discovery_response_due')
  )

  // Calculate risk
  const result = calculateCaseRisk(
    {
      deadlines: nonDiscoveryDeadlines,
      taskEvents: taskEvents ?? [],
      evidenceCount: evidenceCount ?? 0,
      exhibitSets: exhibitSets ?? [],
      exhibitCount,
      trialBinders: trialBinders ?? [],
      discoveryResponseDeadlines,
    },
    now
  )

  // Persist
  const { error: insertError } = await supabase.from('case_risk_scores').insert({
    case_id: caseId,
    overall_score: result.overall_score,
    deadline_risk: result.deadline_risk,
    response_risk: result.response_risk,
    evidence_risk: result.evidence_risk,
    activity_risk: result.activity_risk,
    risk_level: result.risk_level,
    breakdown: result.breakdown,
    model: 'deterministic-v1',
  })

  if (insertError) throw new Error(`Failed to persist risk score: ${insertError.message}`)

  return result
}
```

**Step 2: Commit**

```bash
git add src/lib/rules/run-case-risk.ts
git commit -m "feat: add risk scoring orchestrator (load, score, persist)"
```

---

### Task 3: API route

**Files:**
- Create: `src/app/api/cases/[id]/rules/run-risk-score/route.ts`

**Step 1: Write the API route**

Create `src/app/api/cases/[id]/rules/run-risk-score/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { runCaseRiskScoring } from '@/lib/rules/run-case-risk'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const { supabase, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    // Verify case exists (RLS handles ownership)
    const { data: caseData, error: caseError } = await supabase!
      .from('cases')
      .select('id')
      .eq('id', caseId)
      .single()

    if (caseError || !caseData) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      )
    }

    const result = await runCaseRiskScoring(supabase!, caseId)

    return NextResponse.json(result)
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
git add src/app/api/cases/[id]/rules/run-risk-score/route.ts
git commit -m "feat: add POST /api/cases/[id]/rules/run-risk-score endpoint"
```

---

### Task 4: Run all existing tests to verify no regressions

**Step 1: Run full unit test suite**

Run: `cd "/Users/minwang/lawyer free" && npx vitest run`
Expected: All tests PASS (existing + new)

**Step 2: Build to verify compilation**

Run: `cd "/Users/minwang/lawyer free" && npx next build`
Expected: Build succeeds

---
