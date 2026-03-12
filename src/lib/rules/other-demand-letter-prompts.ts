import { z } from 'zod'
import { partySchema } from '../schemas/filing'
import { damageItemSchema } from '../schemas/small-claims-filing'

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

export const otherDemandLetterFactsSchema = z.object({
  plaintiff: partySchema,
  defendant: partySchema,
  defendant_is_business: z.boolean().default(false),
  sub_type: z.enum([
    'consumer_protection',
    'defamation',
    'fraud',
    'negligence',
    'conversion',
    'unjust_enrichment',
    'interference',
    'general',
    'other',
  ]).optional(),
  complaint_description: z.string().min(10),
  requested_resolution: z.string().min(10),
  amount_demanded: z.number().nonnegative().optional(),
  damages_breakdown: z.array(damageItemSchema).optional(),
  description: z.string().min(10),
  deadline_days: z.number().min(1).max(90).default(14),
  preferred_resolution: z.string().optional(),
  incident_date: z.string().optional(),
  county: z.string().optional(),
})

export type OtherDemandLetterFacts = z.infer<typeof otherDemandLetterFactsSchema>

interface FilingPrompt {
  system: string
  user: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getSubTypeLabel(subType?: string): string {
  switch (subType) {
    case 'consumer_protection':
      return 'Consumer Protection Complaint'
    case 'defamation':
      return 'Defamation'
    case 'fraud':
      return 'Fraud'
    case 'negligence':
      return 'Negligence'
    case 'conversion':
      return 'Conversion of Property'
    case 'unjust_enrichment':
      return 'Unjust Enrichment'
    case 'interference':
      return 'Tortious Interference'
    case 'general':
    case 'other':
    default:
      return 'Civil Dispute'
  }
}

function getSubTypeGuidance(subType?: string): string {
  switch (subType) {
    case 'consumer_protection':
      return `APPLICABLE LAW:
- The Texas Deceptive Trade Practices — Consumer Protection Act (DTPA), Tex. Bus. & Com. Code § 17.41 et seq., protects consumers from false, misleading, or deceptive business practices.
- Under § 17.505, the consumer must send written notice to the defendant at least 60 days before filing suit, specifying the complaint and the amount of damages claimed. This demand letter may serve as that required pre-suit notice.
- DTPA remedies include economic damages, and if the defendant acted knowingly or intentionally, up to three times the economic damages.`

    case 'defamation':
      return `APPLICABLE LAW:
- Defamation in Texas requires the publication of a false statement of fact about the plaintiff to a third party, causing damages (or the statement is defamatory per se).
- This demand letter requests retraction, removal, or correction of the defamatory statement and compensation for damages to reputation.
- Texas does not have a retraction statute, but a voluntary retraction may mitigate damages.`

    case 'fraud':
      return `APPLICABLE LAW:
- Fraud in Texas requires: (1) a material misrepresentation, (2) known to be false or made recklessly, (3) intended to be relied upon, (4) actual reliance, and (5) resulting damages.
- The statute of limitations for fraud in Texas is four years, with the discovery rule potentially extending the accrual date.`

    case 'negligence':
      return `APPLICABLE LAW:
- Negligence in Texas requires: (1) a duty of care, (2) breach of that duty, (3) proximate cause, and (4) damages.
- Texas follows modified comparative negligence — the plaintiff's recovery is reduced by their percentage of fault and barred if the plaintiff is more than 50% at fault (Tex. Civ. Prac. & Rem. Code § 33.001).`

    case 'conversion':
      return `APPLICABLE LAW:
- Conversion in Texas is the unauthorized and wrongful exercise of dominion and control over the personal property of another, to the exclusion of or inconsistent with the owner's rights.
- The measure of damages is typically the fair market value of the property at the time of conversion.`

    case 'unjust_enrichment':
      return `APPLICABLE LAW:
- Unjust enrichment in Texas requires that the defendant received a benefit from the plaintiff under circumstances that make retention inequitable.
- It is an equitable remedy available when no express contract governs the subject matter of the dispute.`

    case 'interference':
      return `APPLICABLE LAW:
- Tortious interference with a contract in Texas requires: (1) an existing contract, (2) willful and intentional interference, (3) proximate cause of damages, and (4) actual damages.
- Tortious interference with a business relationship additionally requires proof of independent tortious or unlawful conduct.`

    case 'general':
    case 'other':
    default:
      return `This is a general demand letter. The sender demands resolution of the described dispute within the stated deadline. If the matter is not resolved, the sender intends to pursue legal remedies, including filing a lawsuit.`
  }
}

// ---------------------------------------------------------------------------
// User prompt builder
// ---------------------------------------------------------------------------

function buildUserPrompt(facts: OtherDemandLetterFacts): string {
  const subTypeLabel = getSubTypeLabel(facts.sub_type)
  const hasDamages = facts.amount_demanded !== undefined && facts.amount_demanded > 0

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
    `Dispute type: ${subTypeLabel}`,
    facts.incident_date ? `Incident date: ${facts.incident_date}` : null,
    hasDamages ? `Total amount demanded: $${facts.amount_demanded!.toLocaleString()}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  const complaintSection = [
    '--- COMPLAINT ---',
    facts.complaint_description,
  ].join('\n')

  const descriptionSection = ['--- DESCRIPTION ---', facts.description].join('\n')

  const damagesSection = facts.damages_breakdown && facts.damages_breakdown.length > 0
    ? [
        '--- DAMAGES BREAKDOWN ---',
        ...facts.damages_breakdown.map(
          (d) =>
            `- ${d.category}: $${d.amount.toLocaleString()}${d.description ? ` (${d.description})` : ''}`
        ),
      ].join('\n')
    : null

  const resolutionSection = [
    '--- REQUESTED RESOLUTION ---',
    facts.requested_resolution,
  ].join('\n')

  const preferredSection = facts.preferred_resolution
    ? ['--- PREFERRED RESOLUTION ---', facts.preferred_resolution].join('\n')
    : null

  return [
    `Demand letter: ${subTypeLabel}`,
    '',
    partiesSection,
    '',
    claimSection,
    '',
    complaintSection,
    '',
    descriptionSection,
    damagesSection ? `\n${damagesSection}` : null,
    '',
    resolutionSection,
    preferredSection ? `\n${preferredSection}` : null,
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

export function buildOtherDemandLetterPrompt(facts: OtherDemandLetterFacts): FilingPrompt {
  const subTypeLabel = getSubTypeLabel(facts.sub_type)
  const citations = getSubTypeGuidance(facts.sub_type)
  const hasDamages = facts.amount_demanded !== undefined && facts.amount_demanded > 0

  const system = `You are a legal document formatting assistant. You help self-represented (pro se) individuals draft professional demand letters for civil disputes in Texas.

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

2. RE LINE — "RE: Demand for Resolution — ${subTypeLabel}" or similar brief subject line identifying the nature of the dispute.

3. OPENING — State the purpose of the letter: to demand resolution of the described dispute${hasDamages ? ` and payment of $${facts.amount_demanded!.toLocaleString()} in damages` : ''}. Identify the sender and their relationship to the recipient.

4. FACTS — A clear, factual account of:
   - What happened, including specific dates, locations, and actions.
   - How the recipient's conduct harmed the sender.
   - Any prior attempts to resolve the matter.
   Present facts in chronological order.
${hasDamages && facts.damages_breakdown && facts.damages_breakdown.length > 0 ? `
5. DAMAGES — Itemize each damage category with its amount. Present in a clear list or table format.

6. DEMAND — State the specific resolution demanded: ${facts.requested_resolution}${hasDamages ? ` Including payment of $${facts.amount_demanded!.toLocaleString()}.` : ''}
` : `
5. DEMAND — State the specific resolution demanded: ${facts.requested_resolution}
`}
${hasDamages && facts.damages_breakdown && facts.damages_breakdown.length > 0 ? '7' : '6'}. DEADLINE — The recipient has ${facts.deadline_days} days from receipt of this letter to comply with the demand.${facts.preferred_resolution ? ` The sender prefers the following resolution: ${facts.preferred_resolution}.` : ''}

${hasDamages && facts.damages_breakdown && facts.damages_breakdown.length > 0 ? '8' : '7'}. CONSEQUENCE — If the matter is not resolved within the deadline, the sender intends to file a lawsuit in ${facts.county ? `${facts.county} County` : 'the appropriate county'} court seeking ${hasDamages ? 'damages, ' : ''}court costs, and any additional remedies allowed by law.

${hasDamages && facts.damages_breakdown && facts.damages_breakdown.length > 0 ? '9' : '8'}. CLOSING — Professional closing with sender's signature block.

${facts.defendant_is_business ? 'NOTE: The recipient is a business entity. Address the letter to the business name and use appropriate business correspondence conventions.' : ''}

ANNOTATIONS:
After the letter text, output a section starting with "---ANNOTATIONS---" on its own line.
Below that, output one annotation per line in this exact format:
[N] SECTION_NAME: Plain-English explanation of what this section means and why it is in the letter.

Number annotations sequentially starting from 1. Cover these sections at minimum:
- Header (who is sending and receiving the letter)
- Facts (what happened)${hasDamages ? '\n- Damages (the money being claimed)' : ''}
- Demand (what you want the recipient to do)
- Deadline (when they must respond)
- Consequence (what happens if they don't respond)

Use simple language a high school student could understand. Do NOT use legal jargon in the explanations.

Format the letter professionally.`

  const user = buildUserPrompt(facts)

  return { system, user }
}
