import type { JurisdictionRuleConfig } from '../schema'

export const paSmallClaims = {
  state: 'PA',
  disputeType: 'small_claims',

  requiredSections: [
    {
      id: 'caption',
      label: 'Caption',
      description:
        'Case caption identifying the court, parties, and docket number. Must name the Magisterial District Court for the correct judicial district.',
      legalElements: [
        'Court name (Magisterial District Court, District number, County)',
        'Plaintiff name (your legal name)',
        'Defendant name (person or business you are suing)',
        'Docket number placeholder (assigned by clerk at filing)',
      ],
      minParagraphs: 1,
    },
    {
      id: 'facts',
      label: 'Statement of Facts',
      description:
        'A plain-language description of what happened, including key dates, amounts, and the parties involved. Magisterial District Court uses simplified procedures (Pa.R.C.P.M.D.J. 201-323), so keep it clear and chronological.',
      legalElements: [
        'Date(s) of the incident or transaction',
        'What the defendant did or failed to do',
        'How the plaintiff was harmed',
        'Amount of money at issue (must be $12,000 or less per 42 Pa.C.S. §1515)',
      ],
      minParagraphs: 2,
    },
    {
      id: 'claim_basis',
      label: 'Legal Basis for Claim',
      description:
        'The legal theory supporting your claim. Common bases include breach of contract, negligence, statutory violation, or property damage. While MDJ Court uses informal proceedings, identifying your legal theory helps the judge understand your case.',
      legalElements: [
        'Type of claim (breach of contract, negligence, property damage, consumer complaint, etc.)',
        'Elements of the claim (e.g., agreement existed, defendant breached it, plaintiff suffered damages)',
        'Any applicable statute or legal basis',
      ],
      minParagraphs: 1,
    },
    {
      id: 'damages',
      label: 'Damages',
      description:
        'An itemized list of the money you are asking for, with supporting evidence. The total must not exceed $12,000. Include actual damages and court costs.',
      legalElements: [
        'Itemized actual damages (e.g., cost of repairs, unpaid invoices, property value)',
        'Supporting evidence for each item (receipts, invoices, photos, estimates)',
        'Total amount requested (must be $12,000 or less per 42 Pa.C.S. §1515)',
        'Court costs and filing fees (recoverable if you win)',
      ],
      minParagraphs: 1,
    },
    {
      id: 'certificate_of_service',
      label: 'Certificate of Service',
      description:
        'Certification that a copy of the complaint was delivered to the defendant. In Magisterial District Court, service is by first class mail (Pa.R.C.P.M.D.J. 305).',
      legalElements: [
        'Date of service',
        'Method of service (first class mail per Pa.R.C.P.M.D.J. 305)',
        'Name and address of the defendant served',
      ],
      minParagraphs: 1,
    },
  ],

  filingRules: {
    courtName:
      'Magisterial District Court (claims up to $12,000 per 42 Pa.C.S. §1515)',
    serviceRequirements:
      'Service is by first class mail per Pa.R.C.P.M.D.J. 305. Hearing must be scheduled within 60 days of filing. No formal discovery — proceedings are informal.',
    filingFee:
      'Approximately $50-75 depending on claim amount (In Forma Pauperis fee waiver available per Pa.R.C.P. 240)',
    maxPages: 25,
    marginRequirements: '1-inch margins on all sides',
    copies: 2,
    localFormUrl: 'https://www.pacourts.us/forms',
  },

  rejectionReasons: [
    {
      reason: 'Claim amount exceeds $12,000',
      howToAvoid:
        'Magisterial District Court jurisdiction is limited to $12,000 (42 Pa.C.S. §1515). If your claim exceeds this, file in the Court of Common Pleas or reduce your claim to fit MDJ Court limits.',
      wizardStep: 'relief',
    },
    {
      reason: 'Wrong venue — filed in incorrect judicial district',
      howToAvoid:
        'File in the magisterial district where the defendant resides or where the transaction or occurrence took place. Verify the defendant\'s address before filing.',
      wizardStep: 'venue',
    },
    {
      reason: 'No certificate of service attached',
      howToAvoid:
        'Attach a certificate of service showing the date, method, and recipient of service per Pa.R.C.P.M.D.J. 305.',
      wizardStep: 'review',
    },
    {
      reason: 'Insufficient facts to state a claim',
      howToAvoid:
        'Clearly describe what happened, when it happened, and how you were damaged. Include specific dates, amounts, and the defendant\'s actions or failures.',
      wizardStep: 'facts',
    },
    {
      reason: 'Counterclaim filed late',
      howToAvoid:
        'If the defendant files a counterclaim, it must be filed at least 5 days before the hearing. If the counterclaim exceeds $12,000, the entire case is transferred to Court of Common Pleas.',
      wizardStep: 'claims',
    },
  ],

  stepValidations: {
    facts: {
      required: ['incident_date'],
      warnings: [
        {
          condition: 'no_receipts_or_documentation_mentioned',
          message:
            'Keep all receipts, invoices, photos, and written communications related to your claim. MDJ Court uses informal proceedings, but documentation significantly strengthens your case.',
        },
        {
          condition: 'no_damages_documented',
          message:
            'Document your damages as specifically as possible — repair estimates, replacement costs, invoices, bank statements. Even in informal MDJ proceedings, specific evidence wins cases.',
        },
      ],
    },
    claims: {
      required: ['claim_type'],
      warnings: [
        {
          condition: 'amount_may_exceed_jurisdiction',
          message:
            'Verify your total claim is $12,000 or less. Magisterial District Court cannot award more than $12,000 (42 Pa.C.S. §1515). If your damages exceed this, you must file in Court of Common Pleas or voluntarily reduce your claim.',
        },
        {
          condition: 'no_legal_basis_specified',
          message:
            'Identify the legal basis for your claim (breach of contract, negligence, property damage, statutory violation). While MDJ Court uses informal proceedings, stating your legal theory helps the judge understand your case.',
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
            'Reference specific evidence for each damage item. Bring originals to the hearing — the judge will want to see receipts, photos, contracts, and written communications.',
        },
      ],
    },
  },

  glossary: [
    {
      term: 'Magisterial District Court',
      plainEnglish:
        'The Pennsylvania court that handles civil claims up to $12,000 (42 Pa.C.S. §1515). Also called MDJ Court. Proceedings are informal — no formal discovery, no jury, and attorneys are allowed but not required.',
    },
    {
      term: 'Trial de Novo',
      plainEnglish:
        'A brand-new trial in the Court of Common Pleas, as if the MDJ hearing never happened. Either party can appeal within 30 days of the MDJ judgment and get a completely fresh hearing with a jury option (Pa.R.C.P.M.D.J. 1002).',
    },
    {
      term: 'Default Judgment',
      plainEnglish:
        'An automatic win for the plaintiff when the defendant fails to show up for the hearing. The judge awards the amount claimed without hearing the defendant\'s side. The defendant can request to reopen, but must act quickly.',
    },
    {
      term: 'Counterclaim',
      plainEnglish:
        'A claim the defendant files against you in the same lawsuit. Must be filed at least 5 days before the hearing. If the counterclaim exceeds $12,000, the entire case is transferred to the Court of Common Pleas.',
    },
    {
      term: 'In Forma Pauperis',
      plainEnglish:
        'A court order that waives filing fees and court costs for people who cannot afford them. You must file a petition showing your financial hardship (Pa.R.C.P. 240). Also called IFP.',
    },
    {
      term: 'First Class Mail Service',
      plainEnglish:
        'The standard method for serving court papers in Magisterial District Court. The court sends the complaint to the defendant by regular first class mail (Pa.R.C.P.M.D.J. 305). No certified mail or personal service is required.',
    },
    {
      term: 'Appeal',
      plainEnglish:
        'The process of asking a higher court to review the MDJ Court\'s decision. Either party has 30 days from the judgment to file an appeal to the Court of Common Pleas for a trial de novo (Pa.R.C.P.M.D.J. 1002). The appeal results in a completely new hearing.',
    },
  ],
} as const satisfies JurisdictionRuleConfig
