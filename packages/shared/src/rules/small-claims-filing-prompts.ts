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

export function getDocumentFormat(subType: string, state?: string): string {
  if (state === 'CA') {
    switch (subType) {
      case 'security_deposit':
        return `This is a California small claims claim for a security deposit dispute. Include:
- FACTS: Describe the rental address, move-in and move-out dates, deposit amount paid, and landlord's failure to return the deposit.
- LEGAL BASIS: Cite Cal. Civil Code § 1950.5 — landlord must return the security deposit or provide an itemized statement of deductions within 21 days of the tenant vacating. (Texas has 30 days; California's deadline is 21 days.)
- BAD FAITH PENALTIES: Under Civil Code § 1950.5(l), a landlord who in bad faith retains a deposit may be liable for up to twice the amount of the deposit as a penalty, plus actual damages.
- DEDUCTIONS DISPUTE: Describe any improper deductions — normal wear and tear is not deductible under California law (Civil Code § 1950.5(b)).`

      case 'breach_of_contract':
        return `This is a California small claims claim for breach of contract. Include:
- CONTRACT: Describe the contract — parties, date, subject matter, key terms, and what each party promised.
- PERFORMANCE: Describe the Plaintiff's performance or readiness to perform.
- BREACH: Describe specifically how the Defendant breached the contract.
- DAMAGES: Describe the damages caused directly by the breach. Note: under California law, damages must be foreseeable at the time the contract was made (Civil Code §§ 3300–3301).`

      case 'consumer_refund':
        return `This is a California small claims claim for a consumer refund dispute. Include:
- PURCHASE: Describe the purchase — what was bought, when, where, and for how much.
- DEFECT OR FAILURE: Describe the defect, failure, or misrepresentation.
- REFUND ATTEMPTS: Describe attempts to obtain a refund, including dates and responses.
- LEGAL BASIS: If applicable, note the California Consumers Legal Remedies Act (CLRA, Civil Code § 1750 et seq.) or the Unfair Competition Law (Bus. & Prof. Code § 17200) — these provide remedies for consumers harmed by deceptive or unlawful business practices.`

      case 'property_damage':
        return `This is a California small claims claim for property damage. Include:
- PROPERTY: Describe the property damaged — type, location, and condition before the incident.
- CAUSE: Describe the incident, date, time, and how Defendant's actions or negligence caused the damage.
- REPAIR ESTIMATES: Include repair or replacement cost estimates (contractor quotes, receipts, etc.).`

      case 'car_accident':
        return `This is a California small claims claim for vehicle damage from a car accident. Include:
- ACCIDENT: Describe the accident — date, time, location, and how it occurred.
- FAULT: Describe how the Defendant's negligence or traffic violation caused the accident.
- COMPARATIVE FAULT: Note that California follows pure comparative fault (Li v. Yellow Cab Co., 13 Cal.3d 804 (1975)) — Plaintiff's recovery is reduced by their percentage of fault, but Plaintiff can recover even if mostly at fault.
- VEHICLE DAMAGE: Describe the damage to Plaintiff's vehicle and the cost of repairs or diminished value.`

      case 'neighbor_dispute':
        return `This is a California small claims claim for a neighbor dispute. Include:
- PARTIES AND ADDRESSES: Identify both parties and their property addresses.
- NATURE OF DISPUTE: Describe the specific conduct — encroachment, noise, water runoff, tree damage, fence disputes, etc.
- DURATION: Describe how long the issue has persisted.
- ATTEMPTS TO RESOLVE: Describe any attempts to resolve before filing.`

      case 'unpaid_loan':
        return `This is a California small claims claim for an unpaid loan or debt. Include:
- LOAN TERMS: Describe the loan — amount, date, interest rate (if any), repayment schedule, written or oral.
- PAYMENTS: Describe any payments made, including dates and amounts.
- OUTSTANDING BALANCE: State the current outstanding balance, including any agreed-upon interest.`

      default:
        return `This is a California small claims claim. Include:
- FACTS: A clear, chronological narrative of the facts giving rise to the claim.
- LEGAL BASIS: The legal theory supporting the claim under California law.
- DAMAGES: How the Plaintiff was harmed and the monetary value of the harm.`
    }
  }

  if (state === 'NY') {
    switch (subType) {
      case 'security_deposit':
        return `This is a New York small claims claim for a security deposit dispute. Include:
- FACTS: Describe the rental address, move-in and move-out dates, deposit amount paid, and landlord's failure to return the deposit.
- LEGAL BASIS: Cite N.Y. General Obligations Law § 7-108(1-a) — landlord must return the security deposit or provide an itemized statement of deductions within 14 days of the tenant vacating. (This 14-day deadline was enacted by the Housing Stability and Tenant Protection Act of 2019.)
- BAD FAITH PENALTIES: A landlord who wrongfully withholds a deposit may be liable for actual damages plus up to twice the amount wrongfully withheld if the court finds bad faith (GOL § 7-108(e)).
- DEDUCTIONS DISPUTE: Normal wear and tear is not deductible. Any improper deductions should be itemized and challenged.`

      case 'breach_of_contract':
        return `This is a New York small claims claim for breach of contract. Include:
- CONTRACT: Describe the contract — parties, date, subject matter, key terms, and consideration (what each party promised).
- PERFORMANCE: Describe the Plaintiff's performance or readiness to perform.
- BREACH: Describe specifically how the Defendant breached the contract.
- DAMAGES: Describe the damages caused by the breach. Note: New York's statute of limitations for contract claims is 6 years (CPLR § 213(2)).`

      case 'consumer_refund':
        return `This is a New York small claims claim for a consumer refund dispute. Include:
- PURCHASE: Describe the purchase — what was bought, when, where, and for how much.
- DEFECT OR FAILURE: Describe the defect, failure, or misrepresentation.
- REFUND ATTEMPTS: Describe attempts to obtain a refund, including dates and responses.
- LEGAL BASIS: If applicable, note New York General Business Law § 349 (deceptive acts and practices) or § 350 (false advertising) — these provide remedies for consumers harmed by deceptive or false business practices.`

      case 'property_damage':
        return `This is a New York small claims claim for property damage. Include:
- PROPERTY: Describe the property damaged — type, location, and condition before the incident.
- CAUSE: Describe the incident, date, time, and how Defendant's actions or negligence caused the damage.
- REPAIR ESTIMATES: Include repair or replacement cost estimates (contractor quotes, receipts, etc.).`

      case 'car_accident':
        return `This is a New York small claims claim for vehicle damage from a car accident. Include:
- ACCIDENT: Describe the accident — date, time, location, and how it occurred.
- FAULT: Describe how the Defendant's negligence or traffic violation caused the accident.
- COMPARATIVE FAULT: Note that New York follows pure comparative negligence (CPLR § 1411) — Plaintiff's recovery is reduced by their percentage of fault, but Plaintiff can recover even if mostly at fault.
- VEHICLE DAMAGE: Describe the damage to Plaintiff's vehicle and the cost of repairs or diminished value.`

      case 'neighbor_dispute':
        return `This is a New York small claims claim for a neighbor dispute. Include:
- PARTIES AND ADDRESSES: Identify both parties and their property addresses.
- NATURE OF DISPUTE: Describe the specific conduct — encroachment, noise, water runoff, tree damage, fence disputes, etc.
- DURATION: Describe how long the issue has persisted.
- ATTEMPTS TO RESOLVE: Describe any attempts to resolve before filing.`

      case 'unpaid_loan':
        return `This is a New York small claims claim for an unpaid loan or debt. Include:
- LOAN TERMS: Describe the loan — amount, date, interest rate (if any), repayment schedule, written or oral.
- PAYMENTS: Describe any payments made, including dates and amounts.
- OUTSTANDING BALANCE: State the current outstanding balance, including any agreed-upon interest. Note: New York's statute of limitations for contract claims is 6 years (CPLR § 213(2)).`

      default:
        return `This is a New York small claims claim. Include:
- FACTS: A clear, chronological narrative of the facts giving rise to the claim.
- LEGAL BASIS: The legal theory supporting the claim under New York law.
- DAMAGES: How the Plaintiff was harmed and the monetary value of the harm.`
    }
  }

  if (state === 'FL') {
    switch (subType) {
      case 'security_deposit':
        return `This is a Florida small claims claim for a security deposit dispute. Include:
- FACTS: Describe the rental address, move-in and move-out dates, deposit amount paid, and landlord's failure to return the deposit.
- LEGAL BASIS: Cite Fla. Stat. § 83.49 — if the landlord makes no claim on the deposit, they must return it within 15 days of the tenant vacating. If the landlord claims a deduction, they must send written notice of the claim within 30 days and return any remaining balance within 30 days.
- BAD FAITH PENALTIES: A landlord who wrongfully withholds a deposit in bad faith may be liable for the deposit amount plus damages and attorney's fees (Fla. Stat. § 83.49(3)(c)).
- DEDUCTIONS DISPUTE: Normal wear and tear is not deductible. Any improper deductions should be itemized and challenged.`

      case 'breach_of_contract':
        return `This is a Florida small claims claim for breach of contract. Include:
- CONTRACT: Describe the contract — parties, date, subject matter, key terms, and consideration (what each party promised).
- PERFORMANCE: Describe the Plaintiff's performance or readiness to perform.
- BREACH: Describe specifically how the Defendant breached the contract.
- DAMAGES: Describe the damages caused by the breach. Note: Florida's statute of limitations for written contract claims is 5 years (Fla. Stat. § 95.11(2)(b)); oral contracts are 4 years (Fla. Stat. § 95.11(3)(k)).`

      case 'consumer_refund':
        return `This is a Florida small claims claim for a consumer refund dispute. Include:
- PURCHASE: Describe the purchase — what was bought, when, where, and for how much.
- DEFECT OR FAILURE: Describe the defect, failure, or misrepresentation.
- REFUND ATTEMPTS: Describe attempts to obtain a refund, including dates and responses.
- LEGAL BASIS: If applicable, note the Florida Deceptive and Unfair Trade Practices Act (FDUTPA), Fla. Stat. § 501.201 et seq. — provides remedies for consumers harmed by unfair or deceptive business practices.`

      case 'property_damage':
        return `This is a Florida small claims claim for property damage. Include:
- PROPERTY: Describe the property damaged — type, location, and condition before the incident.
- CAUSE: Describe the incident, date, time, and how Defendant's actions or negligence caused the damage.
- REPAIR ESTIMATES: Include repair or replacement cost estimates (contractor quotes, receipts, etc.).`

      case 'car_accident':
        return `This is a Florida small claims claim for vehicle damage from a car accident. Include:
- ACCIDENT: Describe the accident — date, time, location, and how it occurred.
- FAULT: Describe how the Defendant's negligence or traffic violation caused the accident.
- COMPARATIVE FAULT: Note that Florida follows modified comparative negligence (Fla. Stat. § 768.81, as amended effective March 24, 2023) — a plaintiff who is more than 50% at fault may not recover damages. If Plaintiff is 50% or less at fault, recovery is reduced by the percentage of fault.
- VEHICLE DAMAGE: Describe the damage to Plaintiff's vehicle and the cost of repairs or diminished value.`

      case 'neighbor_dispute':
        return `This is a Florida small claims claim for a neighbor dispute. Include:
- PARTIES AND ADDRESSES: Identify both parties and their property addresses.
- NATURE OF DISPUTE: Describe the specific conduct — encroachment, noise, water runoff, tree damage, fence disputes, etc.
- DURATION: Describe how long the issue has persisted.
- ATTEMPTS TO RESOLVE: Describe any attempts to resolve before filing.`

      case 'unpaid_loan':
        return `This is a Florida small claims claim for an unpaid loan or debt. Include:
- LOAN TERMS: Describe the loan — amount, date, interest rate (if any), repayment schedule, written or oral.
- PAYMENTS: Describe any payments made, including dates and amounts.
- OUTSTANDING BALANCE: State the current outstanding balance. Note: Florida's statute of limitations for written contract claims is 5 years (Fla. Stat. § 95.11(2)(b)); oral agreements are 4 years (Fla. Stat. § 95.11(3)(k)).`

      default:
        return `This is a Florida small claims claim. Include:
- FACTS: A clear, chronological narrative of the facts giving rise to the claim.
- LEGAL BASIS: The legal theory supporting the claim under Florida law.
- DAMAGES: How the Plaintiff was harmed and the monetary value of the harm.`
    }
  }

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

function buildUserPrompt(facts: SmallClaimsFilingFacts, resolvedState?: string): string {
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

  const courtTypeLabel = resolvedState === 'CA'
    ? 'Small Claims Court (Superior Court)'
    : resolvedState === 'NY'
    ? 'Small Claims Court (UCCA §1801)'
    : resolvedState === 'FL'
    ? 'County Court, Small Claims Division'
    : 'Justice Court (JP)'

  const courtSection = [
    '--- COURT ---',
    `Court type: ${courtTypeLabel}`,
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

export function buildSmallClaimsFilingPrompt(facts: SmallClaimsFilingFacts, state?: string): FilingPrompt {
  const resolvedState = state ?? facts.state
  const docTitle = getDocumentTitle(facts.claim_sub_type)
  const format = getDocumentFormat(facts.claim_sub_type, resolvedState)

  const isCA = resolvedState === 'CA'
  const isNY = resolvedState === 'NY'
  const isFL = resolvedState === 'FL'
  // NYC boroughs — use NYC Civil Court; all other NY counties use city/district/town court
  const NYC_BOROUGHS = new Set(['New York', 'Kings', 'Bronx', 'Queens', 'Richmond'])
  const isNYC = isNY && NYC_BOROUGHS.has(facts.county)

  const courtLabel = isCA
    ? `Small Claims Court, ${facts.county} County`
    : isNYC
    ? `New York City Civil Court, Small Claims Part, ${facts.county} County`
    : isNY
    ? `Small Claims Court, ${facts.county} County`
    : isFL
    ? `County Court, Small Claims Division, ${facts.county} County, Florida`
    : `Justice Court${facts.precinct ? `, Precinct ${facts.precinct}` : ''}, ${facts.county} County, Texas`

  const captionLine = isCA
    ? `SUPERIOR COURT OF CALIFORNIA, COUNTY OF ${facts.county.toUpperCase()}, SMALL CLAIMS DIVISION`
    : isNYC
    ? `CIVIL COURT OF THE CITY OF NEW YORK, COUNTY OF ${facts.county.toUpperCase()} — SMALL CLAIMS PART`
    : isNY
    ? `${facts.county.toUpperCase()} COUNTY — SMALL CLAIMS PART`
    : isFL
    ? `IN THE COUNTY COURT IN AND FOR ${facts.county.toUpperCase()} COUNTY, FLORIDA — SMALL CLAIMS DIVISION`
    : `In the Justice Court, Precinct ${facts.precinct ?? '___'}, ${facts.county} County, Texas`

  const docTitleLine = isCA
    ? `PLAINTIFF'S CLAIM AND ORDER TO GO TO SMALL CLAIMS COURT — ${docTitle}`
    : isNY
    ? `NOTICE OF SMALL CLAIM — ${docTitle}`
    : isFL
    ? `PLAINTIFF'S STATEMENT OF CLAIM — ${docTitle}`
    : `PLAINTIFF'S ORIGINAL PETITION (SMALL CLAIMS) — ${docTitle}`

  const jurisdictionClause = isCA
    ? `This court has jurisdiction under Cal. Code Civ. Proc. § 116.221 because the amount in controversy does not exceed $12,500 (individual plaintiff).`
    : isNY
    ? `This court has jurisdiction under Uniform City Court Act § 1801 (NYC) or Uniform District Court Act § 1801 (outside NYC) because the amount in controversy does not exceed $10,000 (NYC) or $5,000 (outside NYC).`
    : isFL
    ? facts.claim_amount && facts.claim_amount > 8000
      ? `JURISDICTION WARNING: Florida small claims jurisdiction under Fla. Stat. § 34.01 is limited to $8,000. The stated claim amount ($${facts.claim_amount.toLocaleString()}) exceeds this limit. You may need to file in County Court (general civil jurisdiction) or reduce your claim to $8,000. Consult the clerk before filing.`
      : `This court has jurisdiction under Fla. Stat. § 34.01 because the amount in controversy does not exceed $8,000.`
    : `This court has jurisdiction under Tex. Gov. Code § 27.031 because the amount in controversy does not exceed $20,000.`

  const applicableRules = isCA
    ? `This claim is governed by the California Small Claims Act, Cal. Code Civ. Proc. §§ 116.110–116.950. Note: attorneys may not represent parties at a California small claims hearing (CCP § 116.530).`
    : isNY
    ? `This claim is governed by New York UCCA Article 18 (NYC) or UDCA Article 18 (outside NYC). Note: attorneys may represent parties in New York Small Claims Court, though most hearings proceed without counsel.`
    : isFL
    ? `This claim is governed by the Florida Rules of Small Claims Procedure (Fla. R. Sm. Cl. P.) and Fla. Stat. Chapter 34. Attorneys may represent parties in Florida Small Claims Court.`
    : `This petition is governed by the Texas Rules of Civil Procedure, Rules 500-507 (proceedings in justice courts). Cite TRCP 500-507 where appropriate.`

  const verificationLine = isCA
    ? `I declare under penalty of perjury under the laws of the State of California that the foregoing is true and correct. Executed on [date] at [city], California.`
    : isNY
    ? `I certify that the foregoing statements made by me are true. I am aware that if any of the foregoing statements made by me are willfully false, I am subject to punishment.`
    : isFL
    ? `Under penalties of perjury, I declare that I have read the foregoing, and the facts alleged are true to the best of my knowledge and belief. (Fla. Stat. § 92.525)`
    : `My name is [Plaintiff name]. I declare under penalty of perjury that the foregoing is true and correct. Executed on [date].`

  const signatureLabel = isCA ? 'Plaintiff in Pro Per' : 'Pro Se'

  const system = `You are a legal document formatting assistant. You help self-represented (${signatureLabel}) litigants format their small claims court filings for ${courtLabel}.

IMPORTANT RULES:
- You format documents. You do NOT provide legal advice.
- Mark the output clearly as "DRAFT — NOT FOR FILING" at the top.
- Use only the facts provided. Do not invent or assume additional facts.
- Do not predict outcomes or make strategic recommendations.
- Use plain, clear language appropriate for a pro se filer.
- ALWAYS use "Plaintiff" and "Defendant" terminology.

DOCUMENT FORMAT:
Generate a "${docTitleLine}" for the ${courtLabel}.

Caption: "${captionLine}"

The document must include these sections:

1. CAPTION — Court name, case number (if known), and party names (Plaintiff v. Defendant).

2. PARTIES — Full names and addresses of Plaintiff and Defendant.${facts.defendant_is_business ? ' Note that the Defendant is a business entity.' : ''}

3. JURISDICTION — ${jurisdictionClause}

4. FACTS — Plain language description of the events giving rise to the claim.

${format}

5. DAMAGES — Itemized table of damages claimed, with category, amount, and description for each item. Total must match the claimed amount.

6. DEMAND LETTER — ${facts.demand_letter_sent ? 'State that a demand letter was sent to the Defendant' + (facts.demand_letter_date ? ` on ${facts.demand_letter_date}` : '') + ' and the Defendant failed to respond or resolve the matter.' : 'Note that the Plaintiff is prepared to send a formal demand letter if required by the court.'}

7. PRAYER FOR RELIEF — Formal request asking the court to award:
   - The total damages amount
   - Court costs
   - Any other relief the court deems just and equitable

8. VERIFICATION — A sworn statement: "${verificationLine}"

9. SIGNATURE BLOCK — "Respectfully submitted" with Plaintiff's name, address, phone number, and "${signatureLabel}" designation.

APPLICABLE RULES:
${applicableRules}

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

  const user = buildUserPrompt(facts, resolvedState)

  return { system, user }
}
