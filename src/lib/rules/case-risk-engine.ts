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
