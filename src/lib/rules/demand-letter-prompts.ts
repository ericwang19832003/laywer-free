import { z } from 'zod'
import { partySchema } from '../schemas/filing'
import { damageItemSchema } from '../schemas/small-claims-filing'

export const demandLetterFactsSchema = z.object({
  plaintiff: partySchema,
  defendant: partySchema,
  claim_sub_type: z.enum([
    'security_deposit',
    'breach_of_contract',
    'consumer_refund',
    'property_damage',
    'car_accident',
    'neighbor_dispute',
    'unpaid_loan',
    'other',
  ]),
  claim_amount: z.number().positive(),
  damages_breakdown: z.array(damageItemSchema).min(1),
  description: z.string().min(10),
  deadline_days: z.number().min(1).max(90).default(14),
  preferred_resolution: z.string().optional(),
  incident_date: z.string().min(1),
  defendant_is_business: z.boolean().default(false),
  county: z.string().optional(),
})

export type DemandLetterFacts = z.infer<typeof demandLetterFactsSchema>

interface FilingPrompt {
  system: string
  user: string
}

function buildUserPrompt(facts: DemandLetterFacts): string {
  const partiesSection = [
    '--- SENDER (PLAINTIFF) ---',
    `Name: ${facts.plaintiff.full_name}`,
    facts.plaintiff.address
      ? `Address: ${facts.plaintiff.address}, ${facts.plaintiff.city ?? ''}, ${facts.plaintiff.state ?? ''} ${facts.plaintiff.zip ?? ''}`
      : null,
    '',
    '--- RECIPIENT (DEFENDANT) ---',
    `Name: ${facts.defendant.full_name}${facts.defendant_is_business ? ' (business entity)' : ''}`,
    facts.defendant.address
      ? `Address: ${facts.defendant.address}, ${facts.defendant.city ?? ''}, ${facts.defendant.state ?? ''} ${facts.defendant.zip ?? ''}`
      : null,
  ]
    .filter(Boolean)
    .join('\n')

  const claimSection = [
    '--- CLAIM ---',
    `Claim type: ${facts.claim_sub_type.replace(/_/g, ' ')}`,
    `Total amount demanded: $${facts.claim_amount.toLocaleString()}`,
    `Incident date: ${facts.incident_date}`,
  ].join('\n')

  const damagesSection = [
    '--- DAMAGES BREAKDOWN ---',
    ...facts.damages_breakdown.map(
      (d) =>
        `- ${d.category}: $${d.amount.toLocaleString()}${d.description ? ` (${d.description})` : ''}`
    ),
  ].join('\n')

  const descriptionSection = ['--- DESCRIPTION ---', facts.description].join('\n')

  const resolutionSection = facts.preferred_resolution
    ? ['--- PREFERRED RESOLUTION ---', facts.preferred_resolution].join('\n')
    : null

  return [
    `Demand letter for: ${facts.claim_sub_type.replace(/_/g, ' ')}`,
    '',
    partiesSection,
    '',
    claimSection,
    '',
    damagesSection,
    '',
    descriptionSection,
    resolutionSection ? `\n${resolutionSection}` : null,
    '',
    `--- DEADLINE ---`,
    `Response deadline: ${facts.deadline_days} days from receipt`,
    facts.county ? `Filing county: ${facts.county}` : null,
  ]
    .filter((s) => s !== null)
    .join('\n')
}

export function buildDemandLetterPrompt(facts: DemandLetterFacts): FilingPrompt {
  const system = `You are a legal document formatting assistant. You help self-represented (pro se) individuals draft professional demand letters.

IMPORTANT RULES:
- You format documents. You do NOT provide legal advice.
- Mark the output clearly as "DRAFT — NOT FOR FILING" at the top.
- Use only the facts provided. Do not invent or assume additional facts.
- Do not predict outcomes or make strategic recommendations.
- The tone must be firm, professional, and factual — NOT threatening, hostile, or emotional.
- Use plain, clear language.

DOCUMENT FORMAT:
Generate a formal demand letter with the following structure:

1. HEADER — Date, sender's name and address, recipient's name and address.

2. RE LINE — Brief subject line identifying the dispute (e.g., "RE: Demand for Return of Security Deposit" or "RE: Demand for Payment — Breach of Contract").

3. OPENING — State the purpose of the letter: to demand payment or resolution of the dispute. Identify the sender and their relationship to the recipient.

4. FACTS — A clear, factual account of what happened, including specific dates and amounts. Present facts in chronological order.

5. DAMAGES — Itemize each damage category with its amount. Present in a clear list or table format.

6. DEMAND — State the total amount demanded: $${facts.claim_amount.toLocaleString()}.

7. DEADLINE — The recipient has ${facts.deadline_days} days from receipt of this letter to resolve this matter.${facts.preferred_resolution ? ` The sender prefers the following resolution: ${facts.preferred_resolution}.` : ''}

8. CONSEQUENCE — If the matter is not resolved within the deadline, the sender intends to file a small claims lawsuit in ${facts.county ? `${facts.county} County` : 'the appropriate county'} Justice Court to recover the full amount plus court costs and any additional damages allowed by law.

9. CLOSING — Professional closing with sender's signature block.

${facts.defendant_is_business ? 'NOTE: The recipient is a business entity. Address the letter to the business name and use appropriate business correspondence conventions.' : ''}

ANNOTATIONS:
After the letter text, output a section starting with "---ANNOTATIONS---" on its own line.
Below that, output one annotation per line in this exact format:
[N] SECTION_NAME: Plain-English explanation of what this section means and why it is in the letter.

Number annotations sequentially starting from 1. Cover these sections at minimum:
- Header (who is sending and receiving the letter)
- Facts (what happened)
- Damages (the money being claimed)
- Demand (what you want)
- Deadline (when they must respond)
- Consequence (what happens if they don't respond)

Use simple language a high school student could understand. Do NOT use legal jargon in the explanations.

Format the letter professionally.`

  const user = buildUserPrompt(facts)

  return { system, user }
}
