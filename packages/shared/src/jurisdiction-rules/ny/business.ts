import type { JurisdictionRuleConfig } from '../schema'

export const nyBusiness = {
  state: 'NY',
  disputeType: 'business',

  requiredSections: [
    {
      id: 'caption',
      label: 'Caption',
      description:
        'Case caption identifying the court, parties, and index number. Business disputes are filed in Supreme Court; complex cases exceeding $500,000 in certain counties are assigned to the Commercial Division.',
      legalElements: [
        'Court name (Supreme Court of the State of New York, County of [County])',
        'Plaintiff name (individual, partnership, LLC, or corporation)',
        'Defendant name (individual, partnership, LLC, or corporation)',
        'Index number placeholder (assigned by clerk upon filing with the County Clerk)',
      ],
      minParagraphs: 1,
    },
    {
      id: 'facts',
      label: 'Facts — Business Relationship, Duties, and Breach',
      description:
        'A detailed statement of the facts establishing the business relationship between the parties, the duties owed, and how those duties were breached. This section must describe the nature of the business entity, the roles of the parties, and the specific conduct giving rise to the dispute.',
      legalElements: [
        'Nature of the business relationship (shareholder, officer/director, partner, member, employee, contractor)',
        'Date the business relationship began and any governing agreements (bylaws, operating agreement, shareholder agreement)',
        'Fiduciary duties owed under NY BCL §715-717 or common law (loyalty, care, good faith)',
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
        'Each cause of action pleaded as a separate count with the legal elements required under New York law. Business disputes commonly involve breach of fiduciary duty, fraud, trade secret misappropriation, non-compete violations, shareholder oppression, and deceptive business practices.',
      legalElements: [
        'Breach of fiduciary duty — existence of fiduciary relationship under NY BCL §715-717 or common law, breach of duty of loyalty/care, causation, damages (NY CPLR §213(1), 6-year SOL)',
        'Business fraud — material misrepresentation or omission, knowledge of falsity (scienter), intent to induce reliance, justifiable reliance, damages (NY CPLR §213(8), 6-year SOL)',
        'Trade secret misappropriation — existence of trade secret under NY common law (not UTSA), misappropriation by improper means or breach of confidence, damages or injunctive relief',
        'Non-compete violation — covenant not to compete, reasonableness test for scope, duration, and geographic area; NY courts may blue-pencil overbroad covenants',
        'Shareholder oppression — oppressive conduct by those controlling the corporation, frustration of reasonable expectations, dissolution remedy (NY BCL §1104-a)',
        'Deceptive business practices — consumer-oriented conduct, materially misleading, injury (NY Gen. Bus. Law §349)',
      ],
      minParagraphs: 3,
    },
    {
      id: 'damages',
      label: 'Damages',
      description:
        'A statement of the damages sought, including lost profits, diminution in business value, disgorgement of profits, and punitive damages where fraud or egregious conduct is alleged.',
      legalElements: [
        'Actual damages — lost profits proven with reasonable certainty',
        'Diminution in business value or lost business opportunity',
        'Disgorgement of profits — equitable remedy stripping defendant of ill-gotten gains from breach of fiduciary duty',
        'Punitive damages — available where fraud or egregious conduct is shown, no statutory cap in New York',
        'Attorney\'s fees — recoverable under NY Gen. Bus. Law §349 and contractual fee-shifting provisions',
        'Pre-judgment interest at 9% per annum (NY CPLR §5004)',
      ],
      minParagraphs: 2,
    },
    {
      id: 'injunctive_relief',
      label: 'Injunctive Relief',
      description:
        'A request for temporary restraining order, preliminary injunction, or permanent injunction under NY CPLR §6301 where immediate and irreparable harm is threatened. Available in trade secret and non-compete cases to prevent ongoing harm.',
      legalElements: [
        'Likelihood of success on the merits',
        'Irreparable injury if injunction is not granted (NY CPLR §6301)',
        'No adequate remedy at law (monetary damages insufficient)',
        'Balance of equities favors injunction',
        'Specific conduct to be enjoined (e.g., use of trade secrets, competing in violation of covenant)',
        'Undertaking/bond requirement under NY CPLR §6312(b)',
      ],
      minParagraphs: 2,
    },
    {
      id: 'verification',
      label: 'Verification',
      description:
        'A sworn statement that the facts in the petition are true and correct. Required for applications for temporary restraining orders and recommended for all business dispute petitions under NY CPLR §3020.',
      legalElements: [
        'Signed under penalty of perjury under the laws of the State of New York',
        'Statement that the facts set forth in the complaint are true and correct to the best of plaintiff\'s knowledge (NY CPLR §3020)',
      ],
      minParagraphs: 1,
    },
    {
      id: 'proof_of_service',
      label: 'Proof of Service',
      description:
        'Proof that a copy of the summons and complaint was delivered to the opposing party as required by NY CPLR §308 (personal service on individuals) or §311 (service on corporations).',
      legalElements: [
        'Date of service',
        'Method of service (personal delivery, substituted service, or service on the Secretary of State for corporations under NY BCL §306)',
        'Name and address of the party served',
      ],
      minParagraphs: 1,
    },
  ],

  filingRules: {
    courtName:
      'Supreme Court of New York; Commercial Division for complex business disputes exceeding $500,000 in designated counties (NYC, Nassau, Suffolk, Westchester, and others per 22 NYCRR §202.70)',
    serviceRequirements:
      'Must serve all parties via personal delivery, substituted service, or service upon the Secretary of State for domestic and authorized foreign corporations per NY CPLR §308 (individuals) and §311 (corporations). Service must be completed within 120 days of filing (NY CPLR §306-b).',
    filingFee:
      '$210 index number fee for Supreme Court (poor person relief available under NY CPLR §1101)',
    maxPages: 50,
    fontRequirements: '12-point minimum for body text per Commercial Division rules',
    marginRequirements: '1-inch margins on all sides',
    copies: 2,
    localFormUrl: 'https://www.nycourts.gov/forms/',
  },

  rejectionReasons: [
    {
      reason: 'Missing verification paragraph',
      howToAvoid:
        'Include a signed verification stating that the facts in the complaint are true and correct under penalty of perjury. Required for TRO applications under NY CPLR §3020.',
      wizardStep: 'review',
    },
    {
      reason: 'No proof of service attached',
      howToAvoid:
        'Attach proof of service showing the date, method, and recipient of service per NY CPLR §308 or §311.',
      wizardStep: 'review',
    },
    {
      reason: 'Incorrect court name in caption',
      howToAvoid:
        'Verify the court name is Supreme Court of the State of New York, County of [County]. Commercial Division assignment is requested separately per 22 NYCRR §202.70.',
      wizardStep: 'venue',
    },
    {
      reason: 'Improper venue selection',
      howToAvoid:
        'File in the county where the defendant\'s principal office is located or where the defendant resides per NY CPLR §503. For corporate defendants, venue lies where the corporation\'s principal office is situated.',
      wizardStep: 'venue',
    },
    {
      reason: 'Fiduciary duty claim lacks specificity',
      howToAvoid:
        'Identify the specific fiduciary relationship (officer, director, partner, controlling shareholder), the duties owed under NY BCL §715-717 or common law, and the particular acts or omissions constituting breach.',
      wizardStep: 'claims',
    },
    {
      reason: 'Trade secret not adequately identified',
      howToAvoid:
        'Under New York common law, describe the trade secret with sufficient particularity — the specific information claimed as secret, the measures taken to maintain secrecy, and how it was misappropriated. NY has not adopted UTSA; claims proceed under common law misappropriation.',
      wizardStep: 'claims',
    },
    {
      reason: 'Injunctive relief request lacks irreparable harm allegation',
      howToAvoid:
        'Specifically allege irreparable injury that cannot be adequately compensated by monetary damages under NY CPLR §6301. Required for TRO and preliminary injunction applications.',
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
            'Attach or reference key business records (operating agreement, bylaws, shareholder agreement, partnership agreement, employment agreement) that establish the parties\' rights and obligations.',
        },
        {
          condition: 'no_fiduciary_relationship_described',
          message:
            'Describe the fiduciary relationship in detail — identify whether it arises from a formal role (officer, director under NY BCL §715-717, partner, controlling shareholder) or an informal relationship of trust and confidence. New York courts require specificity about the nature of fiduciary duties.',
        },
        {
          condition: 'no_damages_timeline',
          message:
            'Include a chronological timeline of the key events. Courts rely on clear timelines to assess statute of limitations (6 years for fraud under CPLR §213(8), 6 years for contracts under CPLR §213(2)) and the sequence of breaches.',
        },
      ],
    },
    claims: {
      required: ['claim_type'],
      warnings: [
        {
          condition: 'no_specific_duties_breached',
          message:
            'Specify which fiduciary duties were breached (loyalty, care, good faith). Generic allegations of "breach of fiduciary duty" are disfavored under New York pleading standards.',
        },
        {
          condition: 'no_fraud_elements_detailed',
          message:
            'Fraud claims require particularity under NY CPLR §3016(b) — state the specific misrepresentation, who made it, when and where, and why it was false. Vague fraud allegations are subject to dismissal.',
        },
        {
          condition: 'no_trade_secret_identification',
          message:
            'Under New York common law (not UTSA — NY has not adopted the Uniform Trade Secrets Act), you must identify the trade secret with reasonable particularity. Describe the information, the measures taken to maintain secrecy, and how it was misappropriated.',
        },
        {
          condition: 'no_noncompete_reasonableness_analysis',
          message:
            'New York courts apply a strict reasonableness test to non-competes, evaluating scope, duration, and geographic area. Include facts supporting why the covenant is reasonable and necessary to protect legitimate business interests. Note that proposed legislation to ban non-competes has not yet been enacted.',
        },
      ],
    },
    relief: {
      required: [],
      warnings: [
        {
          condition: 'no_injunctive_relief_basis',
          message:
            'If seeking injunctive relief for trade secret or non-compete claims under NY CPLR §6301, you must allege: (1) likelihood of success on the merits, (2) irreparable injury, (3) no adequate remedy at law, and (4) the balance of equities favors relief.',
        },
        {
          condition: 'no_lost_profits_calculation',
          message:
            'New York requires lost profits to be proven with reasonable certainty. Include a methodology for calculating lost profits (e.g., before-and-after analysis, yardstick approach, or lost-volume analysis).',
        },
        {
          condition: 'no_commercial_division_assessment',
          message:
            'If the amount in controversy exceeds $500,000 and the case is filed in a designated county (e.g., New York, Kings, Nassau), consider requesting assignment to the Commercial Division under 22 NYCRR §202.70 for specialized judicial handling.',
        },
      ],
    },
  },

  glossary: [
    {
      term: 'Fiduciary Duty',
      plainEnglish:
        'A legal obligation to act in someone else\'s best interest. In business, officers and directors owe fiduciary duties of loyalty, care, and good faith under NY BCL §715-717 and common law. Partners and controlling shareholders also owe fiduciary duties. The statute of limitations is 6 years (NY CPLR §213(1)).',
    },
    {
      term: 'Trade Secret',
      plainEnglish:
        'Valuable business information — such as formulas, customer lists, processes, or software code — that derives economic value from being kept secret, and that the owner takes reasonable steps to protect. New York protects trade secrets under common law misappropriation (NY has not adopted the Uniform Trade Secrets Act).',
    },
    {
      term: 'Non-Compete (Covenant Not to Compete)',
      plainEnglish:
        'An agreement restricting someone from competing with a business after leaving. In New York, non-competes are enforceable only if reasonable in scope, duration, and geographic area, and necessary to protect legitimate business interests. Courts apply a strict reasonableness test and may blue-pencil overbroad covenants. Proposed legislation to ban non-competes has not yet been enacted.',
    },
    {
      term: 'Shareholder Oppression',
      plainEnglish:
        'When those controlling a corporation act in a way that frustrates the reasonable expectations of minority shareholders — such as excluding them from management, refusing to pay dividends, or diverting corporate assets. New York allows courts to dissolve the corporation under NY BCL §1104-a, and the corporation may elect to buy out the petitioner\'s shares under NY BCL §1118.',
    },
    {
      term: 'Derivative Action',
      plainEnglish:
        'A lawsuit brought by a shareholder on behalf of the corporation when the corporation\'s own leadership refuses to act. Required when the harm is to the entity, not to the individual shareholder. New York requires the plaintiff to have been a shareholder at the time of the wrongdoing and to make a demand on the board or show demand would be futile (NY BCL §626).',
    },
    {
      term: 'Injunctive Relief',
      plainEnglish:
        'A court order requiring someone to do or stop doing something. In business disputes, injunctions under NY CPLR §6301 prevent ongoing harm — like using stolen trade secrets or violating a non-compete — when monetary damages alone would be inadequate.',
    },
    {
      term: 'Commercial Division',
      plainEnglish:
        'A specialized part of the New York Supreme Court that handles complex commercial disputes. Cases are assigned to the Commercial Division in designated counties (including NYC) when they exceed a monetary threshold (generally $500,000) and involve business issues like contract disputes, fiduciary claims, or trade secret cases (22 NYCRR §202.70).',
    },
    {
      term: 'Disgorgement',
      plainEnglish:
        'An equitable remedy that strips the wrongdoer of profits gained through wrongful conduct — such as breach of fiduciary duty or misappropriation. Unlike compensatory damages, disgorgement focuses on what the defendant gained rather than what the plaintiff lost.',
    },
    {
      term: 'Breach of Contract',
      plainEnglish:
        'When one party to a valid contract fails to perform a material obligation without legal excuse. The non-breaching party can recover expectation damages. The statute of limitations is 6 years (NY CPLR §213(2)).',
    },
    {
      term: 'Statute of Limitations',
      plainEnglish:
        'The legal deadline to file a lawsuit. In New York, fraud has a 6-year limit (NY CPLR §213(8)). Breach of contract has a 6-year limit (NY CPLR §213(2)). Breach of fiduciary duty has a 6-year limit (NY CPLR §213(1)). Missing the deadline means your claim is barred.',
    },
  ],
} as const satisfies JurisdictionRuleConfig
