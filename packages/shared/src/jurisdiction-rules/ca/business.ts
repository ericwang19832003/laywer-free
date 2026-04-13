import type { JurisdictionRuleConfig } from '../schema'

export const caBusiness = {
  state: 'CA',
  disputeType: 'business',

  requiredSections: [
    {
      id: 'caption',
      label: 'Caption',
      description:
        'Case caption identifying the court, parties, and case number. California business disputes are filed in Superior Court. Complex cases (trade secret, securities, antitrust) may be assigned to the Complex Litigation Department.',
      legalElements: [
        'Court name (Superior Court of the State of California, County of [County])',
        'Plaintiff name (individual, partnership, LLC, or corporation)',
        'Defendant name (individual, partnership, LLC, or corporation)',
        'Case number placeholder (assigned by clerk at filing)',
        'Complex litigation designation if applicable (Cal. Rules of Court, Rule 3.400)',
      ],
      minParagraphs: 1,
    },
    {
      id: 'facts',
      label: 'Facts — Business Relationship, Duties, and Breach',
      description:
        'A detailed statement of the facts establishing the business relationship between the parties, the duties owed, and how those duties were breached. This section must describe the nature of the business entity, the roles of the parties, and the specific conduct giving rise to the dispute.',
      legalElements: [
        'Nature of the business relationship (partnership, shareholder, officer/director, employee, contractor)',
        'Date the business relationship began and any governing agreements',
        'Fiduciary duties owed under CA Corp. Code §1507 or common law (loyalty, care, good faith)',
        'Specific conduct constituting breach of duty, fraud, or misappropriation',
        'Timeline of key events leading to the dispute',
        'Harm suffered as a result of defendant\'s conduct',
      ],
      minParagraphs: 4,
    },
    {
      id: 'claims',
      label: 'Claims',
      description:
        'Each cause of action pleaded as a separate count with the legal elements required under California law. Business disputes commonly involve breach of fiduciary duty, fraud, trade secret misappropriation under CUTSA, UCL claims, shareholder oppression, and related statutory claims. Note: non-compete agreements are generally void in California under Bus. & Prof. Code §16600.',
      legalElements: [
        'Breach of fiduciary duty — existence of fiduciary relationship, breach of duty of loyalty/care under CA Corp. Code §1507, causation, damages (CCP §343, 4-year residual SOL)',
        'Business fraud — material misrepresentation or omission, knowledge of falsity or recklessness, intent to induce reliance, justifiable reliance, damages (CCP §338(d), 3-year SOL)',
        'Trade secret misappropriation — existence of trade secret, misappropriation by improper means or breach of confidence, damages or injunctive relief (CA Civil Code §3426–3426.11, CUTSA; CCP §3426.6, 3-year SOL)',
        'Non-compete violation — generally VOID under CA Bus. & Prof. Code §16600; narrow exception for sale-of-business goodwill (§16601) and dissolution/dissociation of partnership (§16602–16602.5)',
        'Shareholder oppression — oppressive conduct by those controlling the corporation, frustration of reasonable expectations, involuntary dissolution (CA Corp. Code §1800)',
        'Unfair Competition Law (UCL) — unfair, unlawful, or fraudulent business act or practice under CA Bus. & Prof. Code §17200; broad standing for injunctive relief and restitution/disgorgement',
        'Shareholder derivative action — demand futility or refusal, breach of duty to the entity (CA Corp. Code §1601–1604)',
      ],
      minParagraphs: 3,
    },
    {
      id: 'damages',
      label: 'Damages',
      description:
        'A statement of the damages sought, including lost profits, diminution in business value, and punitive damages where fraud or malice is alleged. California law requires that lost profits be proven with reasonable certainty. UCL claims permit only equitable relief (restitution and disgorgement), not compensatory damages.',
      legalElements: [
        'Actual damages — lost profits calculated with reasonable certainty',
        'Diminution in business value or lost business opportunity',
        'Reasonable royalty or unjust enrichment for trade secret misappropriation (CA Civil Code §3426.3)',
        'Punitive damages — available where fraud, oppression, or malice is shown by clear and convincing evidence (CA Civil Code §3294)',
        'Disgorgement and restitution under UCL (CA Bus. & Prof. Code §17203) — equitable remedy only, not damages',
        'Attorney\'s fees — recoverable for trade secret misappropriation if willful and malicious (CA Civil Code §3426.4) or by contract',
        'Pre-judgment and post-judgment interest (CA Civil Code §3287–3289)',
      ],
      minParagraphs: 2,
    },
    {
      id: 'injunctive_relief',
      label: 'Injunctive Relief',
      description:
        'A request for temporary restraining order, preliminary injunction, or permanent injunction where immediate and irreparable harm is threatened. Available in trade secret and UCL cases to prevent ongoing harm.',
      legalElements: [
        'Likelihood of success on the merits',
        'Imminent and irreparable injury if injunction is not granted',
        'No adequate remedy at law (monetary damages insufficient)',
        'Balance of hardships favors plaintiff',
        'Specific conduct to be enjoined (e.g., use of trade secrets, unfair business practices)',
        'Undertaking (bond) requirement under CCP §529',
        'TRO available ex parte upon showing of immediate and irreparable injury (CCP §527)',
      ],
      minParagraphs: 2,
    },
    {
      id: 'verification',
      label: 'Verification',
      description:
        'A sworn statement that the facts in the petition are true and correct. Recommended for all business dispute complaints and required for applications for temporary restraining orders.',
      legalElements: [
        'Signed under penalty of perjury under the laws of the State of California (CCP §446)',
        'Statement that the facts set forth in the complaint are true and correct to the best of plaintiff\'s knowledge',
      ],
      minParagraphs: 1,
    },
    {
      id: 'proof_of_service',
      label: 'Proof of Service',
      description:
        'Proof that a copy of the complaint and summons was served on the opposing party as required by California law. Personal service or substitute service is required for the initial complaint.',
      legalElements: [
        'Date of service',
        'Method of service (personal service under CCP §415.10, substitute service under CCP §415.20, or service by mail with acknowledgment under CCP §415.30)',
        'Name and address of the party served',
        'Declaration of due diligence for substitute service',
      ],
      minParagraphs: 1,
    },
  ],

  filingRules: {
    courtName:
      'Superior Court of California. Complex business cases (trade secret, securities, antitrust) may be assigned to the Complex Litigation Department (Cal. Rules of Court, Rule 3.400).',
    serviceRequirements:
      'Must serve all parties via personal service (CCP §415.10), substitute service (CCP §415.20), or service by mail with acknowledgment of receipt (CCP §415.30). For TRO applications, ex parte notice to opposing counsel is required unless irreparable harm would result (Cal. Rules of Court, Rule 3.1202).',
    filingFee:
      '~$435 for unlimited civil case (fee waiver available via form FW-001 for those who qualify based on income or government assistance)',
    maxPages: 50,
    fontRequirements: '12-point minimum for body text (Cal. Rules of Court, Rule 2.104)',
    marginRequirements: '1-inch margins on all sides',
    copies: 2,
    localFormUrl: 'https://www.courts.ca.gov/forms.htm',
  },

  rejectionReasons: [
    {
      reason: 'Missing verification paragraph',
      howToAvoid:
        'Include a signed verification stating that the facts in the complaint are true and correct under penalty of perjury. Required for TRO applications (CCP §446).',
      wizardStep: 'review',
    },
    {
      reason: 'No proof of service attached',
      howToAvoid:
        'Attach a proof of service showing the date, method, and recipient of service. Use Judicial Council form POS-010 for personal service or POS-030 for mail.',
      wizardStep: 'review',
    },
    {
      reason: 'Incorrect court name in caption',
      howToAvoid:
        'Verify the caption reads "Superior Court of the State of California, County of [County]." Include the Complex Litigation Department designation if applicable.',
      wizardStep: 'venue',
    },
    {
      reason: 'Improper venue selection',
      howToAvoid:
        'File in the county of defendant\'s principal office or residence per CCP §395.5. For corporations, venue is proper where the contract was made or to be performed, or where the obligation arose.',
      wizardStep: 'venue',
    },
    {
      reason: 'Fiduciary duty claim lacks specificity',
      howToAvoid:
        'Identify the specific fiduciary relationship (director, officer, partner, majority shareholder), the duties owed under CA Corp. Code §1507, and the particular acts or omissions constituting breach.',
      wizardStep: 'claims',
    },
    {
      reason: 'Trade secret not adequately identified',
      howToAvoid:
        'Describe the trade secret with sufficient particularity to put the defendant on notice, without disclosing the secret itself. CUTSA requires reasonable identification (CA Civil Code §3426.1).',
      wizardStep: 'claims',
    },
    {
      reason: 'Non-compete claim filed in California',
      howToAvoid:
        'Non-compete agreements are generally void in California under Bus. & Prof. Code §16600. Only the narrow sale-of-business goodwill exception (§16601) or partnership dissolution/dissociation exceptions (§16602–16602.5) may be enforceable. Reconsider whether a trade secret or UCL claim is more appropriate.',
      wizardStep: 'claims',
    },
    {
      reason: 'Injunctive relief request lacks irreparable harm allegation',
      howToAvoid:
        'Specifically allege imminent and irreparable injury that cannot be adequately compensated by monetary damages. Required for TRO and preliminary injunction (CCP §527).',
      wizardStep: 'relief',
    },
  ],

  stepValidations: {
    facts: {
      required: ['relationship_start_date'],
      warnings: [
        {
          condition: 'no_business_records_documented',
          message:
            'Attach or reference key business records (partnership agreement, operating agreement, bylaws, shareholder agreement, employment agreement) that establish the parties\' rights and obligations.',
        },
        {
          condition: 'no_fiduciary_relationship_described',
          message:
            'Describe the fiduciary relationship in detail — identify whether it arises from a formal role (officer, director, partner under CA Corp. Code §1507) or an informal relationship of trust and confidence. California courts require specificity about the nature of fiduciary duties.',
        },
        {
          condition: 'no_damages_timeline',
          message:
            'Include a chronological timeline of the key events. Courts rely on clear timelines to assess statute of limitations (3 years for fraud under CCP §338(d), 4 years for written contracts under CCP §337, 3 years for trade secrets under CCP §3426.6).',
        },
      ],
    },
    claims: {
      required: ['claim_type'],
      warnings: [
        {
          condition: 'no_specific_duties_breached',
          message:
            'Specify which fiduciary duties were breached (loyalty, care, good faith and fair dealing). Generic allegations of "breach of fiduciary duty" are disfavored under California pleading standards.',
        },
        {
          condition: 'no_fraud_elements_detailed',
          message:
            'Fraud claims require specificity — state the who, what, when, where, and how of the misrepresentation (Lazar v. Superior Court, 12 Cal.4th 631). Vague fraud allegations are subject to demurrer.',
        },
        {
          condition: 'no_trade_secret_identification',
          message:
            'Under CUTSA (CA Civil Code §3426.1), you must identify the trade secret with reasonable particularity. Describe the information, the measures taken to maintain secrecy, and how it was misappropriated.',
        },
        {
          condition: 'noncompete_claim_in_california',
          message:
            'Non-compete agreements are generally void in California under Bus. & Prof. Code §16600. Only narrow exceptions apply (sale-of-business goodwill under §16601, partnership dissolution under §16602). Consider whether a trade secret or UCL claim is more appropriate.',
        },
        {
          condition: 'no_ucl_standing_established',
          message:
            'UCL claims under Bus. & Prof. Code §17200 require that the plaintiff suffered injury in fact and lost money or property as a result of the unfair competition (Proposition 64). Establish standing explicitly.',
        },
      ],
    },
    relief: {
      required: [],
      warnings: [
        {
          condition: 'no_injunctive_relief_basis',
          message:
            'If seeking injunctive relief for trade secret or UCL claims, you must allege: (1) likelihood of success on the merits, (2) imminent and irreparable injury, (3) no adequate remedy at law, and (4) balance of hardships favors plaintiff.',
        },
        {
          condition: 'no_lost_profits_calculation',
          message:
            'California requires lost profits to be proven with reasonable certainty. Include a methodology for calculating lost profits (e.g., before-and-after analysis, yardstick approach, or lost-volume analysis). Speculative lost profits will not survive demurrer.',
        },
        {
          condition: 'no_disgorgement_basis',
          message:
            'UCL claims under Bus. & Prof. Code §17203 allow disgorgement of profits and restitution, but NOT compensatory damages. If seeking disgorgement, identify the specific ill-gotten gains defendant obtained through the unfair business practice.',
        },
      ],
    },
  },

  glossary: [
    {
      term: 'Fiduciary Duty',
      plainEnglish:
        'A legal obligation to act in someone else\'s best interest. In California, officers, directors, partners, and majority shareholders owe fiduciary duties of loyalty, care, and good faith to the entity and its owners (CA Corp. Code §1507). Breach carries a 4-year residual statute of limitations (CCP §343).',
    },
    {
      term: 'Trade Secret',
      plainEnglish:
        'Valuable business information — such as formulas, customer lists, processes, or software code — that derives economic value from being kept secret, and that the owner takes reasonable steps to protect. California protects trade secrets under CUTSA (CA Civil Code §3426–3426.11). The statute of limitations is 3 years (CCP §3426.6).',
    },
    {
      term: 'Non-Compete (Void in California)',
      plainEnglish:
        'An agreement restricting someone from competing with a business after leaving. In California, non-competes are generally VOID and unenforceable under Bus. & Prof. Code §16600. Only narrow exceptions exist: sale of business goodwill (§16601) and partnership dissolution or dissociation (§16602–16602.5). This is one of the strongest employee mobility protections in the U.S.',
    },
    {
      term: 'Unfair Competition Law (UCL)',
      plainEnglish:
        'California\'s broad business regulation statute (Bus. & Prof. Code §17200) that prohibits any unlawful, unfair, or fraudulent business act or practice. UCL claims allow injunctive relief and restitution/disgorgement but NOT compensatory damages. Standing requires actual injury and loss of money or property (Proposition 64).',
    },
    {
      term: 'Shareholder Oppression',
      plainEnglish:
        'When those controlling a corporation act in a way that frustrates the reasonable expectations of minority shareholders — such as excluding them from management, refusing to pay dividends, or diluting their ownership. California allows involuntary dissolution for deadlock or oppression (CA Corp. Code §1800).',
    },
    {
      term: 'Injunctive Relief',
      plainEnglish:
        'A court order requiring someone to do or stop doing something. In business disputes, injunctions prevent ongoing harm — like using stolen trade secrets or engaging in unfair competition — when monetary damages alone would be inadequate. A bond (undertaking) is typically required under CCP §529.',
    },
    {
      term: 'Derivative Action',
      plainEnglish:
        'A lawsuit brought by a shareholder on behalf of the corporation when the corporation\'s own leadership refuses to act. Required when the harm is to the entity, not to the individual owner. California requires the shareholder to have held shares at the time of the wrongful act and to make a demand or show demand futility (CA Corp. Code §1601–1604).',
    },
    {
      term: 'Disgorgement',
      plainEnglish:
        'A court-ordered remedy that forces a defendant to give up profits obtained through wrongful conduct. Under the UCL (Bus. & Prof. Code §17203), disgorgement is an equitable remedy — it focuses on what the defendant gained, not what the plaintiff lost. It is the primary monetary remedy for UCL claims since compensatory damages are not available.',
    },
    {
      term: 'CUTSA (California Uniform Trade Secrets Act)',
      plainEnglish:
        'California\'s trade secret statute (CA Civil Code §3426–3426.11) that provides the exclusive civil remedy for trade secret misappropriation. CUTSA preempts common-law claims based on the same facts. Remedies include injunctive relief, actual damages, unjust enrichment, reasonable royalties, and exemplary damages up to 2× for willful misappropriation.',
    },
    {
      term: 'Statute of Limitations',
      plainEnglish:
        'The legal deadline to file a lawsuit. In California: fraud has a 3-year limit (CCP §338(d)), written contracts have a 4-year limit (CCP §337), trade secret misappropriation has a 3-year limit (CCP §3426.6), and the residual statute of limitations for fiduciary duty breach is 4 years (CCP §343). Missing the deadline means your claim is barred.',
    },
  ],
} as const satisfies JurisdictionRuleConfig
