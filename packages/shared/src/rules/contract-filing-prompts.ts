import { z } from 'zod'
import { partySchema } from '../schemas/filing'
import { damageItemSchema } from '../schemas/small-claims-filing'

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

export const contractFilingFactsSchema = z.object({
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
  contract_amount: z.number().positive(),
  breach_description: z.string().min(10),
  damages: z.object({
    direct: z.number().nonnegative(),
    consequential: z.number().nonnegative(),
    incidental: z.number().nonnegative(),
    total: z.number().positive(),
  }),
  damages_breakdown: z.array(damageItemSchema).min(1),
  county: z.string().min(1),
  court_type: z.enum(['jp', 'county', 'district']),
  cause_number: z.string().optional(),
  incident_date: z.string().optional(),
  description: z.string().min(10),
  demand_letter_sent: z.boolean().default(false),
  demand_letter_date: z.string().optional(),
  include_unjust_enrichment: z.boolean().default(false),
})

export type ContractFilingFacts = z.infer<typeof contractFilingFactsSchema>

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
      return 'Oral Contract'
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

function getContractTypeGuidance(contractType: string): string {
  switch (contractType) {
    case 'written':
      return `- CONTRACT FORMATION: Describe the written contract, including the date it was signed, the parties, and the material terms.
- PERFORMANCE: Describe the Plaintiff's performance or tender of performance under the contract.
- BREACH: Describe specifically how the Defendant breached the written terms of the contract.`

    case 'oral':
      return `- CONTRACT FORMATION: Describe the oral agreement, including when it was made, where, who was present, and the essential terms agreed upon.
- CONSIDERATION: Describe what each party promised to do or give in exchange.
- PERFORMANCE: Describe the Plaintiff's performance or tender of performance under the oral agreement.
- BREACH: Describe specifically how the Defendant failed to perform as promised.
- CORROBORATION: Note any witnesses, text messages, emails, or conduct that corroborates the existence and terms of the oral contract.`

    case 'implied':
      return `- CONTRACT FORMATION: Describe the circumstances that gave rise to an implied contract — the conduct of the parties, the course of dealing, or industry custom that created a binding obligation.
- PERFORMANCE: Describe the Plaintiff's performance — goods delivered, services rendered, or other actions taken in reasonable reliance.
- BREACH: Describe how the Defendant failed to fulfill the implied obligation.`

    case 'employment':
      return `- EMPLOYMENT RELATIONSHIP: Describe the employment agreement, position, start date, compensation terms, and any relevant provisions (non-compete, severance, commission structure, etc.).
- PERFORMANCE: Describe the Plaintiff's fulfillment of employment duties.
- BREACH: Describe how the employer breached the agreement — wrongful termination, unpaid wages, withheld commissions, etc.
- LEGAL BASIS: If applicable, cite the Texas Payday Law (Tex. Lab. Code § 61.001 et seq.) for unpaid wages.`

    case 'services':
      return `- SERVICE AGREEMENT: Describe the services contracted for, the agreed scope, timeline, and compensation.
- PERFORMANCE: Describe the Plaintiff's performance or readiness to perform.
- BREACH: Describe how the Defendant failed to perform, paid insufficiently, or refused the services after engagement.`

    case 'sales':
      return `- SALES AGREEMENT: Describe the goods sold, the agreed price, delivery terms, and any warranties.
- PERFORMANCE: Describe the Plaintiff's delivery of goods or payment as agreed.
- BREACH: Describe how the Defendant failed to pay, accept delivery, or delivered nonconforming goods.
- UCC: If applicable, note that the Texas Business & Commerce Code (Tex. Bus. & Com. Code § 2.301 et seq.) governs sales of goods.`

    case 'construction':
      return `- CONSTRUCTION CONTRACT: Describe the project scope, location, agreed price, timeline, and specifications.
- PERFORMANCE: Describe the Plaintiff's work completed or materials provided.
- BREACH: Describe how the Defendant breached — nonpayment, abandonment, defective work, or deviation from specifications.
- CHANGE ORDERS: Note any change orders, amendments, or modifications to the original scope.`

    case 'lease':
      return `- LEASE TERMS: Describe the lease agreement, property, term, rent amount, and key obligations.
- PERFORMANCE: Describe the Plaintiff's compliance with the lease.
- BREACH: Describe how the Defendant violated the lease terms.`

    case 'other':
    default:
      return `- CONTRACT FORMATION: Describe the agreement between the parties, including date, terms, and consideration.
- PERFORMANCE: Describe the Plaintiff's performance under the contract.
- BREACH: Describe specifically how the Defendant breached the contract.`
  }
}

// ---------------------------------------------------------------------------
// User prompt builder
// ---------------------------------------------------------------------------

function buildUserPrompt(facts: ContractFilingFacts): string {
  const caption = getCourtCaption(facts.court_type, facts.county, facts.cause_number)
  const contractLabel = getContractTypeLabel(facts.contract_type)

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

  const contractSection = [
    '--- CONTRACT DETAILS ---',
    `Contract type: ${contractLabel}`,
    `Contract date: ${facts.contract_date}`,
    `Contract amount: $${facts.contract_amount.toLocaleString()}`,
  ].join('\n')

  const breachSection = [
    '--- BREACH ---',
    facts.breach_description,
  ].join('\n')

  const damagesSection = [
    '--- DAMAGES BREAKDOWN ---',
    ...facts.damages_breakdown.map(
      (d) =>
        `- ${d.category}: $${d.amount.toLocaleString()}${d.description ? ` (${d.description})` : ''}`
    ),
    '',
    '--- DAMAGES SUMMARY ---',
    `Direct damages: $${facts.damages.direct.toLocaleString()}`,
    facts.damages.consequential > 0
      ? `Consequential damages: $${facts.damages.consequential.toLocaleString()}`
      : null,
    facts.damages.incidental > 0
      ? `Incidental damages: $${facts.damages.incidental.toLocaleString()}`
      : null,
    `Total claimed: $${facts.damages.total.toLocaleString()}`,
  ]
    .filter(Boolean)
    .join('\n')

  const descriptionSection = ['--- DESCRIPTION ---', facts.description].join('\n')

  const demandLetterSection = [
    '--- DEMAND LETTER ---',
    `Demand letter sent: ${facts.demand_letter_sent ? 'Yes' : 'No'}`,
    facts.demand_letter_date ? `Demand letter date: ${facts.demand_letter_date}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  return [
    `Contract dispute filing: ${contractLabel}`,
    '',
    captionSection,
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
    '',
    demandLetterSection,
    facts.include_unjust_enrichment
      ? '\n--- ADDITIONAL CLAIMS ---\nInclude unjust enrichment as an alternative cause of action.'
      : null,
  ]
    .filter((s) => s !== null)
    .join('\n')
}

// ---------------------------------------------------------------------------
// Main prompt builder
// ---------------------------------------------------------------------------

export function buildContractFilingPrompt(facts: ContractFilingFacts): FilingPrompt {
  const contractLabel = getContractTypeLabel(facts.contract_type)
  const guidance = getContractTypeGuidance(facts.contract_type)

  const system = `You are a legal document formatting assistant. You help self-represented (pro se) litigants format their breach of contract court filings for Texas courts.

IMPORTANT RULES:
- You format documents. You do NOT provide legal advice.
- Mark the output clearly as "DRAFT — NOT FOR FILING WITHOUT ATTORNEY REVIEW" at the top.
- Use only the facts provided. Do not invent or assume additional facts.
- Do not predict outcomes or make strategic recommendations.
- Use plain, clear language appropriate for a pro se filer.
- ALWAYS use "Plaintiff" and "Defendant" terminology.

DOCUMENT FORMAT:
Generate a "PLAINTIFF'S ORIGINAL PETITION — BREACH OF ${contractLabel.toUpperCase()}" for filing in ${facts.county} County, Texas.

${guidance}

The petition must include these sections:

1. CAPTION — Court name, cause number (if known), and party names (Plaintiff v. Defendant).

2. PARTIES — Full names and addresses of Plaintiff and Defendant.${facts.defendant_is_business ? ' Note that the Defendant is a business entity.' : ''}

3. JURISDICTION — State the jurisdictional basis for this court. ${facts.court_type === 'jp' ? 'This court has jurisdiction under Tex. Gov. Code § 27.031 because the amount in controversy does not exceed $20,000.' : facts.court_type === 'county' ? 'This court has jurisdiction because the amount in controversy exceeds $200 but does not exceed $250,000.' : 'This court has jurisdiction because the amount in controversy exceeds $200.'}

4. FACTS — Plain language description of the events, organized as:
   a. Contract Formation — How the contract was formed, the date, and the essential terms.
   b. Breach — How the Defendant breached the contract, with specific dates and actions.
   c. Damages — How the breach caused the claimed damages, with the causal connection between breach and harm.

5. CAUSES OF ACTION:
   a. FIRST CAUSE OF ACTION — BREACH OF CONTRACT
      - Existence of a valid contract
      - Plaintiff's performance or tender of performance
      - Defendant's material breach
      - Damages resulting from the breach
${facts.include_unjust_enrichment ? `
   b. SECOND CAUSE OF ACTION — UNJUST ENRICHMENT (ALTERNATIVE)
      - Defendant received a benefit from the Plaintiff
      - Defendant retained the benefit under circumstances making retention inequitable
      - No adequate remedy at law
      Note: Plead in the alternative. Under Texas law, unjust enrichment is an equitable remedy available when no express contract governs the dispute.
` : ''}
6. PRAYER FOR RELIEF — Formal request asking the court to award:
   - Direct damages of $${facts.damages.direct.toLocaleString()}${facts.damages.consequential > 0 ? `\n   - Consequential damages of $${facts.damages.consequential.toLocaleString()}` : ''}${facts.damages.incidental > 0 ? `\n   - Incidental damages of $${facts.damages.incidental.toLocaleString()}` : ''}
   - Pre-judgment and post-judgment interest at the legal rate
   - Court costs
   - Any other relief the court deems just and equitable

7. VERIFICATION — A sworn statement: "My name is ${facts.plaintiff.full_name}. I declare under penalty of perjury that the foregoing is true and correct. Executed on [date]."

8. PRO SE SIGNATURE BLOCK — "Respectfully submitted" with Plaintiff's name, address, phone number, and "Pro Se" designation.

APPLICABLE RULES:
This petition is governed by the Texas Rules of Civil Procedure. For breach of contract claims in Texas, the elements are: (1) a valid contract existed, (2) the plaintiff performed or tendered performance, (3) the defendant breached the contract, and (4) the plaintiff was damaged as a result. Cite applicable rules and statutes where appropriate.

ANNOTATIONS:
After the document text, output a section starting with "---ANNOTATIONS---" on its own line.
Below that, output one annotation per line in this exact format:
[N] SECTION_NAME: Plain-English explanation of what this section means and why it is in the document.

Number annotations sequentially starting from 1. Cover these sections at minimum:
- Caption (the header with court name and parties)
- Parties (who is involved — Plaintiff and Defendant)
- Jurisdiction (why this court can hear the case)
- Facts — Contract Formation (how the contract was made)
- Facts — Breach (what the Defendant did wrong)
- Facts — Damages (how you were harmed)
- Causes of Action (the legal reasons you are suing)
- Prayer for Relief (what you are asking the court to do)
- Verification (the sworn statement)
- Signature Block (where you sign)

Use simple language a high school student could understand. Do NOT use legal jargon in the explanations.

Format the document professionally with proper legal formatting.`

  const user = buildUserPrompt(facts)

  return { system, user }
}
