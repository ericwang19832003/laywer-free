# Deterministic Case Risk Engine

**Date:** 2026-02-28
**Status:** Approved
**Replaces:** AI-based risk scoring (OpenAI)

## Purpose

Replace the AI-based case risk scorer with a deterministic, pure-function engine that computes consistent risk scores from case data. Same inputs always produce same outputs. No API calls, no cost, no latency variance.

## Architecture

Follows the established rule engine pattern (gatekeeper, escalation-engine):

```
POST /api/cases/[id]/rules/run-risk-score
  └─ runCaseRiskScoring(supabase, caseId)
       ├─ Load: deadlines, task_events, evidence_items, exhibit_sets, trial_binders
       ├─ Call: calculateCaseRisk(input, now)  ← pure function, no DB
       └─ Persist: INSERT into case_risk_scores (model = 'deterministic-v1')
```

## Pure Function

```typescript
// src/lib/rules/case-risk-engine.ts

interface RiskInput {
  deadlines: { key: string; due_at: string }[]
  taskEvents: { created_at: string }[]
  evidenceCount: number
  exhibitSets: { id: string }[]
  exhibitCount: number
  trialBinders: { id: string }[]
  discoveryResponseDeadlines: { due_at: string; hasResponse: boolean }[]
}

interface RiskBreakdownItem {
  rule: string
  points: number
  detail: string
}

interface RiskResult {
  overall_score: number
  deadline_risk: number
  response_risk: number
  evidence_risk: number
  activity_risk: number
  risk_level: 'low' | 'moderate' | 'elevated' | 'high'
  breakdown: RiskBreakdownItem[]
}

function calculateCaseRisk(input: RiskInput, now?: Date): RiskResult
```

## Scoring Rules

### 1. Deadline Risk (max of all deadlines)

| Condition | Points |
|-----------|--------|
| Overdue deadline | +40 |
| Deadline within 3 days | +20 |
| Deadline within 7 days | +10 |

Takes the **max** across all deadlines to avoid runaway scores.

### 2. Response Risk (max of all discovery response deadlines)

| Condition | Points |
|-----------|--------|
| Discovery response overdue & no response | +50 |
| Response due within 3 days & no response | +30 |

Takes the **max** across all discovery response deadlines.

### 3. Evidence Risk (additive)

| Condition | Points |
|-----------|--------|
| Evidence count < 3 | +15 |
| No exhibit set | +10 |
| Exhibit count < 2 | +10 |
| No trial binder | +5 |

Max possible: 40 points.

### 4. Activity Risk (most recent task_event, mutually exclusive)

| Condition | Points |
|-----------|--------|
| No task_event in 30 days | +40 |
| No task_event in 14 days | +20 |

30-day check takes precedence (if 30+ days inactive, score is 40 not 60).

## Final Score

```
risk_points = deadline_risk + response_risk + evidence_risk + activity_risk
overall_score = clamp(100 - risk_points, 0, 100)
```

## Risk Level Mapping

| Score | Level |
|-------|-------|
| >= 80 | low |
| 60-79 | moderate |
| 40-59 | elevated |
| < 40 | high |

## Persistence

Each call inserts a new row in `case_risk_scores`:
- `model = 'deterministic-v1'`
- `breakdown` = JSON array of fired rules with points and descriptions
- Historical rows preserved for trend tracking

## Files

| File | Purpose |
|------|---------|
| `src/lib/rules/case-risk-engine.ts` | Pure function + types |
| `src/lib/rules/run-case-risk.ts` | Orchestrator (load, score, persist) |
| `src/app/api/cases/[id]/rules/run-risk-score/route.ts` | API route |
| `tests/unit/case-risk-engine.test.ts` | Unit tests |

## Test Scenarios

1. **Clean case** — recent activity, no deadlines, minimal evidence → moderate score
2. **Overdue deadline** — +40 deadline risk
3. **Discovery response overdue** — +50 response risk → high
4. **Stale case** — no events in 30 days → +40 activity
5. **Full evidence** — 3+ evidence, exhibit set, 2+ exhibits, binder → 0 evidence risk
6. **Combined worst case** — all risks maxed → clamped at 0
7. **Determinism** — same inputs produce identical output across runs
