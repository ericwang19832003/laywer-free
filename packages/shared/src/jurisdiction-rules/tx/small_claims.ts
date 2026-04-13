import type { JurisdictionRuleConfig } from '../schema'

export const txSmallClaims = {
  state: 'TX',
  disputeType: 'small_claims',

  requiredSections: [
    {
      id: 'caption',
      label: 'Caption',
      description:
        'Case caption identifying the court, parties, and cause number. Must name the Justice of the Peace Court for the correct precinct.',
      legalElements: [
        'Court name (Justice of the Peace Court, Precinct number, County)',
        'Plaintiff name (your legal name)',
        'Defendant name (person or business you are suing)',
        'Cause number placeholder (assigned by clerk at filing)',
      ],
      minParagraphs: 1,
    },
    {
      id: 'facts',
      label: 'Statement of Facts',
      description:
        'A plain-language description of what happened, including key dates, amounts, and the parties involved. JP Court uses simplified procedures (TRCP Rules 500-510), so keep it clear and chronological.',
      legalElements: [
        'Date(s) of the incident or transaction',
        'What the defendant did or failed to do',
        'How the plaintiff was harmed',
        'Amount of money at issue (must be $20,000 or less per TX Gov\'t Code §27.031)',
      ],
      minParagraphs: 2,
    },
    {
      id: 'claim_basis',
      label: 'Legal Basis for Claim',
      description:
        'The legal theory supporting your claim. Common bases include breach of contract, negligence, statutory violation, or property damage. You do not need to cite specific statutes in JP Court, but it strengthens your petition.',
      legalElements: [
        'Type of claim (breach of contract, negligence, property damage, returned check, consumer complaint, etc.)',
        'Elements of the claim (e.g., agreement existed, defendant breached it, plaintiff suffered damages)',
        'Any applicable statute (e.g., TX Bus. & Com. Code §3.104 for returned checks)',
      ],
      minParagraphs: 1,
    },
    {
      id: 'damages',
      label: 'Damages',
      description:
        'An itemized list of the money you are asking for, with supporting evidence. The total must not exceed $20,000. Include actual damages, and if applicable, statutory damages or court costs.',
      legalElements: [
        'Itemized actual damages (e.g., cost of repairs, unpaid invoices, property value)',
        'Supporting evidence for each item (receipts, invoices, photos, estimates)',
        'Total amount requested (must be $20,000 or less)',
        'Court costs and filing fees (recoverable if you win)',
      ],
      minParagraphs: 1,
    },
    {
      id: 'verification',
      label: 'Verification',
      description:
        'A sworn statement that the facts in the petition are true and correct. Signing under penalty of perjury strengthens credibility and may entitle you to a default judgment if the defendant fails to appear.',
      legalElements: [
        'Signed under penalty of perjury under the laws of the State of Texas',
        'Statement that the facts set forth in the petition are true and correct to the best of plaintiff\'s knowledge',
      ],
      minParagraphs: 1,
    },
    {
      id: 'certificate_of_service',
      label: 'Certificate of Service',
      description:
        'Certification that a copy of the petition was delivered to the defendant. Service must be completed at least 14 days before the trial date (TRCP Rule 501.2).',
      legalElements: [
        'Date of service',
        'Method of service (personal service or certified mail per TRCP Rule 501.2)',
        'Name and address of the defendant served',
        'Confirmation that service was at least 14 days before the trial date',
      ],
      minParagraphs: 1,
    },
  ],

  filingRules: {
    courtName:
      'Justice of the Peace Court (claims up to $20,000 per TX Gov\'t Code §27.031)',
    serviceRequirements:
      'Must serve defendant via personal service or certified mail at least 14 days before the trial date per TRCP Rule 501.2. Service must be to the precinct where defendant resides or where the obligation was to be performed (CPRC §15.091).',
    filingFee:
      'Approximately $54 for JP Court (fee waiver available via Statement of Inability to Afford Payment of Court Costs, TX Gov\'t Code §6.001)',
    maxPages: 25,
    fontRequirements: '14-point minimum for body text in JP Court',
    marginRequirements: '1-inch margins on all sides',
    copies: 2,
    localFormUrl: 'https://www.txcourts.gov/rules-forms/forms/',
  },

  rejectionReasons: [
    {
      reason: 'Claim amount exceeds $20,000',
      howToAvoid:
        'JP Court jurisdiction is limited to $20,000 (TX Gov\'t Code §27.031). If your claim exceeds this, file in County Court or reduce your claim to fit JP Court limits.',
      wizardStep: 'relief',
    },
    {
      reason: 'Wrong venue — filed in incorrect precinct',
      howToAvoid:
        'File in the precinct where the defendant resides or where the obligation was to be performed (CPRC §15.091). Verify the defendant\'s address before filing.',
      wizardStep: 'venue',
    },
    {
      reason: 'Missing verification paragraph',
      howToAvoid:
        'Include a signed verification stating the facts in the petition are true and correct under penalty of perjury.',
      wizardStep: 'review',
    },
    {
      reason: 'No certificate of service attached',
      howToAvoid:
        'Attach a certificate of service showing the date, method, and recipient of service. Service must be at least 14 days before trial (TRCP Rule 501.2).',
      wizardStep: 'review',
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
            'Keep all receipts, invoices, photos, and written communications related to your claim. JP Court has relaxed evidence rules, but documentation significantly strengthens your case.',
        },
        {
          condition: 'no_damages_documented',
          message:
            'Document your damages as specifically as possible — repair estimates, replacement costs, invoices, bank statements. Vague damage claims are harder to prove even under the relaxed JP Court standard.',
        },
      ],
    },
    claims: {
      required: ['claim_type'],
      warnings: [
        {
          condition: 'amount_may_exceed_jurisdiction',
          message:
            'Verify your total claim is $20,000 or less. JP Court cannot award more than $20,000 (TX Gov\'t Code §27.031). If your damages exceed this, you must file in County Court or voluntarily reduce your claim.',
        },
        {
          condition: 'no_legal_basis_specified',
          message:
            'Identify the legal basis for your claim (breach of contract, negligence, property damage, statutory violation). While JP Court uses simplified procedures, stating your legal theory helps the judge understand your case.',
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
            'Reference specific evidence for each damage item. Bring originals to court — the judge will want to see receipts, photos, contracts, and written communications.',
        },
      ],
    },
  },

  glossary: [
    {
      term: 'Small Claims',
      plainEnglish:
        'A simplified court process for disputes involving $20,000 or less. Filed in Justice of the Peace (JP) Court with relaxed rules — no formal discovery, simplified evidence rules, and faster resolution than higher courts.',
    },
    {
      term: 'JP Court (Justice of the Peace Court)',
      plainEnglish:
        'The Texas court that handles small claims up to $20,000 (TX Gov\'t Code §27.031). Each county is divided into precincts, and you file in the precinct where the defendant lives or where the problem happened.',
    },
    {
      term: 'Default Judgment',
      plainEnglish:
        'An automatic win for the plaintiff when the defendant fails to show up for trial. The judge awards the amount claimed without hearing the defendant\'s side. The defendant can sometimes ask to set it aside, but it is difficult.',
    },
    {
      term: 'Preponderance of the Evidence',
      plainEnglish:
        'The standard of proof in civil cases — you must show it is "more likely than not" (more than 50%) that your version of events is true. This is much lower than the "beyond a reasonable doubt" standard used in criminal cases.',
    },
    {
      term: 'Service of Process',
      plainEnglish:
        'The legal requirement to officially notify the defendant that they are being sued. In JP Court, this is done by personal delivery or certified mail at least 14 days before the trial date (TRCP Rule 501.2).',
    },
    {
      term: 'Counterclaim',
      plainEnglish:
        'A claim the defendant files against you in the same lawsuit. For example, if you sue a contractor for bad work, they might counterclaim that you owe them for unpaid labor. The judge hears both claims together.',
    },
    {
      term: 'Fee Waiver',
      plainEnglish:
        'If you cannot afford the filing fee (approximately $54), you can file a Statement of Inability to Afford Payment of Court Costs. The court waives the fee if you qualify based on income or government assistance (TX Gov\'t Code §6.001).',
    },
    {
      term: 'Venue',
      plainEnglish:
        'The specific court location where your case should be filed. For small claims, you must file in the JP Court precinct where the defendant resides or where the obligation was to be performed (CPRC §15.091).',
    },
    {
      term: 'Verification',
      plainEnglish:
        'A sworn statement at the end of your petition confirming that the facts are true. Think of it as signing under oath. It adds credibility and is required for certain types of default judgments.',
    },
  ],
} as const satisfies JurisdictionRuleConfig
