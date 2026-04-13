import type { JurisdictionRuleConfig } from '../schema'

export const caSmallClaims = {
  state: 'CA',
  disputeType: 'small_claims',

  requiredSections: [
    {
      id: 'caption',
      label: 'Caption',
      description:
        'Case caption identifying the Small Claims Division of the Superior Court, the parties, and the case number. Must match the court where the claim is filed.',
      legalElements: [
        'Court name (Superior Court of California, County, Small Claims Division)',
        'Plaintiff name (your legal name)',
        'Defendant name (person or business you are suing)',
        'Case number placeholder (assigned by clerk at filing)',
      ],
      minParagraphs: 1,
    },
    {
      id: 'facts',
      label: 'Statement of Facts',
      description:
        'A plain-language description of what happened, including key dates, amounts, and the parties involved. Small claims court is informal — the judge will ask questions — but a clear, chronological written summary strengthens your case (CCP §116.520).',
      legalElements: [
        'Date(s) of the incident or transaction',
        'What the defendant did or failed to do',
        'How the plaintiff was harmed',
        'Amount of money at issue (must be $10,000 or less for individuals, $5,000 or less for businesses per CCP §116.221)',
        'Any attempts to resolve the dispute before filing',
      ],
      minParagraphs: 2,
    },
    {
      id: 'claim_basis',
      label: 'Legal Basis for Claim',
      description:
        'The legal theory supporting your claim. Common bases include breach of contract, negligence, statutory violation, or property damage. While small claims court does not require formal legal citations, identifying your theory helps the judge follow your case.',
      legalElements: [
        'Type of claim (breach of contract, negligence, property damage, consumer complaint, security deposit dispute, etc.)',
        'Elements of the claim (e.g., agreement existed, defendant breached it, plaintiff suffered damages)',
        'Any applicable statute (e.g., CA Civil Code §1950.5 for security deposits, CA Civil Code §1942.4 for habitability)',
      ],
      minParagraphs: 1,
    },
    {
      id: 'damages',
      label: 'Damages',
      description:
        'An itemized list of the money you are asking for, with supporting evidence. The total must not exceed $10,000 for individuals or $5,000 for businesses (CCP §116.221). Bring all evidence to the hearing — documents, photos, receipts, and witnesses.',
      legalElements: [
        'Itemized actual damages (e.g., cost of repairs, unpaid invoices, property value, lost wages)',
        'Supporting evidence for each item (receipts, invoices, photos, estimates, written communications)',
        'Total amount requested (must be within jurisdictional limits)',
        'Court costs and filing fees (recoverable if you win)',
      ],
      minParagraphs: 1,
    },
    {
      id: 'proof_of_service',
      label: 'Proof of Service',
      description:
        'Documentation that the defendant was properly notified of the claim and hearing date. Service must be completed at least 15 days before the hearing (in-county) or 20 days (out-of-county) per CCP §116.340.',
      legalElements: [
        'Date of service',
        'Method of service (personal service or substituted service per CCP §116.340)',
        'Name and address of the defendant served',
        'Confirmation that service was at least 15 days (in-county) or 20 days (out-of-county) before the hearing',
      ],
      minParagraphs: 1,
    },
  ],

  filingRules: {
    courtName:
      'Superior Court of California, Small Claims Division (claims up to $10,000 for individuals, $5,000 for businesses per CCP §116.221)',
    serviceRequirements:
      'Must serve defendant via personal service or substituted service at least 15 days before the hearing (in-county) or 20 days (out-of-county) per CCP §116.340. Mail service alone is not sufficient — must be personal or substituted service.',
    filingFee:
      '$30 (claims $1,500 or less), $50 (claims $1,500.01–$5,000), $75 (claims $5,000.01–$10,000). Fee waiver available via FW-001 Request to Waive Court Fees.',
    maxPages: 25,
    fontRequirements: '12-point minimum for body text',
    marginRequirements: '1-inch margins on all sides',
    copies: 2,
    localFormUrl: 'https://www.courts.ca.gov/selfhelp-smallclaims.htm',
  },

  rejectionReasons: [
    {
      reason: 'Claim amount exceeds jurisdictional limit',
      howToAvoid:
        'Individual claims must be $10,000 or less; business/entity claims must be $5,000 or less (CCP §116.221). If your claim exceeds these limits, file in civil court or reduce your claim to fit small claims limits.',
      wizardStep: 'relief',
    },
    {
      reason: 'Wrong venue — filed in incorrect county',
      howToAvoid:
        'File in the county where the defendant resides, where the injury or damage occurred, or where the contract was to be performed (CCP §116.370). Verify the defendant\'s address before filing.',
      wizardStep: 'venue',
    },
    {
      reason: 'SC-100 Plaintiff\'s Claim form not used',
      howToAvoid:
        'California small claims court requires the mandatory SC-100 Plaintiff\'s Claim and ORDER to Go to Small Claims Court form. Obtain it from the court clerk or the California Courts self-help website.',
      wizardStep: 'review',
    },
    {
      reason: 'Defendant not properly served',
      howToAvoid:
        'Service must be personal or substituted service at least 15 days (in-county) or 20 days (out-of-county) before the hearing (CCP §116.340). You cannot serve the defendant yourself — use a third party, process server, or the clerk.',
      wizardStep: 'review',
    },
    {
      reason: 'Exceeded annual filing limit for claims over $2,500',
      howToAvoid:
        'California law limits individuals to filing no more than 2 small claims over $2,500 in any 12-month period (CCP §116.231). Check whether you have exceeded this limit before filing.',
      wizardStep: 'facts',
    },
    {
      reason: 'Insufficient facts to state a claim',
      howToAvoid:
        'Clearly describe what happened, when it happened, and how you were damaged. Include specific dates, amounts, and the defendant\'s actions or failures.',
      wizardStep: 'facts',
    },
  ],

  stepValidations: {
    facts: {
      required: ['incident_date'],
      warnings: [
        {
          condition: 'no_receipts_or_documentation_mentioned',
          message:
            'Keep all receipts, invoices, photos, and written communications related to your claim. Bring originals and copies to the hearing — the judge will want to see them.',
        },
        {
          condition: 'no_resolution_attempts_documented',
          message:
            'Document your attempts to resolve the dispute before filing (demand letter, phone calls, emails). Judges look favorably on plaintiffs who tried to settle before going to court.',
        },
      ],
    },
    claims: {
      required: ['claim_type'],
      warnings: [
        {
          condition: 'amount_may_exceed_individual_limit',
          message:
            'Verify your total claim is $10,000 or less for individuals. Small claims court cannot award more than $10,000 to an individual plaintiff (CCP §116.221). If your damages exceed this, you must file in civil court or voluntarily reduce your claim.',
        },
        {
          condition: 'defendant_is_business_lower_limit',
          message:
            'If the defendant is a business, corporation, LLC, or other entity, the jurisdictional limit is $5,000 — not $10,000 (CCP §116.221). Verify the defendant\'s legal status before filing.',
        },
      ],
    },
    relief: {
      required: [],
      warnings: [
        {
          condition: 'damages_not_itemized',
          message:
            'Itemize each element of damages separately with supporting documentation. For example: "Repair cost: $2,500 (see attached estimate from ABC Repair)" rather than a single lump sum.',
        },
        {
          condition: 'no_evidence_referenced',
          message:
            'Reference specific evidence for each damage item. Bring originals and copies to the hearing — photos, receipts, contracts, text messages, and written communications. No formal discovery is allowed, so your evidence at hearing is all you get.',
        },
      ],
    },
  },

  glossary: [
    {
      term: 'Small Claims Court',
      plainEnglish:
        'A simplified division of the Superior Court for disputes involving $10,000 or less (individuals) or $5,000 or less (businesses). No lawyers are allowed — you represent yourself. The judge decides the case without a jury (CCP §116.110-116.950).',
    },
    {
      term: 'SC-100 Form',
      plainEnglish:
        'The mandatory Plaintiff\'s Claim and ORDER to Go to Small Claims Court form. You must fill this out and file it with the court clerk to start your small claims case. It asks for the parties, the amount claimed, and a brief description of why.',
    },
    {
      term: 'Personal Service',
      plainEnglish:
        'Having someone (not you) physically hand the court papers directly to the defendant. This is the most reliable way to serve someone. You cannot serve the defendant yourself — use a friend over 18, a process server, or the sheriff.',
    },
    {
      term: 'Substituted Service',
      plainEnglish:
        'If the defendant cannot be personally served after reasonable attempts, papers can be left with a responsible adult at the defendant\'s home or workplace, then mailed. The court must approve this method (CCP §116.340).',
    },
    {
      term: 'Default Judgment',
      plainEnglish:
        'An automatic win for the plaintiff when the defendant fails to show up for the hearing. The judge awards the amount claimed without hearing the defendant\'s side. The defendant can ask to set it aside within 30 days if they have a good reason.',
    },
    {
      term: 'Counterclaim',
      plainEnglish:
        'A claim the defendant files against you in the same case. The defendant can file it before the hearing or raise it at the hearing itself. The judge hears both claims together.',
    },
    {
      term: 'Fee Waiver',
      plainEnglish:
        'If you cannot afford the filing fee, you can file form FW-001 (Request to Waive Court Fees). The court waives the fee if you receive public benefits, your income is below 125% of the federal poverty level, or paying would be a hardship.',
    },
    {
      term: 'Appeal',
      plainEnglish:
        'After the judge\'s decision, only the defendant can appeal for a new trial in Superior Court (CCP §116.710). The plaintiff cannot appeal. The appeal must be filed within 30 days of the mailed notice of the judgment.',
    },
    {
      term: 'Judgment Debtor',
      plainEnglish:
        'The person who lost the case and owes money. Winning the judgment is only half the battle — collecting the money is your responsibility. You may need to use wage garnishments, bank levies, or property liens to collect.',
    },
  ],
} as const satisfies JurisdictionRuleConfig
