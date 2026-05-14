import type { JurisdictionRuleConfig } from '../schema'

export const paFamily = {
  state: 'PA',
  disputeType: 'family',

  requiredSections: [
    {
      id: 'caption',
      label: 'Caption',
      description:
        'Case caption identifying the Court of Common Pleas (Family Division), parties, and docket number. Pennsylvania family law petitions use the case style "[Plaintiff] v. [Defendant]."',
      legalElements: [
        'Court name (Court of Common Pleas of [County] County, Family Division)',
        'Plaintiff name (spouse filing for divorce)',
        'Defendant name (other spouse)',
        'Docket number placeholder (assigned by clerk at filing)',
        'Civil action designation',
      ],
      minParagraphs: 1,
    },
    {
      id: 'facts',
      label: 'Facts',
      description:
        'Statement of facts establishing jurisdiction, venue, the marriage, grounds for divorce, and any children of the marriage. Pennsylvania requires at least one spouse to have been a bona fide resident of the Commonwealth for at least 6 months before filing (23 Pa.C.S. §3104).',
      legalElements: [
        'Date and place of marriage',
        'Date of separation',
        'Residency — at least one spouse has been a bona fide resident of Pennsylvania for at least 6 months before filing (23 Pa.C.S. §3104)',
        'Grounds for divorce — irretrievable breakdown with mutual consent after a 90-day waiting period (23 Pa.C.S. §3301(c)), or irretrievable breakdown after 1-year separation without mutual consent (23 Pa.C.S. §3301(d))',
        'Children of the marriage — names, dates of birth, and current residence of each minor child',
        'Statement regarding existing custody or support orders (if applicable)',
      ],
      minParagraphs: 3,
    },
    {
      id: 'property_division',
      label: 'Property Division (Equitable Distribution)',
      description:
        'Identification and proposed division of marital property. Pennsylvania is an equitable distribution state — marital property is divided fairly (not necessarily equally) based on factors in 23 Pa.C.S. §3502. Separate property belongs to the acquiring spouse (23 Pa.C.S. §3501(a) defines marital property; §3503 defines non-marital property).',
      legalElements: [
        'Identification of marital property — all property acquired during marriage regardless of title (23 Pa.C.S. §3501(a))',
        'Identification of non-marital (separate) property — property acquired before marriage, by gift or inheritance, or excluded by valid agreement (23 Pa.C.S. §3501(b))',
        'Proposed equitable distribution based on factors in 23 Pa.C.S. §3502 (length of marriage, prior marriages, age/health of parties, income and earning capacity, contributions to education/training, standard of living, economic circumstances, etc.)',
        'Real property (marital residence, investment properties)',
        'Retirement accounts, pensions, and employment benefits (may require QDRO)',
        'Vehicles, bank accounts, investment accounts, and personal property',
        'Marital debts and liabilities',
        'Increase in value of non-marital property during marriage (23 Pa.C.S. §3501(a)(1))',
      ],
      minParagraphs: 2,
    },
    {
      id: 'custody',
      label: 'Custody',
      description:
        'If children are involved, the petition must address legal and physical custody. Pennsylvania applies the best interest of the child standard using the 16 factors enumerated in 23 Pa.C.S. §5328. Custody conciliation or mediation is required in most counties before proceeding to trial (23 Pa.C.S. §5321–5340).',
      legalElements: [
        'Request for shared or sole legal custody (decision-making authority regarding education, medical care, and religious training — 23 Pa.C.S. §5322)',
        'Request for shared or primary physical custody (where the child lives — 23 Pa.C.S. §5322)',
        'Proposed custody schedule / parenting plan',
        'Best interest of the child — 16 factors under 23 Pa.C.S. §5328 (including which parent is more likely to encourage frequent and continuing contact with the other parent, present and past abuse, parental duties performed, stability of the child\'s community, sibling relationships, each parent\'s availability, etc.)',
        'Custody conciliation or mediation requirement (required in most counties before a custody hearing)',
        'Relocation notice requirements if applicable (23 Pa.C.S. §5337)',
      ],
      minParagraphs: 2,
    },
    {
      id: 'child_support',
      label: 'Child Support',
      description:
        'If children are involved, the petition must address child support. Pennsylvania uses an income shares model calculated under the statewide guidelines in Pa.R.C.P. 1910 (derived from 23 Pa.C.S. §4321–4326). Both parents\' net incomes are combined to determine the basic support obligation, which is then allocated proportionally.',
      legalElements: [
        'Request for child support in accordance with the Pennsylvania Support Guidelines (Pa.R.C.P. 1910)',
        'Both parents\' monthly net incomes (23 Pa.C.S. §4322)',
        'Income shares model — combined net income determines the basic support obligation, allocated proportionally between parents',
        'Health insurance for the child (Pa.R.C.P. 1910.16-6)',
        'Child care expenses and extraordinary expenses (Pa.R.C.P. 1910.16-6)',
        'Deviation factors — if applicable (Pa.R.C.P. 1910.16-5)',
      ],
      minParagraphs: 1,
    },
    {
      id: 'alimony',
      label: 'Alimony',
      description:
        'Request for alimony (spousal support after divorce). Pennsylvania courts consider the 17 factors in 23 Pa.C.S. §3701 including relative earnings, duration of marriage, standard of living, age and health, sources of income, contributions as homemaker, marital misconduct, and tax ramifications. Alimony pendente lite (APL) may be requested during proceedings.',
      legalElements: [
        'Request for alimony based on 17 factors in 23 Pa.C.S. §3701',
        'Relative earnings and earning capacities of both spouses',
        'Duration of the marriage',
        'Standard of living established during the marriage',
        'Age, health, and physical/mental condition of each party',
        'Sources of income including retirement benefits',
        'Contributions of each spouse as homemaker',
        'Request for alimony pendente lite (APL) during proceedings if applicable (23 Pa.C.S. §3702)',
      ],
      minParagraphs: 1,
    },
    {
      id: 'verification',
      label: 'Verification',
      description:
        'A sworn statement that the facts in the complaint are true and correct. Pennsylvania requires verification of pleadings under Pa.R.C.P. 1024.',
      legalElements: [
        'Signed verification under penalty of perjury under the laws of the Commonwealth of Pennsylvania',
        'Statement that the facts set forth in the complaint are true and correct to the best of plaintiff\'s knowledge, information, and belief (Pa.R.C.P. 1024)',
      ],
      minParagraphs: 1,
    },
    {
      id: 'certificate_of_service',
      label: 'Certificate of Service',
      description:
        'Certification that a copy of the complaint was delivered to the defendant or their attorney, as required by Pa.R.C.P. 440.',
      legalElements: [
        'Date of service',
        'Method of service (personal service, certified mail, or first-class mail per Pa.R.C.P. 440)',
        'Name and address of the party or attorney served',
      ],
      minParagraphs: 1,
    },
  ],

  filingRules: {
    courtName:
      'Court of Common Pleas, Family Division (each county has a Family Division or family court program)',
    serviceRequirements:
      'Defendant must be served with the complaint in divorce and a notice to defend per Pa.R.C.P. 1920.4. Service may be by personal service, certified mail, or regular mail with return receipt per Pa.R.C.P. 412. After service, a 90-day waiting period must elapse before filing mutual consent affidavits under §3301(c). For §3301(d) no-fault without consent, the parties must have been separated for at least 1 year. Mandatory Income and Expense Statements and an Inventory of property must be exchanged.',
    filingFee:
      'Approximately $300–350 depending on county (fee waiver available via petition to proceed in forma pauperis for qualifying low-income filers)',
    maxPages: 30,
    fontRequirements: '12-point minimum for body text',
    marginRequirements: '1-inch margins on all sides',
    copies: 2,
    localFormUrl: 'https://www.pacourts.us/forms/for-the-public',
  },

  rejectionReasons: [
    {
      reason: 'Missing verification paragraph',
      howToAvoid:
        'Include a signed verification under Pa.R.C.P. 1024 stating that the facts in the complaint are true and correct to the best of your knowledge.',
      wizardStep: 'review',
    },
    {
      reason: 'No certificate of service attached',
      howToAvoid:
        'Attach a certificate of service showing the date, method, and recipient of service per Pa.R.C.P. 440.',
      wizardStep: 'review',
    },
    {
      reason: 'Residency requirements not alleged',
      howToAvoid:
        'Include an allegation that at least one spouse has been a bona fide resident of Pennsylvania for at least 6 months before filing (23 Pa.C.S. §3104).',
      wizardStep: 'venue',
    },
    {
      reason: 'No grounds for divorce stated',
      howToAvoid:
        'Allege specific grounds for divorce. For no-fault, state that the marriage is irretrievably broken with mutual consent (§3301(c)) or after 1-year separation (§3301(d)).',
      wizardStep: 'facts',
    },
    {
      reason: 'Children listed but no custody request',
      howToAvoid:
        'If minor children are involved, include a request for legal and physical custody specifying shared or sole arrangements and a proposed parenting plan.',
      wizardStep: 'claims',
    },
    {
      reason: 'Income and Expense Statement not filed',
      howToAvoid:
        'File an Income and Expense Statement and an Inventory of property as required by Pennsylvania local rules. These mandatory financial disclosures must be exchanged with the other party.',
      wizardStep: 'claims',
    },
    {
      reason: '90-day waiting period not satisfied for §3301(c)',
      howToAvoid:
        'Ensure at least 90 days have elapsed from the date of service before filing mutual consent affidavits under 23 Pa.C.S. §3301(c). The court cannot grant the divorce until this period has passed.',
      wizardStep: 'facts',
    },
  ],

  stepValidations: {
    facts: {
      required: ['marriage_date'],
      warnings: [
        {
          condition: 'no_residency_stated',
          message:
            'Verify that at least one spouse meets the Pennsylvania residency requirement: bona fide resident of the Commonwealth for at least 6 months before filing (23 Pa.C.S. §3104). Failure to allege residency will result in dismissal.',
        },
        {
          condition: 'no_separation_period_stated',
          message:
            'If proceeding under §3301(d) (no mutual consent), the parties must have been separated for at least 1 year. If proceeding under §3301(c) (mutual consent), a 90-day waiting period from service must elapse before both parties file consent affidavits.',
        },
        {
          condition: 'no_children_listed',
          message:
            'If there are minor children of the marriage, list each child\'s name, date of birth, and current residence. The court must address custody, visitation, and child support for all minor children.',
        },
      ],
    },
    claims: {
      required: ['grounds'],
      warnings: [
        {
          condition: 'no_property_inventory',
          message:
            'Pennsylvania requires an Inventory of property and Income and Expense Statements. Begin identifying marital and non-marital property now — the court needs complete financial disclosure for equitable distribution.',
        },
        {
          condition: 'no_retirement_accounts_addressed',
          message:
            'Retirement accounts (401(k), pension, IRA) earned during marriage are subject to equitable distribution. Division typically requires a Qualified Domestic Relations Order (QDRO). Identify all retirement accounts early to avoid delays.',
        },
        {
          condition: 'no_pfa_considered',
          message:
            'If there is a history of domestic abuse, consider filing a Protection From Abuse (PFA) petition under the Protection From Abuse Act (23 Pa.C.S. §6101–6122). A PFA order can be obtained alongside or independently of a divorce action and provides immediate protection.',
        },
      ],
    },
    relief: {
      required: [],
      warnings: [
        {
          condition: 'no_custody_conciliation_noted',
          message:
            'Most Pennsylvania counties require custody conciliation or mediation before a custody case can proceed to trial. Be prepared to participate in the county\'s conciliation program.',
        },
        {
          condition: 'no_temporary_orders_requested',
          message:
            'Consider requesting temporary orders for custody, child support, alimony pendente lite (APL), exclusive possession of the marital home, or a PFA order during the divorce proceedings.',
        },
        {
          condition: 'no_alimony_factors_considered',
          message:
            'Pennsylvania courts consider 17 factors in 23 Pa.C.S. §3701 when awarding alimony — including relative earnings, duration of marriage, standard of living, age and health, and contributions as homemaker. Evaluate whether alimony should be requested.',
        },
      ],
    },
  },

  glossary: [
    {
      term: 'Equitable Distribution',
      plainEnglish:
        'Pennsylvania\'s method of dividing marital property in a divorce. "Equitable" means fair — not necessarily 50/50. The court considers factors in 23 Pa.C.S. §3502 including the length of marriage, each spouse\'s income and earning capacity, and contributions to the marriage.',
    },
    {
      term: 'Marital Property',
      plainEnglish:
        'All property acquired by either spouse during the marriage, regardless of whose name is on the title (23 Pa.C.S. §3501(a)). It also includes the increase in value of non-marital property during the marriage. This is the property that gets divided in a divorce.',
    },
    {
      term: 'Separate Property',
      plainEnglish:
        'Property that belongs to one spouse alone — things owned before the marriage, received as a gift or inheritance, or excluded by a valid prenuptial agreement (23 Pa.C.S. §3501(b)). Separate property is generally not divided in the divorce.',
    },
    {
      term: 'Legal Custody',
      plainEnglish:
        'The right to make major decisions about a child\'s life — including education, medical care, and religious training (23 Pa.C.S. §5322). Shared legal custody means both parents make these decisions together. Sole legal custody means one parent decides.',
    },
    {
      term: 'Physical Custody',
      plainEnglish:
        'Determines where the child lives on a day-to-day basis (23 Pa.C.S. §5322). Primary physical custody means the child lives mostly with one parent. Shared physical custody means the child spends significant time with both parents.',
    },
    {
      term: 'Irretrievable Breakdown',
      plainEnglish:
        'The no-fault ground for divorce in Pennsylvania (23 Pa.C.S. §3301). It means the marriage is broken beyond repair. You can establish this either by mutual consent after a 90-day waiting period (§3301(c)) or by living separately for at least 1 year (§3301(d)).',
    },
    {
      term: 'Alimony',
      plainEnglish:
        'Court-ordered payments from one spouse to the other after divorce. Pennsylvania courts consider 17 factors under 23 Pa.C.S. §3701, including relative earnings, length of marriage, standard of living, and each spouse\'s needs and ability to pay. Alimony pendente lite (APL) provides support during the divorce proceedings.',
    },
    {
      term: 'Child Support Guidelines',
      plainEnglish:
        'Pennsylvania uses an income shares model (Pa.R.C.P. 1910) to calculate child support. Both parents\' net incomes are combined to determine the total support obligation, which is then split proportionally between the parents based on their share of the combined income.',
    },
    {
      term: 'PFA (Protection From Abuse)',
      plainEnglish:
        'A court order under the Protection From Abuse Act (23 Pa.C.S. §6101–6122) that protects a family or household member from abuse, threats, or harassment. A temporary PFA can be issued the same day; a final PFA can last up to 3 years and can be extended.',
    },
    {
      term: 'Custody Conciliation',
      plainEnglish:
        'A mandatory meeting with a court-appointed conciliator to try to resolve custody disputes without a trial. Most Pennsylvania counties require this step before a custody case can go before a judge. It is similar to mediation but conducted by the court.',
    },
    {
      term: '90-Day Waiting Period',
      plainEnglish:
        'Under 23 Pa.C.S. §3301(c), after the divorce complaint is served, both spouses must wait at least 90 days before they can sign affidavits of consent agreeing that the marriage is irretrievably broken. The court cannot grant the divorce until this period has passed.',
    },
  ],
} as const satisfies JurisdictionRuleConfig
