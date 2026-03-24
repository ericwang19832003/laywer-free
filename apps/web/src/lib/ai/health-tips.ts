import { z } from 'zod'

export const healthTipsSchema = z.object({
  tips: z.array(z.object({
    tip: z.string().max(200),
    area: z.enum(['deadline', 'response', 'evidence', 'activity']),
  })).min(1).max(4),
})

export type HealthTips = z.infer<typeof healthTipsSchema>

const BLOCKED_PHRASES = Object.freeze([
  'you must', 'you should', 'file immediately', 'urgent',
  'sanctions', 'legal advice', 'guaranteed', 'winning', 'losing',
])

export function isHealthTipsSafe(text: string): boolean {
  const lower = text.toLowerCase()
  return !BLOCKED_PHRASES.some((phrase) => lower.includes(phrase))
}

export function buildStaticHealthTips(scores: {
  deadline_risk: number
  response_risk: number
  evidence_risk: number
  activity_risk: number
}): HealthTips {
  const tips: HealthTips['tips'] = []

  if (scores.deadline_risk < 50) {
    tips.push({ tip: 'Review your upcoming deadlines — some may need attention soon.', area: 'deadline' })
  }
  if (scores.response_risk < 50) {
    tips.push({ tip: 'Check for any pending responses or filings that need follow-up.', area: 'response' })
  }
  if (scores.evidence_risk < 50) {
    tips.push({ tip: 'Consider uploading additional evidence to strengthen your case file.', area: 'evidence' })
  }
  if (scores.activity_risk < 50) {
    tips.push({ tip: 'Stay engaged with your case tasks to keep momentum going.', area: 'activity' })
  }

  if (tips.length === 0) {
    tips.push({ tip: 'Your case looks healthy! Keep an eye on upcoming deadlines.', area: 'activity' })
  }

  return { tips: tips.slice(0, 4) }
}

export const HEALTH_TIPS_SYSTEM_PROMPT = `You provide actionable health tips for a pro se litigant's case management.

Given case health scores (0-100, higher is better) across 4 areas, provide 2-4 short, specific tips to improve the case's health.

Areas: deadline (meeting court deadlines), response (filing responses on time), evidence (gathering and organizing proof), activity (regular engagement with case tasks).

RULES:
- Be encouraging and practical
- Never give specific legal advice
- Never use directive language ("you must", "you should")
- Focus on case management actions, not legal strategy
- Each tip should be under 200 characters
- Prioritize the weakest areas

Respond with JSON only: { "tips": [{ "tip": "...", "area": "deadline|response|evidence|activity" }] }`

export function buildHealthTipsPrompt(input: {
  overall_score: number
  deadline_risk: number
  response_risk: number
  evidence_risk: number
  activity_risk: number
  court_type: string
  dispute_type: string | null
  tasks_completed: number
  tasks_total: number
  evidence_count: number
}): string {
  return [
    `Overall health score: ${input.overall_score}/100`,
    `Deadline score: ${input.deadline_risk}/100`,
    `Response score: ${input.response_risk}/100`,
    `Evidence score: ${input.evidence_risk}/100`,
    `Activity score: ${input.activity_risk}/100`,
    `Court: ${input.court_type}`,
    `Dispute: ${input.dispute_type ?? 'general'}`,
    `Progress: ${input.tasks_completed}/${input.tasks_total} tasks completed`,
    `Evidence items uploaded: ${input.evidence_count}`,
  ].join('\n')
}
