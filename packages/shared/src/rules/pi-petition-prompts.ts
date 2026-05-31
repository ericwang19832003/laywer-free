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
    return 'Expedited Actions under Texas Rule of Civil Procedure 169'
  }
  return 'Standard discovery under Texas Rule of Civil Procedure 190'
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
      return `Generate MULTIPLE causes of action. Read the incident description carefully to identify the scenario.

SCENARIO A \u2014 RENTAL/LEASE CASE (defendant provided/rented the vehicle to plaintiff, e.g., Penske, Ryder, U-Haul, or any fleet/rental company):
If the facts indicate plaintiff rented or leased the vehicle from defendant, include ALL of the following unless facts clearly exclude them:

COUNT \u2014 NEGLIGENCE: Defendant, as a commercial vehicle provider, owed Plaintiff a duty to exercise ordinary care to maintain, inspect, and provide the vehicle in a safe, roadworthy mechanical condition. Defendant breached this duty by providing a vehicle with known or discoverable mechanical defects (describe from facts). Such breach proximately caused the damage to Plaintiff and Plaintiff's property.

COUNT \u2014 NEGLIGENT BAILMENT: Defendant, as bailor, bailed the subject vehicle to Plaintiff for use. As bailor, Defendant had a duty to disclose all known defects and to deliver a vehicle free from conditions making it unsafe for its intended use. Defendant breached this duty by delivering a vehicle with mechanical defects (describe from facts), proximately causing Plaintiff's damages.

COUNT \u2014 BREACH OF CONTRACT: Defendant and Plaintiff entered into a rental/lease agreement (the contract). Defendant had an express or implied contractual obligation to provide a safe, operable vehicle fit for ordinary use. Defendant breached this obligation, causing Plaintiff's damages.

COUNT \u2014 BREACH OF IMPLIED WARRANTY OF FITNESS FOR ORDINARY USE: As a commercial vehicle rental company, Defendant impliedly warranted that the vehicle was in merchantable condition and fit for ordinary use. The vehicle was not in merchantable condition and failed to perform its intended function, breaching this implied warranty.

COUNT \u2014 NEGLIGENCE PER SE (include if defendant is a commercial motor carrier, or the vehicle is a truck/semi/commercial vehicle used in commerce): Defendant violated 49 C.F.R. \u00a7 396.3(a), which requires every motor carrier to systematically inspect, repair, and maintain all motor vehicles subject to its control in safe and proper operating condition. Plaintiff is within the class of persons this regulation was designed to protect, and the harm suffered is the type the regulation was designed to prevent.

SCENARIO B \u2014 COLLISION CASE (another driver/party caused a crash that damaged plaintiff's vehicle):
COUNT \u2014 NEGLIGENCE: Defendant owed Plaintiff a duty to exercise ordinary care in the operation of a motor vehicle. Defendant breached that duty through one or more of the following: failure to maintain a proper lookout, failure to control speed, failure to yield the right of way, failure to keep a proper distance, and/or other acts of negligence. Such breach proximately caused damage to Plaintiff's vehicle and property.
COUNT \u2014 NEGLIGENCE PER SE (if a traffic law was violated): Defendant violated [specific statute], and such violation constitutes negligence as a matter of law.

Generate all COUNTs supported by the facts. For rental/leasing cases, Negligent Bailment, Breach of Contract, and Breach of Implied Warranty are presumptively applicable \u2014 include them unless the facts clearly exclude them.`
    case 'property_damage_negligence':
    case 'other_property_damage':
      return `Generate multiple causes of action as applicable from the facts:
- NEGLIGENCE: Defendant owed Plaintiff a duty to exercise ordinary care with respect to Plaintiff's property. Defendant breached that duty, and such breach proximately caused the property damage.
- BREACH OF CONTRACT (if a contractual relationship existed): Defendant breached its contractual obligations, resulting in Plaintiff's damages.
- CONVERSION (if Defendant wrongfully exercised dominion over Plaintiff's property): Defendant wrongfully assumed and exercised dominion and control over Plaintiff's personal property to the exclusion of Plaintiff's rights.
Only include causes of action supported by the facts provided.`
    case 'vandalism':
      return `Generate multiple causes of action as applicable from the facts:
- INTENTIONAL DESTRUCTION OF PROPERTY: Defendant intentionally and unlawfully damaged or destroyed Plaintiff's property.
- TRESPASS TO CHATTELS / CONVERSION: Defendant intentionally interfered with Plaintiff's possessory interest in personal property.
- NEGLIGENCE (in the alternative): To the extent Defendant's conduct was not intentional, Defendant was negligent in causing damage to Plaintiff's property.
Only include causes of action supported by the facts provided.`
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
- NEGLIGENCE: Defendant owed Plaintiff a duty to exercise ordinary care in the operation of a motor vehicle. Defendant breached that duty through one or more of the following: failure to maintain a proper lookout, failure to control speed, failure to yield the right of way, failure to keep a proper distance, and/or other acts of negligence. Such breach proximately caused Plaintiff\u2019s injuries and damages.
- NEGLIGENCE PER SE (if Defendant violated a traffic law): Defendant violated [specific statute/ordinance], and such violation constitutes negligence as a matter of law.
Only include causes of action supported by the facts provided.`
    case 'slip_and_fall':
      return `Generate the appropriate cause(s) of action:
- NEGLIGENCE / PREMISES LIABILITY: Defendant, as owner/occupier of the premises, owed Plaintiff a duty to keep the premises in a reasonably safe condition. Defendant knew or should have known of the dangerous condition and failed to warn or make the premises safe, proximately causing Plaintiff\u2019s injuries.
Only include causes of action supported by the facts provided.`
    case 'product_liability':
      return `Generate the appropriate cause(s) of action:
- STRICT PRODUCT LIABILITY: The product was defective and unreasonably dangerous due to a design defect, manufacturing defect, and/or marketing defect (failure to warn). The defect existed when the product left Defendant\u2019s control and proximately caused Plaintiff\u2019s injuries. Tex. Civ. Prac. & Rem. Code \u00a7 82.001.
- NEGLIGENCE: Defendant failed to exercise reasonable care in designing, manufacturing, testing, and/or warning about the product.
- BREACH OF WARRANTY (if applicable): Defendant breached express and/or implied warranties of merchantability and fitness for a particular purpose.
Only include causes of action supported by the facts provided.`
    case 'dog_bite':
      return `Generate the appropriate cause(s) of action:
- NEGLIGENCE: Defendant, as owner/keeper of the animal, knew or should have known of the animal\u2019s dangerous propensities and failed to exercise reasonable care to restrain or control the animal, proximately causing Plaintiff\u2019s injuries.
- STRICT LIABILITY (if the animal had previously bitten or attacked): Defendant knew the animal had dangerous propensities and is strictly liable for Plaintiff\u2019s injuries.
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
- Mark the output clearly as "DRAFT -- NOT FOR FILING" at the very top.
- Use ONLY the facts provided. Do NOT invent, assume, or embellish additional facts.
- Do NOT predict outcomes or make strategic recommendations.
- Use clear, professional legal language. Federal complaints are more formal and detailed than state court petitions.
- Use CONTINUOUS paragraph numbering throughout the entire document (1, 2, 3... through the end). Do NOT restart numbering in each section.
- Use Roman numeral section headings (I., II., III., IV., etc.).
- Do NOT use markdown syntax (**bold**, *italic*, # headings, or --- horizontal rule separators) in the document body. Plain text only. Write headings in ALL CAPS. The ---ANNOTATIONS--- section marker and [N] annotation format at the end are required and must appear exactly as specified.

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
Then centered: PLAINTIFF'S ORIGINAL COMPLAINT

PRELIMINARY STATEMENT:
Write 2\u20134 concise paragraphs (numbered continuously) summarizing the entire case: what happened, what went wrong, and why the plaintiff is suing. This should be a tight narrative overview. Start with: "1. On [DATE], Defendant..."

I. JURISDICTION AND VENUE
Numbered paragraphs continuing from the Preliminary Statement:
- Subject matter jurisdiction: "This Court has subject matter jurisdiction under 28 U.S.C. \u00a7 1332(a). The amount in controversy exceeds $75,000, exclusive of interest and costs."
- Plaintiff\u2019s citizenship: "[NAME] is a citizen of the State of [STATE]."
- Defendant\u2019s citizenship: State what is known. If Defendant is a corporation, note state of incorporation and principal place of business if known. If a limited partnership/LLC, note the citizenship of partners/members if known. If not known, state: "Defendant is believed to be a citizen of [STATE(S)]. Complete diversity exists." (Use only facts provided \u2014 do not fabricate corporate structure.)
- Venue: "Venue is proper under 28 U.S.C. \u00a7 1391(b)(2). A substantial part of the events giving rise to this action occurred in this District."

II. FACTUAL BACKGROUND
Organize facts with lettered sub-sections and continuous paragraph numbering:
- A. BACKGROUND / THE TRANSACTION \u2014 Context leading to the incident.
- B. CONDITION / CIRCUMSTANCES \u2014 Relevant conditions at the time.
- C. THE INCIDENT \u2014 What happened, in chronological detail.
- D. DAMAGES \u2014 What was lost/destroyed and the amounts.
- If Plaintiff attempted informal resolution, include that in the facts (e.g., demand letter, settlement attempts).
- If there are regulatory implications, add: E. REGULATORY FRAMEWORK -- cite applicable federal regulations (49 C.F.R. Parts 390-399 for motor carriers) and/or state statutes. Be specific about which regulation applies and how it was violated.
- Each paragraph should be one focused fact. Use "On or about" for approximate dates.
- Use ONLY the facts provided. Do NOT add hypothetical details.

III. CAUSES OF ACTION
Format as separate COUNTs with centered headings in ALL CAPS:

COUNT I -- NEGLIGENCE
Core NEGLIGENCE theory: ${negligenceGuidance}
- Start with: "[Next number]. Plaintiff incorporates all preceding paragraphs."
- State the duty, the specific breaches (use lettered sub-items (a), (b), (c)...), and that the breach proximately caused Plaintiff\u2019s damages.

${causesGuidance}

Additional COUNTs to consider based on facts (only include if supported):
- COUNT -- NEGLIGENCE PER SE: If Defendant violated a specific statute/regulation, cite it and explain how the violation constitutes negligence as a matter of law. State that Plaintiff is within the protected class and the harm is within the class of harms the provision addresses.
- COUNT -- GROSS NEGLIGENCE: If the facts suggest extreme degree of risk and conscious indifference (Tex. Civ. Prac. & Rem. Code \u00a7 41.003). Only include if the facts genuinely support it.
- COUNT -- BAILMENT / NEGLIGENT BAILMENT: If Defendant as bailor rented, leased, or provided a vehicle or chattel to Plaintiff that was defective or unsafe. As bailor, Defendant had a duty to disclose known defects and to provide the property in safe, fit condition. The bailee (Plaintiff) is entitled to recover for damages caused by the bailor's failure to provide a safe chattel.
- COUNT -- BREACH OF CONTRACT: If a contract/rental/service agreement existed. State the obligation, the breach, and proximate causation.
- COUNT -- BREACH OF IMPLIED WARRANTY OF FITNESS: If Defendant impliedly warranted fitness for purpose. State that the product/vehicle was not fit and not in merchantable condition.

Each COUNT must:
- Begin with "Plaintiff incorporates all preceding paragraphs."
- Continue the continuous paragraph numbering.
- Number COUNTs sequentially (COUNT I, COUNT II, COUNT III, etc.).
- Do NOT include COUNTs that are not supported by the facts.

IV. DAMAGES
Numbered paragraphs for each damages category:
${damagesGuidance}
- Include: "Plaintiff seeks exemplary damages under Tex. Civ. Prac. & Rem. Code \u00a7 41.003 based on the conduct alleged in Count [GROSS NEGLIGENCE COUNT]" only if a gross negligence count was included.
- Include pre-judgment and post-judgment interest and costs of court.

V. PRESERVATION OF EVIDENCE
"Defendant is on notice to preserve all documents and electronically stored information relating to [describe the subject], including: [list categories of documents relevant to the case based on the facts \u2014 e.g., maintenance records, inspection logs, communications, contracts, etc.]."

VI. JURY DEMAND
"Plaintiff demands a trial by jury pursuant to Federal Rule of Civil Procedure 38."

PRAYER FOR RELIEF
Use the federal prayer format:
"WHEREFORE, Plaintiff requests judgment against Defendant and an award of:"
Then lettered items:
(a) Actual damages;
(b) Consequential damages;
(c) Exemplary damages (only if gross negligence count was included);
(d) Pre-judgment and post-judgment interest;
(e) Costs of court; and
(f) Such other and further relief as the Court deems just and proper.

SIGNATURE BLOCK:
Respectfully submitted,

/s/ [Plaintiff Name]
[PLAINTIFF NAME], Pro Se
[Address]
[City, State ZIP]
Phone: [if provided]
Email: [if provided]

FORMATTING REQUIREMENTS:
- Do NOT use markdown syntax (**bold**, *italic*, # headings) anywhere in the output. Plain text only.
- Write all Roman numeral section headings and COUNT headings in ALL CAPS and center them (e.g., "I. JURISDICTION AND VENUE", "COUNT I -- NEGLIGENCE").
- Write lettered sub-section headings in ALL CAPS (e.g., "A. THE RENTAL TRANSACTION").
- Use continuous paragraph numbering (1, 2, 3...) throughout the entire document -- do NOT restart in each section.
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

  return `You are a legal document formatting assistant specializing in Texas civil court filings. Generate a professional ${docTitle} that matches the quality and structure of a real Texas court filing prepared by an experienced attorney. This document is for a self-represented (pro se) plaintiff.

CRITICAL RULES:
- You format documents. You do NOT provide legal advice.
- Mark the output clearly as "DRAFT -- NOT FOR FILING" at the very top.
- Use ONLY the facts provided. Do NOT invent, assume, or embellish additional facts.
- Do NOT predict outcomes or make strategic recommendations.
- Use clear, professional legal language appropriate for a Texas court filing.
- Number ALL paragraphs and sub-paragraphs (1., 2.1, 2.2, 3.1, 4.1, 4.2, etc.).
- Do NOT add [VERIFY:], [CHECK:], or any bracketed annotation markers. Use statutes and rules exactly as given.
- Do NOT leave unfilled placeholder text. If a required value is not provided, omit that element entirely.
- Do NOT use markdown syntax (**bold**, *italic*, # headings, or --- horizontal rule separators) anywhere in the document body. The document is rendered as plain text. Write section headings in ALL CAPS. The ---ANNOTATIONS--- section marker and [N] annotation lines at the end are required and must appear exactly as specified.

DOCUMENT STRUCTURE -- follow this exact section order:

COURT CAPTION:
- Format as a standard Texas civil court caption with section (\u00a7) symbols.
- Left side: Plaintiff name + "," then blank line, then "Plaintiff," then "v." then Defendant name + "," then blank line, then "Defendant."
- Right side (after \u00a7): "CAUSE NO. ____________________" then court name.
- Then centered: "${docTitle}"
- Then: "TO THE HONORABLE JUDGE OF SAID COURT:"
- Then an opening paragraph: "Plaintiff [FULL NAME] ("Plaintiff"), appearing pro se, files this Original Petition against Defendant [FULL NAME] ("[SHORT NAME]" or "Defendant"), and would respectfully show the Court as follows:"

PRELIMINARY STATEMENT:
Write 2-3 short paragraphs (labeled "Preliminary Statement -- Paragraph 1:", etc.) providing a narrative overview of the case: who the parties are, what happened, and what the plaintiff is seeking. This orients the court before the formal numbered sections. Start with: "This is an action by [Plaintiff name] against [Defendant name] arising from [brief description]."

1. DISCOVERY CONTROL PLAN
"Plaintiff intends that discovery be conducted under ${discoveryLevel}."

2. PARTIES
- 2.1 Plaintiff: "[NAME] is an individual residing in [COUNTY] County, Texas, and may be served at: [ADDRESS]."
- 2.2+ Defendant(s): State full legal name. If defendant is a corporation or business entity, state: "[NAME] is a [corporation/limited partnership/etc.] and may be served through its registered agent or officer at: [ADDRESS if known, otherwise 'to be determined through discovery']."

3. JURISDICTION AND VENUE
- 3.1 "${jurisdictionLang}"
- 3.2 "Venue is proper in [COUNTY] County, Texas because the events and occurrences made the basis of this suit occurred in [COUNTY] County, Texas."
- 3.3 Include the Texas Rule of Civil Procedure 47(c) damages tier statement: "Plaintiff seeks monetary relief [state tier]."

4. FACTS
Write numbered sub-paragraphs (4.1, 4.2, 4.3, etc.) presenting the facts chronologically with the following structure:

4.A. BACKGROUND AND PARTIES' RELATIONSHIP -- Describe how the parties came to be in a legal relationship (e.g., "On or about [DATE], Plaintiff entered into a [rental/service/lease] agreement with Defendant..."). If defendant is a business, describe its business operations briefly.

4.B. CONDITION AND CIRCUMSTANCES -- Describe the relevant conditions at the time of the incident.

4.C. THE INCIDENT -- Describe what happened in chronological detail. Be specific about date, time, location, and sequence of events.

4.D. DAMAGES SUFFERED -- Describe the harm and losses Plaintiff suffered as a direct result of the incident.

4.E. REGULATORY FRAMEWORK (include this sub-section if Defendant is a commercial motor carrier, fleet operator, rental company, or if the facts involve a commercial vehicle) -- Identify applicable federal and Texas statutes/regulations that govern Defendant's conduct (e.g., 49 C.F.R. Part 396 for commercial vehicle maintenance, Tex. Transp. Code \u00a7 502.040 for vehicle registration requirements).

4.F. PRE-LITIGATION HISTORY (include if Plaintiff notified Defendant or attempted to resolve the matter) -- Describe the demand, response, and outcome.

Use "On or about" for approximate dates. Each paragraph should contain one focused fact. Do NOT add hypothetical details.

5. CAUSES OF ACTION
Core NEGLIGENCE theory: ${negligenceGuidance}

${causesGuidance}
- Number each cause of action (5.1, 5.2, 5.3...).
- Write the cause of action name in ALL CAPS (e.g., "5.1 NEGLIGENCE.").
- For each, state: (a) the duty owed, (b) the specific breach(es), and (c) that the breach proximately caused Plaintiff's damages.
- Use lettered sub-items (a), (b), (c) to list multiple breaches within a single count.

6. DAMAGES
${damagesGuidance}
- Number each damages category (6.1, 6.2, etc.).
- State "Plaintiff seeks the following damages, in amounts to be proven at trial:" before the itemization.
- After itemizing damages, add one final numbered sub-paragraph for conditions precedent: ${conditionsPrecedent}

7. PRESERVATION OF EVIDENCE
"Defendant is hereby placed on notice to preserve all documents, data, electronically stored information, and tangible items relating to the events and circumstances described herein, including but not limited to: [generate a list of 4-8 specific document categories relevant to the facts -- e.g., maintenance records, inspection logs, service records, contracts and agreements, communications between the parties, insurance policies, photographs and video recordings, and any complaints or claims involving the same subject matter]. Defendant shall immediately suspend any document retention/destruction policies with respect to these materials."

8. REQUEST FOR DISCLOSURE
"Under Texas Rule of Civil Procedure 194, Plaintiff requests that Defendant disclose, within 50 days, the information and material described in Rule 194.2."

9. JURY DEMAND
"Plaintiff requests a trial by jury and will pay the jury fee as required by law."

10. PRAYER FOR RELIEF
Use the standard Texas prayer format:
"WHEREFORE, PREMISES CONSIDERED, Plaintiff prays that Defendant be cited to appear and answer, and that upon final trial Plaintiff have judgment against Defendant for: (a) actual damages; (b) consequential damages; (c) exemplary damages (if gross negligence is alleged); (d) pre-judgment and post-judgment interest as allowed by law; (e) costs of court; and (f) such other and further relief, at law or in equity, to which Plaintiff may be justly entitled."

11. SIGNATURE BLOCK
"Respectfully submitted,"
Then Plaintiff's name with "(Pro Se)" designation, followed by address on separate lines.

FORMATTING REQUIREMENTS:
- Do NOT use markdown syntax (**bold**, *italic*, # headings) anywhere in the output. Plain text only.
- Write all section headings in ALL CAPS (e.g., "1. DISCOVERY CONTROL PLAN").
- Write sub-paragraph labels in ALL CAPS (e.g., "2.1 PLAINTIFF." or "5.1 NEGLIGENCE.").
- Use consistent numbered sub-paragraphs throughout.
- Professional tone -- formal but readable.
- Use standard Texas pleading conventions.

ANNOTATIONS:
After the document text, output a section starting with "---ANNOTATIONS---" on its own line.
Below that, output one annotation per line in this exact format:
[N] SECTION_NAME: Plain-English explanation of what this section means and why it is in the document.

Number annotations sequentially starting from 1. Cover these sections at minimum:
- Caption (the header identifying the court and parties)
- Preliminary Statement (a short summary of the whole case before the formal sections)
- Discovery Control Plan (the rules that will govern how both sides exchange information)
- Parties (who is suing and who is being sued)
- Jurisdiction and Venue (why this court can hear the case and why it's filed in this county)
- Facts (what happened, told as a chronological story)
- Causes of Action (the legal theories for why the defendant owes you money -- explain each COUNT in plain English)
- Damages (the specific dollar amounts you're asking for)
- Preservation of Evidence (telling the other side not to destroy records)
- Request for Disclosure (a formal request for the other side to share basic information)
- Jury Demand (your right to have a jury decide the case)
- Prayer (what you're asking the court to give you at the end of the case)

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
