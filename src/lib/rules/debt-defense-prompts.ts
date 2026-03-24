import { z } from 'zod'
import { partySchema } from '../schemas/filing'

// ---------------------------------------------------------------------------
// Constants & Schema
// ---------------------------------------------------------------------------

export const DEFENSE_KEYS = [
  'statute_of_limitations',
  'lack_of_standing',
  'insufficient_evidence',
  'wrong_amount',
  'identity_theft',
  'fdcpa_violations',
  'improper_service',
  'general_denial',
] as const

export type DefenseKey = (typeof DEFENSE_KEYS)[number]

export const debtDefenseFactsSchema = z.object({
  your_info: partySchema,
  opposing_parties: z.array(partySchema).min(1),
  court_type: z.enum(['jp', 'county', 'district']),
  county: z.string().min(1),
  cause_number: z.string().optional(),
  debt_sub_type: z.enum([
    'credit_card', 'medical_bills', 'personal_loan', 'auto_loan',
    'payday_loan', 'debt_buyer', 'other',
  ]),
  answer_type: z.enum(['general_denial', 'specific_answer']),
  selected_defenses: z.array(z.enum(DEFENSE_KEYS)).min(1),
  defense_details: z.record(z.string(), z.any()).optional(),
  original_amount: z.number().positive(),
  current_amount_claimed: z.number().positive(),
  description: z.string().min(10),
})

export type DebtDefenseFacts = z.infer<typeof debtDefenseFactsSchema>

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
      return `District Court of ${county} County, Texas`
    default:
      return `Court of ${county} County, Texas`
  }
}

function getCourtCaption(courtType: string, county: string, causeNumber?: string): string {
  const causeStr = causeNumber ? `Cause No. ${causeNumber}` : 'Cause No. ___________'
  return `In the ${getCourtLabel(courtType, county)}\n${causeStr}`
}

// ---------------------------------------------------------------------------
// Defense label helper
// ---------------------------------------------------------------------------

function getDefenseLabel(key: DefenseKey): string {
  switch (key) {
    case 'statute_of_limitations':
      return 'Statute of Limitations (Tex. Civ. Prac. & Rem. Code § 16.004 — 4-year SOL for debt on open account)'
    case 'lack_of_standing':
      return 'Lack of Standing (Plaintiff lacks privity of contract or chain-of-title documentation)'
    case 'insufficient_evidence':
      return 'Insufficient Evidence (Plaintiff has not produced the original signed agreement or competent account records)'
    case 'wrong_amount':
      return 'Wrong Amount (The amount claimed is inaccurate, includes unauthorized fees, or does not reflect proper credits)'
    case 'identity_theft':
      return 'Identity Theft / Unauthorized Account (The debt was incurred by fraud or identity theft, not by Defendant)'
    case 'fdcpa_violations':
      return 'Fair Debt Collection Practices Act Violations (15 U.S.C. §§ 1692-1692p)'
    case 'improper_service':
      return 'Improper Service (Defendant was not properly served under TRCP Rules 106-107)'
    case 'general_denial':
      return 'General Denial (TRCP Rule 92)'
    default:
      return key
  }
}

// ---------------------------------------------------------------------------
// System prompt for general denial
// ---------------------------------------------------------------------------

function buildGeneralDenialSystemPrompt(facts: DebtDefenseFacts): string {
  const defensesGuidance = facts.selected_defenses
    .map((d, i) => `${i + 1}. ${getDefenseLabel(d)}`)
    .join('\n')

  return `You are a legal document formatting assistant. Generate a General Denial with Affirmative Defenses for a debt collection lawsuit in Texas. This document is for a self-represented (pro se) defendant.

IMPORTANT RULES:
- You format documents. You do NOT provide legal advice.
- Mark the output clearly as "DRAFT — NOT FOR FILING" at the top.
- Use only the facts provided. Do not invent or assume additional facts.
- Do not predict outcomes or make strategic recommendations.
- Use plain, clear language appropriate for a pro se litigant.

APPLICABLE LAW:
- TRCP Rule 92 — General Denial. A general denial of matters pleaded by the adverse party that are not required to be denied under oath shall be sufficient to put the same in issue.
- TRCP Rule 93 — Verified Pleas. Certain defenses must be verified by affidavit.
- TRCP Rule 94 — Affirmative Defenses. A party shall set forth affirmatively all matters constituting an avoidance or affirmative defense.
- Texas Statute of Limitations: Tex. Civ. Prac. & Rem. Code § 16.004 (4 years for debt on open account).
- FDCPA: 15 U.S.C. §§ 1692-1692p (Fair Debt Collection Practices Act).
- SCRA: 50 U.S.C. § 3931 (Servicemembers Civil Relief Act — default judgment protection).

DOCUMENT FORMAT:
Generate a "GENERAL DENIAL WITH AFFIRMATIVE DEFENSES" with the following structure:

1. CAPTION — Court name, cause number (if known), and party names (Plaintiff vs. Defendant).

2. GENERAL DENIAL PARAGRAPH — Under TRCP Rule 92, Defendant generally denies each and every allegation contained in Plaintiff's Original Petition and demands that Plaintiff prove each allegation by a preponderance of the evidence.

3. AFFIRMATIVE DEFENSES SECTION — One numbered affirmative defense for each selected defense, with applicable legal citations:
${defensesGuidance}

4. PRAYER — Defendant requests that Plaintiff take nothing, that the case be dismissed with prejudice, and that Defendant recover court costs.

5. VERIFICATION — A sworn statement: "My name is [Defendant name]. I declare under penalty of perjury that the foregoing is true and correct. Executed on [date]."

6. CERTIFICATE OF SERVICE — Statement that a true and correct copy was served on all parties or their attorneys of record, with date and method of service.

7. PRO SE SIGNATURE BLOCK — "Respectfully submitted" with Defendant's name, address, and "Pro Se" designation.

ANNOTATIONS:
After the document text, output a section starting with "---ANNOTATIONS---" on its own line.
Below that, output one annotation per line in this exact format:
[N] SECTION_NAME: Plain-English explanation of what this section means and why it is in the document.

Number annotations sequentially starting from 1. Cover these sections at minimum:
- Caption (the header identifying the court and parties)
- General Denial (the blanket denial of all claims)
- Affirmative Defenses (specific legal reasons the debt may not be owed)
- Prayer (what you are asking the court to do)
- Verification (the sworn statement)
- Certificate of Service (proof you sent a copy to the other side)

Use simple language a high school student could understand. Do NOT use legal jargon in the explanations.

Format the document professionally with proper legal formatting.`
}

// ---------------------------------------------------------------------------
// System prompt for specific answer
// ---------------------------------------------------------------------------

function buildSpecificAnswerSystemPrompt(facts: DebtDefenseFacts): string {
  const defensesGuidance = facts.selected_defenses
    .map((d, i) => `${i + 1}. ${getDefenseLabel(d)}`)
    .join('\n')

  const hasFDCPA = facts.selected_defenses.includes('fdcpa_violations')

  const counterclaims = hasFDCPA
    ? `
COUNTERCLAIMS SECTION:
Because Defendant has asserted FDCPA violations, include a counterclaim section:
- Counterclaim under 15 U.S.C. § 1692k — Defendant is entitled to statutory damages up to $1,000 per violation, plus actual damages and reasonable attorney's fees.
- Describe each FDCPA violation alleged and cite the specific subsection violated.
- Request that the court award statutory damages, actual damages, and costs.`
    : ''

  return `You are a legal document formatting assistant. Generate an Original Answer to a debt collection lawsuit in Texas. This document is for a self-represented (pro se) defendant.

IMPORTANT RULES:
- You format documents. You do NOT provide legal advice.
- Mark the output clearly as "DRAFT — NOT FOR FILING" at the top.
- Use only the facts provided. Do not invent or assume additional facts.
- Do not predict outcomes or make strategic recommendations.
- Use plain, clear language appropriate for a pro se litigant.

APPLICABLE LAW:
- TRCP Rule 92 — General Denial.
- TRCP Rule 93 — Verified Pleas.
- TRCP Rule 94 — Affirmative Defenses.
- Texas Statute of Limitations: Tex. Civ. Prac. & Rem. Code § 16.004 (4 years for debt on open account).
- FDCPA: 15 U.S.C. §§ 1692-1692p (Fair Debt Collection Practices Act).
- SCRA: 50 U.S.C. § 3931 (Servicemembers Civil Relief Act — default judgment protection).

DOCUMENT FORMAT:
Generate an "ORIGINAL ANSWER" with the following structure:

1. CAPTION — Court name, cause number (if known), and party names (Plaintiff vs. Defendant).

2. PARAGRAPH-BY-PARAGRAPH RESPONSES — For each paragraph in Plaintiff's petition, Defendant responds with one of:
   - "Admitted" (if the allegation is true)
   - "Denied" (if the allegation is false)
   - "Defendant lacks sufficient knowledge or information to form a belief as to the truth of this allegation and therefore denies the same"
   Since we do not have Plaintiff's petition text, generate template responses that the Defendant can customize.

3. AFFIRMATIVE DEFENSES SECTION — One numbered affirmative defense for each selected defense, with applicable legal citations:
${defensesGuidance}
${counterclaims}

4. PRAYER — Defendant requests that Plaintiff take nothing, that the case be dismissed with prejudice, and that Defendant recover court costs${hasFDCPA ? ', statutory damages under FDCPA, and reasonable attorney\'s fees' : ''}.

5. VERIFICATION — A sworn statement: "My name is [Defendant name]. I declare under penalty of perjury that the foregoing is true and correct. Executed on [date]."

6. CERTIFICATE OF SERVICE — Statement that a true and correct copy was served on all parties or their attorneys of record, with date and method of service.

7. PRO SE SIGNATURE BLOCK — "Respectfully submitted" with Defendant's name, address, and "Pro Se" designation.

ANNOTATIONS:
After the document text, output a section starting with "---ANNOTATIONS---" on its own line.
Below that, output one annotation per line in this exact format:
[N] SECTION_NAME: Plain-English explanation of what this section means and why it is in the document.

Number annotations sequentially starting from 1. Cover these sections at minimum:
- Caption (the header identifying the court and parties)
- Paragraph-by-Paragraph Responses (your specific responses to each claim)
- Affirmative Defenses (specific legal reasons the debt may not be owed)${hasFDCPA ? '\n- Counterclaim (your claim against the debt collector for FDCPA violations)' : ''}
- Prayer (what you are asking the court to do)
- Verification (the sworn statement)
- Certificate of Service (proof you sent a copy to the other side)

Use simple language a high school student could understand. Do NOT use legal jargon in the explanations.

Format the document professionally with proper legal formatting.`
}

// ---------------------------------------------------------------------------
// User prompt builder
// ---------------------------------------------------------------------------

function buildUserPrompt(facts: DebtDefenseFacts): string {
  const caption = getCourtCaption(facts.court_type, facts.county, facts.cause_number)

  const partiesSection = [
    '--- PARTIES ---',
    `Defendant (You): ${facts.your_info.full_name}`,
    facts.your_info.address
      ? `Address: ${facts.your_info.address}, ${facts.your_info.city ?? ''}, ${facts.your_info.state ?? ''} ${facts.your_info.zip ?? ''}`
      : null,
    '',
    ...facts.opposing_parties.map((p, i) => {
      const lines = [`Plaintiff ${facts.opposing_parties.length > 1 ? `#${i + 1}` : ''}: ${p.full_name}`]
      if (p.address) {
        lines.push(`Address: ${p.address}, ${p.city ?? ''}, ${p.state ?? ''} ${p.zip ?? ''}`)
      }
      return lines.join('\n')
    }),
  ]
    .filter(Boolean)
    .join('\n')

  const debtSection = [
    '--- DEBT INFORMATION ---',
    `Debt type: ${facts.debt_sub_type.replace(/_/g, ' ')}`,
    `Original amount: $${facts.original_amount.toLocaleString()}`,
    `Current amount claimed: $${facts.current_amount_claimed.toLocaleString()}`,
  ].join('\n')

  const defensesSection = [
    '--- SELECTED DEFENSES ---',
    ...facts.selected_defenses.map((d) => `- ${getDefenseLabel(d)}`),
  ].join('\n')

  const detailsSection = facts.defense_details && Object.keys(facts.defense_details).length > 0
    ? [
        '--- DEFENSE DETAILS ---',
        ...Object.entries(facts.defense_details).map(
          ([key, value]) => `${key}: ${String(value)}`
        ),
      ].join('\n')
    : null

  const descriptionSection = ['--- CASE DESCRIPTION ---', facts.description].join('\n')

  return [
    `--- COURT CAPTION ---`,
    caption,
    '',
    `--- DOCUMENT TYPE ---`,
    facts.answer_type === 'general_denial'
      ? 'GENERAL DENIAL WITH AFFIRMATIVE DEFENSES'
      : 'ORIGINAL ANSWER',
    '',
    partiesSection,
    '',
    debtSection,
    '',
    defensesSection,
    '',
    descriptionSection,
    detailsSection ? `\n${detailsSection}` : null,
  ]
    .filter((s) => s !== null)
    .join('\n')
}

// ---------------------------------------------------------------------------
// Main prompt builder
// ---------------------------------------------------------------------------

export function buildDebtDefensePrompt(facts: DebtDefenseFacts): FilingPrompt {
  const system = facts.answer_type === 'general_denial'
    ? buildGeneralDenialSystemPrompt(facts)
    : buildSpecificAnswerSystemPrompt(facts)

  const user = buildUserPrompt(facts)

  return { system, user }
}
