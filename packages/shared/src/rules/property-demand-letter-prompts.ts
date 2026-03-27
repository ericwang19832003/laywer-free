import { z } from 'zod'
import { partySchema } from '../schemas/filing'
import { damageItemSchema } from '../schemas/small-claims-filing'

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

export const propertyDemandLetterFactsSchema = z.object({
  plaintiff: partySchema,
  defendant: partySchema,
  defendant_is_business: z.boolean().default(false),
  property_address: z.string().min(5),
  property_type: z.enum([
    'residential',
    'commercial',
    'vacant_land',
    'agricultural',
    'other',
  ]).optional(),
  property_right_violated: z.enum([
    'boundary',
    'easement',
    'trespass',
    'nuisance',
    'encroachment',
    'tree_vegetation',
    'water_drainage',
    'property_damage',
    'other',
  ]),
  requested_action: z.string().min(10),
  description: z.string().min(10),
  damages_breakdown: z.array(damageItemSchema).optional(),
  amount_demanded: z.number().nonnegative().optional(),
  deadline_days: z.number().min(1).max(90).default(14),
  preferred_resolution: z.string().optional(),
  county: z.string().optional(),
  survey_reference: z.string().optional(),
})

export type PropertyDemandLetterFacts = z.infer<typeof propertyDemandLetterFactsSchema>

interface FilingPrompt {
  system: string
  user: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getPropertyRightLabel(right: string): string {
  switch (right) {
    case 'boundary':
      return 'Boundary Violation'
    case 'easement':
      return 'Easement Interference'
    case 'trespass':
      return 'Trespass to Property'
    case 'nuisance':
      return 'Nuisance'
    case 'encroachment':
      return 'Encroachment'
    case 'tree_vegetation':
      return 'Tree / Vegetation Damage'
    case 'water_drainage':
      return 'Water / Drainage Issue'
    case 'property_damage':
      return 'Property Damage'
    case 'other':
    default:
      return 'Property Right Violation'
  }
}

function getPropertyRightGuidance(right: string): string {
  switch (right) {
    case 'boundary':
      return `APPLICABLE LAW:
- In Texas, property boundaries are established by deed descriptions, surveys, and plats of record. A property owner has the right to exclusive possession up to the established boundary.
- If the recipient's use or structures cross the boundary, the sender may seek removal and damages for the encroachment.`

    case 'easement':
      return `APPLICABLE LAW:
- An easement grants a right to use another person's property for a specific purpose. In Texas, easements may be express, implied, by necessity, or prescriptive.
- Interference with an easement entitles the easement holder to injunctive relief and damages.`

    case 'trespass':
      return `APPLICABLE LAW:
- Trespass to real property in Texas occurs when a person enters another's land without consent. The property owner may recover actual damages and seek injunctive relief.
- For continuing trespass, each day may constitute a separate violation.`

    case 'nuisance':
      return `APPLICABLE LAW:
- A private nuisance in Texas is a condition that substantially and unreasonably interferes with the use and enjoyment of property. The affected property owner may seek abatement and damages.
- Nuisance claims may include noise, odors, pollution, or any persistent condition interfering with the Plaintiff's property rights.`

    case 'encroachment':
      return `APPLICABLE LAW:
- An encroachment occurs when a structure, fence, or improvement extends beyond the owner's property line onto neighboring property. The affected owner may demand removal and recover damages.`

    case 'tree_vegetation':
      return `APPLICABLE LAW:
- Under the Texas "self-help" rule, a property owner may trim branches and roots that encroach onto their property at their own expense. If a neighbor's tree causes property damage through negligence, the affected owner may recover damages.
- If a healthy tree falls and causes damage, the tree owner may not be liable. If a dead or diseased tree falls after the owner was on notice, liability may attach.`

    case 'water_drainage':
      return `APPLICABLE LAW:
- Under the Texas civil law rule of water drainage, a landowner may not alter the natural flow of surface water to the detriment of adjacent property. Diversion of water that causes flooding or erosion to a neighbor's property may give rise to damages.`

    case 'property_damage':
      return `APPLICABLE LAW:
- A property owner in Texas may recover actual damages for injury to their property caused by another person's negligence or intentional acts. Damages are measured by the cost of repair or, if the property is destroyed, its fair market value.`

    case 'other':
    default:
      return `APPLICABLE LAW:
- Texas property law protects an owner's right to exclusive possession, use, and enjoyment of their property. Violations of these rights may give rise to claims for damages, injunctive relief, or both.`
  }
}

// ---------------------------------------------------------------------------
// User prompt builder
// ---------------------------------------------------------------------------

function buildUserPrompt(facts: PropertyDemandLetterFacts): string {
  const rightLabel = getPropertyRightLabel(facts.property_right_violated)

  const partiesSection = [
    '--- SENDER (PROPERTY OWNER / PLAINTIFF) ---',
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

  const propertySection = [
    '--- PROPERTY ---',
    `Property address: ${facts.property_address}`,
    facts.property_type ? `Property type: ${facts.property_type}` : null,
    facts.survey_reference ? `Survey reference: ${facts.survey_reference}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  const disputeSection = [
    '--- DISPUTE ---',
    `Property right violated: ${rightLabel}`,
    '',
    '--- DESCRIPTION ---',
    facts.description,
  ].join('\n')

  const requestedActionSection = [
    '--- REQUESTED ACTION ---',
    facts.requested_action,
  ].join('\n')

  const damagesSection = facts.damages_breakdown && facts.damages_breakdown.length > 0
    ? [
        '--- DAMAGES BREAKDOWN ---',
        ...facts.damages_breakdown.map(
          (d) =>
            `- ${d.category}: $${d.amount.toLocaleString()}${d.description ? ` (${d.description})` : ''}`
        ),
        facts.amount_demanded !== undefined && facts.amount_demanded > 0
          ? `Total amount demanded: $${facts.amount_demanded.toLocaleString()}`
          : null,
      ]
        .filter(Boolean)
        .join('\n')
    : null

  const resolutionSection = facts.preferred_resolution
    ? ['--- PREFERRED RESOLUTION ---', facts.preferred_resolution].join('\n')
    : null

  return [
    `Demand letter for property dispute: ${rightLabel}`,
    '',
    partiesSection,
    '',
    propertySection,
    '',
    disputeSection,
    '',
    requestedActionSection,
    damagesSection ? `\n${damagesSection}` : null,
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

export function buildPropertyDemandLetterPrompt(facts: PropertyDemandLetterFacts): FilingPrompt {
  const rightLabel = getPropertyRightLabel(facts.property_right_violated)
  const citations = getPropertyRightGuidance(facts.property_right_violated)
  const hasDamages = facts.amount_demanded !== undefined && facts.amount_demanded > 0

  const system = `You are a legal document formatting assistant. You help self-represented (pro se) individuals draft professional demand letters for property disputes in Texas.

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

2. RE LINE — "RE: Demand to Cease ${rightLabel} — ${facts.property_address}" or similar brief subject line identifying the property dispute.

3. OPENING — State the purpose of the letter: to demand that the recipient cease the conduct violating the sender's property rights${hasDamages ? ' and pay damages' : ''}. Identify the sender as the property owner and describe the relationship (neighbor, adjacent property owner, etc.).

4. PROPERTY — Identify the property at issue by address${facts.survey_reference ? ' and survey reference' : ''}. Describe the sender's ownership or possessory interest.

5. FACTS — A clear, factual account of:
   - The property right being violated (${rightLabel.toLowerCase()}).
   - When the violation began and whether it is ongoing.
   - What the recipient has done or failed to do.
   - Any prior communications or attempts to resolve the matter.
   Present facts in chronological order.
${hasDamages ? `
6. DAMAGES — Itemize each damage category with its amount. Present in a clear list or table format.

7. DEMAND — State the specific action demanded: ${facts.requested_action}${hasDamages ? ` And payment of $${facts.amount_demanded!.toLocaleString()} in damages.` : ''}
` : `
6. DEMAND — State the specific action demanded: ${facts.requested_action}
`}
${hasDamages ? '8' : '7'}. DEADLINE — The recipient has ${facts.deadline_days} days from receipt of this letter to comply with the demand.${facts.preferred_resolution ? ` The sender prefers the following resolution: ${facts.preferred_resolution}.` : ''}

${hasDamages ? '9' : '8'}. CONSEQUENCE — If the matter is not resolved within the deadline, the sender intends to file a lawsuit in ${facts.county ? `${facts.county} County` : 'the appropriate county'} court seeking ${hasDamages ? 'damages, ' : ''}injunctive relief, court costs, and any additional remedies allowed by law.

${hasDamages ? '10' : '9'}. CLOSING — Professional closing with sender's signature block.

${facts.defendant_is_business ? 'NOTE: The recipient is a business entity. Address the letter to the business name and use appropriate business correspondence conventions.' : ''}

ANNOTATIONS:
After the letter text, output a section starting with "---ANNOTATIONS---" on its own line.
Below that, output one annotation per line in this exact format:
[N] SECTION_NAME: Plain-English explanation of what this section means and why it is in the letter.

Number annotations sequentially starting from 1. Cover these sections at minimum:
- Header (who is sending and receiving the letter)
- Property (what property this is about)
- Facts (what happened — how your property rights were violated)${hasDamages ? '\n- Damages (the money being claimed)' : ''}
- Demand (what you want the recipient to do)
- Deadline (when they must respond)
- Consequence (what happens if they don't respond)

Use simple language a high school student could understand. Do NOT use legal jargon in the explanations.

Format the letter professionally.`

  const user = buildUserPrompt(facts)

  return { system, user }
}
