import type { FilingFacts } from '@/lib/schemas/filing'

interface FilingPrompt {
  system: string
  user: string
}

function getDocumentFormat(courtType: string, role: string, isGeneralDenial?: boolean): string {
  if (role === 'defendant') {
    if (isGeneralDenial) {
      return `Generate a General Denial Answer. This is a simple document that denies all allegations in the plaintiff's petition. Include:
- Case caption (court, parties, cause number if provided)
- "ORIGINAL ANSWER" heading
- General denial paragraph: "Defendant generally denies each and every allegation in Plaintiff's Original Petition and demands strict proof thereof."
- Any specific affirmative defenses if provided
- Prayer (asking the court to deny plaintiff's claims)
- Signature block with "Respectfully submitted" and the defendant's name, address, and "Pro Se"`
    }
    return `Generate an Answer to the plaintiff's petition. Include:
- Case caption (court, parties, cause number if provided)
- "ORIGINAL ANSWER" heading
- Numbered paragraphs responding to anticipated claims
- Affirmative defenses if applicable
- Counterclaim section if requested
- Prayer
- Signature block with "Pro Se"`
  }

  switch (courtType) {
    case 'jp':
      return `Generate a small claims petition (sworn affidavit style). JP Court petitions are simple and informal. Include:
- Caption: "In the Justice Court, Precinct ___, [County] County, Texas"
- Title: "PLAINTIFF'S ORIGINAL PETITION (SMALL CLAIMS)"
- Brief statement of claim in plain language
- Amount sought
- Verification/sworn statement paragraph
- Signature block with "Pro Se"`

    case 'federal':
      return `Generate a federal Complaint under the Federal Rules of Civil Procedure. Include:
- Caption: "In the United States District Court for the [District] District of Texas"
- Title: "COMPLAINT"
- Statement of jurisdiction (diversity under 28 U.S.C. § 1332 or federal question under 28 U.S.C. § 1331)
- Parties section with numbered paragraphs
- Factual allegations with numbered paragraphs
- Causes of action (each as a separate "COUNT")
- Prayer for relief
- Jury demand if appropriate
- Signature block with "Pro Se"
- Verification if required`

    default: // county, district
      return `Generate a Texas Original Petition. Include:
- Caption: "In the [Court Type] Court of [County] County, Texas"
- Title: "PLAINTIFF'S ORIGINAL PETITION"
- "DISCOVERY CONTROL PLAN" paragraph (Level 1 for claims under $100K, Level 2 otherwise)
- Parties section with numbered paragraphs
- Factual allegations with numbered paragraphs
- Cause(s) of action section
- Conditions precedent paragraph
- Damages section
- Prayer for relief (specific amounts, attorney fees, costs, interest)
- Signature block with "Respectfully submitted" and "Pro Se"`
  }
}

export function buildFilingPrompt(facts: FilingFacts): FilingPrompt {
  const format = getDocumentFormat(facts.court_type, facts.role, facts.is_general_denial)

  const system = `You are a legal document formatting assistant. You help self-represented (pro se) litigants format their court filings.

IMPORTANT RULES:
- You format documents. You do NOT provide legal advice.
- Mark the output clearly as "DRAFT — NOT LEGAL ADVICE" at the top.
- Use only the facts provided. Do not invent or assume additional facts.
- Do not predict outcomes or make strategic recommendations.
- Use plain, clear language appropriate for a pro se filer.

DOCUMENT FORMAT:
${format}

Format the document professionally with proper legal formatting.`

  const parties = [
    `Filing party: ${facts.your_info.full_name}`,
    facts.your_info.address ? `Address: ${facts.your_info.address}, ${facts.your_info.city ?? ''}, ${facts.your_info.state ?? ''} ${facts.your_info.zip ?? ''}` : null,
    ...facts.opposing_parties.map((p, i) =>
      `Opposing party ${i + 1}: ${p.full_name}${p.address ? `, ${p.address}` : ''}`
    ),
  ].filter(Boolean).join('\n')

  const courtInfo = [
    `Court type: ${facts.court_type}`,
    facts.county ? `County: ${facts.county}` : null,
    facts.cause_number ? `Cause number: ${facts.cause_number}` : null,
  ].filter(Boolean).join('\n')

  const factsSection = [
    `Description of dispute:\n${facts.description}`,
    facts.incident_date ? `Date of incident: ${facts.incident_date}` : null,
    facts.incident_location ? `Location: ${facts.incident_location}` : null,
    facts.claim_details ? `Claim details:\n${facts.claim_details}` : null,
  ].filter(Boolean).join('\n\n')

  const relief = [
    facts.amount_sought ? `Amount sought: $${facts.amount_sought.toLocaleString()}` : null,
    facts.other_relief ? `Other relief: ${facts.other_relief}` : null,
    facts.request_attorney_fees ? 'Requesting attorney fees' : null,
    facts.request_court_costs ? 'Requesting court costs' : null,
  ].filter(Boolean).join('\n')

  const defendantSection = facts.role === 'defendant' ? [
    facts.is_general_denial ? 'Filing a general denial.' : null,
    facts.specific_defenses ? `Defenses:\n${facts.specific_defenses}` : null,
    facts.has_counterclaim ? `Counterclaim:\n${facts.counterclaim_details ?? 'Details to be provided'}` : null,
  ].filter(Boolean).join('\n\n') : null

  const user = [
    `Role: ${facts.role}`,
    `Dispute type: ${facts.dispute_type ?? 'general'}`,
    '',
    '--- PARTIES ---',
    parties,
    '',
    '--- COURT ---',
    courtInfo,
    '',
    '--- FACTS ---',
    factsSection,
    '',
    '--- RELIEF ---',
    relief,
    defendantSection ? `\n--- DEFENDANT RESPONSE ---\n${defendantSection}` : null,
  ].filter((s) => s !== null).join('\n')

  return { system, user }
}
