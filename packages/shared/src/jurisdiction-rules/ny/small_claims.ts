import type { JurisdictionRuleConfig } from '../schema'

export const nySmallClaims = {
  state: 'NY',
  disputeType: 'small_claims',

  requiredSections: [
    {
      id: 'caption',
      label: 'Caption',
      description:
        'Case caption identifying the small claims court, parties, and index number. Must match the court where the claim is filed (NYC Civil Court, City Court, District Court, Justice Court).',
      legalElements: [
        'Court name (e.g., Civil Court of the City of New York, Small Claims Part)',
        'Claimant name (your legal name)',
        'Defendant name (person or business you are suing)',
        'Index number placeholder (assigned by clerk at filing)',
        'Court location / county',
      ],
      minParagraphs: 1,
    },
    {
      id: 'facts',
      label: 'Statement of Facts',
      description:
        'A clear, plain-language description of what happened, including dates, amounts, and attempts to resolve the dispute. Small claims proceedings are informal (NY CCA §1804; UCCA §1804), so write in everyday language.',
      legalElements: [
        'Date(s) of the incident or transaction',
        'Description of the agreement, service, or event giving rise to the claim',
        'Amount of money involved',
        'Steps taken to resolve the dispute before filing (demand letter, phone calls, etc.)',
        'Why the defendant owes you money',
      ],
      minParagraphs: 2,
    },
    {
      id: 'claim_basis',
      label: 'Basis for Claim',
      description:
        'The legal theory supporting your claim. Common small claims bases include breach of contract, property damage, negligence, and consumer fraud. You do not need to cite statutes — the court applies the law.',
      legalElements: [
        'Type of claim (contract, negligence, property damage, consumer protection, etc.)',
        'What the defendant was supposed to do or not do',
        'How the defendant failed to meet that obligation',
      ],
      minParagraphs: 1,
    },
    {
      id: 'damages',
      label: 'Damages',
      description:
        'An itemized list of what you are owed, with supporting evidence. Small claims courts award money only — they cannot order someone to do or stop doing something (NY CCA §1801; UCCA §1801).',
      legalElements: [
        'Total amount claimed (must not exceed jurisdictional limit)',
        'Itemized breakdown of each loss (e.g., repair costs, unpaid wages, security deposit)',
        'Evidence supporting each item (receipts, invoices, photos, estimates)',
        'Interest calculation if applicable',
      ],
      minParagraphs: 1,
    },
    {
      id: 'proof_of_service',
      label: 'Proof of Service',
      description:
        'Documentation that the defendant was properly notified of the claim. In NY small claims, the clerk typically sends notice by both certified and regular first-class mail (NY CCA §1803; UCCA §1803). Personal service is also available if mail service fails.',
      legalElements: [
        'Method of service (clerk-mailed certified + regular mail, or personal service)',
        'Date notice was sent or delivered',
        'Address where notice was sent',
        'Confirmation of successful delivery or return receipt',
      ],
      minParagraphs: 1,
    },
  ],

  filingRules: {
    courtName:
      'NYC Civil Court, Small Claims Part (claims up to $10,000); City Court (up to $5,000); Town or Village Justice Court (up to $3,000–$5,000 depending on locality)',
    serviceRequirements:
      'Clerk sends notice to defendant by certified mail and ordinary first-class mail (NY CCA §1803; UCCA §1803). If mail service fails, claimant may arrange personal service. Service must be completed at least 8 days before the hearing (14 days if outside the county).',
    filingFee:
      '$10 for claims up to $1,000; $15 for claims over $1,000 (NYC Civil Court). Fees vary slightly by court. Fee waiver available for those who qualify (Poor Person Application, CPLR Article 11).',
    copies: 1,
    localFormUrl: 'https://nycourts.gov/courts/nyc/smallclaims/',
  },

  rejectionReasons: [
    {
      reason: 'Claim exceeds jurisdictional limit',
      howToAvoid:
        'Verify your claim does not exceed $10,000 (NYC), $5,000 (most city courts), or $3,000 (some town/village courts). You may reduce your claim to fit the limit, but you waive the excess.',
      wizardStep: 'relief',
    },
    {
      reason: 'Wrong court or venue',
      howToAvoid:
        'File in the court district where the defendant resides, is employed, or has a place of business (UCCA §1801-a; NY CCA §1801-a).',
      wizardStep: 'venue',
    },
    {
      reason: 'Defendant not properly identified',
      howToAvoid:
        'Use the defendant\'s full legal name. For businesses, use the exact registered business name — check with the NY Department of State Division of Corporations.',
      wizardStep: 'parties',
    },
    {
      reason: 'Incomplete statement of claim',
      howToAvoid:
        'Describe what happened, when it happened, the amount owed, and why the defendant is responsible. The clerk needs enough detail to prepare the notice.',
      wizardStep: 'facts',
    },
    {
      reason: 'Filing by a corporation or business',
      howToAvoid:
        'Only natural persons can file in small claims court. Corporations must file in Commercial Small Claims Part and pay a higher fee (NY CCA §1809-A). Sole proprietors may file as individuals.',
      wizardStep: 'parties',
    },
  ],

  stepValidations: {
    facts: {
      required: ['incident_date'],
      warnings: [
        {
          condition: 'no_receipts_or_documentation_mentioned',
          message:
            'Gather all receipts, contracts, photos, and correspondence related to your claim. The judge will want to see proof of your losses — bring originals and copies to the hearing.',
        },
        {
          condition: 'no_informal_resolution_attempts',
          message:
            'Document any attempts you made to resolve the dispute before filing (demand letters, phone calls, emails). Courts look favorably on claimants who tried to work things out first.',
        },
      ],
    },
    claims: {
      required: ['claim_type'],
      warnings: [
        {
          condition: 'amount_may_exceed_jurisdictional_limit',
          message:
            'Check your court\'s jurisdictional limit: $10,000 (NYC Civil Court), $5,000 (most city courts), $3,000 (some town/village courts). If your claim exceeds the limit, you can reduce it to fit — but you permanently waive the excess.',
        },
      ],
    },
    relief: {
      required: [],
      warnings: [
        {
          condition: 'no_evidence_preparation_plan',
          message:
            'Bring all evidence and witnesses to the hearing. Small claims judges decide cases on the spot. Organize receipts, photos, contracts, and estimates — and bring copies for the defendant and the court.',
        },
        {
          condition: 'damages_not_itemized',
          message:
            'Itemize each component of your damages (e.g., repair cost $500, lost wages $200). Judges award specific amounts — a lump sum without breakdown is harder to prove.',
        },
      ],
    },
  },

  glossary: [
    {
      term: 'Small Claims Court',
      plainEnglish:
        'A court designed for regular people to resolve disputes involving money without needing a lawyer. The rules are relaxed, the process is informal, and a judge or arbitrator hears your case — usually in one visit.',
    },
    {
      term: 'Arbitration',
      plainEnglish:
        'In NY small claims, your case may be heard by an arbitrator instead of a judge. Arbitration is faster but typically binding — meaning you usually cannot appeal the decision. You can request a judge instead.',
    },
    {
      term: 'Default Judgment',
      plainEnglish:
        'If the defendant does not show up for the hearing, you can win automatically. The court enters a "default judgment" in your favor — but you still need to prove your damages (called an inquest).',
    },
    {
      term: 'Counterclaim',
      plainEnglish:
        'A claim the defendant files against you in the same case. The defendant can counterclaim up to the court\'s jurisdictional limit. If a counterclaim exceeds the limit, the case may be transferred to a higher court.',
    },
    {
      term: 'Fee Waiver',
      plainEnglish:
        'If you cannot afford the filing fee, you can apply to have it waived by filing a Poor Person Application under CPLR Article 11. You must show that paying the fee would be a hardship.',
    },
    {
      term: 'Personal Service',
      plainEnglish:
        'Having someone (not you) physically hand the court papers to the defendant. This is used when certified mail fails or is returned. The person who delivers the papers must be over 18 and not a party to the case.',
    },
    {
      term: 'Certified Mail Service',
      plainEnglish:
        'The clerk sends your claim to the defendant by certified mail (with a return receipt) and regular mail. This is the standard way defendants are notified in NY small claims court.',
    },
    {
      term: 'Judgment Debtor',
      plainEnglish:
        'The person who owes money after losing a small claims case. If the defendant loses and does not pay voluntarily, you may need to take additional steps to collect — such as garnishing wages or placing a lien.',
    },
    {
      term: 'Inquest',
      plainEnglish:
        'A brief hearing where you present evidence of your damages to the judge, usually after the defendant fails to appear (default). Even though you win by default, you must still prove how much you are owed.',
    },
  ],
} as const satisfies JurisdictionRuleConfig
