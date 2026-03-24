/**
 * Meet-and-Confer Note Generator
 *
 * Deterministic, template-based note generation. No AI.
 * Produces a neutral, professional request to discuss discovery objections.
 *
 * Compliance constraints:
 * - Does NOT provide legal advice
 * - Does NOT threaten sanctions, motions, or penalties
 * - Does NOT draw legal conclusions
 * - Language is neutral: "We would like to discuss..."
 */

export interface MeetAndConferItem {
  item_type: string
  item_no: number | null
  labels: string[]
  neutral_summary: string
}

export interface MeetAndConferInput {
  pack_title: string
  response_date?: string | null
  items: MeetAndConferItem[]
}

export interface MeetAndConferOutput {
  subject: string
  body: string
}

// ── Helpers ───────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  rfp: 'Request for Production',
  rog: 'Interrogatory',
  rfa: 'Request for Admission',
  unknown: 'Discovery Item',
}

const TYPE_SHORT: Record<string, string> = {
  rfp: 'RFP',
  rog: 'ROG',
  rfa: 'RFA',
  unknown: 'Item',
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatItemRef(item: MeetAndConferItem): string {
  const short = TYPE_SHORT[item.item_type] ?? 'Item'
  if (item.item_no) return `${short} #${item.item_no}`
  return `${TYPE_LABELS[item.item_type] ?? 'Discovery item'} (unnumbered)`
}

const LABEL_DISPLAY: Record<string, string> = {
  relevance: 'relevance',
  overbroad: 'overbreadth',
  vague_ambiguous: 'vagueness or ambiguity',
  undue_burden: 'undue burden',
  privilege: 'privilege',
  confidentiality: 'confidentiality',
  not_in_possession: 'possession',
  already_produced: 'prior production',
  premature: 'timing',
  general_objection: 'general objection',
  non_responsive: 'responsiveness',
  incomplete: 'completeness',
  other: 'other concerns',
}

function formatLabels(labels: string[]): string {
  const displayLabels = labels.map((l) => LABEL_DISPLAY[l] ?? l)
  if (displayLabels.length === 1) return displayLabels[0]
  if (displayLabels.length === 2) return `${displayLabels[0]} and ${displayLabels[1]}`
  return `${displayLabels.slice(0, -1).join(', ')}, and ${displayLabels[displayLabels.length - 1]}`
}

// ── Generator ─────────────────────────────────────────────

export function generateMeetAndConferNote(
  input: MeetAndConferInput
): MeetAndConferOutput {
  const { pack_title, response_date, items } = input

  const subject = `Meet and Confer — ${pack_title}`

  const today = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const sections: string[] = []

  // Date header
  sections.push(today)

  // Subject line
  sections.push(`Re: ${subject}`)

  // Opening
  const responseDateClause = response_date
    ? ` received on ${formatDate(response_date)}`
    : ''
  sections.push(
    `To Whom It May Concern,\n\n` +
    `I am writing regarding the discovery response${responseDateClause} ` +
    `for "${pack_title}." After reviewing the response, I have identified ` +
    `${items.length === 1 ? 'an item' : `${items.length} items`} where ` +
    `the objections raised may benefit from a brief discussion to clarify scope ` +
    `and explore whether supplemental responses can be provided.`
  )

  // Items section
  const itemLines = items.map((item) => {
    const ref = formatItemRef(item)
    const labelText = formatLabels(item.labels)
    return `  - ${ref}: Objection regarding ${labelText}. ${item.neutral_summary}`
  })
  sections.push(
    `The following items are the focus of this request:\n\n${itemLines.join('\n')}`
  )

  // Request for discussion
  sections.push(
    `I would appreciate the opportunity to discuss these items with you ` +
    `by phone or email at your convenience. The goal is to better understand ` +
    `the basis of each objection and to determine whether it may be possible ` +
    `to narrow the scope or provide supplemental responses that address the ` +
    `underlying requests.`
  )

  // Closing
  sections.push(
    `Please let me know a time that works for you, or feel free to respond ` +
    `in writing if you prefer. I am happy to work together to resolve these ` +
    `items informally.`
  )

  // Sign-off
  sections.push('Sincerely,\n\n[Your Name]')

  // Disclaimer
  sections.push(
    '---\nFOR REFERENCE ONLY. This document is not legal advice and does not ' +
    'create an attorney-client relationship. You should consult with a licensed ' +
    'attorney for advice specific to your situation.'
  )

  const body = sections.join('\n\n')

  return { subject, body }
}
