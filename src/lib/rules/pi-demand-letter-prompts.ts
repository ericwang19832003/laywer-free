import { z } from 'zod'
import { partySchema } from '../schemas/filing'

export const piDemandLetterFactsSchema = z.object({
  your_info: partySchema,
  defendant_info: partySchema,
  insurance_carrier: z.string().min(1),
  policy_number: z.string().optional(),
  claim_number: z.string().optional(),
  pi_sub_type: z.enum([
    'auto_accident', 'pedestrian_cyclist', 'rideshare', 'uninsured_motorist',
    'slip_and_fall', 'dog_bite', 'product_liability', 'other',
  ]),
  incident_date: z.string().min(1),
  incident_location: z.string().min(1),
  incident_description: z.string().min(10),
  injuries_description: z.string().min(10),
  injury_severity: z.enum(['minor', 'moderate', 'severe']),
  medical_providers: z.array(z.object({
    name: z.string().min(1),
    type: z.string().min(1),
    dates: z.string().min(1),
    amount: z.number().nonnegative(),
  })).min(1),
  total_medical_expenses: z.number().nonnegative(),
  lost_wages: z.number().nonnegative(),
  property_damage: z.number().nonnegative(),
  pain_suffering_amount: z.number().nonnegative(),
  total_demand_amount: z.number().positive(),
  county: z.string().optional(),
})

export type PiDemandLetterFacts = z.infer<typeof piDemandLetterFactsSchema>

interface FilingPrompt {
  system: string
  user: string
}

const SUB_TYPE_LABELS: Record<PiDemandLetterFacts['pi_sub_type'], string> = {
  auto_accident: 'Auto / Vehicle Accident',
  pedestrian_cyclist: 'Pedestrian / Cyclist Accident',
  rideshare: 'Rideshare Accident',
  uninsured_motorist: 'Uninsured / Underinsured Motorist',
  slip_and_fall: 'Slip and Fall / Premises Liability',
  dog_bite: 'Dog Bite / Animal Attack',
  product_liability: 'Product Liability',
  other: 'Personal Injury — Other',
}

function buildUserPrompt(facts: PiDemandLetterFacts): string {
  const senderSection = [
    '--- SENDER (PLAINTIFF) ---',
    `Name: ${facts.your_info.full_name}`,
    facts.your_info.address
      ? `Address: ${facts.your_info.address}, ${facts.your_info.city ?? ''}, ${facts.your_info.state ?? ''} ${facts.your_info.zip ?? ''}`
      : null,
  ]
    .filter(Boolean)
    .join('\n')

  const insuranceSection = [
    '--- INSURANCE CARRIER ---',
    `Carrier: ${facts.insurance_carrier}`,
    facts.policy_number ? `Policy number: ${facts.policy_number}` : null,
    facts.claim_number ? `Claim number: ${facts.claim_number}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  const defendantSection = [
    '--- AT-FAULT PARTY (DEFENDANT) ---',
    `Name: ${facts.defendant_info.full_name}`,
    facts.defendant_info.address
      ? `Address: ${facts.defendant_info.address}, ${facts.defendant_info.city ?? ''}, ${facts.defendant_info.state ?? ''} ${facts.defendant_info.zip ?? ''}`
      : null,
  ]
    .filter(Boolean)
    .join('\n')

  const incidentSection = [
    '--- INCIDENT ---',
    `Type: ${SUB_TYPE_LABELS[facts.pi_sub_type]}`,
    `Date: ${facts.incident_date}`,
    `Location: ${facts.incident_location}`,
    `Description: ${facts.incident_description}`,
  ].join('\n')

  const injuriesSection = [
    '--- INJURIES ---',
    `Description: ${facts.injuries_description}`,
    `Severity: ${facts.injury_severity}`,
  ].join('\n')

  const providerLines = facts.medical_providers.map(
    (p) => `  - ${p.name} (${p.type}), ${p.dates}: $${p.amount.toLocaleString()}`,
  )
  const medicalProvidersSection = [
    '--- MEDICAL PROVIDERS ---',
    ...providerLines,
  ].join('\n')

  const damagesSection = [
    '--- DAMAGES ---',
    `Medical expenses: $${facts.total_medical_expenses.toLocaleString()}`,
    `Lost wages: $${facts.lost_wages.toLocaleString()}`,
    `Property damage: $${facts.property_damage.toLocaleString()}`,
    `Pain and suffering: $${facts.pain_suffering_amount.toLocaleString()}`,
    `TOTAL DEMAND: $${facts.total_demand_amount.toLocaleString()}`,
  ].join('\n')

  const countySection = facts.county ? `Filing county: ${facts.county}` : null

  return [
    'Personal injury demand letter to insurance carrier',
    '',
    senderSection,
    '',
    insuranceSection,
    '',
    defendantSection,
    '',
    incidentSection,
    '',
    injuriesSection,
    '',
    medicalProvidersSection,
    '',
    damagesSection,
    countySection ? `\n${countySection}` : null,
  ]
    .filter((s) => s !== null)
    .join('\n')
}

export function buildPiDemandLetterPrompt(facts: PiDemandLetterFacts): FilingPrompt {
  const system = `You are a legal document formatting assistant. Generate a personal injury demand letter for a self-represented (pro se) plaintiff in Texas, addressed to the at-fault party's insurance carrier.

IMPORTANT RULES:
- You format documents. You do NOT provide legal advice.
- Mark the output clearly as "DRAFT — NOT FOR FILING" at the top.
- Use only the facts provided. Do not invent or assume additional facts.
- Do not predict outcomes or make strategic recommendations.
- The tone must be firm, professional, and factual — NOT threatening, hostile, or emotional.
- Use plain, clear language.

PURPOSE:
This demand letter serves as a formal pre-litigation demand under the Texas Insurance Code. It notifies the insurance carrier of the plaintiff's claim, itemizes damages, and demands a specific settlement amount. Under Tex. Ins. Code § 542 (the Texas Prompt Payment of Claims Act), the insurer must acknowledge receipt of the claim within 15 days, begin investigation within 15 days, and accept or deny the claim within 15 business days after receiving all required documentation. Failure to comply may subject the insurer to penalties of 18% annual interest plus reasonable attorney's fees.

The statute of limitations for personal injury claims in Texas is 2 years from the date of injury under Tex. Civ. Prac. & Rem. Code § 16.003.

DOCUMENT FORMAT:
Generate a formal personal injury demand letter with the following structure:

1. DATE — Current date.

2. SENDER INFO — Plaintiff's name and address.

3. VIA CERTIFIED MAIL — Notation that this letter is sent via Certified Mail, Return Receipt Requested.

4. INSURANCE ADDRESS — Insurance carrier's name with policy/claim numbers as reference.

5. RE LINE — "RE: Personal Injury Demand — [Claim Number / Policy Number]" with claimant name and date of loss.

6. OPENING — State the purpose: a demand letter under the Texas Insurance Code for personal injury damages arising from the incident.

7. FACTS OF INCIDENT — Detailed narrative of the incident based on the facts provided, including date, location, parties involved, and what happened.

8. INJURIES & TREATMENT — Description of injuries sustained, severity, and itemized list of all medical providers, treatment types, dates of treatment, and costs.

9. DAMAGES — Itemized table of all damages:
   - Medical expenses (itemized by provider, then total)
   - Lost wages
   - Property damage
   - Pain and suffering
   - TOTAL DEMAND AMOUNT

10. DEMAND — State the total demand amount. Give the insurer 30 days from receipt to respond with a settlement offer. Reference Tex. Ins. Code § 542 prompt payment deadlines and consequences for non-compliance.

11. CLOSING — Professional closing with plaintiff's signature block. Include "Sent via CERTIFIED MAIL, Return Receipt Requested" notation.

ANNOTATIONS:
After the letter text, output a section starting with "---ANNOTATIONS---" on its own line.
Below that, output one annotation per line in this exact format:
[N] SECTION_NAME: Plain-English explanation of what this section means and why it is in the letter.

Number annotations sequentially starting from 1. Cover these sections at minimum:
- Header (who is sending and receiving the letter)
- Facts of Incident (what happened)
- Injuries & Treatment (how you were hurt and what treatment you received)
- Damages Table (the money you are claiming and why)
- Demand & Deadline (what you are asking for and when they must respond)
- Prompt Payment Act (why the 30-day deadline matters under Texas law)
- Statute of Limitations (how long you have to file a lawsuit if they don't settle)

Use simple language a high school student could understand. Do NOT use legal jargon in the explanations.

Format the letter professionally.`

  const user = buildUserPrompt(facts)

  return { system, user }
}
