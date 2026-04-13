import type { JurisdictionRuleConfig } from '../schema'

export const flFamily = {
  state: 'FL',
  disputeType: 'family',

  requiredSections: [
    {
      id: 'caption',
      label: 'Caption',
      description:
        'Case caption identifying the circuit court, parties, and case number. Florida family law cases are filed in Circuit Court, Family Law Division.',
      legalElements: [
        'Court name (Circuit Court, Family Law Division)',
        'Petitioner name (spouse filing for dissolution)',
        'Respondent name (other spouse)',
        'Case number placeholder (assigned by clerk at filing)',
        'Case style — "In Re: The Marriage of [Petitioner] and [Respondent]"',
      ],
      minParagraphs: 1,
    },
    {
      id: 'facts',
      label: 'Facts',
      description:
        'Statement of facts establishing jurisdiction, venue, the marriage, grounds for dissolution, and any minor children. Florida requires that at least one party has been a resident of the state for at least 6 months before filing (FL Stat. \u00A761.021).',
      legalElements: [
        'Date and place of marriage',
        'Date of separation (if applicable)',
        'Residency \u2014 petitioner or respondent has been a resident of Florida for at least 6 months immediately preceding the filing of the petition (FL Stat. \u00A761.021)',
        'Grounds for dissolution \u2014 the marriage is irretrievably broken (no-fault, FL Stat. \u00A761.052)',
        'Minor children of the marriage \u2014 names, dates of birth, and current residence of each child under 18',
        'Statement regarding whether the wife is pregnant',
      ],
      minParagraphs: 3,
    },
    {
      id: 'property_division',
      label: 'Property Division (Equitable Distribution)',
      description:
        'Identification and proposed division of marital assets and liabilities. Florida follows equitable distribution \u2014 not community property. The court divides marital property equitably, considering factors such as the duration of the marriage, economic circumstances of each party, and contributions to the marriage (FL Stat. \u00A761.075).',
      legalElements: [
        'Identification of marital assets (property acquired during the marriage, FL Stat. \u00A761.075(6))',
        'Identification of non-marital assets (property acquired before marriage, by gift, or by inheritance, FL Stat. \u00A761.075(7))',
        'Proposed equitable distribution considering statutory factors (FL Stat. \u00A761.075(1))',
        'Real property (marital home and other real estate)',
        'Retirement accounts, pensions, and employment benefits',
        'Vehicles, bank accounts, and personal property',
        'Marital debts and liabilities',
        'Enhancement in value of non-marital assets due to marital efforts (FL Stat. \u00A761.075(6)(a)(1))',
      ],
      minParagraphs: 2,
    },
    {
      id: 'timesharing',
      label: 'Timesharing and Parental Responsibility',
      description:
        'If minor children are involved, the petition must address parental responsibility and timesharing. Florida uses "timesharing" rather than custody or visitation. The court determines a timesharing schedule based on the best interests of the child (FL Stat. \u00A761.13). A parenting plan is required (FL Stat. \u00A761.13001).',
      legalElements: [
        'Request for shared parental responsibility or sole parental responsibility (FL Stat. \u00A761.13(2)(c))',
        'Proposed timesharing schedule (FL Stat. \u00A761.13)',
        'Parenting plan addressing daily tasks, education, healthcare, and communication (FL Stat. \u00A761.13001)',
        'Best interests of the child standard \u2014 20 statutory factors (FL Stat. \u00A761.13(3))',
        'Designation of primary residence for school enrollment purposes',
        'Both parties must complete an approved parenting course (FL Stat. \u00A761.21)',
      ],
      minParagraphs: 2,
    },
    {
      id: 'child_support',
      label: 'Child Support',
      description:
        'If minor children are involved, the petition must address child support. Florida uses the income shares model, which considers both parents\u2019 net incomes and the number of overnights each parent has (FL Stat. \u00A761.30).',
      legalElements: [
        'Request for child support in accordance with FL Stat. \u00A761.30 guidelines',
        'Both parents\u2019 net monthly incomes (income shares model)',
        'Number of overnights each parent has under the timesharing schedule',
        'Child\u2019s health insurance and uncovered medical expenses (FL Stat. \u00A761.13(1)(b))',
        'Daycare and childcare costs',
      ],
      minParagraphs: 1,
    },
    {
      id: 'alimony',
      label: 'Alimony',
      description:
        'Request for alimony (spousal support). Florida recognizes bridge-the-gap, rehabilitative, durational, and permanent alimony. The 2023 reform (SB 1416) eliminated permanent alimony for marriages under 20 years and imposed durational caps. The court considers factors including the standard of living, duration of the marriage, and each party\u2019s financial resources (FL Stat. \u00A761.08).',
      legalElements: [
        'Type of alimony requested \u2014 bridge-the-gap (max 2 years), rehabilitative, durational, or permanent (FL Stat. \u00A761.08)',
        'Duration and amount of the marriage (short: <7 years, moderate: 7\u201317 years, long: 17+ years)',
        'Need of the requesting party and ability of the other party to pay',
        'Standard of living established during the marriage',
        '2023 SB 1416 reform: no permanent alimony for marriages under 20 years; durational alimony capped at length of marriage',
      ],
      minParagraphs: 1,
    },
    {
      id: 'verification',
      label: 'Verification',
      description:
        'A sworn statement that the facts in the petition are true and correct. The petitioner signs under oath or affirmation.',
      legalElements: [
        'Signed under penalty of perjury under the laws of the State of Florida',
        'Statement that the facts set forth in the petition are true and correct to the best of petitioner\u2019s knowledge',
      ],
      minParagraphs: 1,
    },
    {
      id: 'certificate_of_service',
      label: 'Certificate of Service',
      description:
        'Certification that a copy of the petition was delivered to the respondent or their attorney, as required by Florida Rule of Civil Procedure 1.080.',
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
      'Circuit Court, Family Law Division',
    serviceRequirements:
      'Respondent must be personally served with a copy of the petition and summons. After initial service, subsequent documents may be served via e-mail, hand delivery, or mail per Florida Rule of Civil Procedure 1.080. A 20-day waiting period applies after filing before the court may finalize the dissolution (FL Stat. \u00A761.19). Mandatory mediation is required before trial (FL Stat. \u00A744.102).',
    filingFee:
      'Approximately $400 depending on county (fee waiver available via Application for Determination of Civil Indigent Status)',
    maxPages: 30,
    fontRequirements: '12-point minimum for body text',
    marginRequirements: '1-inch margins on all sides',
    copies: 2,
    localFormUrl: 'https://www.flcourts.gov/Resources-Services/Court-Improvement/Family-Courts/Family-Law-Self-Help-Information/Family-Law-Forms',
  },

  rejectionReasons: [
    {
      reason: 'Missing verification paragraph',
      howToAvoid:
        'Include a signed verification stating that the facts in the petition are true and correct under penalty of perjury.',
      wizardStep: 'review',
    },
    {
      reason: 'No certificate of service attached',
      howToAvoid:
        'Attach a certificate of service showing the date, method, and recipient of service per Florida Rule of Civil Procedure 1.080.',
      wizardStep: 'review',
    },
    {
      reason: 'Residency requirement not alleged',
      howToAvoid:
        'Include an allegation that the petitioner or respondent has been a resident of the State of Florida for at least 6 months immediately preceding the filing (FL Stat. \u00A761.021).',
      wizardStep: 'venue',
    },
    {
      reason: 'No grounds for dissolution stated',
      howToAvoid:
        'Allege that the marriage is irretrievably broken (FL Stat. \u00A761.052). This is the standard no-fault ground in Florida.',
      wizardStep: 'facts',
    },
    {
      reason: 'Children listed but no parenting plan proposed',
      howToAvoid:
        'If minor children are involved, a parenting plan is mandatory (FL Stat. \u00A761.13001). Include a proposed parenting plan addressing timesharing, parental responsibility, and daily tasks.',
      wizardStep: 'claims',
    },
    {
      reason: 'Financial Affidavit not filed',
      howToAvoid:
        'Both parties must file a Financial Affidavit (FL Family Law Form 12.902). This is a mandatory disclosure in all Florida dissolution cases involving property, alimony, or child support.',
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
            'Verify that you or your spouse meet the Florida residency requirement: at least 6 months of continuous residence in the State of Florida immediately preceding the filing (FL Stat. \u00A761.021). Failure to allege residency will result in dismissal.',
        },
        {
          condition: 'no_children_listed',
          message:
            'If there are minor children of the marriage, list each child\u2019s name, date of birth, and current residence. The court must address timesharing, parental responsibility, and child support for all minor children.',
        },
        {
          condition: 'no_separation_date',
          message:
            'Consider including the date of separation. While Florida does not require a formal separation period, the date may be relevant to property characterization and equitable distribution.',
        },
      ],
    },
    claims: {
      required: ['grounds'],
      warnings: [
        {
          condition: 'no_financial_affidavit_mentioned',
          message:
            'Florida requires both parties to file a Financial Affidavit (FL Family Law Form 12.902) disclosing income, expenses, assets, and liabilities. This is mandatory in all cases involving property division, alimony, or child support. Prepare this early to avoid delays.',
        },
        {
          condition: 'no_retirement_accounts_addressed',
          message:
            'Retirement accounts (401(k), pension, IRA) earned during marriage are marital property subject to equitable distribution. Division may require a Qualified Domestic Relations Order (QDRO). Identify all retirement accounts early.',
        },
        {
          condition: 'no_parenting_course_mentioned',
          message:
            'Both parties are required to complete an approved parenting course (FL Stat. \u00A761.21). Failure to complete the course can delay finalization of the dissolution. Enroll as soon as possible after filing.',
        },
      ],
    },
    relief: {
      required: [],
      warnings: [
        {
          condition: 'no_parenting_plan_proposed',
          message:
            'If minor children are involved, a parenting plan is mandatory (FL Stat. \u00A761.13001). The plan must address timesharing, parental responsibility, healthcare, education, and communication. Submit a proposed plan with the petition or shortly after filing.',
        },
        {
          condition: 'no_alimony_type_selected',
          message:
            'Florida recognizes four types of alimony: bridge-the-gap (max 2 years), rehabilitative (requires a plan), durational (capped at length of marriage), and permanent (only for long-term marriages of 20+ years after 2023 reform). Specify which type you are requesting and why.',
        },
        {
          condition: 'no_temporary_relief_requested',
          message:
            'Consider requesting temporary relief \u2014 such as temporary timesharing, child support, exclusive use of the marital home, or a domestic violence injunction (FL Stat. \u00A7741.30) \u2014 to maintain stability during the dissolution proceedings.',
        },
      ],
    },
  },

  glossary: [
    {
      term: 'Equitable Distribution',
      plainEnglish:
        'Florida\u2019s method of dividing property in a divorce. Unlike community property states, Florida does not automatically split assets 50/50. Instead, the court divides marital property "equitably" \u2014 meaning fairly, considering factors like the length of the marriage, each spouse\u2019s contributions, and economic circumstances (FL Stat. \u00A761.075).',
    },
    {
      term: 'Marital Property',
      plainEnglish:
        'Assets and debts acquired by either spouse during the marriage, regardless of whose name is on the title. Marital property is subject to equitable distribution. It includes things like the family home, joint bank accounts, and retirement benefits earned during the marriage.',
    },
    {
      term: 'Non-Marital Property',
      plainEnglish:
        'Property that belongs to one spouse alone \u2014 things owned before the marriage, or received as a gift or inheritance during the marriage (FL Stat. \u00A761.075(7)). Non-marital property is generally not divided in the divorce, but the increase in value during the marriage due to marital efforts may be.',
    },
    {
      term: 'Timesharing',
      plainEnglish:
        'Florida\u2019s term for what other states call custody or visitation. A timesharing schedule specifies how many overnights each parent has with the child. Florida law favors both parents having meaningful time with their children.',
    },
    {
      term: 'Parental Responsibility',
      plainEnglish:
        'The Florida term for legal custody \u2014 the right to make major decisions about a child\u2019s welfare, including education, healthcare, and religion. "Shared parental responsibility" (the default) means both parents share decision-making. "Sole parental responsibility" is rare and requires a showing of detriment to the child.',
    },
    {
      term: 'Dissolution of Marriage',
      plainEnglish:
        'The legal term for divorce in Florida. To obtain a dissolution, you must show that the marriage is "irretrievably broken" \u2014 meaning it cannot be saved (FL Stat. \u00A761.052). Florida is a no-fault state, so you do not need to prove wrongdoing by either spouse.',
    },
    {
      term: 'Alimony',
      plainEnglish:
        'Court-ordered financial support paid by one spouse to the other after divorce. Florida offers four types: bridge-the-gap (short-term transition, max 2 years), rehabilitative (to help a spouse become self-supporting), durational (set period based on marriage length), and permanent (only for long-term marriages of 20+ years after 2023 reform, FL Stat. \u00A761.08).',
    },
    {
      term: 'Financial Affidavit',
      plainEnglish:
        'A mandatory sworn disclosure form (FL Family Law Form 12.902) listing all income, expenses, assets, and liabilities. Both parties must file one in any Florida dissolution case involving property, alimony, or child support. Think of it as a complete financial picture under oath.',
    },
    {
      term: 'Parenting Plan',
      plainEnglish:
        'A mandatory document (FL Stat. \u00A761.13001) that describes how parents will share daily responsibilities, make decisions, and divide timesharing. Every Florida dissolution involving minor children must include a parenting plan \u2014 either agreed upon by the parties or ordered by the court.',
    },
    {
      term: 'Domestic Violence Injunction',
      plainEnglish:
        'A court order protecting a family or household member from violence, threats, or stalking (FL Stat. \u00A7741.30). A temporary injunction can be issued immediately without the other party present. A final injunction requires a hearing and can last indefinitely.',
    },
    {
      term: 'Mandatory Mediation',
      plainEnglish:
        'Florida requires that parties in a family law case attempt mediation before going to trial (FL Stat. \u00A744.102). A neutral mediator helps both sides try to reach an agreement on contested issues like timesharing, property division, and alimony.',
    },
  ],
} as const satisfies JurisdictionRuleConfig
