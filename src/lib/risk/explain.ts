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
