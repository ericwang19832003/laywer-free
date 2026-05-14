import type { JurisdictionRuleConfig } from '../schema'

export const txBusiness = {
  state: 'TX',
  disputeType: 'business',

  requiredSections: [
    {
      id: 'caption',
      label: 'Caption',
      description:
        'Case caption identifying the court, parties, and cause number. Business disputes are filed in District Court unless the amount in controversy falls within County Court at Law jurisdiction.',
      legalElements: [
        'Court name (District Court of [County] County, Texas)',
        'Plaintiff name (individual, partnership, LLC, or corporation)',
        'Defendant name (individual, partnership, LLC, or corporation)',
        'Cause number placeholder (assigned by clerk at filing)',
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
        'Fiduciary duties owed under TX Bus. Orgs. Code or common law (loyalty, care, obedience, good faith)',
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
        'Each cause of action pleaded as a separate count with the legal elements required under Texas law. Business disputes commonly involve breach of fiduciary duty, fraud, trade secret misappropriation, non-compete violations, shareholder oppression, and related statutory claims.',
      legalElements: [
        'Breach of fiduciary duty — existence of fiduciary relationship, breach of duty of loyalty/care, causation, damages (TX CPRC §16.004, 4-year SOL)',
        'Business fraud — material misrepresentation or omission, knowledge of falsity or recklessness, intent to induce reliance, justifiable reliance, damages (TX CPRC §16.004, 4-year SOL)',
        'Trade secret misappropriation — existence of trade secret, misappropriation by improper means or breach of confidence, damages or injunctive relief (TX CPRC §134A, Texas Uniform Trade Secrets Act)',
        'Non-compete violation — covenant not to compete ancillary to an otherwise enforceable agreement, reasonable scope in time/geography/activity (TX Bus. & Com. Code §15.50-15.52)',
        'Shareholder oppression — oppressive conduct by those controlling the corporation, frustration of reasonable expectations (TX Bus. Orgs. Code §11.404)',
        'DTPA claim — plaintiff qualifies as consumer, false/misleading/deceptive act, producing damages (TX Bus. & Com. Code §27, 2-year SOL under TX CPRC §16.003)',
      ],
      minParagraphs: 3,
    },
    {
      id: 'damages',
      label: 'Damages',
      description:
        'A statement of the damages sought, including lost profits, diminution in business value, and exemplary damages where fraud or malice is alleged. Texas law requires that lost profits be proven with reasonable certainty.',
      legalElements: [
        'Actual damages — lost profits calculated with reasonable certainty (TX pattern jury charge PJC 110.21)',
        'Diminution in business value or lost business opportunity',
        'Reasonable royalty or unjust enrichment for trade secret misappropriation (TX CPRC §134A.004)',
        'Exemplary damages — available where fraud, malice, or gross negligence is shown (TX CPRC §41.003, capped at greater of $200,000 or 2× economic + non-economic damages)',
        'Attorney\'s fees — recoverable for breach of fiduciary duty, DTPA, and statutory claims (TX CPRC §38.001)',
        'Pre-judgment and post-judgment interest',
      ],
      minParagraphs: 2,
    },
    {
      id: 'injunctive_relief',
      label: 'Injunctive Relief',
      description:
        'A request for temporary restraining order, temporary injunction, or permanent injunction where immediate and irreparable harm is threatened. Available in trade secret and non-compete cases to prevent ongoing harm.',
      legalElements: [
        'Probable right to recovery on the merits',
        'Imminent and irreparable injury if injunction is not granted',
        'No adequate remedy at law (monetary damages insufficient)',
        'Balance of equities favors injunction',
        'Specific conduct to be enjoined (e.g., use of trade secrets, competing in violation of covenant)',
        'Bond requirement under TX CPRC §65.011',
      ],
      minParagraphs: 2,
    },
    {
      id: 'verification',
      label: 'Verification',
      description:
        'A sworn statement that the facts in the petition are true and correct. Required for applications for temporary restraining orders and recommended for all business dispute petitions.',
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
        'Certification that a copy of the petition was delivered to the opposing party or their attorney, as required by TRCP Rule 21a.',
      legalElements: [
        'Date of service',
        'Method of service (certified mail, hand delivery, e-service, or fax)',
        'Name and address of the party or attorney served',
      ],
      minParagraphs: 1,
    },
  ],

  filingRules: {
    courtName:
      'District Court for most business disputes; County Court at Law for claims within statutory limits. Temporary restraining orders heard on an expedited basis.',
    serviceRequirements:
      'Must serve all parties via certified mail, hand delivery, e-service, or fax per TX Rule of Civil Procedure 21a. Personal service required for original petition (TRCP Rules 106-108). For TRO applications, ex parte service may be permitted.',
    filingFee:
      '$350–$400 for District Court (fee waiver available via Statement of Inability to Afford Payment of Court Costs, TX Gov\'t Code §6.001)',
    maxPages: 50,
    fontRequirements: '12-point minimum for body text; 14-point for JP Court if applicable',
    marginRequirements: '1-inch margins on all sides',
    copies: 2,
    localFormUrl: 'https://www.txcourts.gov/rules-forms/forms/',
  },

  rejectionReasons: [
    {
      reason: 'Missing verification paragraph',
      howToAvoid:
        'Include a signed verification stating that the facts in the petition are true and correct under penalty of perjury. Required for TRO applications.',
      wizardStep: 'review',
    },
    {
      reason: 'No certificate of service attached',
      howToAvoid:
        'Attach a certificate of service showing the date, method, and recipient of service per TRCP Rule 21a.',
      wizardStep: 'review',
    },
    {
      reason: 'Incorrect court name in caption',
      howToAvoid:
        'Verify the court name matches the appropriate court for the amount in controversy and type of relief sought. Most business disputes belong in District Court.',
      wizardStep: 'venue',
    },
    {
      reason: 'Improper venue selection',
      howToAvoid:
        'File in the county of defendant\'s principal office or residence per TX CPRC §15.002. For mandatory venue exceptions, check TX CPRC §15.011-15.020.',
      wizardStep: 'venue',
    },
    {
      reason: 'Fiduciary duty claim lacks specificity',
      howToAvoid:
        'Identify the specific fiduciary relationship, the duties owed, and the particular acts or omissions constituting breach. Generic allegations are insufficient under TX heightened pleading standards for fraud.',
      wizardStep: 'claims',
    },
    {
      reason: 'Trade secret not adequately identified',
      howToAvoid:
        'Describe the trade secret with sufficient particularity to put the defendant on notice, without disclosing the secret itself. TUTSA requires reasonable identification (TX CPRC §134A.002).',
      wizardStep: 'claims',
    },
    {
      reason: 'Injunctive relief request lacks irreparable harm allegation',
      howToAvoid:
        'Specifically allege imminent and irreparable injury that cannot be adequately compensated by monetary damages. Required for TRO and temporary injunction.',
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
            'Describe the fiduciary relationship in detail — identify whether it arises from a formal role (officer, director, partner, trustee) or an informal relationship of trust and confidence. Texas courts require specificity about the nature of fiduciary duties.',
        },
        {
          condition: 'no_damages_timeline',
          message:
            'Include a chronological timeline of the key events. Courts rely on clear timelines to assess statute of limitations and the sequence of breaches.',
        },
      ],
    },
    claims: {
      required: ['claim_type'],
      warnings: [
        {
          condition: 'no_specific_duties_breached',
          message:
            'Specify which fiduciary duties were breached (loyalty, care, obedience, good faith and fair dealing). Generic allegations of "breach of fiduciary duty" are disfavored.',
        },
        {
          condition: 'no_fraud_elements_detailed',
          message:
            'Fraud claims require particularity under TRCP Rule 91a — state the time, place, and content of the misrepresentation, who made it, and what was obtained. Vague fraud allegations are subject to special exceptions.',
        },
        {
          condition: 'no_trade_secret_identification',
          message:
            'Under TUTSA (TX CPRC §134A), you must identify the trade secret with reasonable particularity. Describe the information, the measures taken to maintain secrecy, and how it was misappropriated.',
        },
      ],
    },
    relief: {
      required: [],
      warnings: [
        {
          condition: 'no_injunctive_relief_basis',
          message:
            'If seeking injunctive relief for trade secret or non-compete claims, you must allege: (1) probable right to recovery, (2) imminent and irreparable injury, (3) no adequate remedy at law, and (4) the balance of equities favors relief.',
        },
        {
          condition: 'no_lost_profits_calculation',
          message:
            'Texas requires lost profits to be proven with reasonable certainty. Include a methodology for calculating lost profits (e.g., before-and-after analysis, yardstick approach, or lost-volume analysis).',
        },
        {
          condition: 'no_exemplary_damages_basis',
          message:
            'Exemplary damages require clear and convincing evidence of fraud, malice, or gross negligence (TX CPRC §41.003). State the specific conduct supporting this heightened standard.',
        },
      ],
    },
  },

  glossary: [
    {
      term: 'Fiduciary Duty',
      plainEnglish:
        'A legal obligation to act in someone else\'s best interest. In business, officers, directors, partners, and majority shareholders owe fiduciary duties of loyalty, care, and good faith to the entity and its owners. Breach carries a 4-year statute of limitations (TX CPRC §16.004).',
    },
    {
      term: 'Trade Secret',
      plainEnglish:
        'Valuable business information — such as formulas, customer lists, processes, or software code — that derives economic value from being kept secret, and that the owner takes reasonable steps to protect. Texas protects trade secrets under TUTSA (TX CPRC §134A).',
    },
    {
      term: 'Non-Compete (Covenant Not to Compete)',
      plainEnglish:
        'An agreement restricting someone from competing with a business after leaving. In Texas, non-competes must be ancillary to an otherwise enforceable agreement and reasonable in time, geographic area, and scope of activity (TX Bus. & Com. Code §15.50-15.52). Courts may reform overbroad covenants rather than void them.',
    },
    {
      term: 'Shareholder Oppression',
      plainEnglish:
        'When those controlling a corporation act in a way that frustrates the reasonable expectations of minority shareholders — such as excluding them from management, refusing to pay dividends, or diluting their ownership. Texas allows courts to appoint a receiver or order a buyout (TX Bus. Orgs. Code §11.404).',
    },
    {
      term: 'Breach of Contract',
      plainEnglish:
        'When one party to a valid contract fails to perform a material obligation without legal excuse. The non-breaching party can recover expectation damages to be put in the position they would have been in had the contract been performed.',
    },
    {
      term: 'Injunctive Relief',
      plainEnglish:
        'A court order requiring someone to do or stop doing something. In business disputes, injunctions prevent ongoing harm — like using stolen trade secrets or violating a non-compete — when monetary damages alone would be inadequate.',
    },
    {
      term: 'Exemplary Damages',
      plainEnglish:
        'Extra damages beyond actual losses, awarded to punish especially bad conduct. In Texas, you must prove fraud, malice, or gross negligence by clear and convincing evidence (TX CPRC §41.003). Caps apply: generally the greater of $200,000 or 2× economic damages plus non-economic damages up to $750,000.',
    },
    {
      term: 'Derivative Action',
      plainEnglish:
        'A lawsuit brought by a shareholder or member on behalf of the company when the company\'s own leadership refuses to act. Required when the harm is to the entity, not to the individual owner. Texas requires a written demand before filing (TX Bus. Orgs. Code §21.553).',
    },
    {
      term: 'Statute of Limitations',
      plainEnglish:
        'The legal deadline to file a lawsuit. In Texas, fraud and breach of fiduciary duty have a 4-year limit (TX CPRC §16.004). Statutory claims like DTPA have a 2-year limit (TX CPRC §16.003). Trade secret claims under TUTSA have a 3-year limit (TX CPRC §134A.006). Missing the deadline means your claim is barred.',
    },
  ],
} as const satisfies JurisdictionRuleConfig
