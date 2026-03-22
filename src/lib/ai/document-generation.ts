/**
 * AI Document Generation Library
 * Uses OpenAI to generate legal documents
 */

export type DocumentType =
  | 'letter'
  | 'demand_letter'
  | 'settlement_proposal'
  | 'mediation_statement'
  | 'settlement_statement'
  | 'conference_summary'
  | 'discovery_letter'
  | 'status_update'
  | 'witness_summary'
  | 'case_narrative'

const BLOCKED_PHRASES = [
  'you must', 'you should', 'you need to', 'i recommend',
  'file immediately', 'urgent', 'as your attorney',
  'in my legal opinion', 'i believe', 'i think',
  'guaranteed', 'winning', 'losing', 'you will win',
  'hire a lawyer', 'legal advice', 'attorney-client',
]

interface DocumentGenerationInput {
  documentType: DocumentType
  caseDetails: {
    caseName: string
    caseNumber?: string
    court?: string
    yourName: string
    opposingParty?: string
    disputeType?: string
    state?: string
    role?: 'plaintiff' | 'defendant'
  }
  documentDetails: {
    recipientName?: string
    recipientTitle?: string
    subject?: string
    facts?: string
    claims?: string
    damages?: string
    settlementAmount?: string
    timeline?: string
    additionalInfo?: string
  }
}

export function isDocumentSafe(text: string): boolean {
  const lower = text.toLowerCase()
  return !BLOCKED_PHRASES.some((phrase) => lower.includes(phrase))
}

export function sanitizeDocument(text: string): string {
  let sanitized = text
  for (const phrase of BLOCKED_PHRASES) {
    sanitized = sanitized.replace(new RegExp(phrase, 'gi'), '[consult an attorney]')
  }
  return sanitized
}

export function getSystemPrompt(documentType: DocumentType): string {
  const prompts: Record<DocumentType, string> = {
    letter: `You are a professional legal document assistant. Generate a formal legal letter in plain, professional language.

RULES:
- Use formal but accessible language
- Never give legal advice or predict outcomes
- Never use directive language ("you must", "you should")
- Include proper legal letter formatting with date, recipient, subject line, salutation, body, and closing
- Be factual and objective
- Add [consult an attorney] if you're unsure about legal requirements`,

    demand_letter: `You are a professional legal document assistant. Generate a formal demand letter for a potential civil dispute.

RULES:
- Be firm but professional
- Clearly state the facts giving rise to the demand
- State what action you are demanding
- Set a reasonable deadline for response
- Include consequences of non-compliance (without threatening legal action)
- Never give legal advice or promise specific outcomes
- Never use phrases like "you must" or "I recommend"
- Add [consult an attorney] if you're unsure about legal requirements`,

    settlement_proposal: `You are a professional legal document assistant. Generate a formal settlement proposal for a civil dispute.

RULES:
- Be clear about the terms being proposed
- Include all material terms (parties, amount, timing, releases, conditions)
- Use plain language a non-lawyer can understand
- Never give legal advice or predict outcomes
- Include standard boilerplate about the proposal being without prejudice
- Add [consult an attorney] for legal review`,

    mediation_statement: `You are a professional legal document assistant. Generate a mediation statement (also called a position statement or mediation brief).

RULES:
- Present your client's position clearly and persuasively
- Include relevant facts, law, and damages
- Acknowledge weaknesses in your position
- Propose a reasonable settlement range
- Focus on interests, not just positions
- Never give legal advice or predict outcomes
- Add [consult an attorney] for legal review`,

    settlement_statement: `You are a professional legal document assistant. Generate a settlement conference statement for a court proceeding.

RULES:
- Follow local court formatting requirements (use placeholders if unsure)
- Clearly present your settlement position
- Include case summary, settlement history, and current offer
- Be realistic about litigation risks
- Never give legal advice or predict outcomes
- Add [consult an attorney] for legal review`,

    conference_summary: `You are a professional legal document assistant. Generate a professional summary of a legal conference or meeting.

RULES:
- Clearly identify the conference type, date, participants, and location
- Summarize topics discussed objectively
- Document any agreements reached
- Note any open issues or follow-up items
- Use neutral language
- Never give legal advice
- Add [consult an attorney] if legal questions arise`,

    discovery_letter: `You are a professional legal document assistant. Generate a discovery-related letter (such as a follow-up or status letter).

RULES:
- Be clear about what discovery is being discussed
- Reference specific requests, responses, or disputes
- Be professional and stick to the facts
- Never threaten sanctions or use aggressive language
- Never give legal advice
- Add [consult an attorney] for legal questions`,

    status_update: `You are a professional legal document assistant. Generate a status update letter to opposing counsel or a client.

RULES:
- Clearly state the purpose of the update
- Include relevant recent developments
- Note upcoming deadlines or actions
- Be concise and professional
- Never give legal advice
- Add [consult an attorney] if legal questions arise`,

    witness_summary: `You are a professional legal document assistant. Generate a summary of a potential witness for litigation preparation.

RULES:
- Include witness name, contact information, and relationship to the case
- Summarize their expected testimony based on provided facts
- Note any potential credibility issues
- Include areas of potential cross-examination
- Never present speculation as fact
- Never give legal advice
- Add [consult an attorney] for legal questions`,

    case_narrative: `You are a professional legal document assistant. Generate a chronological narrative of case facts for litigation.

RULES:
- Present facts in chronological order
- Use clear, objective language
- Distinguish between facts, allegations, and legal conclusions
- Include dates, parties, and specific events
- Never present speculation as fact
- Never give legal advice
- Add [consult an attorney] for legal questions`,
  }

  return prompts[documentType] || prompts.letter
}

export function buildUserPrompt(input: DocumentGenerationInput): string {
  const { caseDetails, documentDetails } = input

  const lines: string[] = []

  lines.push('CASE INFORMATION:')
  lines.push(`- Case Name: ${caseDetails.caseName}`)
  if (caseDetails.caseNumber) lines.push(`- Case Number: ${caseDetails.caseNumber}`)
  if (caseDetails.court) lines.push(`- Court: ${caseDetails.court}`)
  lines.push(`- Your Name: ${caseDetails.yourName}`)
  if (caseDetails.opposingParty) lines.push(`- Opposing Party: ${caseDetails.opposingParty}`)
  if (caseDetails.disputeType) lines.push(`- Dispute Type: ${caseDetails.disputeType}`)
  if (caseDetails.state) lines.push(`- State: ${caseDetails.state}`)
  if (caseDetails.role) lines.push(`- Your Role: ${caseDetails.role}`)
  lines.push('')

  lines.push('DOCUMENT DETAILS:')
  if (documentDetails.recipientName) lines.push(`- Recipient: ${documentDetails.recipientName}`)
  if (documentDetails.recipientTitle) lines.push(`- Title: ${documentDetails.recipientTitle}`)
  if (documentDetails.subject) lines.push(`- Subject: ${documentDetails.subject}`)
  if (documentDetails.facts) {
    lines.push('')
    lines.push('FACTS:')
    lines.push(documentDetails.facts)
  }
  if (documentDetails.claims) {
    lines.push('')
    lines.push('CLAIMS/LEGAL BASIS:')
    lines.push(documentDetails.claims)
  }
  if (documentDetails.damages) {
    lines.push('')
    lines.push('DAMAGES/RELIEF SOUGHT:')
    lines.push(documentDetails.damages)
  }
  if (documentDetails.settlementAmount) {
    lines.push('')
    lines.push(`- Proposed Settlement Amount: ${documentDetails.settlementAmount}`)
  }
  if (documentDetails.timeline) {
    lines.push('')
    lines.push('TIMELINE:')
    lines.push(documentDetails.timeline)
  }
  if (documentDetails.additionalInfo) {
    lines.push('')
    lines.push('ADDITIONAL INFORMATION:')
    lines.push(documentDetails.additionalInfo)
  }

  return lines.join('\n')
}

export const DOCUMENT_TYPES: { value: DocumentType; label: string; description: string }[] = [
  {
    value: 'letter',
    label: 'General Legal Letter',
    description: 'Formal letter for various legal purposes',
  },
  {
    value: 'demand_letter',
    label: 'Demand Letter',
    description: 'Formal demand for action or payment',
  },
  {
    value: 'settlement_proposal',
    label: 'Settlement Proposal',
    description: 'Formal settlement offer',
  },
  {
    value: 'mediation_statement',
    label: 'Mediation Statement',
    description: 'Position statement for mediation',
  },
  {
    value: 'settlement_statement',
    label: 'Settlement Conference Statement',
    description: 'Statement for court settlement conference',
  },
  {
    value: 'conference_summary',
    label: 'Conference Summary',
    description: 'Summary of a legal meeting',
  },
  {
    value: 'discovery_letter',
    label: 'Discovery Letter',
    description: 'Letter related to discovery matters',
  },
  {
    value: 'status_update',
    label: 'Status Update',
    description: 'Update on case status',
  },
  {
    value: 'witness_summary',
    label: 'Witness Summary',
    description: 'Summary of witness testimony',
  },
  {
    value: 'case_narrative',
    label: 'Case Narrative',
    description: 'Chronological story of case facts',
  },
]
