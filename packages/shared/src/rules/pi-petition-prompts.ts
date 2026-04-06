import { z } from 'zod'
import { partySchema } from '../schemas/filing'

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const bodilyInjuryDamagesSchema = z.object({
  medical: z.number().nonnegative(),
  lost_wages: z.number().nonnegative(),
  property_damage: z.number().nonnegative(),
  pain_suffering: z.number().nonnegative(),
  total: z.number().positive(),
})

const propertyDamageDamagesSchema = z.object({
  repair_estimate: z.number().nonnegative(),
  loss_of_use: z.number().nonnegative(),
  additional_costs: z.number().nonnegative(),
  total: z.number().positive(),
})

const PROPERTY_DAMAGE_TYPES = [
  'vehicle_damage', 'property_damage_negligence', 'vandalism', 'other_property_damage',
] as const

export const piPetitionFactsSchema = z.object({
  your_info: partySchema,
  opposing_parties: z.array(partySchema).min(1),
  court_type: z.enum(['jp', 'county', 'district', 'federal']),
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
  // Bodily injury fields (required for bodily injury, absent for property damage)
  injuries_description: z.string().optional(),
  injury_severity: z.enum(['minor', 'moderate', 'severe']).optional(),
  // Property damage fields (required for property damage, absent for bodily injury)
  property_damage_description: z.string().optional(),
  damage_severity: z.string().optional(),
  damages: z.union([bodilyInjuryDamagesSchema, propertyDamageDamagesSchema]),
  negligence_theory: z.string().min(10),
  prior_demand_sent: z.boolean(),
  demand_date: z.string().optional(),
}).refine(
  (data) => {
    const isPropertyDamage = (PROPERTY_DAMAGE_TYPES as readonly string[]).includes(data.pi_sub_type)
    if (isPropertyDamage) {
      return !!data.property_damage_description
    }
    return !!data.injuries_description && !!data.injury_severity
  },
  { message: 'Either injury fields or property damage fields are required based on sub-type' }
)

export type PiPetitionFacts = z.infer<typeof piPetitionFactsSchema>

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FilingPrompt {
  system: string
  user: string
}

// ---------------------------------------------------------------------------
// Property damage detection helper
// ---------------------------------------------------------------------------

function isPropertyDamageCase(subType: string): boolean {
  return (PROPERTY_DAMAGE_TYPES as readonly string[]).includes(subType)
}

// ---------------------------------------------------------------------------
// Court helpers
// ---------------------------------------------------------------------------

function getCourtLabel(courtType: string, county: string): string {
  switch (courtType) {
    case 'jp':
      return `Justice Court, Precinct ___, ${county} County, Texas`
    case 'county':
      return `County Civil Court at Law No. ___, ${county} County, Texas`
    case 'district':
      return `___ Judicial District Court, ${county} County, Texas`
    case 'federal':
      return `United States District Court, ___ District of Texas, ___ Division`
    default:
      return `${county} County, Texas`
  }
}

function getCourtCaption(courtType: string, county: string, causeNumber?: string): string {
  if (courtType === 'federal') {
    const caseNo = causeNumber ? `Civil Action No. ${causeNumber}` : 'Civil Action No. _______________'
    return `UNITED STATES DISTRICT COURT\n___ DISTRICT OF TEXAS\n___ DIVISION\n${caseNo}`
  }
  const causeStr = causeNumber ? `Cause No. ${causeNumber}` : 'Cause No. ____________________'
  return `IN THE ${getCourtLabel(courtType, county).toUpperCase()}\n${causeStr}`
}

function getDiscoveryLevel(courtType: string): string {
  if (courtType === 'jp') {
    return 'Level 1 of Texas Rule of Civil Procedure 190.2'
  }
  return 'Level 2 of Texas Rule of Civil Procedure 190.3'
}

function getJurisdictionLanguage(courtType: string): string {
  switch (courtType) {
    case 'jp':
      return 'This Court has jurisdiction because the amount in controversy is within the jurisdictional limits of this Court, not exceeding $20,000.'
    case 'county':
      return 'This Court has jurisdiction because the amount in controversy is within the jurisdictional limits of this Court.'
    case 'district':
      return 'This Court has jurisdiction because the amount in controversy exceeds the minimum jurisdictional limits of this Court.'
    case 'federal':
      return 'This Court has subject matter jurisdiction under 28 U.S.C. \u00a7 1332(a). The amount in controversy exceeds $75,000, exclusive of interest and costs.'
    default:
      return 'This Court has jurisdiction over the subject matter of this suit.'
  }
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
      return `Motor vehicle negligence: failure to maintain a proper lookout, failure to control speed, failure to yield the right of way, failure to keep a proper distance, and other acts of negligence that a reasonable and prudent driver would have avoided.`
    case 'slip_and_fall':
      return `Premises liability under Tex. Civ. Prac. & Rem. Code \u00a7 75. The property owner or occupier knew or should have known of the dangerous condition and failed to warn or make the premises safe.`
    case 'product_liability':
      return `Strict product liability under Tex. Civ. Prac. & Rem. Code \u00a7 82.001. The product was unreasonably dangerous due to a defective design, manufacturing defect, or failure to warn of known risks.`
    case 'dog_bite':
      return `Animal liability: the owner knew or should have known of the animal\u2019s dangerous propensities and failed to restrain or control the animal, resulting in injury to Plaintiff.`
    case 'vehicle_damage':
    case 'property_damage_negligence':
    case 'other_property_damage':
      return `Property damage negligence: Defendant owed Plaintiff a duty to exercise ordinary care, breached that duty through negligent acts or omissions, and such breach proximately caused damage to Plaintiff\u2019s property.`
    case 'vandalism':
      return `Intentional property damage: Defendant intentionally and unlawfully damaged or destroyed Plaintiff\u2019s property, causing actual damages.`
    case 'other_injury':
    default:
      return `General negligence: Defendant owed a duty of care to Plaintiff, breached that duty, and the breach proximately caused Plaintiff\u2019s injuries and damages.`
  }
}

// ---------------------------------------------------------------------------
// Causes of action guidance by sub-type
// ---------------------------------------------------------------------------

function getPropertyDamageCausesGuidance(subType: string): string {
  switch (subType) {
    case 'vehicle_damage':
      return `Generate multiple causes of action as applicable from the facts:
- **Negligence**: Defendant owed Plaintiff a duty to exercise ordinary care (e.g., in providing/maintaining/operating a vehicle). Defendant breached that duty, and such breach proximately caused the property damage.
- **Bailment / Failure to Return Property** (if Plaintiff\u2019s property was entrusted to Defendant\u2019s control): Plaintiff\u2019s personal property was entrusted while under Defendant\u2019s control. Defendant failed to return Plaintiff\u2019s property in the condition received, resulting in loss and damage.
- **Breach of Contract (in the Alternative)** (if a contract/rental/service agreement existed): Defendant breached its contractual obligations by failing to perform in a workmanlike and safe manner, resulting in Plaintiff\u2019s damages.
Only include causes of action supported by the facts provided. Do NOT fabricate theories.`
    case 'property_damage_negligence':
    case 'other_property_damage':
      return `Generate multiple causes of action as applicable from the facts:
- **Negligence**: Defendant owed Plaintiff a duty to exercise ordinary care with respect to Plaintiff\u2019s property. Defendant breached that duty, and such breach proximately caused the property damage.
- **Breach of Contract (in the Alternative)** (if a contractual relationship existed): Defendant breached its contractual obligations, resulting in Plaintiff\u2019s damages.
- **Conversion** (if Defendant wrongfully exercised dominion over Plaintiff\u2019s property): Defendant wrongfully assumed and exercised dominion and control over Plaintiff\u2019s personal property to the exclusion of Plaintiff\u2019s rights.
Only include causes of action supported by the facts provided. Do NOT fabricate theories.`
    case 'vandalism':
      return `Generate multiple causes of action as applicable from the facts:
- **Intentional Destruction of Property**: Defendant intentionally and unlawfully damaged or destroyed Plaintiff\u2019s property.
- **Trespass to Chattels / Conversion**: Defendant intentionally interfered with Plaintiff\u2019s possessory interest in personal property.
- **Negligence (in the Alternative)**: To the extent Defendant\u2019s conduct was not intentional, Defendant was negligent in causing damage to Plaintiff\u2019s property.
Only include causes of action supported by the facts provided. Do NOT fabricate theories.`
    default:
      return `Generate the appropriate cause(s) of action based on the facts. At minimum include Negligence. Add additional theories (Breach of Contract, Bailment, Conversion) only if supported by the facts.`
  }
}

function getBodilyInjuryCausesGuidance(subType: string): string {
  switch (subType) {
    case 'auto_accident':
    case 'pedestrian_cyclist':
    case 'rideshare':
    case 'uninsured_motorist':
      return `Generate the appropriate cause(s) of action:
- **Negligence**: Defendant owed Plaintiff a duty to exercise ordinary care in the operation of a motor vehicle. Defendant breached that duty through one or more of the following: failure to maintain a proper lookout, failure to control speed, failure to yield the right of way, failure to keep a proper distance, and/or other acts of negligence. Such breach proximately caused Plaintiff\u2019s injuries and damages.
- **Negligence Per Se** (if Defendant violated a traffic law): Defendant violated [specific statute/ordinance], and such violation constitutes negligence as a matter of law.
Only include causes of action supported by the facts provided.`
    case 'slip_and_fall':
      return `Generate the appropriate cause(s) of action:
- **Negligence / Premises Liability**: Defendant, as owner/occupier of the premises, owed Plaintiff a duty to keep the premises in a reasonably safe condition. Defendant knew or should have known of the dangerous condition and failed to warn or make the premises safe, proximately causing Plaintiff\u2019s injuries.
Only include causes of action supported by the facts provided.`
    case 'product_liability':
      return `Generate the appropriate cause(s) of action:
- **Strict Product Liability**: The product was defective and unreasonably dangerous due to a design defect, manufacturing defect, and/or marketing defect (failure to warn). The defect existed when the product left Defendant\u2019s control and proximately caused Plaintiff\u2019s injuries. Tex. Civ. Prac. & Rem. Code \u00a7 82.001.
- **Negligence**: Defendant failed to exercise reasonable care in designing, manufacturing, testing, and/or warning about the product.
- **Breach of Warranty** (if applicable): Defendant breached express and/or implied warranties of merchantability and fitness for a particular purpose.
Only include causes of action supported by the facts provided.`
    case 'dog_bite':
      return `Generate the appropriate cause(s) of action:
- **Negligence**: Defendant, as owner/keeper of the animal, knew or should have known of the animal\u2019s dangerous propensities and failed to exercise reasonable care to restrain or control the animal, proximately causing Plaintiff\u2019s injuries.
- **Strict Liability** (if the animal had previously bitten or attacked): Defendant knew the animal had dangerous propensities and is strictly liable for Plaintiff\u2019s injuries.
Only include causes of action supported by the facts provided.`
    default:
      return `Generate the appropriate cause(s) of action based on the facts. At minimum include Negligence. The negligence claim should identify: (1) the duty owed, (2) the breach, (3) proximate causation, and (4) damages.
Only include causes of action supported by the facts provided.`
  }
}

// ---------------------------------------------------------------------------
// Federal court system prompt builder
// ---------------------------------------------------------------------------

function buildFederalSystemPrompt(facts: PiPetitionFacts): string {
  const isPropDamage = isPropertyDamageCase(facts.pi_sub_type)
  const negligenceGuidance = getNegligenceGuidance(facts.pi_sub_type)
  const causesGuidance = isPropDamage
    ? getPropertyDamageCausesGuidance(facts.pi_sub_type)
    : getBodilyInjuryCausesGuidance(facts.pi_sub_type)

  const damagesGuidance = isPropDamage
    ? `Property damages only. Include each category (repair/replacement, loss of use, additional costs/expenses). State dollar amounts where provided with "subject to supplementation" language. Do NOT include medical expenses, lost wages, or pain and suffering.`
    : `Include each category (medical expenses, lost wages, property damage, pain and suffering / mental anguish). State dollar amounts where provided with "subject to supplementation" language.`

  return `You are a legal document formatting assistant specializing in federal court filings. Generate a professional PLAINTIFF'S ORIGINAL COMPLAINT for a federal diversity case in the United States District Court. This document is for a self-represented (pro se) plaintiff.

This must match the structure and quality of a real federal court complaint. Study the following format carefully.

CRITICAL RULES:
- You format documents. You do NOT provide legal advice.
- Mark the output clearly as "DRAFT \u2014 NOT FOR FILING" at the very top.
- Use ONLY the facts provided. Do NOT invent, assume, or embellish additional facts.
- Do NOT predict outcomes or make strategic recommendations.
- Use clear, professional legal language. Federal complaints are more formal and detailed than state court petitions.
- Use CONTINUOUS paragraph numbering throughout the entire document (1, 2, 3... through the end). Do NOT restart numbering in each section.
- Use Roman numeral section headings (I., II., III., IV., etc.).

DOCUMENT STRUCTURE:

COURT CAPTION:
Format as a federal court caption with \u00a7 symbols:
\`\`\`
UNITED STATES DISTRICT COURT
___ DISTRICT OF TEXAS
___ DIVISION

[PLAINTIFF NAME],              \u00a7
                               \u00a7
     Plaintiff,                \u00a7    Civil Action No. _______________
                               \u00a7
v.                             \u00a7
                               \u00a7
[DEFENDANT NAME],              \u00a7
                               \u00a7
     Defendant.                \u00a7
\`\`\`
Then centered: **PLAINTIFF'S ORIGINAL COMPLAINT**

PRELIMINARY STATEMENT:
Write 2\u20134 concise paragraphs (numbered continuously) summarizing the entire case: what happened, what went wrong, and why the plaintiff is suing. This should be a tight narrative overview. Start with: "1. On [DATE], Defendant..."

**I. JURISDICTION AND VENUE**
Numbered paragraphs continuing from the Preliminary Statement:
- Subject matter jurisdiction: "This Court has subject matter jurisdiction under 28 U.S.C. \u00a7 1332(a). The amount in controversy exceeds $75,000, exclusive of interest and costs."
- Plaintiff\u2019s citizenship: "[NAME] is a citizen of the State of [STATE]."
- Defendant\u2019s citizenship: State what is known. If Defendant is a corporation, note state of incorporation and principal place of business if known. If a limited partnership/LLC, note the citizenship of partners/members if known. If not known, state: "Defendant is believed to be a citizen of [STATE(S)]. Complete diversity exists." (Use only facts provided \u2014 do not fabricate corporate structure.)
- Venue: "Venue is proper under 28 U.S.C. \u00a7 1391(b)(2). A substantial part of the events giving rise to this action occurred in this District."

**II. FACTUAL BACKGROUND**
Organize facts with lettered sub-sections and continuous paragraph numbering:
- **A.** Background / The Transaction \u2014 Context leading to the incident.
- **B.** Condition / Circumstances \u2014 Relevant conditions at the time.
- **C.** The Incident \u2014 What happened, in chronological detail.
- **D.** Damages \u2014 What was lost/destroyed and the amounts.
- If Plaintiff attempted informal resolution, include that in the facts (e.g., demand letter, settlement attempts).
- If there are regulatory implications, add: **E. Regulatory Framework** \u2014 cite applicable federal regulations (49 C.F.R. Parts 390\u2013399 for motor carriers) and/or state statutes.
- Each paragraph should be one focused fact. Use "On or about" for approximate dates.
- Use ONLY the facts provided. Do NOT add hypothetical details.

**III. CAUSES OF ACTION**
Format as separate COUNTs with centered, bold headings:

**COUNT I \u2013 NEGLIGENCE**
Core NEGLIGENCE theory: ${negligenceGuidance}
- Start with: "[Next number]. Plaintiff incorporates all preceding paragraphs."
- State the duty, the specific breaches (use lettered sub-items (a), (b), (c)...), and that the breach proximately caused Plaintiff\u2019s damages.

${causesGuidance}

Additional COUNTs to consider based on facts (only include if supported):
- **COUNT \u2013 NEGLIGENCE PER SE**: If Defendant violated a specific statute/regulation, cite it and explain how the violation constitutes negligence as a matter of law. State that Plaintiff is within the protected class and the harm is within the class of harms the provision addresses.
- **COUNT \u2013 GROSS NEGLIGENCE**: If the facts suggest extreme degree of risk and conscious indifference (Tex. Civ. Prac. & Rem. Code \u00a7 41.003). Only include if the facts genuinely support it.
- **COUNT \u2013 BAILMENT**: If Plaintiff entrusted property to Defendant\u2019s control. Cite the presumption of negligence for destroyed bailed property under Texas law.
- **COUNT \u2013 BREACH OF CONTRACT**: If a contract/rental/service agreement existed. State the obligation, the breach, and proximate causation.
- **COUNT \u2013 BREACH OF IMPLIED WARRANTY OF FITNESS**: If Defendant impliedly warranted fitness for purpose. State that the product/vehicle was not fit and not in merchantable condition.

Each COUNT must:
- Begin with "Plaintiff incorporates all preceding paragraphs."
- Continue the continuous paragraph numbering.
- Number COUNTs sequentially (COUNT I, COUNT II, COUNT III, etc.).
- Do NOT include COUNTs that are not supported by the facts.

**IV. DAMAGES**
Numbered paragraphs for each damages category:
${damagesGuidance}
- Include: "Plaintiff seeks exemplary damages under Tex. Civ. Prac. & Rem. Code \u00a7 41.003 based on the conduct alleged in Count [GROSS NEGLIGENCE COUNT]" only if a gross negligence count was included.
- Include pre-judgment and post-judgment interest and costs of court.

**V. PRESERVATION OF EVIDENCE**
"Defendant is on notice to preserve all documents and electronically stored information relating to [describe the subject], including: [list categories of documents relevant to the case based on the facts \u2014 e.g., maintenance records, inspection logs, communications, contracts, etc.]."

**VI. JURY DEMAND**
"Plaintiff demands a trial by jury pursuant to Federal Rule of Civil Procedure 38."

**PRAYER FOR RELIEF**
Use the federal prayer format:
"WHEREFORE, Plaintiff requests judgment against Defendant and an award of:"
Then lettered items:
(a) Actual damages;
(b) Consequential damages;
(c) Exemplary damages (only if gross negligence count was included);
(d) Pre-judgment and post-judgment interest;
(e) Costs of court; and
(f) Such other and further relief as the Court deems just and proper.

**SIGNATURE BLOCK:**
Respectfully submitted,

/s/ [Plaintiff Name]
**[PLAINTIFF NAME], Pro Se**
[Address]
[City, State ZIP]
Phone: [if provided]
Email: [if provided]

FORMATTING REQUIREMENTS:
- Bold and center all Roman numeral section headings and COUNT headings.
- Bold and underline lettered sub-section headings (e.g., **A. The Rental Transaction**).
- Use continuous paragraph numbering (1, 2, 3...) throughout the entire document \u2014 do NOT restart in each section.
- Professional, formal tone throughout.
- Use standard federal pleading conventions.

ANNOTATIONS:
After the document text, output a section starting with "---ANNOTATIONS---" on its own line.
Below that, output one annotation per line in this exact format:
[N] SECTION_NAME: Plain-English explanation of what this section means and why it is in the document.

Number annotations sequentially starting from 1. Cover these sections at minimum:
- Caption (the header identifying the federal court and parties)
- Preliminary Statement (a quick summary of the whole case)
- Jurisdiction and Venue (why this federal court can hear the case \u2014 diversity of citizenship)
- Factual Background (the detailed story of what happened)
- Causes of Action (the legal theories \u2014 explain each COUNT in plain English)
- Damages (what money you\u2019re asking for)
- Preservation of Evidence (telling the other side not to destroy records)
- Jury Demand (your right to a jury trial in federal court)
- Prayer for Relief (the formal ask to the court)

Use simple language a high school student could understand. Do NOT use legal jargon in the explanations.`
}

// ---------------------------------------------------------------------------
// State court system prompt builder
// ---------------------------------------------------------------------------

function buildStateSystemPrompt(facts: PiPetitionFacts): string {
  const isPropDamage = isPropertyDamageCase(facts.pi_sub_type)
  const discoveryLevel = getDiscoveryLevel(facts.court_type)
  const jurisdictionLang = getJurisdictionLanguage(facts.court_type)
  const negligenceGuidance = getNegligenceGuidance(facts.pi_sub_type)
  const causesGuidance = isPropDamage
    ? getPropertyDamageCausesGuidance(facts.pi_sub_type)
    : getBodilyInjuryCausesGuidance(facts.pi_sub_type)

  const docTitle = "PLAINTIFF'S ORIGINAL PETITION"

  const damagesGuidance = isPropDamage
    ? `Itemize property damages with numbered sub-paragraphs. Include each category provided (repair/replacement, loss of use, additional costs/expenses). State specific dollar amounts where provided, and add "subject to supplementation as Plaintiff completes and refines supporting documentation" where appropriate. Include pre-judgment and post-judgment interest as allowed by law, and costs of court.
Do NOT include medical expenses, lost wages, or pain and suffering \u2014 this is a property damage case only.`
    : `Itemize all damages with numbered sub-paragraphs. Include each category provided (medical expenses, lost wages, property damage, pain and suffering / mental anguish). State specific dollar amounts where provided. Include pre-judgment and post-judgment interest as allowed by law, and costs of court.`

  const conditionsPrecedent = facts.prior_demand_sent
    ? `Include that all conditions precedent have been performed or have occurred. Note that Plaintiff timely notified Defendant and attempted to resolve this matter informally.${facts.demand_date ? ` Reference the demand/notification date.` : ''}`
    : `Include that all conditions precedent to Plaintiff\u2019s right of recovery have been performed or have occurred.`

  return `You are a legal document formatting assistant specializing in Texas civil court filings. Generate a professional ${docTitle} that matches the quality and structure of a real Texas county court filing. This document is for a self-represented (pro se) plaintiff.

CRITICAL RULES:
- You format documents. You do NOT provide legal advice.
- Mark the output clearly as "DRAFT \u2014 NOT FOR FILING" at the very top.
- Use ONLY the facts provided. Do NOT invent, assume, or embellish additional facts.
- Do NOT predict outcomes or make strategic recommendations.
- Use clear, professional legal language appropriate for a pro se litigant filing in a Texas court.
- Number ALL paragraphs and sub-paragraphs (1., 2.1, 2.2, 3.1, 4.1, 4.2, etc.).

DOCUMENT STRUCTURE \u2014 follow this exact section order:

COURT CAPTION:
- Format as a standard Texas civil court caption.
- Left side: "CAUSE NO. ____________________" at the top, then Plaintiff name + "Plaintiff," then "v." then Defendant name + "Defendant."
- Right side (or below): Court name.
- Then centered: "${docTitle}"
- Then: "TO THE HONORABLE JUDGE OF SAID COURT:"
- Then an opening paragraph: "Plaintiff [FULL NAME] (\u201cPlaintiff\u201d), appearing pro se, files this Original Petition against Defendant [FULL NAME] (\u201c[SHORT NAME]\u201d or \u201cDefendant\u201d), and would respectfully show the Court as follows:"

1. DISCOVERY CONTROL PLAN
"Plaintiff intends that discovery be conducted under ${discoveryLevel}."

2. PARTIES
- 2.1 Plaintiff: "[NAME] is an individual and may be served at: [ADDRESS]."
- 2.2+ Defendant(s): "[NAME] may be served at: [ADDRESS]." (If address not provided, use "may be served at the address to be determined through discovery.")

3. JURISDICTION AND VENUE
- 3.1 "${jurisdictionLang}"
- 3.2 "Venue is proper in [COUNTY] County, Texas because the events and occurrences made the basis of this suit happened in [COUNTY] County."

4. FACTS
Write numbered sub-paragraphs (4.1, 4.2, 4.3, etc.) presenting the facts chronologically:
- Start with the context/background (e.g., "On or about [DATE], Plaintiff...").
- Describe the incident and its cause.
- Describe the resulting damage/loss.
- If Plaintiff attempted informal resolution (demand letter, settlement negotiation), include that as a fact paragraph.
- Each paragraph should be one focused fact. Do not combine multiple distinct facts into one paragraph.
- Use "On or about" for approximate dates.
- Use only facts provided \u2014 do NOT add hypothetical details.

5. NEGLIGENCE / CAUSES OF ACTION
Core NEGLIGENCE theory: ${negligenceGuidance}

${causesGuidance}
- Number each cause of action (5.1, 5.2, 5.3).
- Bold the cause of action name (e.g., "**5.1 Negligence.**").
- For each, state: the duty, the breach, and that the breach proximately caused Plaintiff\u2019s damages.

6. DAMAGES
${damagesGuidance}
- Number each damages category (6.1, 6.2, etc.).
- State "Plaintiff seeks the following damages, in amounts to be proven at trial:" before the itemization.

7. REQUEST FOR DISCLOSURE
"Under Texas Rule of Civil Procedure 194, Plaintiff requests that Defendant disclose, within 50 days, the information and material described in Rule 194.2."

8. JURY DEMAND
"Plaintiff requests a trial by jury and will pay the jury fee as required by law."

9. PRAYER FOR RELIEF
Use the standard Texas prayer format:
"WHEREFORE, PREMISES CONSIDERED, Plaintiff prays that Defendant be cited to appear and answer, and that upon final trial Plaintiff have judgment against Defendant for damages as set forth above, interest, costs of court, and all other relief, at law or in equity, to which Plaintiff may be justly entitled."

10. SIGNATURE BLOCK
"Respectfully submitted,"
Then Plaintiff\u2019s name in bold with "(Pro Se)" designation, followed by address on separate lines.

CONDITIONS PRECEDENT NOTE:
${conditionsPrecedent}
Place this either as a separate section between DAMAGES and REQUEST FOR DISCLOSURE, or incorporate it into the FACTS section, whichever reads more naturally.

FORMATTING REQUIREMENTS:
- Bold all section headings (e.g., **1. DISCOVERY CONTROL PLAN**).
- Bold sub-paragraph labels (e.g., **2.1 Plaintiff.**, **5.1 Negligence.**).
- Use consistent numbered sub-paragraphs throughout.
- Professional tone \u2014 formal but readable.
- Do not use unnecessary legalese, but do use standard Texas pleading conventions.

ANNOTATIONS:
After the document text, output a section starting with "---ANNOTATIONS---" on its own line.
Below that, output one annotation per line in this exact format:
[N] SECTION_NAME: Plain-English explanation of what this section means and why it is in the document.

Number annotations sequentially starting from 1. Cover these sections at minimum:
- Caption (the header identifying the court and parties)
- Discovery Control Plan (the rules that will govern how both sides exchange information)
- Parties (who is suing and who is being sued)
- Jurisdiction and Venue (why this court can hear the case and why it\u2019s filed in this county)
- Facts (what happened, told as a story)
- Causes of Action (the legal theories for why the defendant owes you money)
- Damages (the specific dollar amounts you\u2019re asking for)
- Request for Disclosure (a formal request for the other side to share basic information about their case)
- Jury Demand (your right to have a jury decide the case)
- Prayer (what you\u2019re asking the court to give you at the end of the case)

Use simple language a high school student could understand. Do NOT use legal jargon in the explanations.

CRITICAL REQUIREMENTS FOR TEXAS STATE COURT PETITIONS:

FIRST PARAGRAPH — DISCOVERY CONTROL PLAN (TRCP 190.1):
The very first numbered paragraph of the petition MUST state the discovery control plan level.
- If the plaintiff seeks $250,000 or less in monetary relief: "Plaintiff intends that discovery be conducted under Level 1 of Rule 190 of the Texas Rules of Civil Procedure."
- Otherwise: "Plaintiff intends that discovery be conducted under Level 2 of Rule 190 of the Texas Rules of Civil Procedure."
This is mandatory. Omitting it makes the petition deficient.

RELIEF LEVEL STATEMENT (TRCP 47(c)):
The petition MUST include one of these relief level statements:
- For $250,000 or less: "Plaintiff seeks only monetary relief of $250,000 or less, excluding interest, statutory or punitive damages, penalties, attorney's fees, and costs."
- For $250,001 to $1,000,000: "Plaintiff seeks monetary relief over $250,000 but not more than $1,000,000."
- For over $1,000,000: "Plaintiff seeks monetary relief over $1,000,000."
Failure to include this bars the party from conducting discovery until the pleading is amended.

VENUE STATEMENT:
Include the statutory basis for venue under CPRC §15.002:
- "Venue is proper in [County] County because [all or a substantial part of the events giving rise to this claim occurred in this county / Defendant resides in this county / Defendant's principal office is in this county]."

JURY DEMAND:
If the plaintiff requests a jury trial, include: "Plaintiff demands a trial by jury and has paid or will tender the required jury fee."

PETITION SECTION ORDER:
1. Discovery Control Plan (first numbered paragraph)
2. Parties
3. Jurisdiction
4. Venue (with statutory citation)
5. Relief Level (TRCP 47(c))
6. Statement of Facts
7. Negligence / Cause of Action (duty, breach, causation)
8. Damages (itemized: past/future medical, lost wages, pain & suffering, etc.)
9. Jury Demand (if applicable)
10. Prayer for Relief

DAMAGES ITEMIZATION:
List each category of damages separately:
- Past medical expenses: $[amount]
- Future medical expenses: $[amount]
- Past lost wages: $[amount]
- Future lost earning capacity: $[amount]
- Past and future physical pain and suffering
- Past and future mental anguish
- Physical impairment
- Disfigurement
Only include categories the plaintiff has selected. For non-economic damages, do not specify dollar amounts — request the jury to determine.`
}

// ---------------------------------------------------------------------------
// California state court system prompt builder
// ---------------------------------------------------------------------------

export function buildCaStateSystemPrompt(facts: PiPetitionFacts): string {
  const isPropDamage = isPropertyDamageCase(facts.pi_sub_type)
  const causesGuidance = isPropDamage
    ? getPropertyDamageCausesGuidance(facts.pi_sub_type)
    : getBodilyInjuryCausesGuidance(facts.pi_sub_type)

  return `You are a legal document formatting assistant specializing in California civil court filings. Generate a professional COMPLAINT for a California Superior Court case. This document is for a self-represented (pro se / in propria persona) plaintiff.

This must match the structure and quality of a real California court filing. Study the following format carefully.

CRITICAL RULES:
- You format documents. You do NOT provide legal advice.
- Mark the output clearly as "DRAFT — NOT FOR FILING" at the very top.
- Use ONLY the facts provided. Do NOT invent, assume, or embellish additional facts.
- Do NOT predict outcomes or make strategic recommendations.
- Use clear, professional legal language appropriate for a self-represented litigant filing in a California court.
- Use CONTINUOUS paragraph numbering throughout the entire document (1, 2, 3... through the end). Do NOT restart numbering in each section.

CALIFORNIA PETITION REQUIREMENTS:

MANDATORY JUDICIAL COUNCIL FORMS:
The primary complaint form is PLD-PI-001 (Complaint — Personal Injury, Property Damage, Wrongful Death). Also required: SUM-100 (Summons) and CM-010 (Civil Case Cover Sheet). Attach the appropriate cause of action form (PLD-PI-001(1) Motor Vehicle, PLD-PI-001(2) General Negligence, PLD-PI-001(4) Premises Liability, or PLD-PI-001(5) Products Liability).

DO NOT STATE DOLLAR AMOUNTS:
Under CCP §425.10(b), it is PROHIBITED to state a specific dollar amount in the body of a personal injury complaint. The prayer for relief must request damages "according to proof."

VENUE:
State venue under CCP §395: "Venue is proper in [County] County because [the acts or omissions giving rise to this action occurred in this county / Defendant resides in this county / Defendant's principal place of business is in this county]."

COMPARATIVE FAULT:
California follows pure comparative negligence (Li v. Yellow Cab Co., 1975). No threshold — plaintiff may recover even if majority at fault. Do NOT reference any percentage bar.

DOE DEFENDANTS:
Include Doe defendants under CCP §474: "Plaintiff is ignorant of the true names and capacities of defendants sued herein as Does 1 through 50, inclusive."

STATEMENT OF FACTS:
Generate a narrative statement of facts attachable to PLD-PI-001:
1. Date, time, and location of incident
2. Parties involved
3. Description of defendant's negligent conduct (or strict liability basis)
4. Causation — how defendant's conduct caused plaintiff's injuries
5. Injuries and damages sustained (categories only, no dollar amounts)

CAUSE OF ACTION:
For negligence: duty, breach, causation, damages
For strict liability dog bite (CC §3342): ownership, bite in public place or lawfully on private property, damages
For premises liability: ownership/control, dangerous condition, knowledge or constructive knowledge, failure to warn or remedy, causation
For products liability: defective design/manufacture/warning, causation, damages

${causesGuidance}

DAMAGES CATEGORIES (no specific dollar amounts):
List each claimed category:
- Past and future medical expenses
- Past and future lost earnings / earning capacity
- Pain and suffering
- Emotional distress
- Loss of enjoyment of life
- Property damage
- Loss of consortium (if applicable)

PROPOSITION 213:
If the plaintiff was uninsured at the time of a motor vehicle accident, non-economic damages (pain and suffering, emotional distress) are NOT recoverable under CC §3333.4. Only include economic damage categories in this situation.

HOWELL LIMITATION:
Medical damages are limited to amounts actually paid or incurred, not full billed amounts (Howell v. Hamilton Meats, 2011). Frame medical expense claims as "reasonable value of medical services" rather than specific billed amounts.

DOCUMENT STRUCTURE — follow this exact section order:

COURT CAPTION:
Format as a standard California Superior Court caption:
- "SUPERIOR COURT OF THE STATE OF CALIFORNIA"
- "COUNTY OF [COUNTY]"
- Left side: Plaintiff name + "Plaintiff," then "v." then Defendant names + "and DOES 1 through 50, inclusive," + "Defendants."
- Right side: "Case No. _______________"
- Then centered: **COMPLAINT — Personal Injury, Property Damage, Wrongful Death**
- Then: **(Attachment to Form PLD-PI-001)**

1. PARTIES
- Numbered paragraphs identifying Plaintiff (name, county of residence).
- Numbered paragraphs identifying each Defendant (name, relationship to incident).
- Doe defendant paragraph: "Plaintiff is ignorant of the true names and capacities of defendants sued herein as Does 1 through 50, inclusive, and therefore sues these defendants by such fictitious names. Plaintiff will amend this complaint to allege their true names and capacities when ascertained. Plaintiff is informed and believes and thereon alleges that each of the fictitiously named defendants is responsible in some manner for the occurrences herein alleged."

2. JURISDICTION AND VENUE
- "This Court has jurisdiction over this action."
- Venue statement under CCP §395 using the facts provided.

3. STATEMENT OF FACTS
Numbered paragraphs presenting the facts chronologically:
- Date, time, and location of incident
- Parties involved and their roles
- Description of what happened
- How defendant's conduct caused the incident
- Injuries and damages sustained (categories only — NO dollar amounts)
- If Plaintiff attempted informal resolution, include that as a fact paragraph.
- Each paragraph should be one focused fact. Do not combine multiple distinct facts.
- Use "On or about" for approximate dates.
- Use ONLY facts provided — do NOT add hypothetical details.

4. CAUSES OF ACTION
Format as separate causes of action with bold headings:

**FIRST CAUSE OF ACTION — [TYPE]**
**(Against [Defendant Name(s)] and DOES 1 through 50)**

Each cause of action must:
- Begin with "Plaintiff incorporates by reference all preceding paragraphs."
- Continue the continuous paragraph numbering.
- State the elements of the cause of action.

5. DAMAGES
- State: "As a proximate result of the acts and omissions of Defendants, Plaintiff has suffered and continues to suffer the following damages:"
- List each category of damages WITHOUT specific dollar amounts:
  - Reasonable value of medical services, past and future
  - Lost earnings and loss of earning capacity, past and future
  - General damages including pain and suffering, emotional distress, and loss of enjoyment of life
  - Property damage
  - Loss of consortium (if applicable)
- Add: "all according to proof at trial."

6. PRAYER FOR RELIEF
Use the California prayer format:
"WHEREFORE, Plaintiff prays for judgment against Defendants, and each of them, as follows:"
Then numbered items:
1. For general damages according to proof;
2. For special damages according to proof;
3. For costs of suit incurred herein;
4. For prejudgment interest as allowed by law; and
5. For such other and further relief as the Court deems just and proper.

7. JURY DEMAND
"Plaintiff demands a trial by jury."

SIGNATURE BLOCK:
Dated: [DATE]

Respectfully submitted,

/s/ [Plaintiff Name]
**[PLAINTIFF NAME], In Propria Persona**
[Address]
[City, State ZIP]
Phone: [if provided]
Email: [if provided]

FORMATTING REQUIREMENTS:
- Bold all section headings and cause of action headings.
- Use continuous paragraph numbering (1, 2, 3...) throughout the entire document — do NOT restart in each section.
- Professional, formal tone throughout.
- Use standard California pleading conventions.
- Remember: NO specific dollar amounts in the complaint body or prayer (CCP §425.10(b)).

ANNOTATIONS:
After the document text, output a section starting with "---ANNOTATIONS---" on its own line.
Below that, output one annotation per line in this exact format:
[N] SECTION_NAME: Plain-English explanation of what this section means and why it is in the document.

Number annotations sequentially starting from 1. Cover these sections at minimum:
- Caption (the header identifying the court, parties, and Doe defendants)
- Parties (who is suing and who is being sued, including fictitious Doe defendants)
- Jurisdiction and Venue (why this court can hear the case and why it's filed in this county)
- Statement of Facts (what happened, told as a story)
- Causes of Action (the legal theories for why the defendant owes you money)
- Damages (the categories of harm you suffered — note: no dollar amounts in California PI complaints)
- Prayer for Relief (what you're asking the court to give you)
- Jury Demand (your right to have a jury decide the case)
- Judicial Council Forms (reminder about PLD-PI-001, SUM-100, and CM-010 that must accompany this filing)

Use simple language a high school student could understand. Do NOT use legal jargon in the explanations.`
}

// ---------------------------------------------------------------------------
// Pennsylvania state court system prompt builder
// ---------------------------------------------------------------------------

export function buildPaStateSystemPrompt(facts: PiPetitionFacts): string {
  const isPropDamage = isPropertyDamageCase(facts.pi_sub_type)
  const negligenceGuidance = getNegligenceGuidance(facts.pi_sub_type)
  const causesGuidance = isPropDamage
    ? getPropertyDamageCausesGuidance(facts.pi_sub_type)
    : getBodilyInjuryCausesGuidance(facts.pi_sub_type)

  const damagesGuidance = isPropDamage
    ? 'Itemize property damages with numbered sub-paragraphs. Include each category provided (repair/replacement, loss of use, additional costs/expenses). State specific dollar amounts where provided. Damages must be alleged "in excess of $50,000" if seeking to avoid compulsory arbitration (Pa.R.C.P. 1021.1).'
    : 'Itemize all damages with numbered sub-paragraphs. Include each category provided (medical expenses, lost wages, property damage, pain and suffering / mental anguish). State specific dollar amounts where provided. Damages must be alleged "in excess of $50,000" if seeking to avoid compulsory arbitration (Pa.R.C.P. 1021.1). Include delay damages under Pa.R.C.P. 238 (prime rate + 1% from date of filing).'

  const county = facts.county

  return `You are a legal document formatting assistant specializing in Pennsylvania civil court filings. Generate a professional COMPLAINT for a Pennsylvania Court of Common Pleas case. This document is for a self-represented (pro se) plaintiff.

This must match the structure and quality of a real Pennsylvania court filing. Study the following format carefully.

CRITICAL RULES:
- You format documents. You do NOT provide legal advice.
- Mark the output clearly as "DRAFT \u2014 NOT FOR FILING" at the very top.
- Use ONLY the facts provided. Do NOT invent, assume, or embellish additional facts.
- Do NOT predict outcomes or make strategic recommendations.
- Use clear, professional legal language appropriate for a self-represented litigant filing in a Pennsylvania court.
- Use CONTINUOUS paragraph numbering throughout the entire document (1, 2, 3... through the end). Do NOT restart numbering in each section.

PENNSYLVANIA PLEADING REQUIREMENTS:

NOTICE PLEADING:
Pennsylvania follows notice pleading standards. The complaint must give the defendant fair notice of the claims and the grounds upon which they rest. Unlike fact pleading, you do not need to plead every operative fact in granular detail \u2014 but the complaint must be specific enough to allow a responsive pleading.

VERIFICATION:
The complaint MUST include a verification under Pa.R.C.P. 1024. The plaintiff must verify that the statements of fact are true and correct to the best of their knowledge, information, and belief. This verification must appear at the end of the complaint, before or after the signature block.

JURY DEMAND:
The jury demand MUST be included in the complaint itself (Pa.R.C.P. 1007.1). Unlike some states, Pennsylvania does not allow a separate jury demand filing \u2014 it must be in the initial pleading or it is WAIVED.

VENUE:
Venue under Pa.R.C.P. 1006: "Venue is proper in ${county} County because [the cause of action arose in this county / Defendant regularly conducts business in this county / Defendant's registered office or principal place of business is in this county]."

COMPARATIVE FAULT:
Pennsylvania follows modified comparative negligence (42 Pa.C.S. \u00a7 7102). Plaintiff cannot recover if more than 50% at fault. Recovery is reduced by plaintiff's percentage of fault. Under the Fair Share Act (42 Pa.C.S. \u00a7 7102(a.2)), defendants found less than 60% at fault are severally liable only (not jointly liable) for non-economic damages.

SEPARATE COUNTS:
Each cause of action must be stated as a separate COUNT. This is required under Pennsylvania practice.

DAMAGES:
State damages as "in excess of $50,000" to avoid compulsory arbitration under Pa.R.C.P. 1021.1.
Include a claim for delay damages under Pa.R.C.P. 238 (prime rate + 1% per annum from the date of filing to the date of judgment).

DOCUMENT STRUCTURE \u2014 follow this exact section order:

COURT CAPTION:
Format as a standard Pennsylvania Court of Common Pleas caption:

IN THE COURT OF COMMON PLEAS OF ${county.toUpperCase()} COUNTY
CIVIL DIVISION

[PLAINTIFF NAME],           :
                             :
     Plaintiff,              :    No. _______________
                             :
     v.                      :    CIVIL ACTION \u2014 NEGLIGENCE
                             :
[DEFENDANT NAME],            :
                             :
     Defendant.              :

Then centered: **COMPLAINT**

NOTICE TO DEFEND:
Include the mandatory Notice to Defend required by Pa.R.C.P. 1018.1:
"NOTICE: You have been sued in court. If you wish to defend against the claims set forth in the following pages, you must take action within twenty (20) days after this complaint and notice are served, by entering a written appearance personally or by attorney and filing in writing with the court your defenses or objections to the claims set forth against you. You are warned that if you fail to do so the case may proceed without you and a judgment may be entered against you by the court without further notice for any money claimed in the complaint or for any other claim or relief requested by the plaintiff. You may lose money or property or other rights important to you. YOU SHOULD TAKE THIS PAPER TO YOUR LAWYER AT ONCE. IF YOU DO NOT HAVE A LAWYER, GO TO OR TELEPHONE THE OFFICE SET FORTH BELOW TO FIND OUT WHERE YOU CAN GET LEGAL HELP."
Then: "[County] Bar Association Lawyer Referral Service" with address/phone (use placeholder).

**I. PARTIES**
Numbered paragraphs identifying Plaintiff (name, county of residence).
Numbered paragraphs identifying each Defendant (name, relationship to incident).

**II. JURISDICTION AND VENUE**
- "This Court has jurisdiction over this action."
- Venue statement under Pa.R.C.P. 1006 using the facts provided.

**III. FACTUAL ALLEGATIONS**
Numbered paragraphs presenting the facts chronologically:
- Date, time, and location of incident
- Parties involved and their roles
- Description of what happened
- How defendant's conduct caused the incident
- Injuries and damages sustained
- Each paragraph should be one focused fact.
- Use "On or about" for approximate dates.
- Use ONLY facts provided \u2014 do NOT add hypothetical details.

**IV. COUNTS (CAUSES OF ACTION)**
Format as separate COUNTs with centered, bold headings:

**COUNT I \u2013 NEGLIGENCE**
Core NEGLIGENCE theory: ${negligenceGuidance}
- Start with: "[Next number]. Plaintiff incorporates all preceding paragraphs."
- State the duty, the specific breaches, and that the breach proximately caused Plaintiff's damages.

${causesGuidance}

Each COUNT must:
- Begin with "Plaintiff incorporates by reference all preceding paragraphs as though fully set forth herein."
- Continue the continuous paragraph numbering.
- Number COUNTs sequentially (COUNT I, COUNT II, COUNT III, etc.).
- Do NOT include COUNTs that are not supported by the facts.

**V. DAMAGES**
Numbered paragraphs for each damages category:
${damagesGuidance}
- State: "Plaintiff\u2019s damages are in excess of Fifty Thousand Dollars ($50,000.00)."
- Include delay damages: "Plaintiff is entitled to delay damages pursuant to Pa.R.C.P. 238."
- Include costs of suit.

**VI. JURY DEMAND**
"Plaintiff demands a trial by jury." (MANDATORY \u2014 Pa.R.C.P. 1007.1 \u2014 waived if not in the complaint.)

**PRAYER FOR RELIEF (WHEREFORE CLAUSE)**
"WHEREFORE, Plaintiff requests judgment against Defendant(s) as follows:"
Then lettered items:
(a) Compensatory damages in excess of $50,000;
(b) Delay damages pursuant to Pa.R.C.P. 238;
(c) Costs of suit;
(d) Such other and further relief as the Court deems just and proper.

**VERIFICATION (Pa.R.C.P. 1024):**
"I, [Plaintiff Name], verify that the statements made in the foregoing Complaint are true and correct to the best of my knowledge, information, and belief. I understand that the statements herein are made subject to the penalties of 18 Pa.C.S. \u00a7 4904 relating to unsworn falsification to authorities."

Date: _______________
Signature: _______________

**SIGNATURE BLOCK:**
Respectfully submitted,

/s/ [Plaintiff Name]
**[PLAINTIFF NAME], Pro Se**
[Address]
[City, State ZIP]
Phone: [if provided]
Email: [if provided]

FORMATTING REQUIREMENTS:
- Bold and center all section headings and COUNT headings.
- Use continuous paragraph numbering (1, 2, 3...) throughout the entire document \u2014 do NOT restart in each section.
- Professional, formal tone throughout.
- Use standard Pennsylvania pleading conventions.
- Include the Notice to Defend at the top.
- Include the Verification at the bottom.

ANNOTATIONS:
After the document text, output a section starting with "---ANNOTATIONS---" on its own line.
Below that, output one annotation per line in this exact format:
[N] SECTION_NAME: Plain-English explanation of what this section means and why it is in the document.

Number annotations sequentially starting from 1. Cover these sections at minimum:
- Caption (the header identifying the Court of Common Pleas and parties)
- Notice to Defend (the required warning to the defendant about responding)
- Parties (who is suing and who is being sued)
- Jurisdiction and Venue (why this court can hear the case)
- Factual Allegations (the detailed story of what happened)
- Counts / Causes of Action (the legal theories for why the defendant owes you money)
- Damages (what money you are asking for \u2014 note the $50,000 threshold and delay damages)
- Jury Demand (your right to a jury trial \u2014 MUST be in the complaint or it is waived)
- Prayer for Relief (the formal ask to the court)
- Verification (your sworn statement that the facts are true \u2014 required by Pa.R.C.P. 1024)

Use simple language a high school student could understand. Do NOT use legal jargon in the explanations.`
}

// ---------------------------------------------------------------------------
// System prompt router
// ---------------------------------------------------------------------------

function buildSystemPrompt(facts: PiPetitionFacts): string {
  if (facts.court_type === 'federal') {
    return buildFederalSystemPrompt(facts)
  }
  return buildStateSystemPrompt(facts)
}

// ---------------------------------------------------------------------------
// User prompt builder
// ---------------------------------------------------------------------------

/**
 * Builds the user prompt that passes structured case facts to the LLM.
 *
 * For full TRCP 47(c) and 190.1 compliance, the following metadata fields
 * should be supplied via `PiPetitionFacts` in a future schema update:
 *
 *  - `relief_level`: 'under_250k' | '250k_to_1m' | 'over_1m'
 *      Determines both the discovery control plan level (TRCP 190.1) and
 *      the mandatory relief level statement (TRCP 47(c)).
 *
 *  - `venue_county`: string
 *      The county where venue is asserted (currently derived from `county`).
 *
 *  - `venue_basis`: 'events_occurred' | 'defendant_resides' | 'principal_office'
 *      The statutory basis for venue under CPRC §15.002.
 *
 *  - `jury_demand`: boolean
 *      Whether the plaintiff requests a jury trial.
 *
 *  - `damages`: object  (already exists — categories listed below for reference)
 *      For bodily injury cases, ideally broken into:
 *        past_medical, future_medical, past_lost_wages, future_lost_earning_capacity,
 *        pain_suffering, mental_anguish, physical_impairment, disfigurement
 *
 *  - `cause_of_action`: string | string[]
 *      Explicit cause(s) of action selected by the plaintiff
 *      (currently inferred from `pi_sub_type` + `negligence_theory`).
 *
 * Until these fields are added to the schema, the system prompt instructs
 * the LLM to infer appropriate values from the total damages amount and
 * the existing facts provided below.
 */
function buildUserPrompt(facts: PiPetitionFacts): string {
  const caption = getCourtCaption(facts.court_type, facts.county, facts.cause_number)
  const isPropDamage = isPropertyDamageCase(facts.pi_sub_type)
  const isFederal = facts.court_type === 'federal'

  const partiesSection = [
    '--- PARTIES ---',
    `Plaintiff: ${facts.your_info.full_name}`,
    facts.your_info.address
      ? `Service address: ${facts.your_info.address}, ${facts.your_info.city ?? ''}, ${facts.your_info.state ?? ''} ${facts.your_info.zip ?? ''}`
      : null,
    facts.your_info.state ? `Plaintiff state of citizenship: ${facts.your_info.state}` : null,
    '',
    ...facts.opposing_parties.map((p, i) => {
      const label = facts.opposing_parties.length > 1 ? `Defendant #${i + 1}` : 'Defendant'
      const lines = [`${label}: ${p.full_name}`]
      if (p.address) {
        lines.push(`Service address: ${p.address}, ${p.city ?? ''}, ${p.state ?? ''} ${p.zip ?? ''}`)
      } else {
        lines.push('Service address: To be determined through discovery')
      }
      if (isFederal && p.state) {
        lines.push(`Defendant state: ${p.state}`)
      }
      return lines.join('\n')
    }),
  ]
    .filter(Boolean)
    .join('\n')

  const incidentSection = [
    '--- INCIDENT DETAILS ---',
    `Case type: ${facts.pi_sub_type.replace(/_/g, ' ')}`,
    `Date: ${facts.incident_date}`,
    `Location: ${facts.incident_location}`,
    `Description: ${facts.incident_description}`,
  ].join('\n')

  let descriptionSection: string
  let damagesSection: string

  if (isPropDamage) {
    descriptionSection = [
      '--- PROPERTY DAMAGE ---',
      `Description: ${facts.property_damage_description ?? ''}`,
      `Severity: ${facts.damage_severity ?? ''}`,
    ].join('\n')

    const dmg = facts.damages as z.infer<typeof propertyDamageDamagesSchema>
    damagesSection = [
      '--- DAMAGES ---',
      `Repair/replacement costs: $${dmg.repair_estimate.toLocaleString()}`,
      `Loss of use: $${dmg.loss_of_use.toLocaleString()}`,
      `Additional costs/expenses: $${dmg.additional_costs.toLocaleString()}`,
      `Total damages sought: $${dmg.total.toLocaleString()}`,
    ].join('\n')
  } else {
    descriptionSection = [
      '--- INJURIES ---',
      `Description: ${facts.injuries_description ?? ''}`,
      `Severity: ${facts.injury_severity ?? ''}`,
    ].join('\n')

    const dmg = facts.damages as z.infer<typeof bodilyInjuryDamagesSchema>
    damagesSection = [
      '--- DAMAGES ---',
      `Medical expenses: $${dmg.medical.toLocaleString()}`,
      `Lost wages: $${dmg.lost_wages.toLocaleString()}`,
      `Property damage: $${dmg.property_damage.toLocaleString()}`,
      `Pain and suffering: $${dmg.pain_suffering.toLocaleString()}`,
      `Total damages sought: $${dmg.total.toLocaleString()}`,
    ].join('\n')
  }

  const negligenceSection = [
    '--- NEGLIGENCE THEORY (user-provided) ---',
    facts.negligence_theory,
  ].join('\n')

  const demandSection = facts.prior_demand_sent
    ? [
        '--- PRIOR DEMAND / SETTLEMENT ATTEMPTS ---',
        `Plaintiff notified Defendant and attempted to resolve this matter informally.`,
        facts.demand_date ? `Demand/notification date: ${facts.demand_date}` : null,
      ]
        .filter(Boolean)
        .join('\n')
    : null

  const courtInfo = [
    '--- COURT INFO ---',
    `Court type: ${facts.court_type}`,
    `County: ${facts.county}`,
    facts.cause_number ? `Cause number: ${facts.cause_number}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  const docType = isFederal
    ? (isPropDamage ? "PLAINTIFF'S ORIGINAL COMPLAINT (Property Damage \u2014 Federal)" : "PLAINTIFF'S ORIGINAL COMPLAINT (Personal Injury \u2014 Federal)")
    : (isPropDamage ? "PLAINTIFF'S ORIGINAL PETITION (Property Damage)" : "PLAINTIFF'S ORIGINAL PETITION (Personal Injury)")

  return [
    '--- COURT CAPTION ---',
    caption,
    '',
    courtInfo,
    '',
    '--- DOCUMENT TYPE ---',
    docType,
    '',
    partiesSection,
    '',
    incidentSection,
    '',
    descriptionSection,
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
