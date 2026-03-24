import { z } from 'zod'
import { partySchema } from '../schemas/filing'
import { damageItemSchema } from '../schemas/small-claims-filing'

export const ltDemandLetterFactsSchema = z.object({
  party_role: z.enum(['landlord', 'tenant']),
  your_info: partySchema,
  other_party: partySchema,
  landlord_tenant_sub_type: z.enum([
    'eviction', 'nonpayment', 'security_deposit', 'property_damage',
    'repair_maintenance', 'lease_termination', 'habitability', 'other',
  ]),
  property_address: z.string().min(5),
  claim_amount: z.number().positive(),
  damages_breakdown: z.array(damageItemSchema).min(1),
  description: z.string().min(10),
  deadline_days: z.number().min(1).max(90).default(14),
  preferred_resolution: z.string().optional(),
  lease_start_date: z.string().optional(),
  monthly_rent: z.number().optional(),
  deposit_amount: z.number().optional(),
  county: z.string().optional(),
})

export type LtDemandLetterFacts = z.infer<typeof ltDemandLetterFactsSchema>

interface FilingPrompt {
  system: string
  user: string
}

function getRoleLabels(partyRole: 'landlord' | 'tenant') {
  if (partyRole === 'landlord') {
    return { senderLabel: 'LANDLORD', recipientLabel: 'TENANT' }
  }
  return { senderLabel: 'TENANT', recipientLabel: 'LANDLORD' }
}

function getSubTypeCitations(subType: LtDemandLetterFacts['landlord_tenant_sub_type']): string {
  switch (subType) {
    case 'security_deposit':
      return `APPLICABLE LAW:
- Tex. Prop. Code § 92.104 — A landlord must return the security deposit (less lawful deductions) within 30 days after the tenant surrenders the premises. Failure to do so or to provide an itemized accounting of deductions may result in the landlord being liable for the full deposit amount plus $100, three times the wrongfully withheld amount, and reasonable attorney's fees.`

    case 'repair_maintenance':
      return `APPLICABLE LAW:
- Tex. Prop. Code § 92.052 — Warranty of habitability. A landlord must make a diligent effort to repair or remedy a condition that materially affects the physical health or safety of an ordinary tenant.
- Tex. Prop. Code § 92.0561 — Tenant's repair-and-deduct remedy. If the landlord fails to make repairs after proper notice, the tenant may have the repair made and deduct the cost from rent, or terminate the lease.`

    case 'habitability':
      return `APPLICABLE LAW:
- Tex. Prop. Code § 92.052 — Warranty of habitability. The landlord has a duty to make diligent efforts to repair conditions that materially affect the physical health or safety of an ordinary tenant. The tenant has the right to repair and deduct, or to terminate the lease if conditions are not remedied.`

    case 'nonpayment':
      return `APPLICABLE LAW:
- Tex. Prop. Code § 24.005 — Notice to vacate. Before filing an eviction suit for nonpayment of rent, the landlord must give the tenant at least 3 days' written notice to vacate unless the lease provides for a shorter or longer period.
This letter serves as notice to vacate if the outstanding balance is not paid within the stated deadline.`

    case 'eviction':
      return `APPLICABLE LAW:
- Tex. Prop. Code § 24.005 — Notice to vacate. The landlord must provide written notice to vacate at least 3 days before filing a forcible detainer suit, unless the lease specifies a different notice period. The notice must be delivered in person or by mail at the premises.
This letter serves as formal notice to vacate with a cure period as specified below.`

    case 'lease_termination':
      return `APPLICABLE LAW:
- Lease agreement terms govern early termination provisions, including any early termination fees, required notice periods, and conditions under which either party may end the tenancy. Texas law generally requires written notice as specified in the lease or, for month-to-month tenancies, at least one month's notice under Tex. Prop. Code § 91.001.`

    case 'property_damage':
      return `APPLICABLE LAW:
- Itemized damage claims with repair estimates should be documented. Under Texas law, the responsible party is liable for actual damages caused by negligence or intentional acts. Photographic evidence and professional repair estimates strengthen the claim.`

    case 'other':
    default:
      return `This is a general demand letter related to a landlord-tenant dispute. The sender demands resolution of the matter as described below.`
  }
}

function buildUserPrompt(facts: LtDemandLetterFacts): string {
  const { senderLabel, recipientLabel } = getRoleLabels(facts.party_role)

  const partiesSection = [
    `--- SENDER (${senderLabel}) ---`,
    `Name: ${facts.your_info.full_name}`,
    facts.your_info.address
      ? `Address: ${facts.your_info.address}, ${facts.your_info.city ?? ''}, ${facts.your_info.state ?? ''} ${facts.your_info.zip ?? ''}`
      : null,
    '',
    `--- RECIPIENT (${recipientLabel}) ---`,
    `Name: ${facts.other_party.full_name}`,
    facts.other_party.address
      ? `Address: ${facts.other_party.address}, ${facts.other_party.city ?? ''}, ${facts.other_party.state ?? ''} ${facts.other_party.zip ?? ''}`
      : null,
  ]
    .filter(Boolean)
    .join('\n')

  const propertySection = [
    '--- PROPERTY ---',
    `Property address: ${facts.property_address}`,
  ].join('\n')

  const claimSection = [
    '--- CLAIM ---',
    `Dispute type: ${facts.landlord_tenant_sub_type.replace(/_/g, ' ')}`,
    `Total amount demanded: $${facts.claim_amount.toLocaleString()}`,
    facts.monthly_rent ? `Monthly rent: $${facts.monthly_rent.toLocaleString()}` : null,
    facts.deposit_amount ? `Security deposit: $${facts.deposit_amount.toLocaleString()}` : null,
    facts.lease_start_date ? `Lease start date: ${facts.lease_start_date}` : null,
  ]
    .filter(Boolean)
    .join('\n')

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

  // For nonpayment/eviction sub-types, add notice to vacate language in user prompt
  const noticeSection =
    facts.landlord_tenant_sub_type === 'nonpayment' || facts.landlord_tenant_sub_type === 'eviction'
      ? '--- NOTICE ---\nThis letter also serves as notice to vacate if the matter is not resolved within the deadline.'
      : null

  return [
    `Demand letter for landlord-tenant dispute: ${facts.landlord_tenant_sub_type.replace(/_/g, ' ')}`,
    '',
    partiesSection,
    '',
    propertySection,
    '',
    claimSection,
    '',
    damagesSection,
    '',
    descriptionSection,
    resolutionSection ? `\n${resolutionSection}` : null,
    noticeSection ? `\n${noticeSection}` : null,
    '',
    '--- DEADLINE ---',
    `Response deadline: ${facts.deadline_days} days from receipt`,
    facts.county ? `Filing county: ${facts.county}` : null,
  ]
    .filter((s) => s !== null)
    .join('\n')
}

export function buildLtDemandLetterPrompt(facts: LtDemandLetterFacts): FilingPrompt {
  const { senderLabel, recipientLabel } = getRoleLabels(facts.party_role)
  const citations = getSubTypeCitations(facts.landlord_tenant_sub_type)

  const system = `You are a legal document formatting assistant. You help self-represented (pro se) individuals draft professional demand letters for landlord-tenant disputes in Texas.

IMPORTANT RULES:
- You format documents. You do NOT provide legal advice.
- Mark the output clearly as "DRAFT — NOT FOR FILING" at the top.
- Use only the facts provided. Do not invent or assume additional facts.
- Do not predict outcomes or make strategic recommendations.
- The tone must be firm, professional, and factual — NOT threatening, hostile, or emotional.
- Use plain, clear language.
- The sender is the ${senderLabel} and the recipient is the ${recipientLabel}. Use these role labels throughout the letter.

${citations}

DOCUMENT FORMAT:
Generate a formal demand letter with the following structure:

1. HEADER — Date, sender's name and address, recipient's name and address.

2. RE LINE — Brief subject line identifying the dispute (e.g., "RE: Demand for Return of Security Deposit" or "RE: Notice of Lease Violation — Failure to Make Repairs").

3. OPENING — State the purpose of the letter: to demand payment or resolution of the landlord-tenant dispute. Identify the sender's role (${senderLabel}) and their relationship to the recipient (${recipientLabel}).

4. PROPERTY — Identify the rental property at issue by address.

5. FACTS — A clear, factual account of what happened, including specific dates and amounts. Present facts in chronological order.

6. DAMAGES — Itemize each damage category with its amount. Present in a clear list or table format.

7. DEMAND — State the total amount demanded: $${facts.claim_amount.toLocaleString()}.

8. DEADLINE — The recipient has ${facts.deadline_days} days from receipt of this letter to resolve this matter.${facts.preferred_resolution ? ` The sender prefers the following resolution: ${facts.preferred_resolution}.` : ''}

9. CONSEQUENCE — If the matter is not resolved within the deadline, the sender intends to file a lawsuit in ${facts.county ? `${facts.county} County` : 'the appropriate county'} court to recover the full amount plus court costs and any additional damages allowed by law.

10. CLOSING — Professional closing with sender's signature block.

ANNOTATIONS:
After the letter text, output a section starting with "---ANNOTATIONS---" on its own line.
Below that, output one annotation per line in this exact format:
[N] SECTION_NAME: Plain-English explanation of what this section means and why it is in the letter.

Number annotations sequentially starting from 1. Cover these sections at minimum:
- Header (who is sending and receiving the letter)
- Property (what rental property this is about)
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
