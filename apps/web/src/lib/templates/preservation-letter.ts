/**
 * Preservation Letter Generator
 *
 * Deterministic, template-based letter generation. No AI.
 * Produces a professional litigation hold / evidence preservation notice.
 *
 * Compliance constraints:
 * - Does NOT provide legal advice
 * - Does NOT claim sanctions, penalties, or legal conclusions as certainties
 * - Language is instructive and formal: proper litigation hold notice.
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
      ? `Dear ${name},`
      : `To Whom It May Concern,`,
  neutral: (name) =>
    name
      ? `Dear ${name},`
      : `To Whom It May Concern,`,
  firm: (name) =>
    name
      ? `Dear ${name},`
      : `To Whom It May Concern,`,
}

const OPENING: Record<string, (summary: string, date: string) => string> = {
  polite: (summary, date) => {
    const dateClause = date ? ` on or around ${date}` : ''
    return `I am writing to formally request that you preserve all documents, records, and other materials that may be relevant to a dispute arising from the following matter${dateClause}: ${summary}\n\nI am sending this letter because I believe it is reasonably possible that legal proceedings may follow, and I want to ensure that relevant evidence is not lost or destroyed before this matter is resolved.`
  },
  neutral: (summary, date) => {
    const dateClause = date ? ` arising on or around ${date}` : ''
    return `This letter constitutes formal notice that legal action is reasonably anticipated in connection with the following matter${dateClause}: ${summary}\n\nYou are hereby requested to preserve all documents, data, electronically stored information ("ESI"), and other materials that may be relevant to this dispute.`
  },
  firm: (summary, date) => {
    const dateClause = date ? ` arising on or around ${date}` : ''
    return `This letter serves as formal notice that litigation is reasonably anticipated and/or pending in connection with the following matter${dateClause}: ${summary}\n\nYou are hereby instructed to immediately implement a litigation hold and preserve all documents, data, electronically stored information ("ESI"), and other materials — in whatever form maintained — that are or may be relevant to this dispute.`
  },
}

const SUSPENSION: Record<string, string> = {
  polite:
    'I ask that you please take steps to suspend any routine deletion, overwriting, or destruction of potentially relevant materials, including scheduled purges of electronic records, email archives, video surveillance footage, and backup data.',
  neutral:
    'You are requested to immediately suspend all routine deletion, overwriting, or destruction of potentially relevant materials, including any scheduled purges of electronic records, email archives, surveillance footage, backup tapes or cloud backups, and server or application logs.',
  firm:
    'You are hereby directed to immediately suspend all policies, procedures, schedules, or systems that provide for the routine deletion, destruction, overwriting, or expiration of potentially relevant evidence, including without limitation: video surveillance purge cycles, backup rotation policies, email and communication retention schedules, server and application log rollover, and any automatic data expiration processes.',
}

const PRESERVATION_REQUEST: Record<string, string> = {
  polite:
    'I respectfully request that you preserve the following categories of materials, in all physical and electronic forms in which they exist:',
  neutral:
    'You are requested to preserve the following categories of documents and ESI, in all forms in which they exist, including native electronic files and associated metadata:',
  firm:
    'You are instructed to preserve — in native format, with all metadata intact — the following categories of documents, data, and ESI, including all copies, drafts, versions, and backup or archived copies wherever maintained:',
}

const SCOPE: Record<string, string> = {
  polite:
    'This request applies to materials in your possession, custody, or control, as well as materials held by your employees, agents, contractors, vendors, or any third parties acting on your behalf. Please take reasonable steps to notify relevant individuals within your organization of this preservation request.',
  neutral:
    'This preservation request applies to all materials in your possession, custody, or control, including materials held by your affiliates, employees, agents, contractors, vendors, and any third parties acting on your behalf. You should promptly notify all relevant individuals and departments of their obligation to preserve.',
  firm:
    'This litigation hold applies to all materials within your possession, custody, or control, including materials held by your affiliates, parent entities, subsidiaries, employees, officers, directors, agents, attorneys, contractors, vendors, third-party service providers, cloud storage providers, and any other parties acting on your behalf or at your direction. You must promptly notify all such persons and entities of their obligation to preserve relevant evidence.',
}

const NATIVE_FORMAT: Record<string, string> = {
  polite:
    'Where possible, please preserve electronic records in their original format. Printouts or screenshots alone are generally not adequate substitutes for the underlying electronic records.',
  neutral:
    'Electronic records must be preserved in native format, with metadata intact. Do not alter, overwrite, convert, or summarize electronic records. Printouts or screenshots are not adequate substitutes for native electronic data.',
  firm:
    'You are specifically instructed to preserve native electronic data, metadata, audit trails, access logs, system logs, and database records in their original, unaltered form. Do not convert, alter, summarize, overwrite, delete, modify, or degrade any relevant evidence. Screenshots, printouts, or summary reports are not adequate substitutes for native records and metadata.',
}

const CONSEQUENCES: Record<string, string> = {
  polite:
    'If relevant materials are lost or destroyed after your receipt of this letter, that loss may become an issue in any future proceedings. I appreciate your attention to preserving these materials.',
  neutral:
    'Please be advised that if relevant evidence is lost, deleted, overwritten, or destroyed after receipt of this notice, such loss may become the subject of a motion for sanctions or other relief in any future proceeding.',
  firm:
    'Be advised that the failure to preserve relevant evidence after receipt of this notice may constitute spoliation of evidence. If evidence is lost, deleted, overwritten, altered, or allowed to expire after receipt of this letter, available remedies may include sanctions, adverse inference instructions, evidentiary presumptions, exclusion of evidence, cost-shifting, and attorney\'s fees where available.',
}

const CONFIRMATION: Record<string, string> = {
  polite:
    'I would appreciate written confirmation that you have received this letter and have taken steps to preserve the materials described above.',
  neutral:
    'Please confirm in writing within seven (7) calendar days of receipt that a preservation hold has been implemented and that routine deletion of potentially relevant materials has been suspended.',
  firm:
    'You are requested to confirm in writing within seven (7) calendar days of receipt that a litigation hold has been implemented, that routine deletion schedules have been suspended, and that the materials described above are being preserved.',
}

const CLOSING: Record<string, string> = {
  polite: 'Thank you for your attention to this matter.',
  neutral: 'Nothing in this letter should be construed as a waiver of any rights, claims, defenses, remedies, or privileges, all of which are expressly reserved.',
  firm: 'This letter is not a discovery request and does not require disclosure of privileged material at this time. It is a formal demand to preserve potentially relevant evidence. Nothing in this letter should be construed as a waiver of any rights, claims, defenses, remedies, objections, or privileges, all of which are expressly reserved.',
}

// ── Helpers ───────────────────────────────────────────────

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
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

  const subjectLine = tone === 'firm'
    ? 'Re: Litigation Hold and Evidence Preservation Notice'
    : 'Re: Evidence Preservation Request'

  const evidenceBullets = buildEvidenceBullets(
    evidence_categories,
    custom_evidence_text
  )

  const today = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const formattedDate = incident_date ? formatDate(incident_date) : ''

  const sections: string[] = []

  // Date header
  sections.push(today)

  // Recipient
  if (opponent_name) {
    sections.push(opponent_name)
  }

  // Subject line
  sections.push(subjectLine)

  // Greeting
  sections.push(GREETING[tone](opponent_name))

  // Opening / notice of anticipated litigation
  sections.push(OPENING[tone](summary, formattedDate))

  // Suspension of deletion schedules
  sections.push(SUSPENSION[tone])

  // Evidence categories
  const bulletList = evidenceBullets
    .map((b, i) => `  ${i + 1}. ${b}`)
    .join('\n')
  sections.push(`${PRESERVATION_REQUEST[tone]}\n\n${bulletList}`)

  // Scope
  sections.push(SCOPE[tone])

  // Native format instruction
  sections.push(NATIVE_FORMAT[tone])

  // Consequences
  sections.push(CONSEQUENCES[tone])

  // Confirmation request
  sections.push(CONFIRMATION[tone])

  // Closing / rights reservation
  sections.push(CLOSING[tone])

  // Sign-off
  sections.push('Sincerely,\n\n[Your Name]\nPro Se Plaintiff / Claimant\n[Your Contact Information]')

  // Disclaimer
  sections.push(
    '---\nFOR REFERENCE ONLY. This document is not legal advice and does not create an attorney-client relationship. You should consult with a licensed attorney for advice specific to your situation.'
  )

  const body = sections.join('\n\n')

  return { subject: subjectLine, body, evidenceBullets }
}
