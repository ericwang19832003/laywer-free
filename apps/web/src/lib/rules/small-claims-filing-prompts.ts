import type { SmallClaimsFilingFacts } from '@lawyer-free/shared/schemas/small-claims-filing'

interface FilingPrompt {
  system: string
  user: string
}

export function getDocumentTitle(subType: string): string {
  switch (subType) {
    case 'security_deposit':
      return 'Security Deposit Dispute'
    case 'breach_of_contract':
      return 'Breach of Contract'
    case 'consumer_refund':
      return 'Consumer Refund Dispute'
    case 'property_damage':
      return 'Property Damage Claim'
    case 'car_accident':
      return 'Vehicle Damage Claim'
    case 'neighbor_dispute':
      return 'Neighbor Dispute'
    case 'unpaid_loan':
      return 'Unpaid Debt Claim'
    case 'other':
      return 'Small Claims Petition'
    default:
      return 'Small Claims Petition'
  }
}

export function getDocumentFormat(subType: string): string {
  switch (subType) {
    case 'security_deposit':
      return `This is a Texas small claims petition for a security deposit dispute. Include:
- FACTS: Describe the lease, property address, move-in and move-out dates, deposit amount paid, and landlord's failure to return the deposit or provide an itemized accounting.
- LEGAL BASIS: Cite Tex. Prop. Code § 92.104 — landlord must return the security deposit or provide a written description and itemized list of deductions within 30 days after the tenant surrenders the premises.
- BAD FAITH PENALTIES: Cite Tex. Prop. Code § 92.109 — if the landlord acted in bad faith by retaining the deposit, the tenant may recover three times the portion wrongfully withheld plus $100 in statutory damages, reasonable attorney's fees, and court costs.
- DEDUCTIONS DISPUTE: If the landlord made improper deductions, describe each deduction and why it is improper (normal wear and tear, pre-existing condition, etc.).`

    case 'breach_of_contract':
      return `This is a Texas small claims petition for breach of contract. Include:
- CONTRACT: Describe the contract — parties, date, subject matter, key terms, and consideration (what each party promised).
- PERFORMANCE: Describe the Plaintiff's performance or readiness to perform under the contract.
- BREACH: Describe specifically how the Defendant breached the contract — what they failed to do or did in violation of the terms.
- DAMAGES: Describe the damages caused directly by the breach, including the causal connection between the breach and each claimed damage.`

    case 'consumer_refund':
      return `This is a Texas small claims petition for a consumer refund dispute. Include:
- PURCHASE: Describe the purchase — what was bought, when, where, and for how much.
- DEFECT OR FAILURE: Describe the defect, failure, or misrepresentation that entitles the consumer to a refund.
- REFUND ATTEMPTS: Describe attempts to obtain a refund from the seller, including dates and responses.
- LEGAL BASIS: If applicable, cite the Texas Deceptive Trade Practices Act (DTPA), Tex. Bus. & Com. Code § 17.50, which provides remedies for consumers harmed by false, misleading, or deceptive acts or practices.`

    case 'property_damage':
      return `This is a Texas small claims petition for property damage. Include:
- PROPERTY: Describe the property that was damaged — type, location, and condition before the incident.
- CAUSE: Describe the incident that caused the damage, including date, time, and how the Defendant's actions or negligence caused it.
- REPAIR ESTIMATES: Include repair or replacement cost estimates with sources (contractor quotes, receipts, etc.).`

    case 'car_accident':
      return `This is a Texas small claims petition for vehicle damage from a car accident. Include:
- ACCIDENT: Describe the accident — date, time, location, weather conditions, and how it occurred.
- FAULT: Describe how the Defendant's negligence or traffic violation caused the accident.
- COMPARATIVE NEGLIGENCE: Note that Texas follows a modified comparative negligence rule (Tex. Civ. Prac. & Rem. Code § 33.001) — Plaintiff's recovery may be reduced by their percentage of fault, and barred if Plaintiff is more than 50% at fault.
- VEHICLE DAMAGE: Describe the damage to Plaintiff's vehicle and the cost of repairs or diminished value.`

    case 'neighbor_dispute':
      return `This is a Texas small claims petition for a neighbor dispute. Include:
- PARTIES AND ADDRESSES: Identify both parties and their property addresses to establish the neighbor relationship.
- NATURE OF DISPUTE: Describe the specific conduct causing harm — property encroachment, noise, water runoff, tree damage, fence disputes, etc.
- DURATION: Describe how long the issue has persisted and any pattern of repeated conduct.
- ATTEMPTS TO RESOLVE: Describe any attempts to resolve the dispute directly with the neighbor before filing suit.`

    case 'unpaid_loan':
      return `This is a Texas small claims petition for an unpaid loan or debt. Include:
- LOAN TERMS: Describe the loan — amount, date, interest rate (if any), repayment schedule, and whether it was written or oral.
- PAYMENTS: Describe any payments made by the Defendant, including dates and amounts.
- OUTSTANDING BALANCE: Calculate and state the current outstanding balance, including any agreed-upon interest.`

    default:
      return `This is a Texas small claims petition. Include:
- FACTS: A clear, chronological narrative of the facts giving rise to the claim.
- LEGAL BASIS: The legal theory supporting the claim.
- DAMAGES: How the Plaintiff was harmed and the monetary value of the harm.`
  }
}

function buildUserPrompt(facts: SmallClaimsFilingFacts): string {
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

  const courtSection = [
    '--- COURT ---',
    `Court type: Justice Court (JP)`,
    `County: ${facts.county}`,
    facts.precinct ? `Precinct: ${facts.precinct}` : null,
    facts.cause_number ? `Cause number: ${facts.cause_number}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  const claimSection = [
    '--- CLAIM ---',
    `Claim type: ${facts.claim_sub_type.replace(/_/g, ' ')}`,
    `Total amount sought: $${facts.claim_amount.toLocaleString()}`,
    `Incident date: ${facts.incident_date}`,
  ]
    .filter(Boolean)
    .join('\n')

  const damagesSection = [
    '--- DAMAGES BREAKDOWN ---',
    ...facts.damages_breakdown.map(
      (d) =>
        `- ${d.category}: $${d.amount.toLocaleString()}${d.description ? ` (${d.description})` : ''}`
    ),
  ].join('\n')

  const descriptionSection = ['--- DESCRIPTION ---', facts.description].join('\n')

  const demandLetterSection = [
    '--- DEMAND LETTER ---',
    `Demand letter sent: ${facts.demand_letter_sent ? 'Yes' : 'No'}`,
    facts.demand_letter_date ? `Demand letter date: ${facts.demand_letter_date}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  // Sub-type-specific sections
  const subTypeSection = (() => {
    const lines: string[] = []
    if (
      facts.claim_sub_type === 'security_deposit' &&
      (facts.lease_dates || facts.deposit_amount !== undefined)
    ) {
      lines.push('--- SECURITY DEPOSIT DETAILS ---')
      if (facts.lease_dates) lines.push(`Lease dates: ${facts.lease_dates}`)
      if (facts.deposit_amount !== undefined)
        lines.push(`Deposit amount: $${facts.deposit_amount.toLocaleString()}`)
    }
    if (
      facts.claim_sub_type === 'breach_of_contract' &&
      facts.contract_date
    ) {
      lines.push('--- CONTRACT DETAILS ---')
      lines.push(`Contract date: ${facts.contract_date}`)
    }
    if (
      facts.claim_sub_type === 'unpaid_loan' &&
      (facts.loan_amount !== undefined || facts.loan_date)
    ) {
      lines.push('--- LOAN DETAILS ---')
      if (facts.loan_amount !== undefined)
        lines.push(`Loan amount: $${facts.loan_amount.toLocaleString()}`)
      if (facts.loan_date) lines.push(`Loan date: ${facts.loan_date}`)
    }
    if (facts.claim_sub_type === 'car_accident' && facts.accident_date) {
      lines.push('--- ACCIDENT DETAILS ---')
      lines.push(`Accident date: ${facts.accident_date}`)
    }
    return lines.length > 0 ? lines.join('\n') : null
  })()

  return [
    `Small claims sub-type: ${facts.claim_sub_type}`,
    '',
    partiesSection,
    '',
    courtSection,
    '',
    claimSection,
    '',
    damagesSection,
    '',
    descriptionSection,
    '',
    demandLetterSection,
    subTypeSection ? `\n${subTypeSection}` : null,
  ]
    .filter((s) => s !== null)
    .join('\n')
}

export function buildSmallClaimsFilingPrompt(facts: SmallClaimsFilingFacts): FilingPrompt {
  const docTitle = getDocumentTitle(facts.claim_sub_type)
  const format = getDocumentFormat(facts.claim_sub_type)

  const system = `You are a legal document formatting assistant. You help self-represented (pro se) litigants format their small claims court filings for Texas Justice of the Peace (JP) Courts.

IMPORTANT RULES:
- You format documents. You do NOT provide legal advice.
- Mark the output clearly as "DRAFT — NOT FOR FILING" at the top.
- Use only the facts provided. Do not invent or assume additional facts.
- Do not predict outcomes or make strategic recommendations.
- Use plain, clear language appropriate for a pro se filer.
- ALWAYS use "Plaintiff" and "Defendant" terminology. Small claims cases in JP Court use civil-case party labels, NOT family-law party labels.

DOCUMENT FORMAT:
Generate a "PLAINTIFF'S ORIGINAL PETITION (SMALL CLAIMS) — ${docTitle}" for the Justice Court${facts.precinct ? `, Precinct ${facts.precinct}` : ''}, ${facts.county} County, Texas.

Caption: "In the Justice Court, Precinct ${facts.precinct ?? '___'}, ${facts.county} County, Texas"

The petition must include these sections:

1. CAPTION — Court name, cause number (if known), and party names (Plaintiff v. Defendant).

2. PARTIES — Full names and addresses of Plaintiff and Defendant.${facts.defendant_is_business ? ' Note that the Defendant is a business entity.' : ''}

3. JURISDICTION — This court has jurisdiction under Tex. Gov. Code § 27.031 because the amount in controversy does not exceed $20,000.

4. FACTS — Plain language description of the events giving rise to the claim.

${format}

5. DAMAGES — Itemized table of damages claimed, with category, amount, and description for each item. Total must match the claimed amount.

6. DEMAND LETTER — ${facts.demand_letter_sent ? 'State that a demand letter was sent to the Defendant' + (facts.demand_letter_date ? ` on ${facts.demand_letter_date}` : '') + ' and the Defendant failed to respond or resolve the matter.' : 'Note that the Plaintiff is prepared to send a formal demand letter if required by the court.'}

7. PRAYER FOR RELIEF — Formal request asking the court to award:
   - The total damages amount
   - Court costs
   - Any other relief the court deems just and equitable

8. VERIFICATION — A sworn statement: "My name is [Plaintiff name]. I declare under penalty of perjury that the foregoing is true and correct. Executed on [date]."

9. PRO SE SIGNATURE BLOCK — "Respectfully submitted" with Plaintiff's name, address, phone number, and "Pro Se" designation.

APPLICABLE RULES:
This petition is governed by the Texas Rules of Civil Procedure, Rules 500-507 (proceedings in justice courts). Cite TRCP 500-507 where appropriate.

ANNOTATIONS:
After the document text, output a section starting with "---ANNOTATIONS---" on its own line.
Below that, output one annotation per line in this exact format:
[N] SECTION_NAME: Plain-English explanation of what this section means and why it is in the document.

Number annotations sequentially starting from 1. Cover these sections at minimum:
- Caption (the header with court name and parties)
- Parties (who is involved — Plaintiff and Defendant)
- Jurisdiction (why this court can hear the case)
- Facts (what happened)
- Damages (the money you are claiming)
- Prayer for Relief (what you are asking the court to do)
- Verification (the sworn statement)
- Signature Block (where you sign)

Use simple language a high school student could understand. Do NOT use legal jargon in the explanations.

Format the document professionally with proper legal formatting.`

  const user = buildUserPrompt(facts)

  return { system, user }
}
