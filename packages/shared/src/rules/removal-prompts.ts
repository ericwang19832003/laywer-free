import { z } from 'zod'

interface PartyInfo {
  full_name: string
  address?: string
  city?: string
  state?: string
  zip?: string
}

export interface AmendedComplaintFacts {
  your_info: PartyInfo
  opposing_parties: PartyInfo[]
  description: string
  federal_case_number: string
  jurisdiction_basis: 'diversity' | 'federal_question' | 'both'
  amount_sought?: number
  claim_details?: string
  other_relief?: string
  request_jury_trial: boolean
}

export interface RemandMotionFacts {
  your_info: PartyInfo
  opposing_parties: PartyInfo[]
  federal_case_number: string
  original_court: string
  removal_date: string
  remand_grounds: string[]
  additional_arguments?: string
}

const partySchema = z.object({
  full_name: z.string().min(1),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
})

export const amendedComplaintFactsSchema = z.object({
  your_info: partySchema,
  opposing_parties: z.array(partySchema).min(1),
  description: z.string().min(1),
  federal_case_number: z.string(),
  jurisdiction_basis: z.enum(['diversity', 'federal_question', 'both']),
  amount_sought: z.number().optional(),
  claim_details: z.string().optional(),
  other_relief: z.string().optional(),
  request_jury_trial: z.boolean(),
})

export const remandMotionFactsSchema = z.object({
  your_info: partySchema,
  opposing_parties: z.array(partySchema).min(1),
  federal_case_number: z.string(),
  original_court: z.string().min(1),
  removal_date: z.string().min(1),
  remand_grounds: z.array(z.string()).min(1),
  additional_arguments: z.string().optional(),
})

interface Prompt {
  system: string
  user: string
}

export function buildAmendedComplaintPrompt(facts: AmendedComplaintFacts): Prompt {
  const jurySection = facts.request_jury_trial
    ? '\n- Jury demand paragraph'
    : ''

  const system = `You are a legal document formatting assistant. You help self-represented (pro se) litigants format their court filings.

IMPORTANT RULES:
- You format documents. You do NOT provide legal advice.
- Mark the output clearly as "DRAFT — NOT LEGAL ADVICE" at the top.
- Use only the facts provided. Do not invent or assume additional facts.
- Do not predict outcomes or make strategic recommendations.
- Use plain, clear language appropriate for a pro se filer.

DOCUMENT FORMAT:
Generate a FIRST AMENDED COMPLAINT under the Federal Rules of Civil Procedure. Include:
- Caption: "In the United States District Court for the [District] District of Texas"
- Title: "PLAINTIFF'S FIRST AMENDED COMPLAINT"
- Statement of jurisdiction (${facts.jurisdiction_basis === 'diversity' ? 'diversity under 28 U.S.C. § 1332' : facts.jurisdiction_basis === 'federal_question' ? 'federal question under 28 U.S.C. § 1331' : 'diversity under 28 U.S.C. § 1332 and/or federal question under 28 U.S.C. § 1331'})
- Parties section with numbered paragraphs
- Factual allegations with numbered paragraphs
- Causes of action (each as a separate "COUNT")
- Prayer for relief${jurySection}
- Signature block with "Pro Se"
- Verification if required

Format the document professionally with proper legal formatting.`

  const parties = [
    `Filing party: ${facts.your_info.full_name}`,
    facts.your_info.address ? `Address: ${facts.your_info.address}, ${facts.your_info.city ?? ''}, ${facts.your_info.state ?? ''} ${facts.your_info.zip ?? ''}` : null,
    ...facts.opposing_parties.map((p, i) =>
      `Opposing party ${i + 1}: ${p.full_name}${p.address ? `, ${p.address}` : ''}`
    ),
  ].filter(Boolean).join('\n')

  const user = [
    'Role: plaintiff (filing amended complaint after removal to federal court)',
    '',
    '--- PARTIES ---',
    parties,
    '',
    '--- COURT ---',
    `Federal case number: ${facts.federal_case_number}`,
    `Jurisdiction basis: ${facts.jurisdiction_basis}`,
    '',
    '--- FACTS ---',
    `Description of dispute:\n${facts.description}`,
    facts.claim_details ? `Claim details:\n${facts.claim_details}` : null,
    '',
    '--- RELIEF ---',
    facts.amount_sought ? `Amount sought: $${facts.amount_sought.toLocaleString()}` : null,
    facts.other_relief ? `Other relief: ${facts.other_relief}` : null,
    facts.request_jury_trial ? 'Requesting jury trial' : null,
  ].filter((s) => s !== null).join('\n')

  return { system, user }
}

export function buildRemandMotionPrompt(facts: RemandMotionFacts): Prompt {
  const system = `You are a legal document formatting assistant. You help self-represented (pro se) litigants format their court filings.

IMPORTANT RULES:
- You format documents. You do NOT provide legal advice.
- Mark the output clearly as "DRAFT — NOT LEGAL ADVICE" at the top.
- Use only the facts provided. Do not invent or assume additional facts.
- Do not predict outcomes or make strategic recommendations.
- Use plain, clear language appropriate for a pro se filer.

DOCUMENT FORMAT:
Generate a MOTION TO REMAND under 28 U.S.C. § 1447(c). Include:
- Caption: "In the United States District Court for the [District] District of Texas"
- Title: "PLAINTIFF'S MOTION TO REMAND"
- Introduction paragraph identifying the motion and relief sought
- Background section (case history, original filing, removal)
- Legal standard for remand (28 U.S.C. § 1447(c), burden on removing party)
- Arguments for remand based on the grounds provided
- Request for costs and expenses if applicable (28 U.S.C. § 1447(c))
- Prayer (asking the court to remand to the original state court)
- Signature block with "Pro Se"

Format the document professionally with proper legal formatting.`

  const parties = [
    `Moving party: ${facts.your_info.full_name}`,
    ...facts.opposing_parties.map((p, i) =>
      `Opposing party ${i + 1}: ${p.full_name}`
    ),
  ].join('\n')

  const user = [
    '--- PARTIES ---',
    parties,
    '',
    '--- CASE INFO ---',
    `Federal case number: ${facts.federal_case_number}`,
    `Original state court: ${facts.original_court}`,
    `Date of removal: ${facts.removal_date}`,
    '',
    '--- GROUNDS FOR REMAND ---',
    `Grounds: ${facts.remand_grounds.join(', ')}`,
    facts.additional_arguments ? `\nAdditional arguments:\n${facts.additional_arguments}` : null,
  ].filter((s) => s !== null).join('\n')

  return { system, user }
}
