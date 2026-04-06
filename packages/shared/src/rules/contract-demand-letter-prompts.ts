import { z } from 'zod'
import { partySchema } from '../schemas/filing'
import { damageItemSchema } from '../schemas/small-claims-filing'

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

export const contractDemandLetterFactsSchema = z.object({
  plaintiff: partySchema,
  defendant: partySchema,
  defendant_is_business: z.boolean().default(false),
  contract_type: z.enum([
    'written',
    'oral',
    'implied',
    'employment',
    'services',
    'sales',
    'lease',
    'construction',
    'other',
  ]),
  contract_date: z.string().min(1),
  contract_terms_breached: z.string().min(10),
  amount_demanded: z.number().positive(),
  damages_breakdown: z.array(damageItemSchema).min(1),
  description: z.string().min(10),
  deadline_days: z.number().min(1).max(90).default(14),
  preferred_resolution: z.string().optional(),
  county: z.string().optional(),
})

export type ContractDemandLetterFacts = z.infer<typeof contractDemandLetterFactsSchema>

interface FilingPrompt {
  system: string
  user: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getContractTypeLabel(contractType: string): string {
  switch (contractType) {
    case 'written':
      return 'Written Contract'
    case 'oral':
      return 'Oral Agreement'
    case 'implied':
      return 'Implied Contract'
    case 'employment':
      return 'Employment Contract'
    case 'services':
      return 'Services Agreement'
    case 'sales':
      return 'Sales Contract'
    case 'lease':
      return 'Lease Agreement'
    case 'construction':
      return 'Construction Contract'
    case 'other':
    default:
      return 'Contract'
  }
}

function getContractSpecificGuidance(contractType: string): string {
  switch (contractType) {
    case 'written':
      return `APPLICABLE LAW:
- A written contract in Texas is governed by the terms within the four corners of the document. Parol evidence of prior or contemporaneous oral agreements is generally inadmissible to vary the written terms.
- The statute of limitations for breach of a written contract in Texas is four years (Tex. Civ. Prac. & Rem. Code § 16.004).`

    case 'oral':
      return `APPLICABLE LAW:
- Oral contracts are enforceable in Texas if supported by consideration and not subject to the Statute of Frauds (Tex. Bus. & Com. Code § 26.01).
- The statute of limitations for breach of an oral contract in Texas is four years (Tex. Civ. Prac. & Rem. Code § 16.004).
- Reference any evidence corroborating the oral agreement: text messages, emails, witness statements, partial performance, etc.`

    case 'employment':
      return `APPLICABLE LAW:
- If the breach involves unpaid wages, cite the Texas Payday Law (Tex. Lab. Code § 61.001 et seq.), which requires employers to pay wages in full on regularly scheduled paydays.
- If the breach involves a non-compete or confidentiality agreement, note the Texas Business & Commerce Code § 15.50 et seq.`

    case 'services':
      return `APPLICABLE LAW:
- Service agreements in Texas are subject to general contract law principles. The performing party is entitled to compensation for services rendered as agreed.
- If services were partially performed, the sender may be entitled to quantum meruit recovery for the reasonable value of services rendered.`

    case 'sales':
      return `APPLICABLE LAW:
- Sales of goods in Texas are governed by the Texas Business & Commerce Code (UCC Article 2, Tex. Bus. & Com. Code § 2.301 et seq.).
- Remedies include the right to cover (§ 2.712), recover damages for non-delivery (§ 2.713), or recover the price for accepted goods (§ 2.709).`

    case 'construction':
      return `APPLICABLE LAW:
- Construction contracts in Texas are subject to general contract law. For residential construction, the Texas Residential Construction Commission Act (Tex. Prop. Code § 27.001 et seq.) may provide a statutory framework for dispute resolution.
- Mechanic's liens may apply for unpaid work or materials (Tex. Prop. Code § 53.001 et seq.).`

    case 'lease':
      return `APPLICABLE LAW:
- Lease agreements are governed by the Texas Property Code and the terms of the lease. Material breaches entitle the non-breaching party to damages and, in some cases, termination of the lease.`

    default:
      return `APPLICABLE LAW:
- Texas contract law requires the existence of a valid agreement, performance by the complaining party, breach by the other party, and resulting damages. The statute of limitations for breach of contract is four years (Tex. Civ. Prac. & Rem. Code § 16.004).`
  }
}

// ---------------------------------------------------------------------------
// User prompt builder
// ---------------------------------------------------------------------------

function buildUserPrompt(facts: ContractDemandLetterFacts): string {
  const contractLabel = getContractTypeLabel(facts.contract_type)

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

  const contractSection = [
    '--- CONTRACT DETAILS ---',
    `Contract type: ${contractLabel}`,
    `Contract date: ${facts.contract_date}`,
  ].join('\n')

  const breachSection = [
    '--- TERMS BREACHED ---',
    facts.contract_terms_breached,
  ].join('\n')

  const damagesSection = [
    '--- DAMAGES BREAKDOWN ---',
    ...facts.damages_breakdown.map(
      (d) =>
        `- ${d.category}: $${d.amount.toLocaleString()}${d.description ? ` (${d.description})` : ''}`
    ),
    `Total amount demanded: $${facts.amount_demanded.toLocaleString()}`,
  ].join('\n')

  const descriptionSection = ['--- DESCRIPTION ---', facts.description].join('\n')

  const resolutionSection = facts.preferred_resolution
    ? ['--- PREFERRED RESOLUTION ---', facts.preferred_resolution].join('\n')
    : null

  return [
    `Demand letter for breach of ${contractLabel.toLowerCase()}`,
    '',
    partiesSection,
    '',
    contractSection,
    '',
    breachSection,
    '',
    damagesSection,
    '',
    descriptionSection,
    resolutionSection ? `\n${resolutionSection}` : null,
    '',
    '--- DEADLINE ---',
    `Response deadline: ${facts.deadline_days} days from receipt`,
    facts.county ? `Filing county: ${facts.county}` : null,
  ]
    .filter((s) => s !== null)
    .join('\n')
}

// ---------------------------------------------------------------------------
// Main prompt builder
// ---------------------------------------------------------------------------

export function buildContractDemandLetterPrompt(facts: ContractDemandLetterFacts): FilingPrompt {
  const contractLabel = getContractTypeLabel(facts.contract_type)
  const citations = getContractSpecificGuidance(facts.contract_type)

  const system = `You are a legal document formatting assistant. You help self-represented (pro se) individuals draft professional demand letters for breach of contract disputes in Texas.

IMPORTANT RULES:
- You format documents. You do NOT provide legal advice.
- Mark the output clearly as "DRAFT — NOT FOR FILING WITHOUT ATTORNEY REVIEW" at the top.
- Use only the facts provided. Do not invent or assume additional facts.
- Do not predict outcomes or make strategic recommendations.
- The tone must be firm, professional, and factual — NOT threatening, hostile, or emotional.
- Use plain, clear language.

${citations}

DOCUMENT FORMAT:
Generate a formal demand letter with the following structure:

1. HEADER — Date, sender's name and address, recipient's name and address.

2. RE LINE — "RE: Demand for Payment — Breach of ${contractLabel}" or similar brief subject line identifying the contract dispute.

3. OPENING — State the purpose of the letter: to demand payment or performance for breach of the ${contractLabel.toLowerCase()} entered into on ${facts.contract_date}. Identify the sender and their relationship to the recipient under the contract.

4. FACTS — A clear, factual account of:
   - The contract: date, parties, essential terms, and consideration.
   - The sender's performance under the contract.
   - The specific terms breached by the recipient and how they were breached.
   Present facts in chronological order.

5. DAMAGES — Itemize each damage category with its amount. Present in a clear list or table format. Show the causal connection between the breach and each damage item.

6. DEMAND — State the total amount demanded: $${facts.amount_demanded.toLocaleString()}.

7. DEADLINE — The recipient has ${facts.deadline_days} days from receipt of this letter to resolve this matter.${facts.preferred_resolution ? ` The sender prefers the following resolution: ${facts.preferred_resolution}.` : ''}

8. CONSEQUENCE — If the matter is not resolved within the deadline, the sender intends to file a breach of contract lawsuit in ${facts.county ? `${facts.county} County` : 'the appropriate county'} court to recover the full amount plus pre-judgment and post-judgment interest, court costs, and any additional damages allowed by law.

9. CLOSING — Professional closing with sender's signature block.

${facts.defendant_is_business ? 'NOTE: The recipient is a business entity. Address the letter to the business name and use appropriate business correspondence conventions.' : ''}

ANNOTATIONS:
After the letter text, output a section starting with "---ANNOTATIONS---" on its own line.
Below that, output one annotation per line in this exact format:
[N] SECTION_NAME: Plain-English explanation of what this section means and why it is in the letter.

Number annotations sequentially starting from 1. Cover these sections at minimum:
- Header (who is sending and receiving the letter)
- Contract Summary (what the contract was about)
- Facts / Breach (what happened — what terms were broken)
- Damages (the money being claimed and why)
- Demand (what you want)
- Deadline (when they must respond)
- Consequence (what happens if they don't respond)

Use simple language a high school student could understand. Do NOT use legal jargon in the explanations.

Format the letter professionally.`

  const user = buildUserPrompt(facts)

  return { system, user }
}
