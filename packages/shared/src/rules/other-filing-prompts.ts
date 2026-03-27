import { z } from 'zod'
import { partySchema } from '../schemas/filing'
import { damageItemSchema } from '../schemas/small-claims-filing'

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

export const otherFilingFactsSchema = z.object({
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
  demand_letter_sent: z.boolean().default(false),
  demand_letter_date: z.string().optional(),
  seeks_exemplary_damages: z.boolean().default(false),
  statutory_violations: z.string().optional(),
})

export type OtherFilingFacts = z.infer<typeof otherFilingFactsSchema>

interface FilingPrompt {
  system: string
  user: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getSubTypeLabel(subType: string): string {
  switch (subType) {
    case 'consumer_protection':
      return 'Consumer Protection Violation'
    case 'defamation':
      return 'Defamation'
    case 'fraud':
      return 'Fraud'
    case 'negligence':
      return 'Negligence'
    case 'conversion':
      return 'Conversion'
    case 'unjust_enrichment':
      return 'Unjust Enrichment'
    case 'interference':
      return 'Tortious Interference'
    case 'other':
    default:
      return 'Civil Petition'
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

function getSubTypeGuidance(subType: string): string {
  switch (subType) {
    case 'consumer_protection':
      return `This is a Texas consumer protection petition. Include:
- TRANSACTION: Describe the consumer transaction — what was purchased or contracted for, when, where, and for how much.
- DECEPTIVE ACT: Describe the false, misleading, or deceptive act or practice committed by the Defendant. Be specific about what was represented vs. what actually occurred.
- RELIANCE: Describe how the Plaintiff relied on the Defendant's representations to their detriment.
- LEGAL BASIS: Cite the Texas Deceptive Trade Practices — Consumer Protection Act (DTPA), Tex. Bus. & Com. Code § 17.41 et seq. The DTPA provides remedies for consumers harmed by false, misleading, or deceptive acts, unconscionable actions, or breaches of warranty.
- DTPA NOTICE: Under Tex. Bus. & Com. Code § 17.505, the consumer must give the defendant written notice at least 60 days before filing suit, specifying the complaint and the amount of damages claimed. Note whether this notice was given.`

    case 'defamation':
      return `This is a Texas defamation petition. Include:
- STATEMENT: Identify the defamatory statement(s) — the exact words or substance of the communication, who made it, when, and to whom it was published.
- FALSITY: Explain why the statement is false.
- PUBLICATION: Describe how the statement was communicated to third parties (spoken = slander, written/broadcast = libel).
- DAMAGES: Describe the harm to the Plaintiff's reputation, including any economic losses, emotional distress, or damage to personal or professional standing.
- LEGAL BASIS: Under Texas law, defamation requires: (1) publication of a false statement of fact, (2) about the plaintiff, (3) to a third party, (4) that was defamatory, and (5) damages (unless the statement is defamatory per se).
- DEFAMATION PER SE: If applicable, note that certain statements are defamatory per se in Texas (imputing a crime, loathsome disease, sexual misconduct, or harm to business/profession), meaning damages are presumed.`

    case 'fraud':
      return `This is a Texas fraud petition. Include:
- MISREPRESENTATION: Describe the material misrepresentation or omission made by the Defendant — what was said, when, and in what context.
- KNOWLEDGE: Describe facts showing the Defendant knew the representation was false or made it recklessly without regard for its truth.
- RELIANCE: Describe how the Plaintiff justifiably relied on the misrepresentation.
- DAMAGES: Describe the harm caused by the reliance on the false representation.
- LEGAL BASIS: Under Texas law, the elements of fraud are: (1) a material misrepresentation, (2) that was false, (3) known to be false when made or made recklessly, (4) made with the intent that it be acted upon, (5) the other party relied on it, and (6) the other party was injured as a result.`

    case 'negligence':
      return `This is a Texas negligence petition. Include:
- DUTY: Describe the duty of care the Defendant owed to the Plaintiff.
- BREACH: Describe how the Defendant breached that duty — what they did or failed to do.
- CAUSATION: Describe the causal connection between the breach and the Plaintiff's injuries.
- DAMAGES: Describe the injuries and losses suffered by the Plaintiff.
- LEGAL BASIS: Texas negligence requires: (1) a legal duty, (2) breach of that duty, (3) proximate cause, and (4) damages. Texas follows modified comparative negligence — Plaintiff's recovery is reduced by their percentage of fault and barred if Plaintiff is more than 50% at fault (Tex. Civ. Prac. & Rem. Code § 33.001).`

    case 'conversion':
      return `This is a Texas conversion petition. Include:
- PROPERTY: Describe the personal property at issue — what it is, its value, and the Plaintiff's ownership or right to possession.
- WRONGFUL ACT: Describe how the Defendant wrongfully exercised dominion or control over the Plaintiff's property — took it, refused to return it, destroyed it, etc.
- DEMAND FOR RETURN: Describe any demand made for the return of the property and the Defendant's refusal.
- LEGAL BASIS: Conversion in Texas is the unauthorized and wrongful exercise of dominion and control over the personal property of another to the exclusion of, or inconsistent with, the owner's rights.`

    case 'unjust_enrichment':
      return `This is a Texas unjust enrichment petition. Include:
- BENEFIT: Describe the benefit conferred upon the Defendant by the Plaintiff.
- RETENTION: Describe how the Defendant has retained the benefit under circumstances that make retention inequitable.
- NO CONTRACT: Note that unjust enrichment in Texas is an equitable remedy — it applies when there is no express contract governing the dispute.
- LEGAL BASIS: Unjust enrichment requires: (1) the defendant received a benefit, (2) from the plaintiff, (3) under circumstances that make retention inequitable. It is not an independent cause of action but rather a basis for restitution.`

    case 'interference':
      return `This is a Texas tortious interference petition. Include:
- RELATIONSHIP OR CONTRACT: Describe the existing contract or business relationship the Plaintiff had with a third party.
- INTERFERENCE: Describe how the Defendant willfully and intentionally interfered with that contract or relationship.
- IMPROPER MEANS: Describe any improper means used — fraud, intimidation, threats, etc.
- DAMAGES: Describe the economic harm caused by the interference.
- LEGAL BASIS: Tortious interference with an existing contract requires: (1) an existing contract, (2) willful and intentional interference, (3) that was the proximate cause of damages, and (4) actual damages. Tortious interference with a business relationship requires similar elements plus proof of independent tortious or unlawful conduct.`

    case 'other':
    default:
      return `This is a Texas civil petition. Include:
- FACTS: A clear, chronological narrative of the facts giving rise to the claim.
- LEGAL BASIS: The legal theory supporting the claim.
- DAMAGES: How the Plaintiff was harmed and the monetary value of the harm.`
  }
}

function getCausesOfAction(subType: string, facts: OtherFilingFacts): string {
  switch (subType) {
    case 'consumer_protection':
      return `5. CAUSES OF ACTION:
   a. FIRST CAUSE OF ACTION — VIOLATION OF THE TEXAS DECEPTIVE TRADE PRACTICES ACT
      - Plaintiff is a consumer as defined by Tex. Bus. & Com. Code § 17.45(4).
      - Defendant engaged in false, misleading, or deceptive acts or practices as defined by § 17.46(b).
      - Plaintiff relied on Defendant's conduct to their detriment.
      - Plaintiff suffered actual damages as a result.
      - Under § 17.50, Plaintiff may recover economic damages, and if Defendant acted knowingly or intentionally, up to three times the economic damages.`

    case 'defamation':
      return `5. CAUSES OF ACTION:
   a. FIRST CAUSE OF ACTION — DEFAMATION (${facts.dispute_description.toLowerCase().includes('written') || facts.dispute_description.toLowerCase().includes('post') || facts.dispute_description.toLowerCase().includes('publish') ? 'LIBEL' : 'SLANDER'})
      - Defendant published a false statement of fact concerning the Plaintiff.
      - The statement was communicated to one or more third parties.
      - The statement was defamatory — it tended to harm the Plaintiff's reputation.
      - Plaintiff suffered damages as a result (or the statement is defamatory per se).`

    case 'fraud':
      return `5. CAUSES OF ACTION:
   a. FIRST CAUSE OF ACTION — FRAUD
      - Defendant made a material misrepresentation.
      - The misrepresentation was false.
      - Defendant knew it was false or made it recklessly.
      - Defendant intended that Plaintiff act on it.
      - Plaintiff justifiably relied on the misrepresentation.
      - Plaintiff suffered damages as a result.${facts.seeks_exemplary_damages ? `
   b. EXEMPLARY DAMAGES
      - Defendant's conduct was committed with actual malice or gross negligence.
      - Under Tex. Civ. Prac. & Rem. Code § 41.003, Plaintiff seeks exemplary damages.` : ''}`

    case 'negligence':
      return `5. CAUSES OF ACTION:
   a. FIRST CAUSE OF ACTION — NEGLIGENCE
      - Defendant owed a duty of care to Plaintiff.
      - Defendant breached that duty.
      - Defendant's breach was the proximate cause of Plaintiff's injuries.
      - Plaintiff suffered damages as a result.`

    case 'conversion':
      return `5. CAUSES OF ACTION:
   a. FIRST CAUSE OF ACTION — CONVERSION
      - Plaintiff had ownership or right to possession of the personal property.
      - Defendant wrongfully exercised dominion or control over the property.
      - Plaintiff demanded return and Defendant refused or is unable to return.
      - Plaintiff suffered damages equal to the value of the converted property.`

    case 'unjust_enrichment':
      return `5. CAUSES OF ACTION:
   a. FIRST CAUSE OF ACTION — UNJUST ENRICHMENT / RESTITUTION
      - Plaintiff conferred a valuable benefit on Defendant.
      - Defendant received and retained the benefit.
      - Retention of the benefit is inequitable under the circumstances.
      - No express contract governs the subject matter.`

    case 'interference':
      return `5. CAUSES OF ACTION:
   a. FIRST CAUSE OF ACTION — TORTIOUS INTERFERENCE
      - A valid contract or business relationship existed between Plaintiff and a third party.
      - Defendant had knowledge of the contract or relationship.
      - Defendant willfully and intentionally interfered.
      - The interference proximately caused damages to Plaintiff.`

    case 'other':
    default:
      return `5. CAUSES OF ACTION:
   State the legal basis for the claim based on the specific facts of the dispute.`
  }
}

// ---------------------------------------------------------------------------
// User prompt builder
// ---------------------------------------------------------------------------

function buildUserPrompt(facts: OtherFilingFacts): string {
  const caption = getCourtCaption(facts.court_type, facts.county, facts.cause_number)
  const subTypeLabel = getSubTypeLabel(facts.sub_type)

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

  const claimSection = [
    '--- CLAIM ---',
    `Claim type: ${subTypeLabel}`,
    `Total amount sought: $${facts.damages_total.toLocaleString()}`,
    facts.incident_date ? `Incident date: ${facts.incident_date}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  const disputeSection = [
    '--- DISPUTE DESCRIPTION ---',
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

  const statutorySection = facts.statutory_violations
    ? ['--- STATUTORY VIOLATIONS ---', facts.statutory_violations].join('\n')
    : null

  return [
    `Filing type: ${subTypeLabel}`,
    '',
    captionSection,
    '',
    partiesSection,
    '',
    claimSection,
    '',
    disputeSection,
    '',
    damagesSection,
    '',
    descriptionSection,
    '',
    demandLetterSection,
    statutorySection ? `\n${statutorySection}` : null,
    facts.seeks_exemplary_damages
      ? '\n--- EXEMPLARY DAMAGES ---\nPlaintiff seeks exemplary damages for Defendant\'s willful, malicious, or grossly negligent conduct.'
      : null,
  ]
    .filter((s) => s !== null)
    .join('\n')
}

// ---------------------------------------------------------------------------
// Main prompt builder
// ---------------------------------------------------------------------------

export function buildOtherFilingPrompt(facts: OtherFilingFacts): FilingPrompt {
  const subTypeLabel = getSubTypeLabel(facts.sub_type)
  const guidance = getSubTypeGuidance(facts.sub_type)
  const causesOfAction = getCausesOfAction(facts.sub_type, facts)

  const system = `You are a legal document formatting assistant. You help self-represented (pro se) litigants format their civil court filings for Texas courts.

IMPORTANT RULES:
- You format documents. You do NOT provide legal advice.
- Mark the output clearly as "DRAFT — NOT FOR FILING WITHOUT ATTORNEY REVIEW" at the top.
- Use only the facts provided. Do not invent or assume additional facts.
- Do not predict outcomes or make strategic recommendations.
- Use plain, clear language appropriate for a pro se filer.
- ALWAYS use "Plaintiff" and "Defendant" terminology.

DOCUMENT FORMAT:
Generate a "PLAINTIFF'S ORIGINAL PETITION — ${subTypeLabel.toUpperCase()}" for filing in ${facts.county} County, Texas.

${guidance}

The petition must include these sections:

1. CAPTION — Court name, cause number (if known), and party names (Plaintiff v. Defendant).

2. PARTIES — Full names and addresses of Plaintiff and Defendant.${facts.defendant_is_business ? ' Note that the Defendant is a business entity.' : ''}

3. JURISDICTION — State the jurisdictional basis for this court. ${facts.court_type === 'jp' ? 'This court has jurisdiction under Tex. Gov. Code § 27.031 because the amount in controversy does not exceed $20,000.' : facts.court_type === 'county' ? 'This court has jurisdiction because the amount in controversy exceeds $200 but does not exceed $250,000.' : 'This court has jurisdiction because the amount in controversy exceeds $200.'}

4. FACTS — Plain language description of the events giving rise to the claim, presented in chronological order.

${causesOfAction}

6. PRAYER FOR RELIEF — Formal request asking the court to award:
   - Actual damages of $${facts.damages_total.toLocaleString()}${facts.seeks_exemplary_damages ? '\n   - Exemplary damages in an amount to be determined by the court' : ''}
   - Pre-judgment and post-judgment interest at the legal rate
   - Court costs
   - Any other relief the court deems just and equitable

7. VERIFICATION — A sworn statement: "My name is ${facts.plaintiff.full_name}. I declare under penalty of perjury that the foregoing is true and correct. Executed on [date]."

8. PRO SE SIGNATURE BLOCK — "Respectfully submitted" with Plaintiff's name, address, phone number, and "Pro Se" designation.

APPLICABLE RULES:
This petition is governed by the Texas Rules of Civil Procedure. Cite applicable statutes and case law where appropriate.

ANNOTATIONS:
After the document text, output a section starting with "---ANNOTATIONS---" on its own line.
Below that, output one annotation per line in this exact format:
[N] SECTION_NAME: Plain-English explanation of what this section means and why it is in the document.

Number annotations sequentially starting from 1. Cover these sections at minimum:
- Caption (the header with court name and parties)
- Parties (who is involved — Plaintiff and Defendant)
- Jurisdiction (why this court can hear the case)
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
