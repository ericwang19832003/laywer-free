/**
 * Preservation Letter Generator
 *
 * Deterministic, template-based letter generation. No AI.
 * Produces a neutral, professional preservation request.
 *
 * Compliance constraints:
 * - Does NOT provide legal advice
 * - Does NOT claim sanctions, penalties, or legal conclusions
 * - Does NOT recommend lawsuit strategy
 * - Language is neutral: "This is a request to preserve relevant materials."
 */

export interface PreservationLetterInput {
  opponent_name?: string
  incident_date?: string
  summary: string
  evidence_categories: string[]
  custom_evidence_text?: string
  tone: 'polite' | 'neutral' | 'firm'
}

export interface PreservationLetterOutput {
  subject: string
  body: string
  evidenceBullets: string[]
}

// ── Tone-varied paragraphs ────────────────────────────────

const GREETING: Record<string, (name: string | undefined) => string> = {
  polite: (name) =>
    name
      ? `Dear ${name},\n\nI hope this message finds you well. I am writing to respectfully ask that you preserve certain documents and materials that may be relevant to a matter between us.`
      : `To Whom It May Concern,\n\nI am writing to respectfully ask that you preserve certain documents and materials that may be relevant to a matter involving your organization or you personally.`,
  neutral: (name) =>
    name
      ? `Dear ${name},\n\nI am writing to request that you preserve documents and materials that may be relevant to a matter between us.`
      : `To Whom It May Concern,\n\nI am writing to request that you preserve documents and materials that may be relevant to a matter involving your organization or you personally.`,
  firm: (name) =>
    name
      ? `Dear ${name},\n\nThis letter is a written request to preserve all documents and materials that may be relevant to a matter between us, as described below.`
      : `To Whom It May Concern,\n\nThis letter is a written request to preserve all documents and materials that may be relevant to a matter described below.`,
}

const PRESERVATION_REQUEST: Record<string, string> = {
  polite:
    'I would appreciate it if you could take steps to ensure that the following types of materials are not destroyed, altered, or discarded while this matter is being addressed. I understand this may take some effort, and I appreciate your cooperation.',
  neutral:
    'I ask that you take steps to ensure that the following types of materials are not destroyed, altered, or discarded while this matter is being addressed.',
  firm:
    'I ask that you take immediate steps to ensure that the following types of materials are not destroyed, altered, or discarded. This includes pausing any routine document destruction or data retention schedules that may affect these materials.',
}

const CLOSING: Record<string, string> = {
  polite:
    'Thank you for your time and willingness to cooperate. If you have any questions about the scope of this request, please do not hesitate to reach out. I would appreciate written confirmation that you have received this letter.',
  neutral:
    'Please confirm in writing that you have received this letter and intend to preserve the materials described above.',
  firm:
    'Please confirm in writing that you have received this letter and that you will preserve the materials described above. I would appreciate a response within a reasonable timeframe.',
}

// ── Helpers ───────────────────────────────────────────────

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  // Parse date-only strings (YYYY-MM-DD) as local dates, not UTC
  const parts = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  const d = parts
    ? new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]))
    : new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function buildEvidenceBullets(
  categories: string[],
  customText?: string
): string[] {
  const bullets = [...categories]
  if (customText?.trim()) {
    bullets.push(customText.trim())
  }
  if (bullets.length === 0) {
    bullets.push('All documents and materials relevant to this matter')
  }
  return bullets
}

// ── Generator ─────────────────────────────────────────────

export function generatePreservationLetter(
  input: PreservationLetterInput
): PreservationLetterOutput {
  const {
    opponent_name,
    incident_date,
    summary,
    evidence_categories,
    custom_evidence_text,
    tone,
  } = input

  const subject = 'Request to Preserve Relevant Records'
  const evidenceBullets = buildEvidenceBullets(
    evidence_categories,
    custom_evidence_text
  )

  const today = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  // Assemble body sections
  const sections: string[] = []

  // Date header
  sections.push(today)

  // Recipient
  if (opponent_name) {
    sections.push(opponent_name)
  }

  // Subject line
  sections.push(`Re: ${subject}`)

  // Greeting + opening
  sections.push(GREETING[tone](opponent_name))

  // Factual context
  const contextParts: string[] = []
  if (incident_date) {
    contextParts.push(
      `This request relates to events on or around ${formatDate(incident_date)}.`
    )
  }
  contextParts.push(summary)
  sections.push(contextParts.join(' '))

  // Preservation request + bullets
  const bulletList = evidenceBullets.map((b) => `  - ${b}`).join('\n')
  sections.push(`${PRESERVATION_REQUEST[tone]}\n\n${bulletList}`)

  // Scope clarification
  sections.push(
    'This request applies to the above materials in all forms, whether physical or electronic, including but not limited to paper documents, electronically stored information, emails, text messages, photographs, videos, social media content, voicemails, and other recordings or communications.'
  )

  // Closing
  sections.push(CLOSING[tone])

  // Sign-off
  sections.push('Sincerely,\n\n[Your Name]')

  // Disclaimer
  sections.push(
    '---\nFOR REFERENCE ONLY. This document is not legal advice and does not create an attorney-client relationship. You should consult with a licensed attorney for advice specific to your situation.'
  )

  const body = sections.join('\n\n')

  return { subject, body, evidenceBullets }
}
