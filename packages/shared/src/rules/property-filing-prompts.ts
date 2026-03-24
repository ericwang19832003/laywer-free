import { z } from 'zod'
import { partySchema } from '../schemas/filing'
import { damageItemSchema } from '../schemas/small-claims-filing'

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

export const propertyFilingFactsSchema = z.object({
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
  ]),
  dispute_type: z.enum([
    'boundary',
    'easement',
    'trespass',
    'nuisance',
    'quiet_title',
    'encroachment',
    'adverse_possession',
    'tree_vegetation',
    'water_drainage',
    'other',
  ]),
  dispute_description: z.string().min(10),
  damages_breakdown: z.array(damageItemSchema).min(1),
  damages_total: z.number().positive(),
  county: z.string().min(1),
  court_type: z.enum(['jp', 'county', 'district']),
  cause_number: z.string().optional(),
  incident_date: z.string().optional(),
  description: z.string().min(10),
  property_legal_description: z.string().optional(),
  survey_reference: z.string().optional(),
  demand_letter_sent: z.boolean().default(false),
  demand_letter_date: z.string().optional(),
  seeks_injunctive_relief: z.boolean().default(false),
  injunctive_relief_description: z.string().optional(),
})

export type PropertyFilingFacts = z.infer<typeof propertyFilingFactsSchema>

interface FilingPrompt {
  system: string
  user: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getDisputeTypeLabel(disputeType: string): string {
  switch (disputeType) {
    case 'boundary':
      return 'Boundary Dispute'
    case 'easement':
      return 'Easement Dispute'
    case 'trespass':
      return 'Trespass'
    case 'nuisance':
      return 'Nuisance'
    case 'quiet_title':
      return 'Quiet Title Action'
    case 'encroachment':
      return 'Encroachment'
    case 'adverse_possession':
      return 'Adverse Possession'
    case 'tree_vegetation':
      return 'Tree / Vegetation Dispute'
    case 'water_drainage':
      return 'Water / Drainage Dispute'
    case 'other':
    default:
      return 'Property Dispute'
  }
}

function getPropertyTypeLabel(propertyType: string): string {
  switch (propertyType) {
    case 'residential':
      return 'Residential Property'
    case 'commercial':
      return 'Commercial Property'
    case 'vacant_land':
      return 'Vacant Land'
    case 'agricultural':
      return 'Agricultural Property'
    case 'other':
    default:
      return 'Property'
  }
}

function getCourtCaption(courtType: string, county: string, causeNumber?: string): string {
  const causeStr = causeNumber ? `Cause No. ${causeNumber}` : 'Cause No. ___________'

  switch (courtType) {
    case 'jp':
      return `In the Justice Court, Precinct ___, ${county} County, Texas\n${causeStr}`
    case 'county':
      return `In the County Court at Law No. ___, ${county} County, Texas\n${causeStr}`
    case 'district':
      return `In the District Court of ${county} County, Texas\n${causeStr}`
    default:
      return `In the Court of ${county} County, Texas\n${causeStr}`
  }
}

function getDisputeTypeGuidance(disputeType: string): string {
  switch (disputeType) {
    case 'boundary':
      return `This is a Texas property dispute petition involving a boundary disagreement. Include:
- PROPERTY DESCRIPTION: Describe the properties involved, including addresses and any legal descriptions or survey references.
- BOUNDARY ISSUE: Describe the disputed boundary line, where the disagreement lies, and how the Plaintiff's property rights are being affected.
- SURVEYS: Reference any surveys, plats, or deeds that establish the correct boundary.
- LEGAL BASIS: In Texas, boundary disputes are resolved by reference to the original grant, deed descriptions, and surveys. Cite Tex. Prop. Code as applicable.`

    case 'easement':
      return `This is a Texas property dispute petition involving an easement. Include:
- EASEMENT DESCRIPTION: Describe the easement — its type (express, implied, prescriptive, or by necessity), location, and purpose.
- INTERFERENCE: Describe how the Defendant has interfered with or violated the easement rights.
- LEGAL BASIS: Texas recognizes easements by express grant, implication, necessity, and prescription. Cite the recorded easement instrument if applicable.`

    case 'trespass':
      return `This is a Texas property dispute petition for trespass. Include:
- PROPERTY: Describe the Plaintiff's property and their ownership or possessory interest.
- TRESPASS: Describe the Defendant's unauthorized entry or intrusion onto the property, including dates and nature of the trespass.
- CONTINUING TRESPASS: If the trespass is ongoing, describe the continuing nature and frequency.
- LEGAL BASIS: Under Texas law, trespass to real property occurs when a person enters another's property without consent. The property owner may recover actual damages and, in cases of willful trespass, may seek exemplary damages.`

    case 'nuisance':
      return `This is a Texas property dispute petition for nuisance. Include:
- PROPERTY: Describe the Plaintiff's property and how they use and enjoy it.
- NUISANCE: Describe the condition or activity that constitutes a nuisance — noise, odors, pollution, obstruction, or other interference with the Plaintiff's use and enjoyment.
- DURATION: How long the nuisance has persisted and its frequency or continuity.
- LEGAL BASIS: A private nuisance in Texas is a condition that substantially interferes with the use and enjoyment of land. The interference must be unreasonable.`

    case 'quiet_title':
      return `This is a Texas quiet title action. Include:
- PROPERTY: Describe the property at issue, including the legal description and the Plaintiff's claimed ownership interest.
- CLOUD ON TITLE: Describe the adverse claim, lien, encumbrance, or defect that clouds the Plaintiff's title.
- CHAIN OF TITLE: Outline the Plaintiff's chain of title establishing their ownership.
- LEGAL BASIS: A suit to quiet title in Texas requires the Plaintiff to show: (1) an interest in specific property, (2) that title is affected by a claim by the Defendant, and (3) that the claim is invalid or unenforceable. Cite Tex. Prop. Code § 13.001 et seq. as applicable.`

    case 'encroachment':
      return `This is a Texas property dispute petition for encroachment. Include:
- PROPERTY: Describe both properties and the established boundary.
- ENCROACHMENT: Describe the structure, fence, or improvement that encroaches onto the Plaintiff's property, including the extent of the encroachment.
- SURVEY: Reference any survey showing the encroachment.
- LEGAL BASIS: An encroachment onto neighboring property constitutes a trespass and nuisance in Texas. The property owner may seek removal of the encroaching structure and damages.`

    case 'adverse_possession':
      return `This is a Texas property dispute petition involving adverse possession. Include:
- PROPERTY: Describe the disputed property and its current use.
- POSSESSION: Describe the claimant's actual, visible, continuous, and exclusive possession of the property.
- DURATION: State the period of adverse possession. Texas recognizes 3-year, 5-year, 10-year, and 25-year adverse possession statutes (Tex. Civ. Prac. & Rem. Code §§ 16.024–16.028).
- LEGAL BASIS: Cite the applicable limitations period and the elements of adverse possession under Texas law.`

    case 'tree_vegetation':
      return `This is a Texas property dispute petition involving trees or vegetation. Include:
- PROPERTY: Describe the properties and the tree(s) or vegetation at issue.
- DAMAGE OR INTRUSION: Describe how the trees or vegetation are causing damage or intruding — overhanging branches, root damage, fallen trees, blocked light, etc.
- DAMAGES: Itemize repair or removal costs.
- LEGAL BASIS: Under the Texas "self-help" rule, a property owner may trim branches and roots that encroach onto their property at their own expense. If a neighbor's tree causes damage, the affected owner may recover damages for negligence or nuisance.`

    case 'water_drainage':
      return `This is a Texas property dispute petition involving water or drainage issues. Include:
- PROPERTY: Describe the affected property and the drainage conditions.
- DRAINAGE ISSUE: Describe the water or drainage problem — flooding, diversion of natural flow, improper grading, blocked drainage, etc.
- CAUSE: Describe how the Defendant's actions altered the natural drainage or caused the water damage.
- LEGAL BASIS: Under the Texas civil law rule of water drainage, a landowner may not alter the natural flow of surface water to the detriment of adjacent property. Cite applicable case law.`

    case 'other':
    default:
      return `This is a Texas property dispute petition. Include:
- PROPERTY: A description of the property at issue.
- FACTS: A clear, chronological narrative of the facts giving rise to the claim.
- LEGAL BASIS: The legal theory supporting the claim.
- DAMAGES: How the Plaintiff was harmed and the monetary value of the harm.`
  }
}

function getCausesOfAction(disputeType: string): string {
  switch (disputeType) {
    case 'trespass':
      return `5. CAUSES OF ACTION:
   a. FIRST CAUSE OF ACTION — TRESPASS TO REAL PROPERTY
      - Plaintiff owns or has a possessory interest in the property.
      - Defendant intentionally or negligently entered the property without authorization.
      - Defendant's entry caused damages to the Plaintiff.`

    case 'nuisance':
      return `5. CAUSES OF ACTION:
   a. FIRST CAUSE OF ACTION — PRIVATE NUISANCE
      - Plaintiff owns or has a possessory interest in the property.
      - Defendant's conduct substantially and unreasonably interferes with Plaintiff's use and enjoyment.
      - The interference is ongoing and has caused damages.`

    case 'quiet_title':
      return `5. CAUSES OF ACTION:
   a. FIRST CAUSE OF ACTION — SUIT TO QUIET TITLE
      - Plaintiff has an interest in specific property.
      - Defendant's claim affects Plaintiff's title.
      - Defendant's claim is invalid or unenforceable.`

    case 'boundary':
    case 'encroachment':
      return `5. CAUSES OF ACTION:
   a. FIRST CAUSE OF ACTION — TRESPASS / ENCROACHMENT
      - Plaintiff owns the property up to the established boundary.
      - Defendant's structure, use, or activity crosses the boundary onto Plaintiff's property.
      - Defendant's encroachment causes damages to Plaintiff.
   b. SECOND CAUSE OF ACTION — DECLARATORY JUDGMENT (BOUNDARY)
      - A justiciable controversy exists regarding the boundary between the properties.
      - Plaintiff seeks a judicial declaration establishing the correct boundary.`

    case 'easement':
      return `5. CAUSES OF ACTION:
   a. FIRST CAUSE OF ACTION — INTERFERENCE WITH EASEMENT RIGHTS
      - A valid easement exists in Plaintiff's favor.
      - Defendant has unreasonably interfered with Plaintiff's use of the easement.
      - Defendant's interference has caused damages.`

    case 'adverse_possession':
      return `5. CAUSES OF ACTION:
   a. FIRST CAUSE OF ACTION — ADVERSE POSSESSION
      - Plaintiff (or their predecessors) openly, notoriously, continuously, and exclusively possessed the disputed property for the statutory period.
      - Possession was actual, visible, and hostile to the record owner's interest.
      - Plaintiff is entitled to be declared the owner of the disputed property.`

    case 'tree_vegetation':
      return `5. CAUSES OF ACTION:
   a. FIRST CAUSE OF ACTION — NEGLIGENCE / NUISANCE
      - Defendant's trees or vegetation encroach onto or damage Plaintiff's property.
      - Defendant knew or should have known of the condition and failed to act.
      - Plaintiff has suffered damages as a result.`

    case 'water_drainage':
      return `5. CAUSES OF ACTION:
   a. FIRST CAUSE OF ACTION — ALTERATION OF NATURAL DRAINAGE
      - Defendant altered the natural flow of surface water.
      - The alteration causes water damage to Plaintiff's property.
      - Plaintiff has suffered damages as a result.`

    case 'other':
    default:
      return `5. CAUSES OF ACTION:
   State the legal basis for the claim based on the specific facts of the dispute.`
  }
}

// ---------------------------------------------------------------------------
// User prompt builder
// ---------------------------------------------------------------------------

function buildUserPrompt(facts: PropertyFilingFacts): string {
  const caption = getCourtCaption(facts.court_type, facts.county, facts.cause_number)
  const disputeLabel = getDisputeTypeLabel(facts.dispute_type)
  const propertyLabel = getPropertyTypeLabel(facts.property_type)

  const captionSection = [
    '--- COURT CAPTION ---',
    caption,
  ].join('\n')

  const partiesSection = [
    '--- PARTIES ---',
    `Plaintiff: ${facts.plaintiff.full_name}`,
    facts.plaintiff.address
      ? `Address: ${facts.plaintiff.address}, ${facts.plaintiff.city ?? ''}, ${facts.plaintiff.state ?? ''} ${facts.plaintiff.zip ?? ''}`
      : null,
    `Defendant: ${facts.defendant.full_name}${facts.defendant_is_business ? ' (business entity)' : ''}`,
    facts.defendant.address
      ? `Address: ${facts.defendant.address}, ${facts.defendant.city ?? ''}, ${facts.defendant.state ?? ''} ${facts.defendant.zip ?? ''}`
      : null,
  ]
    .filter(Boolean)
    .join('\n')

  const propertySection = [
    '--- PROPERTY ---',
    `Property address: ${facts.property_address}`,
    `Property type: ${propertyLabel}`,
    `Dispute type: ${disputeLabel}`,
    facts.property_legal_description
      ? `Legal description: ${facts.property_legal_description}`
      : null,
    facts.survey_reference
      ? `Survey reference: ${facts.survey_reference}`
      : null,
  ]
    .filter(Boolean)
    .join('\n')

  const disputeSection = [
    '--- DISPUTE ---',
    facts.dispute_description,
  ].join('\n')

  const damagesSection = [
    '--- DAMAGES BREAKDOWN ---',
    ...facts.damages_breakdown.map(
      (d) =>
        `- ${d.category}: $${d.amount.toLocaleString()}${d.description ? ` (${d.description})` : ''}`
    ),
    `Total claimed: $${facts.damages_total.toLocaleString()}`,
  ].join('\n')

  const descriptionSection = ['--- DESCRIPTION ---', facts.description].join('\n')

  const demandLetterSection = [
    '--- DEMAND LETTER ---',
    `Demand letter sent: ${facts.demand_letter_sent ? 'Yes' : 'No'}`,
    facts.demand_letter_date ? `Demand letter date: ${facts.demand_letter_date}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  const injunctiveSection = facts.seeks_injunctive_relief
    ? [
        '--- INJUNCTIVE RELIEF ---',
        facts.injunctive_relief_description ?? 'Plaintiff seeks injunctive relief to stop the ongoing harm.',
      ].join('\n')
    : null

  return [
    `Property dispute filing: ${disputeLabel}`,
    '',
    captionSection,
    '',
    partiesSection,
    '',
    propertySection,
    '',
    disputeSection,
    '',
    damagesSection,
    '',
    descriptionSection,
    '',
    demandLetterSection,
    injunctiveSection ? `\n${injunctiveSection}` : null,
  ]
    .filter((s) => s !== null)
    .join('\n')
}

// ---------------------------------------------------------------------------
// Main prompt builder
// ---------------------------------------------------------------------------

export function buildPropertyFilingPrompt(facts: PropertyFilingFacts): FilingPrompt {
  const disputeLabel = getDisputeTypeLabel(facts.dispute_type)
  const guidance = getDisputeTypeGuidance(facts.dispute_type)
  const causesOfAction = getCausesOfAction(facts.dispute_type)

  const system = `You are a legal document formatting assistant. You help self-represented (pro se) litigants format their property dispute court filings for Texas courts.

IMPORTANT RULES:
- You format documents. You do NOT provide legal advice.
- Mark the output clearly as "DRAFT — NOT FOR FILING WITHOUT ATTORNEY REVIEW" at the top.
- Use only the facts provided. Do not invent or assume additional facts.
- Do not predict outcomes or make strategic recommendations.
- Use plain, clear language appropriate for a pro se filer.
- ALWAYS use "Plaintiff" and "Defendant" terminology.

DOCUMENT FORMAT:
Generate a "PLAINTIFF'S ORIGINAL PETITION — ${disputeLabel.toUpperCase()}" for filing in ${facts.county} County, Texas.

${guidance}

The petition must include these sections:

1. CAPTION — Court name, cause number (if known), and party names (Plaintiff v. Defendant).

2. PARTIES — Full names and addresses of Plaintiff and Defendant.${facts.defendant_is_business ? ' Note that the Defendant is a business entity.' : ''}

3. JURISDICTION — State the jurisdictional basis for this court. ${facts.court_type === 'jp' ? 'This court has jurisdiction under Tex. Gov. Code § 27.031 because the amount in controversy does not exceed $20,000.' : facts.court_type === 'county' ? 'This court has jurisdiction because the amount in controversy exceeds $200 but does not exceed $250,000.' : 'This court has jurisdiction because the amount in controversy exceeds $200.'}

4. PROPERTY DESCRIPTION — Describe the property at issue, including the street address${facts.property_legal_description ? ', legal description' : ''}${facts.survey_reference ? ', and survey reference' : ''}.

5. FACTS — Plain language description of the events giving rise to the property dispute, presented in chronological order.

${causesOfAction}

6. PRAYER FOR RELIEF — Formal request asking the court to award:
   - Actual damages of $${facts.damages_total.toLocaleString()}${facts.seeks_injunctive_relief ? '\n   - Injunctive relief ordering the Defendant to cease the offending conduct' : ''}
   - Pre-judgment and post-judgment interest at the legal rate
   - Court costs
   - Any other relief the court deems just and equitable

7. VERIFICATION — A sworn statement: "My name is ${facts.plaintiff.full_name}. I declare under penalty of perjury that the foregoing is true and correct. Executed on [date]."

8. PRO SE SIGNATURE BLOCK — "Respectfully submitted" with Plaintiff's name, address, phone number, and "Pro Se" designation.

APPLICABLE RULES:
This petition is governed by the Texas Rules of Civil Procedure and the Texas Property Code. Cite applicable statutes and case law where appropriate.

ANNOTATIONS:
After the document text, output a section starting with "---ANNOTATIONS---" on its own line.
Below that, output one annotation per line in this exact format:
[N] SECTION_NAME: Plain-English explanation of what this section means and why it is in the document.

Number annotations sequentially starting from 1. Cover these sections at minimum:
- Caption (the header with court name and parties)
- Parties (who is involved — Plaintiff and Defendant)
- Jurisdiction (why this court can hear the case)
- Property Description (what property this dispute is about)
- Facts (what happened)
- Causes of Action (the legal reasons you are suing)
- Prayer for Relief (what you are asking the court to do)
- Verification (the sworn statement)
- Signature Block (where you sign)

Use simple language a high school student could understand. Do NOT use legal jargon in the explanations.

Format the document professionally with proper legal formatting.`

  const user = buildUserPrompt(facts)

  return { system, user }
}
