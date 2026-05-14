import type { JurisdictionRuleConfig } from '../schema'

export const flSmallClaims = {
  state: 'FL',
  disputeType: 'small_claims',

  requiredSections: [
    {
      id: 'caption',
      label: 'Caption',
      description:
        'Case caption identifying the Small Claims division of the County Court, parties, and case number. Florida small claims actions are governed by FL R. Small Claims 7.010-7.350.',
      legalElements: [
        'Court name (Small Claims division of the County Court per FL Stat. §34.01)',
        'Plaintiff name',
        'Defendant name',
        'Case number placeholder (assigned by clerk at filing)',
      ],
      minParagraphs: 1,
    },
    {
      id: 'facts',
      label: 'Statement of Facts',
      description:
        'A plain-language narrative explaining what happened, when it happened, and why the defendant owes money. Small claims courts prefer clear, concise statements over legal jargon.',
      legalElements: [
        'Date(s) of the incident or transaction giving rise to the claim',
        'Description of the agreement, transaction, or event',
        'What the defendant did or failed to do',
        'How the plaintiff was harmed or suffered a loss',
        'Any attempts to resolve the dispute before filing',
      ],
      minParagraphs: 2,
    },
    {
      id: 'claim_basis',
      label: 'Claim Basis',
      description:
        'The legal or factual basis for the claim. In small claims, this does not need to cite specific statutes but should clearly state why the defendant owes money (breach of contract, property damage, unpaid services, etc.).',
      legalElements: [
        'Type of claim (breach of contract, negligence, property damage, unpaid debt, return of deposit, etc.)',
        'Key facts supporting the claim',
        'Any written agreements, receipts, or documentation referenced',
      ],
      minParagraphs: 1,
    },
    {
      id: 'damages',
      label: 'Damages',
      description:
        'Specific monetary relief sought, itemized by category. Florida small claims jurisdiction is limited to $8,000 (FL Stat. §34.01). Claims exceeding this limit must be filed in County Court or Circuit Court.',
      legalElements: [
        'Total amount claimed (must not exceed $8,000)',
        'Itemized breakdown of damages (repair costs, unpaid amounts, lost deposits, etc.)',
        'Supporting documentation referenced (receipts, estimates, invoices)',
        'Court costs and pre-judgment interest (if applicable)',
      ],
      minParagraphs: 1,
    },
    {
      id: 'certificate_of_service',
      label: 'Certificate of Service',
      description:
        'Certification that a copy of the statement of claim was served on the defendant via personal service or certified mail per FL R. Civ. P. 1.070.',
      legalElements: [
        'Date of service',
        'Method of service (personal service or certified mail per FL R. Civ. P. 1.070)',
        'Name and address of the party served',
      ],
      minParagraphs: 1,
    },
  ],

  filingRules: {
    courtName:
      'Small Claims division of the County Court per FL Stat. §34.01 (jurisdictional limit: $8,000)',
    serviceRequirements:
      'Must serve the defendant via personal service or certified mail per FL R. Civ. P. 1.070. If the defendant cannot be located, service by publication may be available with court approval.',
    filingFee:
      '~$55 for claims ≤$2,500; ~$80 for claims $2,501-$8,000 (fee waiver available for qualifying individuals based on income or government assistance)',
    maxPages: 10,
    fontRequirements: 'At least 12-point font for body text',
    marginRequirements: '1-inch margins on all sides',
    copies: 2,
    localFormUrl: 'https://www.flcourts.gov/Resources-Services/Court-Improvement/Family-Courts/Family-Law-Self-Help-Information/Family-Law-Forms',
  },

  rejectionReasons: [
    {
      reason: 'Claim exceeds $8,000 jurisdictional limit',
      howToAvoid:
        'Florida small claims jurisdiction is capped at $8,000 (FL Stat. §34.01). If your claim exceeds this amount, file in County Court (≤$50,000) or Circuit Court (>$50,000) instead.',
      wizardStep: 'relief',
    },
    {
      reason: 'No incident or transaction date specified',
      howToAvoid:
        'State the specific date(s) of the incident or transaction. If the exact date is unknown, provide an approximate date range.',
      wizardStep: 'facts',
    },
    {
      reason: 'Damages not itemized',
      howToAvoid:
        'Break down your claim into specific categories (repair costs, unpaid amounts, lost deposits, etc.) with dollar amounts for each. Attach supporting documentation as exhibits.',
      wizardStep: 'relief',
    },
    {
      reason: 'Filed in wrong county',
      howToAvoid:
        'Small claims must be filed in the county where the defendant resides or where the cause of action accrued (FL Stat. §47.011). Verify venue before filing.',
      wizardStep: 'venue',
    },
    {
      reason: 'No certificate of service attached',
      howToAvoid:
        'Attach a certificate of service showing the date, method, and recipient of service per FL R. Civ. P. 1.070.',
      wizardStep: 'review',
    },
    {
      reason: 'Missing claim basis',
      howToAvoid:
        'Clearly state why the defendant owes you money — breach of contract, property damage, unpaid services, etc. You do not need to cite statutes in small claims, but you must explain the basis of the claim.',
      wizardStep: 'claims',
    },
  ],

  stepValidations: {
    facts: {
      required: ['incident_date'],
      warnings: [
        {
          condition: 'no_supporting_documents',
          message:
            'Gather all supporting documents before filing: contracts, receipts, photographs, text messages, emails, and repair estimates. Small claims judges rely heavily on documentary evidence.',
        },
        {
          condition: 'no_prior_demand',
          message:
            'Consider whether you sent a written demand to the defendant before filing. While not legally required for most small claims, a demand letter shows the court you tried to resolve the dispute and strengthens your case.',
        },
      ],
    },
    claims: {
      required: ['claim_type'],
      warnings: [
        {
          condition: 'amount_near_jurisdictional_limit',
          message:
            'Florida small claims jurisdiction is limited to $8,000 (FL Stat. §34.01). If your total damages exceed $8,000, you must either reduce your claim to fit the limit (waiving the excess) or file in County Court instead.',
        },
        {
          condition: 'no_counterclaim_awareness',
          message:
            'Be aware that the defendant may file a counterclaim. If the counterclaim exceeds $8,000, the entire case may be transferred to regular County Court (FL R. Small Claims 7.100).',
        },
      ],
    },
    relief: {
      required: [],
      warnings: [
        {
          condition: 'damages_not_itemized',
          message:
            'Itemize every component of your claim with a specific dollar amount. Judges are more likely to award damages when they can see exactly how you calculated each item. Include receipts, estimates, or invoices as exhibits.',
        },
        {
          condition: 'no_mediation_awareness',
          message:
            'Most Florida counties require pre-trial mediation in small claims cases. Be prepared for a mediation session before trial where a neutral mediator will help you and the defendant try to reach a settlement.',
        },
      ],
    },
  },

  glossary: [
    {
      term: 'Small Claims Court',
      plainEnglish:
        'A simplified division of the County Court for disputes of $8,000 or less (FL Stat. §34.01). The rules are relaxed, attorneys are allowed but not required, and cases are resolved faster than in regular court.',
    },
    {
      term: 'County Court',
      plainEnglish:
        'The trial court in Florida that handles civil cases up to $50,000 (FL Stat. §34.01). Small claims is a division of County Court with simplified procedures for cases $8,000 and under.',
    },
    {
      term: 'Pre-Trial Mediation',
      plainEnglish:
        'A meeting where a neutral mediator helps both sides try to reach a settlement before trial. Most Florida counties require mediation in small claims cases. It is informal and confidential — if you cannot agree, the case goes to trial.',
    },
    {
      term: 'Default Judgment',
      plainEnglish:
        'An automatic win for the plaintiff when the defendant fails to respond within 5 days of being served. The court may award the full amount claimed without a hearing.',
    },
    {
      term: 'Counterclaim',
      plainEnglish:
        'A claim filed by the defendant against the plaintiff in the same case. In Florida small claims, counterclaims are allowed up to the $8,000 jurisdictional limit. If the counterclaim exceeds $8,000, the case is transferred to regular County Court (FL R. Small Claims 7.100).',
    },
    {
      term: 'Service of Process',
      plainEnglish:
        'The legal method of delivering court papers to the defendant. In Florida, this is done through personal service (a process server hands the papers to the defendant) or certified mail (FL R. Civ. P. 1.070). The case cannot proceed until the defendant is properly served.',
    },
    {
      term: 'Fee Waiver',
      plainEnglish:
        'If you cannot afford the filing fee, you can apply for a fee waiver. The court waives the fee if you qualify based on income or if you receive government assistance such as food stamps, Medicaid, or SSI.',
    },
    {
      term: 'Statement of Claim',
      plainEnglish:
        'The document you file to start a small claims case. It explains who you are suing, why, and how much money you are asking for. In Florida, it must be plain and simple — no legal jargon required.',
    },
  ],
} as const satisfies JurisdictionRuleConfig
