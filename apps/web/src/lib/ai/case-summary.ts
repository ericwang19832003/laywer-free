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

export const STRATEGY_NOTES_SYSTEM_PROMPT = `You help a pro se litigant organize their trial preparation materials.

Given case details and evidence, produce an organizational guide covering:
1. Key Exhibits — which exhibits to organize and a suggested logical grouping order
2. Witness List — anticipated witnesses and the topics they may address
3. Anticipated Objections — common objections that arise in this dispute type and general information on how they work procedurally
4. Document Checklist — documents that are typically relevant for this type of case
5. Preparation Reminders — organizational reminders (e.g., arrive early, bring extra copies)

RULES:
- You are NOT a lawyer. This is an organizational aid, not legal strategy.
- Never give legal advice or predict outcomes
- Never use directive language ("you must", "you should")
- Never suggest specific arguments, themes, or what to say to a jury
- Frame everything as things to "consider organizing" or "commonly relevant"
- Focus on logistics and organization, not legal arguments or advocacy
- Include a footer: "This organizational guide is a self-help tool only. Consult a licensed attorney before trial."

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
