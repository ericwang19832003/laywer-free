import { z } from 'zod'

export const strategyRecommendationSchema = z.object({
  recommendations: z.array(z.object({
    title: z.string().max(100),
    body: z.string().max(500),
    priority: z.enum(['high', 'medium', 'low']),
  })).min(1).max(5),
})

export type StrategyRecommendations = z.infer<typeof strategyRecommendationSchema>

const BLOCKED_PHRASES = Object.freeze([
  'you must', 'you should file', 'file immediately', 'urgent action',
  'sanctions', 'legal advice', 'guaranteed', 'winning', 'losing',
  'i recommend that you', 'you need to file', 'hire a lawyer',
  'as your attorney', 'in my legal opinion',
])

export function isStrategySafe(text: string): boolean {
  const lower = text.toLowerCase()
  return !BLOCKED_PHRASES.some((phrase) => lower.includes(phrase))
}

export function buildStaticStrategy(input: {
  tasks_completed: number
  tasks_total: number
  has_evidence: boolean
  has_deadlines: boolean
}): StrategyRecommendations {
  const recs: StrategyRecommendations['recommendations'] = []

  if (input.tasks_completed < input.tasks_total) {
    recs.push({
      title: 'Continue completing case tasks',
      body: `You have completed ${input.tasks_completed} of ${input.tasks_total} tasks. Each completed task builds your case foundation.`,
      priority: 'high',
    })
  }

  if (!input.has_evidence) {
    recs.push({
      title: 'Start gathering evidence',
      body: 'Uploading relevant documents, photos, and communications to the evidence vault helps build a strong case file.',
      priority: 'high',
    })
  }

  if (input.has_deadlines) {
    recs.push({
      title: 'Stay ahead of deadlines',
      body: 'Court deadlines are critical. Review your upcoming deadlines regularly to avoid missed filings.',
      priority: 'medium',
    })
  }

  if (recs.length === 0) {
    recs.push({
      title: 'Your case is progressing well',
      body: 'Continue monitoring your case dashboard for new tasks and deadlines as they become available.',
      priority: 'low',
    })
  }

  return { recommendations: recs }
}

export const STRATEGY_SYSTEM_PROMPT = `You provide case management strategy recommendations for a pro se litigant (someone representing themselves in court).

Given comprehensive case context, provide 3-5 prioritized strategic recommendations focusing on case management and procedural steps.

CRITICAL RULES:
- You are NOT a lawyer. Never provide specific legal advice.
- Never use directive language ("you must", "you should file")
- Never predict outcomes ("winning", "losing", "guaranteed")
- Never recommend hiring/not hiring a lawyer
- Focus on procedural and organizational strategy, not legal arguments
- Frame recommendations as things to "consider" or "explore"
- Each recommendation needs a short title and a 2-3 sentence body
- Prioritize as high/medium/low based on urgency and impact

Respond with JSON only:
{
  "recommendations": [
    { "title": "...", "body": "...", "priority": "high|medium|low" }
  ]
}`

export function buildStrategyPrompt(input: {
  court_type: string
  dispute_type: string | null
  role: string
  completed_tasks: string[]
  pending_tasks: string[]
  locked_tasks: string[]
  upcoming_deadlines: { key: string; due_at: string }[]
  evidence_count: number
  risk_score: number | null
  risk_areas: { area: string; score: number }[]
  motions_filed: number
  discovery_served: boolean
  days_since_creation: number
}): { system: string; user: string } {
  const userLines = [
    '--- CASE CONTEXT ---',
    `Court: ${input.court_type}`,
    `Dispute: ${input.dispute_type ?? 'general'}`,
    `Role: ${input.role}`,
    `Case age: ${input.days_since_creation} days`,
    '',
    '--- PROGRESS ---',
    `Completed tasks: ${input.completed_tasks.join(', ') || 'none'}`,
    `Pending tasks: ${input.pending_tasks.join(', ') || 'none'}`,
    `Locked tasks: ${input.locked_tasks.join(', ') || 'none'}`,
    '',
    '--- DEADLINES ---',
    ...(input.upcoming_deadlines.length > 0
      ? input.upcoming_deadlines.map((d) => `- ${d.key}: ${new Date(d.due_at).toLocaleDateString('en-US')}`)
      : ['No upcoming deadlines']),
    '',
    '--- CASE HEALTH ---',
    `Overall score: ${input.risk_score ?? 'not calculated'}/100`,
    ...input.risk_areas.map((a) => `- ${a.area}: ${a.score}/100`),
    '',
    '--- RESOURCES ---',
    `Evidence items: ${input.evidence_count}`,
    `Motions filed: ${input.motions_filed}`,
    `Discovery served: ${input.discovery_served ? 'yes' : 'no'}`,
  ]

  return {
    system: STRATEGY_SYSTEM_PROMPT,
    user: userLines.join('\n'),
  }
}
