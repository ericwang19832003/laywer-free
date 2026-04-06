const BLOCKED_PHRASES = Object.freeze([
  'you must', 'you should', 'file immediately', 'urgent',
  'sanctions', 'legal advice', 'guaranteed', 'winning', 'losing',
  'hire a lawyer', 'as your attorney', 'in my legal opinion',
])

export { BLOCKED_PHRASES as CASE_SUMMARY_BLOCKED_PHRASES }

export function isSummarySafe(text: string): boolean {
  const lower = text.toLowerCase()
  return !BLOCKED_PHRASES.some((phrase) => lower.includes(phrase))
}

export const CASE_SUMMARY_SYSTEM_PROMPT = `You generate a structured case summary for a pro se litigant's trial binder.

Given case details, produce a comprehensive summary covering:
1. Case Overview — brief narrative of the dispute
2. Parties — names and roles of all parties involved
3. Claims — legal claims or causes of action
4. Key Facts — the most important undisputed and disputed facts
5. Evidence Summary — overview of evidence collected, by category
6. Timeline — chronological summary of key events
7. Strengths — aspects of the case that favor the litigant
8. Areas of Concern — potential weaknesses or gaps to address

RULES:
- Use plain language a non-lawyer can understand
- Never give legal advice or predict outcomes
- Never use directive language ("you must", "you should")
- Be factual and balanced
- Frame concerns as areas to "consider" or "explore"

Respond with structured sections as described above.`

export const STRATEGY_NOTES_SYSTEM_PROMPT = `You generate trial strategy notes for a pro se litigant's trial binder.

Given case details and evidence, produce notes covering:
1. Opening Statement Themes — 2-3 narrative themes to weave through the opening
2. Key Exhibits — which exhibits to highlight and in what order
3. Anticipated Objections — likely objections from the opposing side and how to address them
4. Cross-Exam Points — key points to raise during cross-examination
5. Closing Framework — structure for a closing argument tied to the evidence

RULES:
- Use plain language a non-lawyer can understand
- Never give legal advice or predict outcomes
- Never use directive language ("you must", "you should")
- Frame suggestions as things to "consider" or "explore"
- Focus on organization and presentation, not legal arguments

Respond with structured sections as described above.`

export function buildCaseSummaryPrompt(input: {
  dispute_type: string
  state: string
  role: string
  county?: string
  exhibit_count: number
  evidence_categories?: string[]
  timeline_event_count: number
  discovery_summary?: string
}): string {
  const lines = [
    `Dispute type: ${input.dispute_type}`,
    `State: ${input.state}`,
    `Role: ${input.role}`,
  ]
  if (input.county) {
    lines.push(`County: ${input.county}`)
  }
  lines.push(`Exhibits: ${input.exhibit_count}`)
  if (input.evidence_categories && input.evidence_categories.length > 0) {
    lines.push(`Evidence categories: ${input.evidence_categories.join(', ')}`)
  }
  lines.push(`Timeline events: ${input.timeline_event_count}`)
  if (input.discovery_summary) {
    lines.push(`Discovery summary: ${input.discovery_summary}`)
  }
  return lines.join('\n')
}

export function buildStrategyNotesPrompt(input: {
  dispute_type: string
  state: string
  role: string
  exhibit_titles?: string[]
  risk_level?: string
  health_score?: number
}): string {
  const lines = [
    `Dispute type: ${input.dispute_type}`,
    `State: ${input.state}`,
    `Role: ${input.role}`,
  ]
  if (input.exhibit_titles && input.exhibit_titles.length > 0) {
    lines.push(`Exhibit titles: ${input.exhibit_titles.join(', ')}`)
  }
  if (input.risk_level) {
    lines.push(`Risk level: ${input.risk_level}`)
  }
  if (input.health_score !== undefined) {
    lines.push(`Health score: ${input.health_score}/100`)
  }
  return lines.join('\n')
}
