import type { JurisdictionRuleConfig } from '../schema'

export const caFamily = {
  state: 'CA',
  disputeType: 'family',

  requiredSections: [
    {
      id: 'caption',
      label: 'Caption',
      description:
        'Case caption identifying the Superior Court (Family Law Division), parties, and case number. California family law petitions use the case style "In re the Marriage of [Petitioner] and [Respondent]."',
      legalElements: [
        'Court name (Superior Court of California, County of [county], Family Law Division)',
        'Petitioner name (spouse filing for dissolution)',
        'Respondent name (other spouse)',
        'Case number placeholder (assigned by clerk at filing)',
        'Case style — "In re the Marriage of [Petitioner] and [Respondent]"',
      ],
      minParagraphs: 1,
    },
    {
      id: 'facts',
      label: 'Facts',
      description:
        'Statement of facts establishing jurisdiction, venue, the marriage, grounds for dissolution, and any children of the marriage. California requires 6 months of residency in the state and 3 months in the filing county (CA Family Code §2320).',
      legalElements: [
        'Date and place of marriage',
        'Date of separation',
        'Residency — petitioner or respondent has been a resident of California for at least 6 months and of the filing county for at least 3 months (CA Family Code §2320)',
        'Grounds for dissolution — irreconcilable differences that have caused the irremediable breakdown of the marriage (CA Family Code §2310(a))',
        'Children of the marriage — names, dates of birth, and current residence of each minor child',
        'Statement regarding pregnancy (if applicable)',
      ],
      minParagraphs: 3,
    },
    {
      id: 'property_division',
      label: 'Property Division',
      description:
        'Identification and proposed division of the community estate. California is a community property state — all property acquired during marriage is presumed community property and must be divided equally (50/50) absent agreement otherwise (CA Family Code §760). Separate property belongs to the acquiring spouse (CA Family Code §770).',
      legalElements: [
        'Identification of community property — assets and debts acquired during marriage (CA Family Code §760)',
        'Identification of separate property — property owned before marriage, gifts, or inheritance (CA Family Code §770)',
        'Proposed equal (50/50) division of community estate (CA Family Code §2550)',
        'Real property (family residence, rental properties, and other real estate)',
        'Retirement accounts, pensions, and employment benefits (may require QDRO)',
        'Vehicles, bank accounts, investment accounts, and personal property',
        'Community debts and liabilities',
        'Reimbursement claims — separate property contributions to community estate or vice versa (CA Family Code §2640)',
      ],
      minParagraphs: 2,
    },
    {
      id: 'conservatorship',
      label: 'Custody and Visitation',
      description:
        'If children are involved, the petition must address legal and physical custody. California applies the best interest of the child standard (CA Family Code §3020–3049) and has a preference for custody arrangements that ensure frequent and continuing contact with both parents (CA Family Code §3020(b)). Mandatory mediation is required for contested custody disputes (CA Family Code §3170).',
      legalElements: [
        'Request for joint or sole legal custody (decision-making authority — CA Family Code §3003)',
        'Request for joint or sole physical custody (where the child lives — CA Family Code §3004)',
        'Proposed visitation/parenting time schedule',
        'Custody preference order — to both parents, then to the person with whom the child has been living (CA Family Code §3040)',
        'Best interest of the child standard (CA Family Code §3011 — health, safety, and welfare of the child; history of abuse; nature and amount of contact with both parents; substance abuse)',
        'Mandatory mediation for custody/visitation disputes (CA Family Code §3170)',
      ],
      minParagraphs: 2,
    },
    {
      id: 'child_support',
      label: 'Child Support',
      description:
        'If children are involved, the petition must address child support. California uses a statewide uniform guideline formula based on both parents\' incomes, time-share percentage, and allowable deductions (CA Family Code §4050–4076).',
      legalElements: [
        'Request for child support in accordance with the statewide uniform guideline (CA Family Code §4050–4076)',
        'Both parents\' gross and net monthly incomes (CA Family Code §4058)',
        'Time-share percentage with each parent (CA Family Code §4055)',
        'Mandatory add-ons — child care costs and uninsured health care expenses (CA Family Code §4062)',
        'Health insurance for the child (CA Family Code §3751)',
      ],
      minParagraphs: 1,
    },
    {
      id: 'spousal_support',
      label: 'Spousal Support',
      description:
        'Request for temporary or long-term spousal support (alimony). California courts consider the factors in CA Family Code §4320 including length of marriage, standard of living, earning capacity, and domestic violence history. For marriages of 10+ years, the court retains jurisdiction indefinitely unless otherwise ordered.',
      legalElements: [
        'Request for temporary spousal support (pendente lite — based on local county guidelines)',
        'Request for long-term spousal support (based on CA Family Code §4320 factors)',
        'Length of marriage (marriages of 10+ years = long-duration marriage, support may be indefinite)',
        'Marital standard of living (CA Family Code §4320(d))',
        'Earning capacity, marketable skills, and job market for each spouse (CA Family Code §4320(a))',
        'Domestic violence history (CA Family Code §4320(i))',
      ],
      minParagraphs: 1,
    },
    {
      id: 'verification',
      label: 'Verification',
      description:
        'A sworn statement that the facts in the petition are true and correct. The petitioner signs the petition under penalty of perjury under the laws of the State of California.',
      legalElements: [
        'Signed under penalty of perjury under the laws of the State of California',
        'Statement that the facts set forth in the petition are true and correct to the best of petitioner\'s knowledge',
      ],
      minParagraphs: 1,
    },
    {
      id: 'proof_of_service',
      label: 'Proof of Service',
      description:
        'Proof that the respondent was served with the petition, summons, and blank response form. California requires personal service or substituted service for the initial petition (CA Code of Civil Procedure §415.10–415.40). A 6-month waiting period runs from the date of service before the divorce can be finalized (CA Family Code §2339).',
      legalElements: [
        'Date of service',
        'Method of service (personal service, substituted service, service by mail with acknowledgment, or service by publication)',
        'Name and address of the person served',
        'Proof of Service form (FL-115)',
      ],
      minParagraphs: 1,
    },
  ],

  filingRules: {
    courtName:
      'Superior Court of California, Family Law Division (each county has a Family Law Division or department)',
    serviceRequirements:
      'Respondent must be personally served with the Summons (FL-110), Petition (FL-100), and blank Response (FL-120) per CA Code of Civil Procedure §415.10. After initial service, a 6-month waiting period runs from the date of service before the divorce can be finalized (CA Family Code §2339). Mandatory Preliminary Declaration of Disclosure (FL-140) and Income and Expense Declaration (FL-150) must be served on the other party within 60 days of filing.',
    filingFee:
      'Approximately $435 (fee waiver available via Request to Waive Court Fees form FW-001 for qualifying low-income filers)',
    maxPages: 30,
    fontRequirements: '12-point minimum for body text per California Rules of Court, Rule 2.104',
    marginRequirements: '1-inch margins on all sides',
    copies: 2,
    localFormUrl: 'https://www.courts.ca.gov/forms.htm?filter=FL',
  },

  rejectionReasons: [
    {
      reason: 'Missing verification paragraph',
      howToAvoid:
        'Include a signed verification stating that the facts in the petition are true and correct under penalty of perjury under the laws of the State of California.',
      wizardStep: 'review',
    },
    {
      reason: 'No proof of service filed',
      howToAvoid:
        'File a Proof of Service (FL-115) showing the date, method, and recipient of service. The respondent must be personally served with the Summons, Petition, and blank Response.',
      wizardStep: 'review',
    },
    {
      reason: 'Residency requirements not alleged',
      howToAvoid:
        'Include an allegation that the petitioner or respondent has been a resident of California for at least 6 months and of the filing county for at least 3 months (CA Family Code §2320).',
      wizardStep: 'venue',
    },
    {
      reason: 'No grounds for dissolution stated',
      howToAvoid:
        'Allege irreconcilable differences that have caused the irremediable breakdown of the marriage (CA Family Code §2310(a)). California is a no-fault state.',
      wizardStep: 'facts',
    },
    {
      reason: 'Children listed but no custody request',
      howToAvoid:
        'If minor children are involved, include a request for legal and physical custody specifying joint or sole arrangements and a proposed visitation schedule.',
      wizardStep: 'claims',
    },
    {
      reason: 'Preliminary Declaration of Disclosure not served',
      howToAvoid:
        'Serve the Preliminary Declaration of Disclosure (FL-140) and Income and Expense Declaration (FL-150) on the other party within 60 days of filing. The court cannot enter judgment without proof that disclosures were exchanged.',
      wizardStep: 'claims',
    },
    {
      reason: 'Incorrect Judicial Council form used',
      howToAvoid:
        'Use the mandatory Judicial Council forms: FL-100 (Petition), FL-110 (Summons), FL-115 (Proof of Service), FL-140 (Declaration of Disclosure), FL-150 (Income and Expense Declaration), FL-180 (Judgment), FL-190 (Appearance/Stipulations).',
      wizardStep: 'review',
    },
  ],

  stepValidations: {
    facts: {
      required: ['marriage_date'],
      warnings: [
        {
          condition: 'no_residency_stated',
          message:
            'Verify that you or your spouse meet the California residency requirements: resident of California for at least 6 months and of the filing county for at least 3 months (CA Family Code §2320). Failure to allege residency will result in dismissal.',
        },
        {
          condition: 'no_children_listed',
          message:
            'If there are minor children of the marriage, list each child\'s name, date of birth, and current residence. The court must address custody, visitation, and child support for all minor children.',
        },
        {
          condition: 'no_separation_date',
          message:
            'Include the date of separation. In California, the date of separation determines when community property accumulation ends (CA Family Code §70). This can significantly affect property division.',
        },
      ],
    },
    claims: {
      required: ['grounds'],
      warnings: [
        {
          condition: 'no_community_property_inventory',
          message:
            'California requires a Preliminary Declaration of Disclosure (FL-140) listing all assets, debts, income, and expenses. Begin identifying community and separate property now — the court cannot enter judgment without completed disclosures.',
        },
        {
          condition: 'no_retirement_accounts_addressed',
          message:
            'Retirement accounts (401(k), pension, IRA) earned during marriage are community property. Division typically requires a Qualified Domestic Relations Order (QDRO). Identify all retirement accounts early to avoid delays.',
        },
        {
          condition: 'no_spousal_support_considered',
          message:
            'California courts consider spousal support based on the factors in CA Family Code §4320 — including length of marriage, standard of living, earning capacity, and domestic violence history. For long-duration marriages (10+ years), support may be indefinite.',
        },
      ],
    },
    relief: {
      required: [],
      warnings: [
        {
          condition: 'no_temporary_orders_requested',
          message:
            'Consider requesting temporary orders (Request for Order, FL-300) for custody, child support, spousal support, exclusive use of the family home, or attorney fees during the divorce proceedings.',
        },
        {
          condition: 'no_custody_mediation_noted',
          message:
            'California requires mandatory mediation for contested custody and visitation disputes (CA Family Code §3170). Be prepared to participate in court-connected mediation before a custody hearing.',
        },
        {
          condition: 'no_dvpa_restraining_order_considered',
          message:
            'If there is a history of domestic violence, consider requesting a Domestic Violence Prevention Act (DVPA) restraining order (CA Family Code §6300–6389). A DVPA order can be filed alongside or independently of a dissolution petition and provides immediate protection.',
        },
      ],
    },
  },

  glossary: [
    {
      term: 'Community Property',
      plainEnglish:
        'Property acquired by either spouse during the marriage. California presumes all property acquired during marriage is community property (CA Family Code §760) and it must be divided equally (50/50) in a divorce — unlike Texas, which uses a "just and right" standard.',
    },
    {
      term: 'Separate Property',
      plainEnglish:
        'Property that belongs to one spouse alone — things owned before the marriage, or received as a gift or inheritance during the marriage (CA Family Code §770). Separate property is not divided in the divorce and stays with its owner.',
    },
    {
      term: 'Legal Custody',
      plainEnglish:
        'The right and responsibility to make major decisions about a child\'s health, education, and welfare (CA Family Code §3003). Joint legal custody means both parents share this decision-making authority.',
    },
    {
      term: 'Physical Custody',
      plainEnglish:
        'Determines where the child lives on a day-to-day basis (CA Family Code §3004). Joint physical custody means the child spends significant time with both parents. Sole physical custody means the child lives primarily with one parent.',
    },
    {
      term: 'Irreconcilable Differences',
      plainEnglish:
        'The standard no-fault ground for divorce in California (CA Family Code §2310(a)). It means the marriage has broken down and cannot be saved. You do not need to prove wrongdoing by either spouse — California is a purely no-fault state.',
    },
    {
      term: 'Spousal Support',
      plainEnglish:
        'Court-ordered payments from one spouse to the other during or after divorce. Temporary support is calculated using county guidelines. Long-term support is based on the factors in CA Family Code §4320, including length of marriage, standard of living, and each spouse\'s earning capacity.',
    },
    {
      term: 'Preliminary Declaration of Disclosure',
      plainEnglish:
        'A mandatory financial disclosure form (FL-140) that each spouse must serve on the other, listing all assets, debts, income, and expenses. The court cannot finalize the divorce without proof that disclosures were exchanged. Think of it as a complete financial snapshot.',
    },
    {
      term: 'Guideline Child Support',
      plainEnglish:
        'The amount of child support calculated using California\'s statewide uniform formula (CA Family Code §4050–4076). It factors in both parents\' incomes, the time-share percentage, tax filing status, and allowable deductions. The court presumes the guideline amount is correct.',
    },
    {
      term: 'DVPA Restraining Order',
      plainEnglish:
        'A court order under the Domestic Violence Prevention Act (CA Family Code §6300–6389) that protects a family member from abuse, threats, or harassment. A temporary restraining order (TRO) can be issued the same day; a permanent order lasts up to 5 years and can be renewed.',
    },
    {
      term: 'QDRO (Qualified Domestic Relations Order)',
      plainEnglish:
        'A special court order required to divide retirement accounts (401(k), pension) in a divorce. Without a QDRO, the plan administrator cannot transfer retirement funds to the non-employee spouse. It must be approved by both the court and the plan administrator.',
    },
    {
      term: 'Date of Separation',
      plainEnglish:
        'The date one spouse communicated to the other their intent to end the marriage, combined with conduct consistent with that intent (CA Family Code §70). This date is critical because it determines when community property accumulation stops.',
    },
  ],
} as const satisfies JurisdictionRuleConfig
