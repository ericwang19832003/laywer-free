import type { LandlordTenantFilingFacts } from '../schemas/landlord-tenant-filing'

interface FilingPrompt {
  system: string
  user: string
}

// ---------------------------------------------------------------------------
// Document title by sub-type and party role
// ---------------------------------------------------------------------------

export function getDocumentTitle(subType: string, partyRole: string): string {
  switch (subType) {
    case 'eviction':
      return 'PETITION FOR FORCIBLE ENTRY AND DETAINER'
    case 'nonpayment':
      return 'PETITION FOR NONPAYMENT OF RENT AND EVICTION'
    case 'security_deposit':
      return 'PETITION FOR RETURN OF SECURITY DEPOSIT'
    case 'property_damage':
      return 'PETITION FOR PROPERTY DAMAGES'
    case 'repair_maintenance':
      return 'PETITION FOR REPAIR AND REMEDY'
    case 'lease_termination':
      return 'PETITION FOR BREACH OF LEASE AND TERMINATION'
    case 'habitability':
      return 'PETITION FOR BREACH OF WARRANTY OF HABITABILITY'
    case 'other':
    default:
      return 'PETITION — LANDLORD-TENANT DISPUTE'
  }
}

// ---------------------------------------------------------------------------
// Sub-type-specific document format guidance
// ---------------------------------------------------------------------------

export function getDocumentFormat(subType: string): string {
  switch (subType) {
    case 'eviction':
      return `This is a Texas landlord-tenant petition for eviction (forcible entry and detainer). Include:
- FACTS: Describe the lease, property address, the tenant's violation or failure to vacate, and the notice given.
- LEGAL BASIS: Cite Tex. Prop. Code § 24.005 — notice to vacate requirements.
- NOTICE: Describe the notice to vacate provided, including date, method of delivery, and cure period (if any).
- TRCP 510: This action is governed by Texas Rules of Civil Procedure, Rule 510 (Eviction Cases).`

    case 'nonpayment':
      return `This is a Texas landlord-tenant petition for nonpayment of rent. Include:
- FACTS: Describe the lease, monthly rent amount, the period(s) of nonpayment, and the total outstanding balance.
- LEGAL BASIS: Cite Tex. Prop. Code § 24.005 — the landlord must give written notice to vacate at least 3 days before filing suit for nonpayment, unless the lease specifies a different period.
- NOTICE: Describe the notice to vacate, including date and method of delivery.`

    case 'security_deposit':
      return `This is a Texas landlord-tenant petition for return of security deposit. Include:
- FACTS: Describe the lease, deposit amount paid, move-out date, and the landlord's failure to return the deposit or provide an itemized accounting within 30 days.
- LEGAL BASIS: Cite Tex. Prop. Code § 92.104 — landlord must return the deposit or provide written itemized deductions within 30 days.
- BAD FAITH PENALTIES: Cite Tex. Prop. Code § 92.109 — if the landlord retained the deposit in bad faith, the tenant may recover three times the wrongfully withheld amount plus $100 statutory damages and reasonable attorney's fees.
- DEDUCTIONS: If the landlord made improper deductions, describe each and why it is improper.`

    case 'property_damage':
      return `This is a Texas landlord-tenant petition for property damages. Include:
- FACTS: Describe the property that was damaged, what caused the damage, and the responsible party's negligence or intentional acts.
- DAMAGES: Itemize each damage with repair or replacement costs supported by estimates or receipts.`

    case 'repair_maintenance':
      return `This is a Texas landlord-tenant petition for repair and remedy. Include:
- FACTS: Describe the condition requiring repair, when it was first reported, and the landlord's failure to act.
- LEGAL BASIS: Cite Tex. Prop. Code § 92.0563 — tenant's remedies for landlord's failure to repair.
- REPAIR REQUESTS: List each repair request with date, issue reported, and landlord's response (or lack thereof).
- NOTICE: Describe the written notice given to the landlord, the reasonable time allowed, and the landlord's failure to make a diligent effort to repair.`

    case 'lease_termination':
      return `This is a Texas landlord-tenant petition for breach of lease and termination. Include:
- FACTS: Describe the lease terms, the breach committed by the other party, and the impact on the complaining party.
- BREACH: Specify which lease provisions were violated and how.
- NOTICE: Describe any notice of breach or cure period provided before filing.`

    case 'habitability':
      return `This is a Texas landlord-tenant petition for breach of warranty of habitability. Include:
- FACTS: Describe the conditions that materially affect the physical health or safety of an ordinary tenant.
- LEGAL BASIS: Cite Tex. Prop. Code § 92.052 — the landlord's duty to make diligent efforts to repair conditions affecting habitability.
- NOTICE: Describe the written notice given to the landlord and the reasonable time allowed for repair.
- CONDITIONS: Detail each habitability issue, including severity and duration.`

    case 'other':
    default:
      return `This is a Texas landlord-tenant petition. Include:
- FACTS: A clear, chronological narrative of the facts giving rise to the claim.
- LEGAL BASIS: The legal theory supporting the claim.
- DAMAGES: How the filing party was harmed and the monetary value of the harm.`
  }
}

// ---------------------------------------------------------------------------
// Texas Property Code citations per sub-type
// ---------------------------------------------------------------------------

function getPropertyCodeCitations(subType: string): string {
  switch (subType) {
    case 'security_deposit':
      return `TEXAS PROPERTY CODE CITATIONS:
- Tex. Prop. Code § 92.104 — Obligation to return security deposit within 30 days.
- Tex. Prop. Code § 92.109 — Bad faith retention: treble damages plus $100 statutory damages.`

    case 'habitability':
      return `TEXAS PROPERTY CODE CITATIONS:
- Tex. Prop. Code § 92.052 — Landlord's duty to repair conditions materially affecting health or safety.`

    case 'repair_maintenance':
      return `TEXAS PROPERTY CODE CITATIONS:
- Tex. Prop. Code § 92.0563 — Tenant's remedies when landlord fails to repair after proper notice.`

    case 'eviction':
      return `TEXAS PROPERTY CODE CITATIONS:
- Tex. Prop. Code § 24.005 — Notice to vacate requirements.
- TRCP 510 — Eviction case procedures in justice court.`

    case 'nonpayment':
      return `TEXAS PROPERTY CODE CITATIONS:
- Tex. Prop. Code § 24.005 — Notice to vacate for nonpayment of rent.`

    default:
      return ''
  }
}

// ---------------------------------------------------------------------------
// Court caption
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Role labels
// ---------------------------------------------------------------------------

function getRoleLabels(partyRole: 'landlord' | 'tenant') {
  if (partyRole === 'landlord') {
    return { filerLabel: 'Landlord', opposingLabel: 'Tenant' }
  }
  return { filerLabel: 'Tenant', opposingLabel: 'Landlord' }
}

// ---------------------------------------------------------------------------
// User prompt builder
// ---------------------------------------------------------------------------

function buildUserPrompt(facts: LandlordTenantFilingFacts): string {
  const { filerLabel, opposingLabel } = getRoleLabels(facts.party_role)
  const caption = getCourtCaption(facts.court_type, facts.county, facts.cause_number)
  const docTitle = getDocumentTitle(facts.landlord_tenant_sub_type, facts.party_role)

  const captionSection = [
    '--- COURT CAPTION ---',
    caption,
  ].join('\n')

  const titleSection = [
    '--- DOCUMENT TITLE ---',
    docTitle,
  ].join('\n')

  const partiesSection = [
    '--- PARTIES ---',
    `${filerLabel} (Filing Party): ${facts.your_info.full_name}`,
    facts.your_info.address
      ? `Address: ${facts.your_info.address}, ${facts.your_info.city ?? ''}, ${facts.your_info.state ?? ''} ${facts.your_info.zip ?? ''}`
      : null,
    `${opposingLabel} (Opposing Party): ${facts.other_party.full_name}`,
    facts.other_party.address
      ? `Address: ${facts.other_party.address}, ${facts.other_party.city ?? ''}, ${facts.other_party.state ?? ''} ${facts.other_party.zip ?? ''}`
      : null,
  ]
    .filter(Boolean)
    .join('\n')

  const propertySection = [
    '--- PROPERTY ---',
    `Property address: ${facts.property_address}`,
    facts.lease_start_date ? `Lease start date: ${facts.lease_start_date}` : null,
    facts.lease_end_date ? `Lease end date: ${facts.lease_end_date}` : null,
    facts.lease_type ? `Lease type: ${facts.lease_type}` : null,
    facts.monthly_rent !== undefined ? `Monthly rent: $${facts.monthly_rent.toLocaleString()}` : null,
    facts.deposit_amount !== undefined ? `Security deposit: $${facts.deposit_amount.toLocaleString()}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  const factsSection = [
    '--- CASE FACTS ---',
    facts.description,
  ].join('\n')

  const damagesSection = [
    '--- DAMAGES BREAKDOWN ---',
    ...facts.damages_breakdown.map(
      (d) =>
        `- ${d.category}: $${d.amount.toLocaleString()}${d.description ? ` (${d.description})` : ''}`
    ),
    `Total claimed: $${facts.claim_amount.toLocaleString()}`,
  ].join('\n')

  const demandLetterSection = [
    '--- DEMAND LETTER ---',
    `Demand letter sent: ${facts.demand_letter_sent ? 'Yes' : 'No'}`,
    facts.demand_letter_date ? `Demand letter date: ${facts.demand_letter_date}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  // Sub-type-specific sections
  const subTypeSections: string[] = []

  // Eviction notice details
  if (
    (facts.landlord_tenant_sub_type === 'eviction' || facts.landlord_tenant_sub_type === 'nonpayment') &&
    (facts.eviction_notice_date || facts.eviction_notice_type || facts.eviction_reason)
  ) {
    const lines = ['--- EVICTION NOTICE DETAILS ---']
    if (facts.eviction_notice_date) lines.push(`Notice date: ${facts.eviction_notice_date}`)
    if (facts.eviction_notice_type) lines.push(`Notice type: ${facts.eviction_notice_type}`)
    if (facts.eviction_reason) lines.push(`Reason: ${facts.eviction_reason}`)
    subTypeSections.push(lines.join('\n'))
  }

  // Repair requests
  if (
    (facts.landlord_tenant_sub_type === 'repair_maintenance' || facts.landlord_tenant_sub_type === 'habitability') &&
    facts.repair_requests &&
    facts.repair_requests.length > 0
  ) {
    const lines = ['--- REPAIR REQUESTS ---']
    facts.repair_requests.forEach((r, i) => {
      lines.push(`${i + 1}. Date: ${r.date} | Issue: ${r.issue}${r.response ? ` | Response: ${r.response}` : ''}${r.status ? ` | Status: ${r.status}` : ''}`)
    })
    subTypeSections.push(lines.join('\n'))
  }

  // Deposit deductions
  if (
    facts.landlord_tenant_sub_type === 'security_deposit' &&
    facts.deposit_deductions &&
    facts.deposit_deductions.length > 0
  ) {
    const lines = ['--- DEPOSIT DEDUCTIONS CLAIMED BY LANDLORD ---']
    facts.deposit_deductions.forEach((d) => {
      lines.push(`- $${d.amount.toLocaleString()}: ${d.reason}`)
    })
    subTypeSections.push(lines.join('\n'))
  }

  // Habitability issues
  if (facts.landlord_tenant_sub_type === 'habitability' && facts.habitability_issues) {
    subTypeSections.push(`--- HABITABILITY ISSUES ---\n${facts.habitability_issues}`)
  }

  return [
    captionSection,
    '',
    titleSection,
    '',
    partiesSection,
    '',
    propertySection,
    '',
    factsSection,
    '',
    damagesSection,
    '',
    demandLetterSection,
    ...subTypeSections.map((s) => `\n${s}`),
  ]
    .filter((s) => s !== null)
    .join('\n')
}

// ---------------------------------------------------------------------------
// Main prompt builder
// ---------------------------------------------------------------------------

export function buildLandlordTenantFilingPrompt(facts: LandlordTenantFilingFacts): FilingPrompt {
  const { filerLabel, opposingLabel } = getRoleLabels(facts.party_role)
  const docTitle = getDocumentTitle(facts.landlord_tenant_sub_type, facts.party_role)
  const format = getDocumentFormat(facts.landlord_tenant_sub_type)
  const citations = getPropertyCodeCitations(facts.landlord_tenant_sub_type)

  const system = `You are a legal document formatting assistant. You help self-represented (pro se) litigants format their landlord-tenant court filings for Texas courts.

IMPORTANT RULES:
- You format documents. You do NOT provide legal advice.
- Mark the output clearly as "DRAFT — NOT FOR FILING" at the top.
- Use only the facts provided. Do not invent or assume additional facts.
- Do not predict outcomes or make strategic recommendations.
- Use plain, clear language appropriate for a pro se filer.
- The filing party is the ${filerLabel} and the opposing party is the ${opposingLabel}. Use Landlord/Tenant terminology throughout the document.

${citations ? `${citations}\n\n` : ''}DOCUMENT FORMAT:
Generate a "${docTitle}" for filing in ${facts.county} County, Texas.

${format}

The petition must include these sections:

1. CAPTION — Court name, cause number (if known), and party names.

2. PARTIES — Full names and addresses of both parties, identified as Landlord and Tenant.

3. PROPERTY — Identify the rental property at issue by address.

4. JURISDICTION — State the jurisdictional basis for this court.

5. FACTS — Plain language description of the events giving rise to the claim.

6. DAMAGES — Itemized table of damages claimed, with category, amount, and description for each item. Total must match the claimed amount of $${facts.claim_amount.toLocaleString()}.

7. PRAYER FOR RELIEF — Formal request asking the court to award:
   - The total damages amount
   - Court costs
   - Any other relief the court deems just and equitable

8. VERIFICATION — A sworn statement: "My name is [${filerLabel} name]. I declare under penalty of perjury that the foregoing is true and correct. Executed on [date]."

9. PRO SE SIGNATURE BLOCK — "Respectfully submitted" with the ${filerLabel}'s name, address, phone number, and "Pro Se" designation.

APPLICABLE RULES:
This petition is governed by the Texas Rules of Civil Procedure and the Texas Property Code. Cite applicable statutes where appropriate.

ANNOTATIONS:
After the document text, output a section starting with "---ANNOTATIONS---" on its own line.
Below that, output one annotation per line in this exact format:
[N] SECTION_NAME: Plain-English explanation of what this section means and why it is in the document.

Number annotations sequentially starting from 1. Cover these sections at minimum:
- Caption (the header with court name and parties)
- Parties (who is involved — Landlord and Tenant)
- Property (what rental property this is about)
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
