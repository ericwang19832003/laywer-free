import type { FamilyFilingFacts } from '@lawyer-free/shared/schemas/family-filing'

interface FilingPrompt {
  system: string
  user: string
}

function getDocumentTitle(subType: string): string {
  switch (subType) {
    case 'divorce':
      return 'ORIGINAL PETITION FOR DIVORCE'
    case 'custody':
      return 'ORIGINAL PETITION IN SUIT AFFECTING THE PARENT-CHILD RELATIONSHIP'
    case 'child_support':
      return 'PETITION FOR CHILD SUPPORT'
    case 'visitation':
      return 'PETITION FOR ACCESS AND POSSESSION'
    case 'spousal_support':
      return 'PETITION FOR SPOUSAL MAINTENANCE'
    case 'protective_order':
      return 'APPLICATION FOR PROTECTIVE ORDER'
    case 'modification':
      return 'PETITION TO MODIFY EXISTING ORDER'
    default:
      return 'FAMILY LAW PETITION'
  }
}

function getDocumentFormat(subType: string): string {
  switch (subType) {
    case 'divorce':
      return `This is a Texas Original Petition for Divorce. Include:
- Caption: "In the District Court of [County] County, Texas"
- Title: "ORIGINAL PETITION FOR DIVORCE"
- RESIDENCY: Petitioner must meet residency requirements under Tex. Fam. Code § 6.301 — domiciled in Texas for at least 6 months and resided in the filing county for at least 90 days preceding the filing date.
- MARRIAGE INFORMATION: Date and place of marriage, date of separation if applicable.
- GROUNDS: Insupportability (no-fault) under Tex. Fam. Code § 6.001, or fault-based grounds (cruelty § 6.002, adultery § 6.003, conviction of felony § 6.004, abandonment § 6.005, living apart § 6.006, confinement to mental hospital § 6.007).
- CHILDREN: If children of the marriage exist, include a section identifying each child (name, date of birth, age, relationship). Include a UCCJEA (Uniform Child Custody Jurisdiction and Enforcement Act) affidavit stating this is the child's home state and no other proceedings exist.
- CONSERVATORSHIP: Request for joint managing conservatorship or sole managing conservatorship under Tex. Fam. Code Ch. 153. Include possession and access schedule (standard possession order under §§ 153.312-153.317 or modified).
- CHILD SUPPORT: Request for child support under Tex. Fam. Code Ch. 154 guidelines if applicable, including health insurance for children.
- PROPERTY DIVISION: Community property division under Tex. Fam. Code §§ 7.001-7.006 if community property exists, with description of property to be divided.
- SPOUSAL MAINTENANCE: If sought, reference Tex. Fam. Code Ch. 8 eligibility requirements.
- PRAYER: Formal request to the court for all relief sought.
- VERIFICATION: Sworn verification paragraph.
- SIGNATURE BLOCK: "Respectfully submitted" with Petitioner's name, address, and "Pro Se" designation.`

    case 'custody':
      return `This is a Texas Original Petition in Suit Affecting the Parent-Child Relationship (SAPCR). Include:
- Caption: "In the District Court of [County] County, Texas"
- Title: "ORIGINAL PETITION IN SUIT AFFECTING THE PARENT-CHILD RELATIONSHIP"
- STANDING: Petitioner's standing to file under Tex. Fam. Code Ch. 102 (parent, person with substantial past contact, etc.).
- UCCJEA AFFIDAVIT: Uniform Child Custody Jurisdiction and Enforcement Act affidavit — Texas is the child's home state, child's address history for the past 5 years, no other custody proceedings pending in any other court.
- CHILDREN: Identify each child (name, date of birth, age, relationship to each party).
- CONSERVATORSHIP: Request for joint managing conservatorship or sole managing conservatorship under Tex. Fam. Code Ch. 153, with specific rights and duties for each conservator.
- POSSESSION AND ACCESS: Standard possession order under Tex. Fam. Code §§ 153.312-153.317, or modified schedule with justification.
- CHILD SUPPORT: Request under Tex. Fam. Code Ch. 154 guidelines, including medical support and health insurance.
- PRAYER: Formal request for all relief sought.
- VERIFICATION: Sworn verification paragraph.
- SIGNATURE BLOCK: "Respectfully submitted" with Petitioner's name, address, and "Pro Se" designation.`

    case 'child_support':
      return `This is a Texas Petition for Child Support. Include:
- Caption: "In the District Court of [County] County, Texas"
- Title: "PETITION FOR CHILD SUPPORT"
- CHILDREN: Identify each child (name, date of birth, age).
- CHILD SUPPORT GUIDELINES: Reference Tex. Fam. Code Ch. 154 guidelines for calculating support. One child = 20% of net resources; two = 25%; three = 30%; four = 35%; five = 40%; six+ = not less than 40%.
- INCOME INFORMATION: Obligor's income and resources as known to Petitioner.
- HEALTH INSURANCE: Request for medical support and health insurance coverage under Tex. Fam. Code § 154.181-154.192.
- INCOME WITHHOLDING: Request for income withholding order under Tex. Fam. Code Ch. 158.
- PRAYER: Formal request for child support, medical support, and income withholding.
- VERIFICATION: Sworn verification paragraph.
- SIGNATURE BLOCK: "Respectfully submitted" with Petitioner's name, address, and "Pro Se" designation.`

    case 'visitation':
      return `This is a Texas Petition for Access and Possession (Visitation). Include:
- Caption: "In the District Court of [County] County, Texas"
- Title: "PETITION FOR ACCESS AND POSSESSION"
- CHILDREN: Identify each child (name, date of birth, age).
- STANDARD POSSESSION ORDER: Reference Tex. Fam. Code §§ 153.312-153.317 for the standard possession order schedule, including:
  - First, third, and fifth weekends of each month
  - Thursday evenings during the school year
  - Alternating holidays
  - Extended summer possession (30 days)
- MODIFIED SCHEDULE: If seeking a non-standard schedule, include specific proposed schedule and justification.
- BEST INTEREST: Statement that the proposed possession schedule is in the best interest of the child under Tex. Fam. Code § 153.002.
- PRAYER: Formal request for access and possession order.
- VERIFICATION: Sworn verification paragraph.
- SIGNATURE BLOCK: "Respectfully submitted" with Petitioner's name, address, and "Pro Se" designation.`

    case 'spousal_support':
      return `This is a Texas Petition for Spousal Maintenance. Include:
- Caption: "In the District Court of [County] County, Texas"
- Title: "PETITION FOR SPOUSAL MAINTENANCE"
- ELIGIBILITY: Reference Tex. Fam. Code § 8.051 — Petitioner must demonstrate eligibility based on one of:
  (1) Family violence conviction or deferred adjudication within 2 years of filing or during pendency,
  (2) Marriage lasted 10+ years and Petitioner lacks ability to earn sufficient income for minimum reasonable needs,
  (3) Petitioner has an incapacitating physical or mental disability,
  (4) Petitioner is custodian of a child who requires substantial care due to disability.
- DURATION LIMITS: Reference Tex. Fam. Code § 8.054 — maintenance limited to:
  - 5 years if marriage lasted 10-20 years,
  - 7 years if marriage lasted 20-30 years,
  - 10 years if marriage lasted 30+ years,
  - Indefinite if based on disability of spouse or child.
- AMOUNT: Reference Tex. Fam. Code § 8.055 — maintenance amount is the lesser of $5,000/month or 20% of the obligor's average monthly gross income.
- FACTORS: Court considers factors under § 8.052 (earning ability, education, employment skills, duration of marriage, age, health, etc.).
- PRAYER: Formal request for spousal maintenance with specific amount and duration sought.
- VERIFICATION: Sworn verification paragraph.
- SIGNATURE BLOCK: "Respectfully submitted" with Petitioner's name, address, and "Pro Se" designation.`

    case 'protective_order':
      return `This is a Texas Application for Protective Order. Include:
- Caption: "In the District Court of [County] County, Texas"
- Title: "APPLICATION FOR PROTECTIVE ORDER"
- FAMILY VIOLENCE: Describe the family violence under Tex. Fam. Code § 71.004 — an act by a member of a family or household against another member that is intended to result in physical harm, bodily injury, assault, or sexual assault, or a threat that reasonably places the member in fear of imminent physical harm.
- RELATIONSHIP: Establish that parties are members of the same family or household under Tex. Fam. Code § 71.003-71.006 (spouses, former spouses, parents of the same child, persons related by blood or marriage, persons in a dating relationship, etc.).
- DESCRIPTION OF VIOLENCE: Detailed factual description of each incident of family violence (dates, what happened, injuries sustained, witnesses, police reports filed).
- SPECIFIC RELIEF REQUESTED: Under Tex. Fam. Code Ch. 85, specify what the protective order should include:
  - Prohibit respondent from committing family violence
  - Prohibit respondent from threatening, harassing, or contacting petitioner
  - Order respondent to stay away from petitioner's residence, workplace, and children's school
  - Establish temporary possession of children if applicable
  - Any other specific protections needed
- DURATION: Protective orders may last up to 2 years under Tex. Fam. Code § 85.025.
- PRAYER: Formal request for all specific protective relief.
- VERIFICATION: Sworn verification paragraph.
- SIGNATURE BLOCK: "Respectfully submitted" with Petitioner's name, address, and "Pro Se" designation.`

    case 'modification':
      return `This is a Texas Petition to Modify Existing Order. Include:
- Caption: "In the District Court of [County] County, Texas"
- Title: "PETITION TO MODIFY EXISTING ORDER"
- EXISTING ORDER: Identify the existing order by court, cause number, and date. Reference Tex. Fam. Code Ch. 156.
- MATERIAL AND SUBSTANTIAL CHANGE: Under Tex. Fam. Code § 156.101, demonstrate a material and substantial change in circumstances since the prior order. Examples include: change in income, relocation, change in child's needs, change in work schedule, etc.
- BEST INTEREST: Statement that the requested modification is in the best interest of the child under Tex. Fam. Code § 153.002.
- SPECIFIC MODIFICATIONS SOUGHT: Clearly state what provisions of the existing order should be changed (conservatorship, possession schedule, child support amount, geographic restriction, etc.).
- CHILDREN: Identify each child affected by the modification.
- PRAYER: Formal request for specific modifications to the existing order.
- VERIFICATION: Sworn verification paragraph.
- SIGNATURE BLOCK: "Respectfully submitted" with Petitioner's name, address, and "Pro Se" designation.`

    default:
      return `Generate a family law petition. Include caption, parties, facts, prayer, and signature block with "Pro Se" designation.`
  }
}

function buildUserPrompt(facts: FamilyFilingFacts): string {
  const partiesSection = [
    '--- PARTIES ---',
    `Petitioner: ${facts.petitioner.full_name}`,
    facts.petitioner.address
      ? `Address: ${facts.petitioner.address}, ${facts.petitioner.city ?? ''}, ${facts.petitioner.state ?? ''} ${facts.petitioner.zip ?? ''}`
      : null,
    `Respondent: ${facts.respondent.full_name}`,
    facts.respondent.address
      ? `Address: ${facts.respondent.address}, ${facts.respondent.city ?? ''}, ${facts.respondent.state ?? ''} ${facts.respondent.zip ?? ''}`
      : null,
  ]
    .filter(Boolean)
    .join('\n')

  const courtSection = [
    '--- COURT ---',
    `Court type: ${facts.court_type}`,
    `County: ${facts.county}`,
    facts.cause_number ? `Cause number: ${facts.cause_number}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  const marriageSection =
    facts.family_sub_type === 'divorce' || facts.family_sub_type === 'spousal_support'
      ? [
          '--- MARRIAGE ---',
          facts.marriage_date ? `Date of marriage: ${facts.marriage_date}` : null,
          facts.separation_date ? `Date of separation: ${facts.separation_date}` : null,
        ]
          .filter(Boolean)
          .join('\n')
      : null

  const childrenSection =
    facts.children.length > 0
      ? [
          '--- CHILDREN ---',
          ...facts.children.map(
            (c, i) =>
              `Child ${i + 1}: ${c.name}, DOB: ${c.date_of_birth}${c.age !== undefined ? `, Age: ${c.age}` : ''}${c.relationship ? `, Relationship: ${c.relationship}` : ''}`
          ),
        ].join('\n')
      : null

  const groundsSection = [
    '--- GROUNDS/FACTS ---',
    facts.grounds,
    facts.additional_facts ? `\nAdditional facts:\n${facts.additional_facts}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  const custodySection =
    facts.custody_arrangement_sought
      ? [
          '--- CUSTODY ---',
          `Arrangement sought: ${facts.custody_arrangement_sought.replace(/_/g, ' ')}`,
          facts.custody_reasoning ? `Reasoning: ${facts.custody_reasoning}` : null,
        ]
          .filter(Boolean)
          .join('\n')
      : null

  const supportSection = (() => {
    const lines: string[] = []
    if (facts.child_support_amount !== undefined) {
      lines.push(`Child support amount sought: $${facts.child_support_amount.toLocaleString()}/month`)
    }
    if (facts.spousal_support_amount !== undefined) {
      lines.push(
        `Spousal support amount sought: $${facts.spousal_support_amount.toLocaleString()}/month`
      )
    }
    if (facts.spousal_support_duration_months !== undefined) {
      lines.push(`Spousal support duration: ${facts.spousal_support_duration_months} months`)
    }
    return lines.length > 0 ? ['--- SUPPORT ---', ...lines].join('\n') : null
  })()

  const propertySection =
    facts.community_property_exists
      ? [
          '--- PROPERTY ---',
          'Community property exists.',
          facts.property_description
            ? `Property description: ${facts.property_description}`
            : null,
        ]
          .filter(Boolean)
          .join('\n')
      : null

  const protectiveOrderSection =
    facts.family_sub_type === 'protective_order'
      ? [
          '--- PROTECTIVE ORDER ---',
          facts.domestic_violence_description
            ? `Description of violence: ${facts.domestic_violence_description}`
            : null,
          facts.protective_order_requests && facts.protective_order_requests.length > 0
            ? `Specific requests:\n${facts.protective_order_requests.map((r) => `- ${r}`).join('\n')}`
            : null,
        ]
          .filter(Boolean)
          .join('\n')
      : null

  const existingOrderSection =
    facts.family_sub_type === 'modification'
      ? [
          '--- EXISTING ORDER ---',
          facts.existing_order_court ? `Court: ${facts.existing_order_court}` : null,
          facts.existing_order_cause_number
            ? `Cause number: ${facts.existing_order_cause_number}`
            : null,
          facts.modification_reason ? `Reason for modification: ${facts.modification_reason}` : null,
        ]
          .filter(Boolean)
          .join('\n')
      : null

  const residencySection = [
    '--- RESIDENCY ---',
    facts.petitioner_county_months !== undefined
      ? `Months in county: ${facts.petitioner_county_months}`
      : null,
    facts.petitioner_state_months !== undefined
      ? `Months in state: ${facts.petitioner_state_months}`
      : null,
  ]
    .filter((s) => s !== null && s !== '--- RESIDENCY ---')

  const residencyOutput =
    residencySection.length > 0
      ? ['--- RESIDENCY ---', ...residencySection.filter((s) => s !== '--- RESIDENCY ---')].join(
          '\n'
        )
      : null

  const militarySection = facts.military_involvement
    ? '--- MILITARY ---\nMilitary involvement: Yes. Servicemembers Civil Relief Act may apply.'
    : null

  return [
    `Family law sub-type: ${facts.family_sub_type}`,
    '',
    partiesSection,
    '',
    courtSection,
    marriageSection ? `\n${marriageSection}` : null,
    childrenSection ? `\n${childrenSection}` : null,
    '',
    groundsSection,
    custodySection ? `\n${custodySection}` : null,
    supportSection ? `\n${supportSection}` : null,
    propertySection ? `\n${propertySection}` : null,
    protectiveOrderSection ? `\n${protectiveOrderSection}` : null,
    existingOrderSection ? `\n${existingOrderSection}` : null,
    residencyOutput ? `\n${residencyOutput}` : null,
    militarySection ? `\n${militarySection}` : null,
  ]
    .filter((s) => s !== null)
    .join('\n')
}

export function buildFamilyFilingPrompt(facts: FamilyFilingFacts): FilingPrompt {
  const docTitle = getDocumentTitle(facts.family_sub_type)
  const format = getDocumentFormat(facts.family_sub_type)

  const system = `You are a legal document formatting assistant. You help self-represented (pro se) litigants format their family law court filings.

IMPORTANT RULES:
- You format documents. You do NOT provide legal advice.
- Mark the output clearly as "DRAFT — NOT LEGAL ADVICE" at the top.
- Use only the facts provided. Do not invent or assume additional facts.
- Do not predict outcomes or make strategic recommendations.
- Use plain, clear language appropriate for a pro se filer.
- ALWAYS use "Petitioner" and "Respondent" terminology. NEVER use civil-case party labels.

DOCUMENT FORMAT:
Generate a "${docTitle}" for the District Court of ${facts.county} County, Texas.

${format}

ANNOTATIONS:
After the document text, output a section starting with "---ANNOTATIONS---" on its own line.
Below that, output one annotation per line in this exact format:
[N] SECTION_NAME: Plain-English explanation of what this section means and why it is in the document.

Number annotations sequentially starting from 1. Cover these sections at minimum:
- Caption (the header with court name and parties)
- Parties (who is involved — Petitioner and Respondent)
- Grounds (the legal basis for filing)
- Children (if applicable — identifying the children)
- Relief Sought (what you are asking the court to do)
- Prayer (the formal request to the court)
- Verification (the sworn statement)
- Signature Block (where you sign)

Use simple language a high school student could understand. Do NOT use legal jargon in the explanations.

Format the document professionally with proper legal formatting.`

  const user = buildUserPrompt(facts)

  return { system, user }
}
