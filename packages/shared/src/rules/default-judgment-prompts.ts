import { z } from 'zod'
import { partySchema } from '@lawyer-free/shared/schemas/filing'

export const defaultJudgmentFactsSchema = z.object({
  your_info: partySchema,
  opposing_parties: z.array(partySchema).min(1),
  court_type: z.enum(['jp', 'county', 'district']),
  county: z.string().min(1),
  cause_number: z.string().optional(),
  description: z.string().min(10),
  amount_sought: z.number().positive(),
  damages_breakdown: z
    .array(
      z.object({
        category: z.string().min(1),
        amount: z.number().positive(),
      })
    )
    .min(1),
  service_date: z.string().min(1),
  answer_deadline: z.string().min(1),
  non_military_affidavit: z.boolean(),
})

export type DefaultJudgmentFacts = z.infer<typeof defaultJudgmentFactsSchema>

interface Prompt {
  system: string
  user: string
}

function courtLabel(courtType: DefaultJudgmentFacts['court_type'], county: string): string {
  switch (courtType) {
    case 'jp':
      return 'Justice Court'
    case 'county':
      return 'County Court'
    case 'district':
      return `District Court of ${county} County, Texas`
  }
}

export function buildDefaultJudgmentPrompt(facts: DefaultJudgmentFacts): Prompt {
  const affidavitSection = facts.non_military_affidavit
    ? '\n3. Affidavit of Non-Military Service'
    : ''

  const certificateNumber = facts.non_military_affidavit ? '4' : '3'

  const system = `You are a legal document formatting assistant. You help self-represented (pro se) litigants format their court filings.

IMPORTANT RULES:
- You format documents. You do NOT provide legal advice.
- Mark the output clearly as "DRAFT — NOT LEGAL ADVICE" at the top.
- Use only the facts provided. Do not invent or assume additional facts.
- Do not predict outcomes or make strategic recommendations.
- Use plain, clear language appropriate for a pro se filer.

DOCUMENT FORMAT:
Generate a default judgment packet containing the following documents:
1. Application for Default (clerk's default — establishing that the defendant failed to answer)
2. Motion for Default Judgment (with itemized damages breakdown)${affidavitSection}
${certificateNumber}. Certificate of Last Known Address

Format each document professionally with proper legal formatting, captions, and signature blocks marked "Pro Se".`

  const parties = [
    `Filing party: ${facts.your_info.full_name}`,
    facts.your_info.address
      ? `Address: ${facts.your_info.address}, ${facts.your_info.city ?? ''}, ${facts.your_info.state ?? ''} ${facts.your_info.zip ?? ''}`
      : null,
    ...facts.opposing_parties.map(
      (p, i) =>
        `Opposing party ${i + 1}: ${p.full_name}${p.address ? `, ${p.address}` : ''}`
    ),
  ]
    .filter(Boolean)
    .join('\n')

  const damagesLines = facts.damages_breakdown
    .map((d) => `- ${d.category}: $${d.amount.toLocaleString()}`)
    .join('\n')

  const user = [
    '--- PARTIES ---',
    parties,
    '',
    '--- COURT ---',
    `Court: ${courtLabel(facts.court_type, facts.county)}`,
    `County: ${facts.county}`,
    facts.cause_number ? `Cause number: ${facts.cause_number}` : null,
    '',
    '--- CASE FACTS ---',
    `Description of dispute:\n${facts.description}`,
    '',
    '--- SERVICE ---',
    `Service date: ${facts.service_date}`,
    `Answer deadline: ${facts.answer_deadline}`,
    '',
    '--- DAMAGES ---',
    damagesLines,
    `Total amount sought: $${facts.amount_sought.toLocaleString()}`,
    '',
    '--- AFFIDAVIT ---',
    `Include non-military affidavit: ${facts.non_military_affidavit}`,
  ]
    .filter((s) => s !== null)
    .join('\n')

  return { system, user }
}
