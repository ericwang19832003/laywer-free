import { z } from 'zod'
import { partySchema } from '../schemas/filing'

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

export const piPetitionFactsSchema = z.object({
  your_info: partySchema,
  opposing_parties: z.array(partySchema).min(1),
  court_type: z.enum(['jp', 'county', 'district']),
  county: z.string().min(1),
  cause_number: z.string().optional(),
  pi_sub_type: z.enum([
    'auto_accident', 'pedestrian_cyclist', 'rideshare', 'uninsured_motorist',
    'slip_and_fall', 'dog_bite', 'product_liability', 'other_injury',
    'vehicle_damage', 'property_damage_negligence', 'vandalism', 'other_property_damage',
  ]),
  incident_date: z.string().min(1),
  incident_location: z.string().min(1),
  incident_description: z.string().min(10),
  injuries_description: z.string().min(10),
  injury_severity: z.enum(['minor', 'moderate', 'severe']),
  damages: z.object({
    medical: z.number().nonnegative(),
    lost_wages: z.number().nonnegative(),
    property_damage: z.number().nonnegative(),
    pain_suffering: z.number().nonnegative(),
    total: z.number().positive(),
  }),
  negligence_theory: z.string().min(10),
  prior_demand_sent: z.boolean(),
  demand_date: z.string().optional(),
})

export type PiPetitionFacts = z.infer<typeof piPetitionFactsSchema>

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FilingPrompt {
  system: string
  user: string
}

// ---------------------------------------------------------------------------
// Court label helper
// ---------------------------------------------------------------------------

function getCourtLabel(courtType: string, county: string): string {
  switch (courtType) {
    case 'jp':
      return `Justice Court, Precinct ___, ${county} County, Texas`
    case 'county':
      return `County Court at Law No. ___, ${county} County, Texas`
    case 'district':
      return `District Court, ${county} County, Texas`
    default:
      return `${county} County, Texas`
  }
}

function getCourtCaption(courtType: string, county: string, causeNumber?: string): string {
  const causeStr = causeNumber ? `Cause No. ${causeNumber}` : 'Cause No. ___________'
  return `In the ${getCourtLabel(courtType, county)}\n${causeStr}`
}

// ---------------------------------------------------------------------------
// Negligence theory helper
// ---------------------------------------------------------------------------

function getNegligenceGuidance(subType: string): string {
  switch (subType) {
    case 'auto_accident':
    case 'pedestrian_cyclist':
    case 'rideshare':
    case 'uninsured_motorist':
      return `Motor vehicle negligence theories: failure to maintain a proper lookout, failure to control speed, failure to yield the right of way, failure to keep a proper distance, and other acts of negligence that a reasonable driver would have avoided.`
    case 'slip_and_fall':
      return `Premises liability under Tex. Civ. Prac. & Rem. Code \u00a7 75. The property owner or occupier knew or should have known of the dangerous condition and failed to warn or make the premises safe.`
    case 'product_liability':
      return `Strict product liability under Tex. Civ. Prac. & Rem. Code \u00a7 82.001. The product was unreasonably dangerous due to a defective design, manufacturing defect, or failure to warn of known risks.`
    case 'dog_bite':
      return `Animal liability: the owner knew or should have known of the animal's dangerous propensities and failed to restrain or control the animal, resulting in injury to Plaintiff.`
    case 'vehicle_damage':
    case 'property_damage_negligence':
    case 'other_property_damage':
      return `Property damage negligence: Defendant owed a duty of care to Plaintiff's property, breached that duty through negligent acts or omissions, and the breach proximately caused damage to Plaintiff's property.`
    case 'vandalism':
      return `Intentional property damage: Defendant intentionally and unlawfully damaged or destroyed Plaintiff's property, causing actual damages.`
    case 'other_injury':
    default:
      return `General negligence: Defendant owed a duty of care to Plaintiff, breached that duty, and the breach proximately caused Plaintiff's injuries and damages.`
  }
}

// ---------------------------------------------------------------------------
// System prompt builder
// ---------------------------------------------------------------------------

function buildSystemPrompt(facts: PiPetitionFacts): string {
  const negligenceGuidance = getNegligenceGuidance(facts.pi_sub_type)

  return `You are a legal document formatting assistant. Generate an Original Petition for a personal injury lawsuit in Texas. This document is for a self-represented (pro se) plaintiff.

IMPORTANT RULES:
- You format documents. You do NOT provide legal advice.
- Mark the output clearly as "DRAFT \u2014 NOT FOR FILING" at the top.
- Use only the facts provided. Do not invent or assume additional facts.
- Do not predict outcomes or make strategic recommendations.
- Use plain, clear language appropriate for a pro se litigant.

DOCUMENT FORMAT:
Generate an "ORIGINAL PETITION" with the following structure:

1. COURT CAPTION \u2014 Court name, cause number (if known), and party names (Plaintiff vs. Defendant).

2. PARTIES \u2014 Identify the Plaintiff and each Defendant with name and address information.

3. JURISDICTION AND VENUE \u2014 State that the court has jurisdiction over this matter and that venue is proper in the named county under Texas law.

4. FACTS \u2014 Describe the incident: date, location, and what happened. Include only the facts provided.

5. NEGLIGENCE/LIABILITY \u2014 ${negligenceGuidance}

6. DAMAGES \u2014 Itemize the damages:
   - Medical expenses (past and future)
   - Lost wages / lost earning capacity
   - Property damage
   - Pain and suffering / mental anguish
   - Total damages sought

7. CONDITIONS PRECEDENT \u2014 All conditions precedent to Plaintiff's right of recovery have been performed or have occurred.${facts.prior_demand_sent ? ' Plaintiff sent a pre-suit demand letter to Defendant.' : ''}

8. PRAYER FOR RELIEF \u2014 Plaintiff requests:
   - Actual damages in the amount described above
   - Pre-judgment and post-judgment interest at the legal rate
   - Court costs and reasonable expenses
   - Such other and further relief to which Plaintiff may be justly entitled

9. JURY DEMAND \u2014 Plaintiff demands a trial by jury and tenders the appropriate jury fee.

10. PRO SE SIGNATURE BLOCK \u2014 "Respectfully submitted" with Plaintiff's name, address, and "Pro Se" designation.

ANNOTATIONS:
After the document text, output a section starting with "---ANNOTATIONS---" on its own line.
Below that, output one annotation per line in this exact format:
[N] SECTION_NAME: Plain-English explanation of what this section means and why it is in the document.

Number annotations sequentially starting from 1. Cover these sections at minimum:
- Caption (the header identifying the court and parties)
- Parties (who is suing and who is being sued)
- Jurisdiction and Venue (why this court can hear the case)
- Facts (what happened)
- Negligence/Liability (why the defendant is at fault)
- Damages (the money you are asking for and why)
- Conditions Precedent (legal prerequisites that have been met)
- Prayer for Relief (what you are asking the court to award)
- Jury Demand (your right to have a jury decide the case)

Use simple language a high school student could understand. Do NOT use legal jargon in the explanations.

Format the document professionally with proper legal formatting.`
}

// ---------------------------------------------------------------------------
// User prompt builder
// ---------------------------------------------------------------------------

function buildUserPrompt(facts: PiPetitionFacts): string {
  const caption = getCourtCaption(facts.court_type, facts.county, facts.cause_number)

  const partiesSection = [
    '--- PARTIES ---',
    `Plaintiff (You): ${facts.your_info.full_name}`,
    facts.your_info.address
      ? `Address: ${facts.your_info.address}, ${facts.your_info.city ?? ''}, ${facts.your_info.state ?? ''} ${facts.your_info.zip ?? ''}`
      : null,
    '',
    ...facts.opposing_parties.map((p, i) => {
      const lines = [`Defendant ${facts.opposing_parties.length > 1 ? `#${i + 1}` : ''}: ${p.full_name}`]
      if (p.address) {
        lines.push(`Address: ${p.address}, ${p.city ?? ''}, ${p.state ?? ''} ${p.zip ?? ''}`)
      }
      return lines.join('\n')
    }),
  ]
    .filter(Boolean)
    .join('\n')

  const incidentSection = [
    '--- INCIDENT DETAILS ---',
    `Type: ${facts.pi_sub_type.replace(/_/g, ' ')}`,
    `Date: ${facts.incident_date}`,
    `Location: ${facts.incident_location}`,
    `Description: ${facts.incident_description}`,
  ].join('\n')

  const injuriesSection = [
    '--- INJURIES ---',
    `Description: ${facts.injuries_description}`,
    `Severity: ${facts.injury_severity}`,
  ].join('\n')

  const damagesSection = [
    '--- DAMAGES ---',
    `Medical expenses: $${facts.damages.medical.toLocaleString()}`,
    `Lost wages: $${facts.damages.lost_wages.toLocaleString()}`,
    `Property damage: $${facts.damages.property_damage.toLocaleString()}`,
    `Pain and suffering: $${facts.damages.pain_suffering.toLocaleString()}`,
    `Total: $${facts.damages.total.toLocaleString()}`,
  ].join('\n')

  const negligenceSection = [
    '--- NEGLIGENCE THEORY ---',
    facts.negligence_theory,
  ].join('\n')

  const demandSection = facts.prior_demand_sent
    ? [
        '--- PRIOR DEMAND ---',
        `A demand letter was sent to the opposing party.`,
        facts.demand_date ? `Demand date: ${facts.demand_date}` : null,
      ]
        .filter(Boolean)
        .join('\n')
    : null

  return [
    '--- COURT CAPTION ---',
    caption,
    '',
    '--- DOCUMENT TYPE ---',
    'ORIGINAL PETITION (Personal Injury)',
    '',
    partiesSection,
    '',
    incidentSection,
    '',
    injuriesSection,
    '',
    damagesSection,
    '',
    negligenceSection,
    demandSection ? `\n${demandSection}` : null,
  ]
    .filter((s) => s !== null)
    .join('\n')
}

// ---------------------------------------------------------------------------
// Main prompt builder
// ---------------------------------------------------------------------------

export function buildPiPetitionPrompt(facts: PiPetitionFacts): FilingPrompt {
  const system = buildSystemPrompt(facts)
  const user = buildUserPrompt(facts)
  return { system, user }
}
