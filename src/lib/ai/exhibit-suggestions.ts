import { z } from 'zod'

const BLOCKED_PHRASES = Object.freeze([
  'you must', 'you should', 'file immediately', 'urgent',
  'sanctions', 'legal advice', 'guaranteed', 'winning', 'losing',
  'i recommend that you', 'as your attorney', 'in my legal opinion',
])

export const exhibitSuggestionSchema = z.object({
  suggestions: z.array(z.object({
    evidence_id: z.string(),
    suggested_title: z.string().min(1).max(200),
    reason: z.string().min(1).max(500),
  })),
})

export type ExhibitSuggestion = z.infer<typeof exhibitSuggestionSchema>

export function isExhibitSuggestionSafe(text: string): boolean {
  const lower = text.toLowerCase()
  return !BLOCKED_PHRASES.some((phrase) => lower.includes(phrase))
}

export const EXHIBIT_SUGGESTION_SYSTEM_PROMPT = `You suggest which evidence items a pro se litigant should designate as exhibit for their case binder.

Given the case context, a list of already-designated exhibits, and a list of unexhibited evidence items, suggest which evidence items to designate next and propose a short, descriptive exhibit title for each.

RULES:
- Never give legal advice
- Never use directive language ("you must", "you should")
- Never predict outcomes ("winning", "losing", "guaranteed")
- Suggest exhibit titles that are clear, concise, and descriptive of the document
- Provide a brief reason why the item may be worth designating as an exhibit
- Focus on organizational value, not legal strategy

Respond with JSON only:
{
  "suggestions": [
    { "evidence_id": "...", "suggested_title": "...", "reason": "..." }
  ]
}`

export function buildExhibitSuggestionPrompt(input: {
  dispute_type: string | null
  state: string | null
  existing_exhibits: { exhibit_no: number; title: string }[]
  unexhibited_evidence: { id: string; file_name: string; category: string | null; notes: string | null }[]
}): string {
  const lines: string[] = [
    '--- CASE CONTEXT ---',
    `Dispute type: ${input.dispute_type ?? 'general'}`,
    `State: ${input.state ?? 'unknown'}`,
    '',
  ]

  if (input.existing_exhibits.length > 0) {
    lines.push('--- EXISTING EXHIBITS ---')
    for (const ex of input.existing_exhibits) {
      lines.push(`- Exhibit ${ex.exhibit_no}: ${ex.title}`)
    }
  } else {
    lines.push('--- EXISTING EXHIBITS ---')
    lines.push('None yet')
  }

  lines.push('')
  lines.push('--- UNEXHIBITED EVIDENCE ---')

  if (input.unexhibited_evidence.length > 0) {
    for (const ev of input.unexhibited_evidence) {
      const parts = [`ID: ${ev.id}`, `File: ${ev.file_name}`]
      if (ev.category) parts.push(`Category: ${ev.category}`)
      if (ev.notes) parts.push(`Notes: ${ev.notes}`)
      lines.push(`- ${parts.join(' | ')}`)
    }
  } else {
    lines.push('No unexhibited evidence items')
  }

  return lines.join('\n')
}
