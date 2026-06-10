export type DemandTone = 'measured' | 'assertive'

export interface DemandIntake {
  role: 'plaintiff' | 'defendant'
  opposingParty: string
  reliefSought: string
  keyFacts: string
  tone: DemandTone
  responseDeadlineDays: number
  caseContext: string
}

export interface IntakeValidation {
  valid: boolean
  errors: string[]
}

export function validateDemandIntake(intake: DemandIntake): IntakeValidation {
  const errors: string[] = []
  if (!intake.keyFacts.trim()) errors.push('Key facts are required')
  if (!intake.reliefSought.trim()) errors.push('Relief sought is required')
  if (!intake.opposingParty.trim()) errors.push('Opposing party name is required')
  return { valid: errors.length === 0, errors }
}

export function buildDemandDraftPrompt(intake: DemandIntake): { systemPrompt: string; userPrompt: string } {
  const systemPrompt = `You are a legal document drafting assistant helping a self-represented (pro se) ${intake.role} draft a demand letter.

${intake.caseContext}

Rules:
- Write in plain English appropriate for a self-represented litigant.
- Never use directive language ("you must", "you should", "I recommend").
- Never predict outcomes or guarantee results.
- Never fabricate case law, statutes, or citations.
- Use bracketed placeholders for any missing information: [DATE], [AMOUNT], etc.
- Flag any legally weak argument with: [WEAK POINT — consider whether to include].
- The letter must include today's date, sender's name (use [YOUR NAME] as placeholder), and a response deadline.
- Append: "NOTICE: This letter was drafted with AI assistance and should be reviewed by an attorney before sending."`

  const toneInstruction = intake.tone === 'assertive'
    ? 'Use a firm, assertive tone that makes clear the consequences of non-response.'
    : 'Use a professional, measured tone that leaves room for resolution without litigation.'

  const userPrompt = `Draft a demand letter to ${intake.opposingParty} on behalf of a ${intake.role}.

${toneInstruction}

Key facts:
${intake.keyFacts}

Relief sought: ${intake.reliefSought}

Give the recipient ${intake.responseDeadlineDays} days to respond before further action is taken.

Format the letter as a complete, sendable document with proper header, body paragraphs, and closing.`

  return { systemPrompt, userPrompt }
}
