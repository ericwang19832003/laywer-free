import type { JurisdictionRuleConfig } from '../schema'

export const txFamily = {
  state: 'TX',
  disputeType: 'family',

  requiredSections: [
    {
      id: 'caption',
      label: 'Caption',
      description:
        'Case caption identifying the district court, parties, and cause number. Family law cases are filed in District Court (family law divisions in larger counties).',
      legalElements: [
        'Court name (District Court, with family law division if applicable)',
        'Petitioner name (spouse filing for divorce)',
        'Respondent name (other spouse)',
        'Cause number placeholder (assigned by clerk at filing)',
        'Case style — "In the Matter of the Marriage of [Petitioner] and [Respondent]"',
      ],
      minParagraphs: 1,
    },
    {
      id: 'facts',
      label: 'Facts',
      description:
        'Statement of facts establishing jurisdiction, venue, the marriage, grounds for divorce, and any children of the marriage. Texas requires residency of 6 months in the state and 90 days in the county (TX Family Code §6.301).',
      legalElements: [
        'Date and place of marriage',
        'Date of separation (if applicable)',
        'Residency — petitioner or respondent has been a domiciliary of Texas for at least 6 months and a resident of the filing county for at least 90 days (TX Family Code §6.301)',
        'Grounds for divorce — insupportability (no-fault): the marriage has become insupportable because of discord or conflict of personalities that destroys the legitimate ends of the marital relationship with no reasonable expectation of reconciliation (TX Family Code §6.001)',
        'Children of the marriage — names, dates of birth, and current residence of each child under 18',
        'Statement that the wife is not pregnant (or disclosure of pregnancy)',
      ],
      minParagraphs: 3,
    },
    {
      id: 'property_division',
      label: 'Property Division',
      description:
        'Identification and proposed division of the community estate. Texas is a community property state — all property acquired during the marriage is presumed community property. The court must divide community property in a manner that is "just and right" (TX Family Code §7.001).',
      legalElements: [
        'Identification of community property (assets and debts acquired during marriage)',
        'Identification of separate property (property owned before marriage, gifts, or inheritance — TX Family Code §3.001)',
        'Proposed just and right division of community estate (TX Family Code §7.001)',
        'Real property (homestead and other real estate)',
        'Retirement accounts, pensions, and employment benefits',
        'Vehicles, bank accounts, and personal property',
        'Community debts and liabilities',
      ],
      minParagraphs: 2,
    },
    {
      id: 'conservatorship',
      label: 'Conservatorship (Custody)',
      description:
        'If children are involved, the petition must address conservatorship (custody). Texas presumes that appointing both parents as joint managing conservators is in the best interest of the child (TX Family Code §153.131). The court applies the best interest of the child standard (TX Family Code §153.002).',
      legalElements: [
        'Request for joint managing conservatorship or sole managing conservatorship (TX Family Code §153.131)',
        'Designation of which parent has the exclusive right to determine the primary residence of the child',
        'Geographic restriction on primary residence (if requested)',
        'Standard Possession Order or modified possession schedule (TX Family Code §153.311 et seq.)',
        'Rights and duties of each conservator (TX Family Code §153.132–153.133)',
        'Best interest of the child standard (TX Family Code §153.002)',
      ],
      minParagraphs: 2,
    },
    {
      id: 'child_support',
      label: 'Child Support',
      description:
        'If children are involved, the petition must address child support. Texas uses a percentage-of-income model based on the obligor\'s net monthly resources (TX Family Code §154.125). Guidelines: 20% for 1 child, 25% for 2, 30% for 3, 35% for 4, 40% for 5+.',
      legalElements: [
        'Request for child support in accordance with TX Family Code §154 guidelines',
        'Obligor\'s monthly net resources (TX Family Code §154.061)',
        'Guideline percentages — 20% for 1 child, 25% for 2, 30% for 3, 35% for 4, 40% for 5+ (TX Family Code §154.125)',
        'Health insurance for the child (TX Family Code §154.181)',
        'Request for income withholding order (TX Family Code §158.001)',
      ],
      minParagraphs: 1,
    },
    {
      id: 'verification',
      label: 'Verification',
      description:
        'A sworn statement that the facts in the petition are true and correct. Required under TX Family Code §6.402 for original petitions in divorce suits.',
      legalElements: [
        'Signed under penalty of perjury under the laws of the State of Texas',
        'Statement that the facts set forth in the petition are true and correct to the best of petitioner\'s knowledge',
      ],
      minParagraphs: 1,
    },
    {
      id: 'certificate_of_service',
      label: 'Certificate of Service',
      description:
        'Certification that a copy of the petition was delivered to the respondent or their attorney, as required by TX Rule of Civil Procedure 21a.',
      legalElements: [
        'Date of service',
        'Method of service (personal service, certified mail, or e-service)',
        'Name and address of the party or attorney served',
      ],
      minParagraphs: 1,
    },
  ],

  filingRules: {
    courtName:
      'District Court (family law division in counties that have one, e.g., Harris, Dallas, Bexar, Travis)',
    serviceRequirements:
      'Respondent must be personally served with citation and a copy of the petition per TX Rule of Civil Procedure 106. After initial service, subsequent documents may be served via certified mail, hand delivery, or e-service per TRCP Rule 21a. A 60-day waiting period applies after filing before the court may grant the divorce (TX Family Code §6.702).',
    filingFee:
      '$300–350 depending on county (fee waiver available via Statement of Inability to Afford Payment of Court Costs, TX Gov\'t Code §6.001)',
    maxPages: 30,
    fontRequirements: '14-point minimum for body text recommended',
    marginRequirements: '1-inch margins on all sides',
    copies: 2,
    localFormUrl: 'https://www.txcourts.gov/rules-forms/forms/',
  },

  rejectionReasons: [
    {
      reason: 'Missing verification paragraph',
      howToAvoid:
        'Include a signed verification stating that the facts in the petition are true and correct under penalty of perjury (TX Family Code §6.402).',
      wizardStep: 'review',
    },
    {
      reason: 'No certificate of service attached',
      howToAvoid:
        'Attach a certificate of service showing the date, method, and recipient of service per TRCP Rule 21a.',
      wizardStep: 'review',
    },
    {
      reason: 'Residency requirements not alleged',
      howToAvoid:
        'Include an allegation that the petitioner or respondent has been a domiciliary of Texas for at least 6 months and a resident of the filing county for at least 90 days (TX Family Code §6.301).',
      wizardStep: 'venue',
    },
    {
      reason: 'No grounds for divorce stated',
      howToAvoid:
        'Allege specific grounds for divorce. For no-fault, state that the marriage has become insupportable due to discord or conflict of personalities (TX Family Code §6.001).',
      wizardStep: 'facts',
    },
    {
      reason: 'Children listed but no conservatorship request',
      howToAvoid:
        'If children are involved, include a request for conservatorship (custody) specifying joint or sole managing conservator and a possession schedule.',
      wizardStep: 'claims',
    },
    {
      reason: 'Sworn Inventory and Appraisement not filed',
      howToAvoid:
        'File a Sworn Inventory and Appraisement listing all community and separate property, debts, and their estimated values. This is a mandatory disclosure in Texas divorce cases.',
      wizardStep: 'claims',
    },
  ],

  stepValidations: {
    facts: {
      required: ['marriage_date'],
      warnings: [
        {
          condition: 'no_residency_stated',
          message:
            'Verify that you or your spouse meet the Texas residency requirements: domiciliary of Texas for at least 6 months and resident of the filing county for at least 90 days (TX Family Code §6.301). Failure to allege residency will result in dismissal.',
        },
        {
          condition: 'no_children_listed',
          message:
            'If there are children of the marriage under 18, list each child\'s name, date of birth, and current residence. The court must address conservatorship and child support for all children.',
        },
        {
          condition: 'no_separation_date',
          message:
            'Consider including the date of separation. While Texas does not require a formal separation, the date can affect property characterization and temporary orders.',
        },
      ],
    },
    claims: {
      required: ['grounds'],
      warnings: [
        {
          condition: 'no_community_property_inventory',
          message:
            'Texas requires a Sworn Inventory and Appraisement of all community and separate property. Start identifying assets, debts, real property, retirement accounts, and vehicles now to avoid delays.',
        },
        {
          condition: 'no_retirement_accounts_addressed',
          message:
            'Retirement accounts (401(k), pension, IRA) earned during marriage are community property. Division may require a Qualified Domestic Relations Order (QDRO). Identify all retirement accounts early.',
        },
        {
          condition: 'no_spousal_maintenance_considered',
          message:
            'Texas spousal maintenance is available in limited circumstances — marriages of 10+ years, family violence, disability, or a child with a disability (TX Family Code §8.051). Consider whether you qualify.',
        },
      ],
    },
    relief: {
      required: [],
      warnings: [
        {
          condition: 'no_temporary_orders_requested',
          message:
            'Consider requesting temporary orders for custody, child support, exclusive use of the marital home, or restraining orders during the divorce proceedings (TX Family Code §105.001).',
        },
        {
          condition: 'no_custody_arrangement_specified',
          message:
            'If children are involved, specify whether you are requesting joint managing conservatorship or sole managing conservatorship, and which parent will determine the child\'s primary residence.',
        },
        {
          condition: 'no_protective_order_considered',
          message:
            'If there is a history of family violence, consider requesting a protective order (TX Family Code §83 for temporary, §85 for permanent). A protective order can be filed alongside or independently of a divorce.',
        },
      ],
    },
  },

  glossary: [
    {
      term: 'Community Property',
      plainEnglish:
        'Property acquired by either spouse during the marriage. Texas presumes all property owned at divorce is community property unless proven otherwise. It gets divided in a "just and right" manner — not necessarily 50/50.',
    },
    {
      term: 'Separate Property',
      plainEnglish:
        'Property that belongs to one spouse alone — things owned before the marriage, or received as a gift or inheritance during the marriage (TX Family Code §3.001). Separate property is not divided in the divorce.',
    },
    {
      term: 'Conservatorship',
      plainEnglish:
        'The Texas legal term for custody. It determines who makes decisions about the child and where the child lives. Texas uses "conservator" instead of "custodian."',
    },
    {
      term: 'Possessory Conservator',
      plainEnglish:
        'The parent who has visitation rights but does not have the right to determine the child\'s primary residence. This parent typically follows the Standard Possession Order for their time with the child.',
    },
    {
      term: 'Managing Conservator',
      plainEnglish:
        'The parent (or parents, if joint) who has the right to make major decisions about the child — including education, medical care, and where the child lives. In most Texas cases, both parents are appointed joint managing conservators.',
    },
    {
      term: 'Insupportability',
      plainEnglish:
        'The most common ground for divorce in Texas (no-fault). It means the marriage has become insupportable because of discord or conflict of personalities that destroys the relationship, with no reasonable expectation of reconciliation (TX Family Code §6.001).',
    },
    {
      term: 'Spousal Maintenance',
      plainEnglish:
        'Court-ordered support paid by one spouse to the other after divorce. Texas has strict eligibility requirements — generally available only for marriages of 10+ years, family violence, disability, or caring for a disabled child (TX Family Code §8.051). It is limited in amount and duration.',
    },
    {
      term: 'Sworn Inventory and Appraisement',
      plainEnglish:
        'A mandatory disclosure document listing all community and separate property, debts, and their estimated values. Both spouses must file one in a Texas divorce. Think of it as a complete financial snapshot of the marriage.',
    },
    {
      term: 'Standard Possession Order',
      plainEnglish:
        'The default visitation schedule in Texas for the non-primary parent. It typically provides the 1st, 3rd, and 5th weekends of each month, Thursday evenings, alternating holidays, and extended summer possession (TX Family Code §153.311 et seq.).',
    },
    {
      term: 'Protective Order',
      plainEnglish:
        'A court order that protects a family member from violence, threats, or harassment. A temporary protective order (TX Family Code §83) can be issued immediately; a final protective order (TX Family Code §85) lasts up to 2 years and can be extended.',
    },
    {
      term: 'Modification',
      plainEnglish:
        'A legal action to change an existing court order — such as custody, child support, or visitation — because of a material and substantial change in circumstances (TX Family Code §156.101). You must file a modification petition in the court that issued the original order.',
    },
  ],
} as const satisfies JurisdictionRuleConfig
