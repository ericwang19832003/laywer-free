import type { JurisdictionRuleConfig } from '../schema'

export const nyFamily = {
  state: 'NY',
  disputeType: 'family',

  requiredSections: [
    {
      id: 'caption',
      label: 'Caption',
      description:
        'Case caption identifying the court, parties, and index number. Divorce actions are filed in Supreme Court; custody, support, and orders of protection without a divorce are filed in Family Court.',
      legalElements: [
        'Court name (Supreme Court for divorce, Family Court for standalone custody/support/OOP)',
        'Plaintiff name (spouse filing for divorce)',
        'Defendant name (other spouse)',
        'Index number placeholder (assigned by clerk at filing)',
        'Case style — "[Plaintiff] v. [Defendant], Action for Divorce"',
        'County of filing (county where either spouse resides — DRL §230)',
      ],
      minParagraphs: 1,
    },
    {
      id: 'facts',
      label: 'Facts',
      description:
        'Statement of facts establishing jurisdiction, venue, the marriage, grounds for divorce, and any children of the marriage. New York requires residency of at least 1 year if the parties were married in NY, lived together in NY, or the grounds arose in NY; 2 years otherwise; or both parties are NY residents at filing and the grounds arose in NY (DRL §230).',
      legalElements: [
        'Date and place of marriage',
        'Date of separation (if applicable)',
        'Residency — 1 year if married in NY, lived together as spouses in NY, or grounds arose in NY; 2 years continuous residence otherwise; or both spouses are NY residents at filing and grounds arose in NY (DRL §230)',
        'Grounds for divorce — irretrievable breakdown of the relationship for a period of at least 6 months (DRL §170(7), no-fault), or fault grounds: cruel and inhuman treatment (§170(1)), abandonment (§170(2)), imprisonment (§170(3)), adultery (§170(4)), separation agreement (§170(5)–(6))',
        'Children of the marriage — names, dates of birth, and current residence of each child under 18',
        'Statement regarding any existing orders of protection or pending Family Court proceedings',
      ],
      minParagraphs: 3,
    },
    {
      id: 'property_division',
      label: 'Property Division (Equitable Distribution)',
      description:
        'New York is an equitable distribution state — NOT community property. The court divides marital property "equitably" (not necessarily equally) considering statutory factors including length of marriage, age and health of parties, income and property at time of marriage, and contributions to marital property (DRL §236(B)(5)).',
      legalElements: [
        'Identification of marital property (property acquired during the marriage regardless of title — DRL §236(B)(1)(c))',
        'Identification of separate property (property acquired before marriage, by gift, inheritance, or personal injury award — DRL §236(B)(1)(d))',
        'Proposed equitable distribution of marital property (DRL §236(B)(5))',
        'Real property (marital residence and other real estate)',
        'Retirement accounts, pensions, and employment benefits (may require QDRO)',
        'Vehicles, bank accounts, investments, and personal property',
        'Marital debts and liabilities',
        'Enhanced earning capacity or professional licenses acquired during marriage (if applicable)',
      ],
      minParagraphs: 2,
    },
    {
      id: 'custody',
      label: 'Custody and Parenting Plan',
      description:
        'If children are involved, the petition must address custody. New York applies the "best interests of the child" standard (DRL §240). The court considers factors including stability, parental fitness, domestic violence history, and the child\'s wishes (if of sufficient age).',
      legalElements: [
        'Request for legal custody — sole or joint (decision-making authority for education, health, and welfare)',
        'Request for physical custody — sole or joint (where the child primarily resides)',
        'Proposed parenting plan or visitation schedule',
        'Best interests of the child standard (DRL §240)',
        'History of domestic violence (if applicable — a statutory factor in custody determinations)',
        'Child\'s preferences (if of sufficient age and maturity)',
      ],
      minParagraphs: 2,
    },
    {
      id: 'child_support',
      label: 'Child Support',
      description:
        'If children are involved, the petition must address child support. New York uses the Child Support Standards Act (CSSA), which applies a percentage of combined parental income to determine the basic obligation: 17% for 1 child, 25% for 2, 29% for 3, 31% for 4, 35% for 5+ (DRL §240(1-b)).',
      legalElements: [
        'Request for child support in accordance with CSSA guidelines (DRL §240(1-b))',
        'Combined parental income calculation',
        'Guideline percentages — 17% for 1 child, 25% for 2, 29% for 3, 31% for 4, 35% for 5+ (DRL §240(1-b)(c)(2))',
        'Add-on expenses — child care, health insurance, and unreimbursed medical expenses (DRL §240(1-b)(c)(4)–(5))',
        'Health insurance for the child',
        'Income cap consideration (court may deviate above the statutory cap based on factors)',
      ],
      minParagraphs: 1,
    },
    {
      id: 'spousal_support',
      label: 'Spousal Support (Maintenance)',
      description:
        'New York uses a formula-based approach for both temporary and post-divorce maintenance (DRL §236(B)(5-a) and §236(B)(6)). The 2016 maintenance reform provides duration guidelines based on length of marriage. The court may deviate based on statutory factors.',
      legalElements: [
        'Request for temporary maintenance during pendency of the action (DRL §236(B)(5-a))',
        'Request for post-divorce maintenance (DRL §236(B)(6))',
        'Formula calculation — based on income of both parties with statutory caps',
        'Duration guidelines — 15–30% of marriage length for marriages 0–15 years; 30–40% for 15–20 years; 35–50% for 20+ years (DRL §236(B)(6)(f))',
        'Statutory deviation factors — age, health, earning capacity, reduced earning capacity due to marriage (DRL §236(B)(6)(e))',
      ],
      minParagraphs: 1,
    },
    {
      id: 'verification',
      label: 'Verification',
      description:
        'A sworn statement that the facts in the petition are true and correct. Verified complaints are standard in New York matrimonial actions (CPLR §3020).',
      legalElements: [
        'Signed under penalty of perjury under the laws of the State of New York',
        'Statement that the facts set forth in the petition are true and correct to the best of petitioner\'s knowledge',
      ],
      minParagraphs: 1,
    },
    {
      id: 'proof_of_service',
      label: 'Proof of Service',
      description:
        'Proof that the defendant was properly served with the summons and complaint. New York requires personal service for the initial divorce filing (CPLR §308).',
      legalElements: [
        'Date of service',
        'Method of service — personal delivery, substituted service, or service by publication if defendant cannot be located (CPLR §308)',
        'Name and address of the party served',
        'Affidavit of service from the process server',
      ],
      minParagraphs: 1,
    },
  ],

  filingRules: {
    courtName:
      'Supreme Court (divorce and equitable distribution); Family Court (standalone custody, support, and orders of protection without divorce)',
    serviceRequirements:
      'Defendant must be personally served with the summons and verified complaint per CPLR §308. Personal delivery is preferred; substituted service (leave-and-mail) or service by publication requires court permission. Automatic Orders take effect upon filing for the plaintiff and upon service for the defendant (DRL §236(B)(2)(b)) — both parties are restrained from transferring assets, incurring debt, or changing insurance.',
    filingFee:
      '$210 Supreme Court index number filing fee (poor person relief available under CPLR §1101 to waive fees based on financial hardship)',
    maxPages: 30,
    fontRequirements: 'No statewide font requirement; check local court rules (many require 12-point minimum)',
    marginRequirements: '1-inch margins on all sides recommended; check local court rules',
    copies: 2,
    localFormUrl: 'https://www.nycourts.gov/divorce/forms.shtml',
  },

  rejectionReasons: [
    {
      reason: 'Missing verification',
      howToAvoid:
        'Include a signed verification stating that the facts in the complaint are true and correct under penalty of perjury (CPLR §3020).',
      wizardStep: 'review',
    },
    {
      reason: 'No proof of service filed',
      howToAvoid:
        'File an affidavit of service from the process server showing the date, method, and recipient of service per CPLR §308.',
      wizardStep: 'review',
    },
    {
      reason: 'Residency requirements not alleged',
      howToAvoid:
        'Include an allegation establishing one of the residency bases under DRL §230: 1 year if married in NY/lived together in NY/grounds arose in NY; 2 years continuous residence; or both residents at filing with grounds in NY.',
      wizardStep: 'venue',
    },
    {
      reason: 'No grounds for divorce stated',
      howToAvoid:
        'Allege specific grounds for divorce. For no-fault, state that the relationship has been irretrievably broken for at least 6 months (DRL §170(7)).',
      wizardStep: 'facts',
    },
    {
      reason: 'Children listed but no custody or support request',
      howToAvoid:
        'If children are involved, include requests for both custody (legal and physical) and child support under the CSSA guidelines (DRL §240).',
      wizardStep: 'claims',
    },
    {
      reason: 'Statement of Net Worth not filed in contested case',
      howToAvoid:
        'In all contested matrimonial actions, both parties must file a Statement of Net Worth (22 NYCRR §202.16). Prepare this financial disclosure document listing all income, assets, expenses, and liabilities.',
      wizardStep: 'claims',
    },
    {
      reason: 'Automatic Orders acknowledgment missing',
      howToAvoid:
        'Include or attach the Automatic Orders notice (DRL §236(B)(2)(b)). These financial restraints take effect upon filing for plaintiff and upon service for defendant.',
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
            'Verify that you meet one of New York\'s residency requirements under DRL §230: (1) 1 year if you were married in NY, lived together in NY as spouses, or the grounds arose in NY; (2) 2 years continuous residence by either spouse; or (3) both spouses are NY residents at filing and the grounds arose in NY. Failure to allege residency will result in dismissal.',
        },
        {
          condition: 'no_children_listed',
          message:
            'If there are children of the marriage under 18, list each child\'s name, date of birth, and current residence. The court must address custody and child support for all minor children.',
        },
        {
          condition: 'no_separation_date',
          message:
            'Consider including the date of separation. The separation date can affect the characterization of property as marital or separate, and is relevant if claiming irretrievable breakdown for 6+ months.',
        },
      ],
    },
    claims: {
      required: ['grounds'],
      warnings: [
        {
          condition: 'no_automatic_orders_acknowledged',
          message:
            'Upon filing, Automatic Orders (DRL §236(B)(2)(b)) take effect immediately for the plaintiff and upon service for the defendant. Both parties are restrained from transferring marital assets, incurring unreasonable debt, or changing insurance beneficiaries. Ensure you understand these restraints.',
        },
        {
          condition: 'no_statement_of_net_worth',
          message:
            'In contested cases, both parties must file a Statement of Net Worth (22 NYCRR §202.16) — a comprehensive financial disclosure listing all income, assets, expenses, and liabilities. Begin preparing this document early to avoid delays.',
        },
        {
          condition: 'no_retirement_accounts_addressed',
          message:
            'Retirement accounts and pensions earned during the marriage are marital property subject to equitable distribution. Division may require a Qualified Domestic Relations Order (QDRO). Identify all retirement accounts early.',
        },
      ],
    },
    relief: {
      required: [],
      warnings: [
        {
          condition: 'no_temporary_orders_requested',
          message:
            'Consider requesting temporary maintenance, temporary child support, or exclusive use of the marital home during the pendency of the divorce action (DRL §236(B)(5-a) for temporary maintenance, DRL §240 for temporary support).',
        },
        {
          condition: 'no_maintenance_formula_calculated',
          message:
            'New York uses a formula for both temporary and post-divorce maintenance (DRL §236(B)(5-a) and §236(B)(6)). Calculate the guideline amount based on both parties\' incomes to include a specific maintenance request.',
        },
        {
          condition: 'no_order_of_protection_considered',
          message:
            'If there is a history of domestic violence, consider requesting an order of protection (Family Court Act §842). An order of protection can be filed in Family Court independently or requested as part of the divorce in Supreme Court.',
        },
      ],
    },
  },

  glossary: [
    {
      term: 'Equitable Distribution',
      plainEnglish:
        'New York\'s method of dividing property in a divorce. Unlike community property states, the court divides marital property "equitably" — meaning fairly, but not necessarily 50/50. The court considers many factors including length of marriage, each spouse\'s income, and contributions to the marriage (DRL §236(B)(5)).',
    },
    {
      term: 'Marital Property',
      plainEnglish:
        'All property acquired by either spouse during the marriage, regardless of whose name is on the title (DRL §236(B)(1)(c)). This includes the home, cars, retirement accounts, and even a business started during the marriage. Marital property is subject to equitable distribution.',
    },
    {
      term: 'Separate Property',
      plainEnglish:
        'Property that belongs to one spouse alone — things owned before the marriage, gifts from third parties, inheritances, or personal injury awards (DRL §236(B)(1)(d)). Separate property is not divided in the divorce, but you must prove it is separate.',
    },
    {
      term: 'Legal Custody',
      plainEnglish:
        'The right to make major decisions about a child\'s life — including education, religion, and medical care. Joint legal custody means both parents share these decisions. Sole legal custody means one parent decides alone.',
    },
    {
      term: 'Physical Custody',
      plainEnglish:
        'Where the child actually lives day to day. The parent with primary physical custody is the one the child lives with most of the time. The other parent typically has a visitation or parenting time schedule.',
    },
    {
      term: 'Irretrievable Breakdown',
      plainEnglish:
        'New York\'s no-fault ground for divorce (DRL §170(7)). It means the relationship has been broken down irretrievably for at least 6 months. One spouse states under oath that the marriage is over, and the court does not require proof of wrongdoing.',
    },
    {
      term: 'Maintenance (Spousal Support)',
      plainEnglish:
        'Court-ordered payments from one spouse to the other to help maintain their standard of living after divorce. New York uses a formula based on both spouses\' incomes (DRL §236(B)(6)). Duration depends on the length of the marriage — longer marriages generally mean longer maintenance.',
    },
    {
      term: 'CSSA (Child Support Standards Act)',
      plainEnglish:
        'New York\'s formula for calculating child support (DRL §240(1-b)). It applies a percentage of combined parental income: 17% for 1 child, 25% for 2, 29% for 3, 31% for 4, 35% for 5 or more. The non-custodial parent pays their proportional share.',
    },
    {
      term: 'Automatic Orders',
      plainEnglish:
        'Financial restraints that take effect automatically when a divorce is filed (DRL §236(B)(2)(b)). Neither spouse may transfer assets, hide money, incur unreasonable debts, or change insurance beneficiaries. These protect both parties during the divorce.',
    },
    {
      term: 'Order of Protection',
      plainEnglish:
        'A court order that protects a family member from abuse, threats, or harassment (Family Court Act §842). It can order the abuser to stay away, move out, or stop contacting the victim. Violation is a crime. Can be temporary or final (up to 5 years).',
    },
    {
      term: 'Statement of Net Worth',
      plainEnglish:
        'A required financial disclosure in all contested New York divorce cases (22 NYCRR §202.16). It is a detailed form listing your income, assets, expenses, and liabilities. Both spouses must file one. Think of it as a complete financial X-ray of your life.',
    },
  ],
} as const satisfies JurisdictionRuleConfig
