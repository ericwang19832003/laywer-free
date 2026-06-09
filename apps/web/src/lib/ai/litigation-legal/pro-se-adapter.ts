const BLOCKED_PHRASES = [
  'you must', 'you should', 'you need to', 'i recommend',
  'file immediately', 'as your attorney', 'in my legal opinion',
  'i believe', 'i think', 'guaranteed', 'winning', 'losing',
  'you will win', 'legal advice', 'attorney-client',
  'i advise', 'you are required to', 'you are obligated to',
]

export const PRO_SE_DISCLAIMER =
  '\n\n---\n**NOTICE:** This document was generated with AI assistance and has not been reviewed by a licensed attorney. Review carefully before using, and consider consulting an attorney before filing or sending.'

export interface CaseContextInput {
  caseId: string
  disputeType: string
  state: string
  role: 'plaintiff' | 'defendant'
  caseName: string
  opposingParty: string
  court: string | null
  caseNumber: string | null
  keyFacts: string[]
  evidenceSummary: string
  upcomingDeadlines: string[]
  completedSteps: string[]
}

const JURISDICTION_NOTES: Record<string, string> = {
  TX: 'Texas courts follow the Texas Rules of Civil Procedure. Deadlines are strict. Pro se litigants must follow the same rules as attorneys.',
  CA: 'California courts follow the California Rules of Court. Many courts have self-help centers. Filing fees may be waived with a fee waiver application.',
  NY: 'New York courts vary by county. The Unified Court System has self-help resources at nycourts.gov.',
  FL: 'Florida courts follow the Florida Rules of Civil Procedure. Many circuits have self-help programs.',
}

export function buildCaseContext(input: CaseContextInput): string {
  const jurisdictionNote = JURISDICTION_NOTES[input.state] ?? ''
  return `## Case Context
Case: ${input.caseName}
Case Number: ${input.caseNumber ?? 'Not yet filed'}
Court: ${input.court ?? 'Not yet filed'}
Dispute Type: ${input.disputeType}
State: ${input.state}
Role: ${input.role} (self-represented)
Opposing Party: ${input.opposingParty}

## Key Facts
${input.keyFacts.map((f) => `- ${f}`).join('\n')}

## Evidence Summary
${input.evidenceSummary}

## Case Progress
Completed steps: ${input.completedSteps.join(', ') || 'None yet'}
Upcoming deadlines: ${input.upcomingDeadlines.join(', ') || 'None recorded'}

## Jurisdiction Notes
${jurisdictionNote}

## Role Reminder
The user is a self-represented (pro se) litigant — not an attorney. Use plain English. Never use directive language. Never predict outcomes. Always recommend consulting an attorney for final review.`
}

export function applyProSeGuardrails(text: string): string {
  let sanitized = text
  for (const phrase of BLOCKED_PHRASES) {
    sanitized = sanitized.replace(new RegExp(phrase, 'gi'), '[consult an attorney]')
  }
  return sanitized + PRO_SE_DISCLAIMER
}
