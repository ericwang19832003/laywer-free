import { z } from 'zod'
import { partySchema } from '../schemas/filing'

export const piSettlementFactsSchema = z.object({
  your_info: partySchema,
  defendant_info: partySchema,
  insurance_carrier: z.string().optional(),
  settlement_amount: z.number().positive(),
  incident_date: z.string().min(1),
  incident_description: z.string().min(10),
  county: z.string().optional(),
  include_medical_liens_release: z.boolean(),
  include_confidentiality: z.boolean(),
})

export type PiSettlementFacts = z.infer<typeof piSettlementFactsSchema>

interface FilingPrompt {
  system: string
  user: string
}

function buildUserPrompt(facts: PiSettlementFacts): string {
  const plaintiffSection = [
    '--- PLAINTIFF ---',
    `Name: ${facts.your_info.full_name}`,
    facts.your_info.address
      ? `Address: ${facts.your_info.address}, ${facts.your_info.city ?? ''}, ${facts.your_info.state ?? ''} ${facts.your_info.zip ?? ''}`
      : null,
  ]
    .filter(Boolean)
    .join('\n')

  const defendantSection = [
    '--- DEFENDANT ---',
    `Name: ${facts.defendant_info.full_name}`,
    facts.defendant_info.address
      ? `Address: ${facts.defendant_info.address}, ${facts.defendant_info.city ?? ''}, ${facts.defendant_info.state ?? ''} ${facts.defendant_info.zip ?? ''}`
      : null,
  ]
    .filter(Boolean)
    .join('\n')

  const insuranceSection = facts.insurance_carrier
    ? `--- INSURANCE ---\nInsurance carrier: ${facts.insurance_carrier}`
    : null

  const settlementSection = [
    '--- SETTLEMENT ---',
    `Settlement amount: $${facts.settlement_amount.toLocaleString()}`,
  ].join('\n')

  const incidentSection = [
    '--- INCIDENT ---',
    `Date of incident: ${facts.incident_date}`,
    `Description: ${facts.incident_description}`,
  ].join('\n')

  const countySection = facts.county ? `Filing county: ${facts.county}` : null

  const flagsSection = [
    '--- FLAGS ---',
    `Include medical liens release: ${facts.include_medical_liens_release ? 'Yes' : 'No'}`,
    `Include confidentiality clause: ${facts.include_confidentiality ? 'Yes' : 'No'}`,
  ].join('\n')

  return [
    'Personal injury settlement agreement and release',
    '',
    plaintiffSection,
    '',
    defendantSection,
    '',
    insuranceSection,
    '',
    settlementSection,
    '',
    incidentSection,
    countySection ? `\n${countySection}` : null,
    '',
    flagsSection,
  ]
    .filter((s) => s !== null)
    .join('\n')
}

export function buildPiSettlementPrompt(facts: PiSettlementFacts): FilingPrompt {
  const system = `You are a legal document formatting assistant. Generate a Settlement Agreement and Release of All Claims for a personal injury case in Texas.

IMPORTANT RULES:
- You format documents. You do NOT provide legal advice.
- Mark the output clearly as "DRAFT — NOT FOR FILING" at the top.
- Use only the facts provided. Do not invent or assume additional facts.
- Do not predict outcomes or make strategic recommendations.
- The tone must be professional and precise.
- Use plain, clear language.

DOCUMENT FORMAT:
Generate a formal settlement agreement with the following structure:

1. "SETTLEMENT AGREEMENT AND RELEASE OF ALL CLAIMS" — Title header centered at top.

2. PARTIES — Identify the Releasor (plaintiff) and Releasee (defendant and/or insurance carrier). Use full names and addresses as provided.

3. RECITALS — Brief description of the underlying incident giving rise to the claims, including the date and nature of the incident.

4. SETTLEMENT PAYMENT — State the agreed settlement amount, payment timeline (within 30 days of execution), and payment method (certified check or wire transfer to plaintiff or plaintiff's designated representative).

5. RELEASE OF CLAIMS — Plaintiff (Releasor) releases and forever discharges Defendant (Releasee), their agents, employees, insurers, successors, and assigns from any and all claims, demands, actions, or causes of action arising from or related to the incident described in the Recitals.

6. MEDICAL LIENS — CONDITIONAL: Only include this section if the user prompt indicates "Include medical liens release: Yes". If included, state that Releasor assumes full responsibility for satisfying any and all outstanding medical liens, bills, or subrogation interests related to the incident, and agrees to indemnify and hold Releasee harmless from any claims by medical providers or lien holders. If the user prompt says "Include medical liens release: No", omit this section entirely.

7. CONFIDENTIALITY — CONDITIONAL: Only include this section if the user prompt indicates "Include confidentiality clause: Yes". If included, state that the parties agree to keep the terms and amount of this settlement strictly confidential and shall not disclose them to any third party except as required by law, to legal or tax advisors, or as necessary to enforce the agreement. If the user prompt says "Include confidentiality clause: No", omit this section entirely.

8. REPRESENTATIONS AND WARRANTIES — Both parties represent that they have full authority to enter into this agreement, that no prior assignment of claims has been made, and that they have read and understand the terms.

9. GOVERNING LAW — This agreement shall be governed by and construed in accordance with the laws of the State of Texas.

10. ENTIRE AGREEMENT — This agreement constitutes the entire agreement between the parties and supersedes all prior negotiations, representations, or agreements relating to this subject matter.

11. SIGNATURES — Signature blocks for both parties with printed name, signature line, and date line. Include an optional notary acknowledgment block.

ANNOTATIONS:
After the agreement text, output a section starting with "---ANNOTATIONS---" on its own line.
Below that, output one annotation per line in this exact format:
[N] SECTION_NAME: Plain-English explanation of what this section means and why it is in the agreement.

Number annotations sequentially starting from 1. Cover these sections at minimum:
- Parties (who is involved in the agreement)
- Recitals (what happened and why there is a settlement)
- Settlement Payment (how much is being paid and when)
- Release of Claims (what rights the plaintiff is giving up)
- Medical Liens (if included — why the plaintiff takes responsibility for medical bills)
- Confidentiality (if included — why the terms are kept private)
- Representations and Warranties (why both sides confirm their authority)
- Governing Law (which state's laws apply)
- Entire Agreement (why this replaces all prior discussions)

Use simple language a high school student could understand. Do NOT use legal jargon in the explanations.

Format the agreement professionally.`

  const user = buildUserPrompt(facts)

  return { system, user }
}
