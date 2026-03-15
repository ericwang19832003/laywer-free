import type { InsightInput, Insight } from './types'

type InsightRule = (input: InsightInput) => Insight | null

const solDays: Record<string, number> = {
  personal_injury: 730, small_claims: 730, contract: 1460,
  property: 1460, landlord_tenant: 730, debt_defense: 1460,
  family: 0, other: 1460,
}

const solWarning: InsightRule = (input) => {
  if (!input.incidentDate) return null
  const solDaysForType = solDays[input.disputeType] ?? 1460
  if (solDaysForType === 0) return null

  const incident = new Date(input.incidentDate)
  const deadline = new Date(incident.getTime() + solDaysForType * 86400000)
  const daysLeft = Math.ceil((deadline.getTime() - Date.now()) / 86400000)

  if (daysLeft <= 0) {
    return { insight_type: 'sol_expired', title: 'Statute of limitations may have passed', body: `Based on your incident date, the filing deadline may have passed ${Math.abs(daysLeft)} days ago. Consult an attorney immediately.`, priority: 'urgent' }
  }
  if (daysLeft <= 90) {
    return { insight_type: 'sol_warning', title: `${daysLeft} days left to file`, body: `Based on your incident date, you have approximately ${daysLeft} days left before the statute of limitations expires.`, priority: daysLeft <= 30 ? 'urgent' : 'warning' }
  }
  return null
}

const missingEvidence: InsightRule = (input) => {
  const filingStarted = input.tasks.some(t =>
    (t.task_key.includes('prepare_filing') || t.task_key.includes('prepare_pi') ||
    t.task_key.includes('prepare_small') || t.task_key.includes('prepare_debt')) &&
    (t.status === 'in_progress' || t.status === 'completed' || t.status === 'todo' || t.status === 'needs_review')
  )
  if (!filingStarted) return null
  if (input.evidenceCount >= 3) return null

  return {
    insight_type: 'missing_evidence',
    title: 'Consider adding more evidence',
    body: `You have ${input.evidenceCount} evidence item${input.evidenceCount === 1 ? '' : 's'}. Cases with 3+ pieces of organized evidence tend to be stronger.`,
    priority: 'info',
  }
}

const upcomingDeadline: InsightRule = (input) => {
  const now = Date.now()
  const upcoming = input.deadlines
    .map(d => ({ ...d, daysUntil: Math.ceil((new Date(d.due_at).getTime() - now) / 86400000) }))
    .filter(d => d.daysUntil > 0 && d.daysUntil <= 7)
    .sort((a, b) => a.daysUntil - b.daysUntil)

  if (upcoming.length === 0) return null

  const nearest = upcoming[0]
  return {
    insight_type: 'deadline_approaching',
    title: `Deadline in ${nearest.daysUntil} day${nearest.daysUntil === 1 ? '' : 's'}`,
    body: `Your "${nearest.key.replace(/_/g, ' ')}" deadline is coming up. Make sure you're prepared.`,
    priority: nearest.daysUntil <= 3 ? 'urgent' : 'warning',
  }
}

const staleCase: InsightRule = (input) => {
  const lastActivity = input.tasks
    .filter(t => t.completed_at)
    .map(t => new Date(t.completed_at!).getTime())
    .sort((a, b) => b - a)[0]

  if (!lastActivity) return null
  const daysSince = Math.ceil((Date.now() - lastActivity) / 86400000)
  if (daysSince < 14) return null

  return {
    insight_type: 'stale_case',
    title: 'Your case needs attention',
    body: `It's been ${daysSince} days since your last activity. Staying active keeps your case on track.`,
    priority: daysSince >= 30 ? 'warning' : 'info',
  }
}

export const INSIGHT_RULES: InsightRule[] = [
  solWarning,
  missingEvidence,
  upcomingDeadline,
  staleCase,
]

export function generateInsights(input: InsightInput): Insight[] {
  return INSIGHT_RULES.map(rule => rule(input)).filter((r): r is Insight => r !== null)
}
