import type { JurisdictionRuleConfig } from '../schema'

export const paBusiness = {
  state: 'PA',
  disputeType: 'business',

  requiredSections: [
    {
      id: 'caption',
      label: 'Caption',
      description:
        'Case caption identifying the Court of Common Pleas (or Philadelphia Commerce Court), county, parties, and docket number. Venue is the county of the defendant\'s registered office or principal place of business (Pa.R.C.P. 2179).',
      legalElements: [
        'Court of Common Pleas — county of defendant\'s registered office or principal place of business; Commerce Court if filed in Philadelphia',
        'Plaintiff name (shareholder, business partner, or aggrieved party)',
        'Defendant name (corporation, LLC, partner, or individual)',
        'Docket number placeholder (assigned by Prothonotary at filing)',
      ],
      minParagraphs: 1,
    },
    {
      id: 'facts',
      label: 'Statement of Facts',
      description:
        'Chronological recitation of the facts giving rise to the business dispute. Must include the date the business relationship began and all material events.',
      legalElements: [
        'Date the business relationship started (incorporation, partnership formation, employment start)',
        'Nature of the business relationship (shareholder, partner, employee, contractor)',
        'Timeline of events leading to the dispute',
        'Any agreements, contracts, or restrictive covenants at issue',
        'Notices, demands, or communications exchanged between the parties',
      ],
      minParagraphs: 3,
    },
    {
      id: 'claims',
      label: 'Claims',
      description:
        'Legal causes of action asserted against the defendant. Each claim must identify the applicable statute or common-law basis and the specific facts supporting it.',
      legalElements: [
        'Breach of fiduciary duty — officers, directors, or controlling shareholders owe duties of care and loyalty',
        'Fraud — 42 Pa.C.S. §5524 (2-year SOL); must plead with particularity under Pa.R.C.P. 1019(b)',
        'Trade secret misappropriation — PA Uniform Trade Secrets Act (12 Pa.C.S. §5301-5308)',
        'Non-compete violation — PA enforces with reasonableness test (ancillary to employment, reasonable in scope, duration, and geography)',
        'UTPCPL violation — Unfair Trade Practices and Consumer Protection Law (73 P.S. §201-1 et seq.)',
        'Shareholder oppression / deadlock — dissolution under 15 Pa.C.S. §1767; derivative actions under §1781-1787',
        'Breach of contract — 42 Pa.C.S. §5525 (4-year SOL)',
      ],
      minParagraphs: 3,
    },
    {
      id: 'damages',
      label: 'Damages',
      description:
        'Itemization of all damages sought, including compensatory, consequential, and any statutory damages or treble damages available under applicable statutes.',
      legalElements: [
        'Compensatory damages (lost profits, lost business value, out-of-pocket losses)',
        'Consequential damages (lost opportunities, reputational harm)',
        'Statutory damages — UTPCPL provides treble damages for intentional violations (73 P.S. §201-9.2)',
        'Unjust enrichment / disgorgement of profits obtained through wrongful conduct',
        'Attorney fees if authorized by statute (UTPCPL, PUTSA) or contract',
      ],
      minParagraphs: 2,
    },
    {
      id: 'injunctive_relief',
      label: 'Injunctive Relief',
      description:
        'Request for preliminary or permanent injunctive relief. Available for trade secret misappropriation and non-compete enforcement under Pa.R.C.P. 1531.',
      legalElements: [
        'Preliminary injunction — must show (1) likelihood of success on merits, (2) immediate and irreparable harm, (3) greater injury to plaintiff than defendant, (4) injunction restores status quo, (5) injunction is reasonably suited to abate the harm, (6) public interest is not harmed',
        'Temporary restraining order (TRO) — available for emergency situations under Pa.R.C.P. 1531',
        'Permanent injunction — preventing ongoing trade secret use, enforcing non-compete, or compelling corporate action',
        'Specific relief — dissolution or appointment of custodian under 15 Pa.C.S. §1767',
      ],
      minParagraphs: 2,
    },
    {
      id: 'verification',
      label: 'Verification',
      description:
        'A sworn statement that the facts in the complaint are true and correct. Pennsylvania requires verification of pleadings containing averments of fact (Pa.R.C.P. 1024).',
      legalElements: [
        'Statement that the facts set forth are true and correct to the best of the signer\'s knowledge, information, and belief',
        'Signed under penalty of perjury under 18 Pa.C.S. §4904 (unsworn falsification to authorities)',
      ],
      minParagraphs: 1,
    },
    {
      id: 'certificate_of_service',
      label: 'Certificate of Service',
      description:
        'Certification that a copy of the complaint was served on all parties or their counsel, as required by Pa.R.C.P. 440.',
      legalElements: [
        'Date of service',
        'Method of service (personal service, certified mail, or first-class mail per Pa.R.C.P. 440)',
        'Name and address of each party or attorney served',
      ],
      minParagraphs: 1,
    },
  ],

  filingRules: {
    courtName:
      'Court of Common Pleas; Commerce Court in Philadelphia (Commerce Program handles complex business disputes)',
    serviceRequirements:
      'Original process must be served by the sheriff or a competent adult per Pa.R.C.P. 400-405. Subsequent filings served by first-class mail, personal delivery, or electronic service per Pa.R.C.P. 440.',
    filingFee:
      '$100-300 depending on the county (fee waiver available via petition to proceed in forma pauperis under Pa.R.C.P. 240)',
    maxPages: 30,
    fontRequirements: 'No statewide font requirement; check local county rules (many require 12-point minimum)',
    marginRequirements: '1-inch margins on all sides',
    copies: 2,
    localFormUrl: 'https://www.pacourts.us/forms',
  },

  rejectionReasons: [
    {
      reason: 'Missing verification paragraph',
      howToAvoid:
        'Include a signed verification under Pa.R.C.P. 1024 stating that the facts are true and correct to the best of your knowledge, information, and belief.',
      wizardStep: 'review',
    },
    {
      reason: 'No certificate of service attached',
      howToAvoid:
        'Attach a certificate of service showing the date, method, and recipient of service per Pa.R.C.P. 440.',
      wizardStep: 'review',
    },
    {
      reason: 'Fraud not pleaded with particularity',
      howToAvoid:
        'Under Pa.R.C.P. 1019(b), fraud claims must specify the who, what, when, where, and how of the fraudulent conduct. General allegations of fraud will be stricken.',
      wizardStep: 'claims',
    },
    {
      reason: 'Wrong venue — filed in incorrect county',
      howToAvoid:
        'Business disputes must be filed in the county of the defendant\'s registered office or principal place of business (Pa.R.C.P. 2179). Verify venue before filing.',
      wizardStep: 'venue',
    },
    {
      reason: 'Claim filed after statute of limitations expired',
      howToAvoid:
        'Fraud claims have a 2-year SOL (42 Pa.C.S. §5524); contract claims have a 4-year SOL (42 Pa.C.S. §5525). Verify your claim is timely before filing.',
      wizardStep: 'claims',
    },
  ],

  stepValidations: {
    facts: {
      required: ['relationship_start_date'],
      warnings: [
        {
          condition: 'no_agreement_details',
          message:
            'Identify any written agreements (operating agreement, shareholder agreement, employment contract, non-compete). Attach copies if possible — the court will look to these documents to determine the parties\' rights and obligations.',
        },
        {
          condition: 'no_demand_letter_mentioned',
          message:
            'Note whether you sent a demand letter before filing suit. While not always required, a pre-suit demand is necessary for derivative actions (15 Pa.C.S. §1782) and strengthens UTPCPL claims.',
        },
      ],
    },
    claims: {
      required: ['claim_type'],
      warnings: [
        {
          condition: 'no_specific_fiduciary_duty',
          message:
            'If raising a fiduciary duty claim, specify which duty was breached (duty of care, duty of loyalty, duty of good faith) and the specific conduct that violated it. Pennsylvania courts require more than conclusory allegations.',
        },
        {
          condition: 'no_trade_secret_identification',
          message:
            'If raising a trade secret claim under PUTSA (12 Pa.C.S. §5301-5308), you must identify the trade secret with reasonable particularity and explain the measures taken to maintain its secrecy.',
        },
      ],
    },
    parties: {
      required: [],
      warnings: [
        {
          condition: 'no_entity_type_identified',
          message:
            'Identify whether the defendant is a corporation, LLC, partnership, or sole proprietorship — this affects which statutes apply (e.g., shareholder derivative rules only apply to corporations under 15 Pa.C.S. §1781-1787).',
        },
      ],
    },
  },

  glossary: [
    {
      term: 'Fiduciary Duty',
      plainEnglish:
        'A legal obligation to act in another person\'s best interest. Corporate officers, directors, and controlling shareholders owe fiduciary duties of care (make informed decisions) and loyalty (don\'t put personal interests above the company). Breach of these duties is a common business lawsuit claim.',
    },
    {
      term: 'Trade Secret',
      plainEnglish:
        'Confidential business information (formulas, customer lists, processes) that gives you a competitive advantage and that you take reasonable steps to keep secret. Pennsylvania\'s Uniform Trade Secrets Act (12 Pa.C.S. §5301-5308) protects against misappropriation — stealing or improperly using someone else\'s trade secrets.',
    },
    {
      term: 'Non-Compete (Reasonableness Test)',
      plainEnglish:
        'An agreement restricting an employee from working for a competitor after leaving. Pennsylvania enforces non-competes only if they are (1) ancillary to an employment relationship, (2) supported by adequate consideration, and (3) reasonable in scope, duration, and geographic area. Courts can modify overly broad restrictions.',
    },
    {
      term: 'UTPCPL (Unfair Trade Practices and Consumer Protection Law)',
      plainEnglish:
        'Pennsylvania\'s consumer protection statute (73 P.S. §201-1 et seq.) that prohibits deceptive and unfair business practices. It covers fraud, false advertising, and other unfair conduct. Successful plaintiffs can recover treble (triple) damages and attorney fees.',
    },
    {
      term: 'Shareholder Oppression',
      plainEnglish:
        'When majority shareholders or directors use their control to unfairly squeeze out or harm minority shareholders. Under Pennsylvania law (15 Pa.C.S. §1767), a court can dissolve a corporation if those in control are acting illegally, oppressively, or fraudulently.',
    },
    {
      term: 'Injunctive Relief',
      plainEnglish:
        'A court order requiring someone to do — or stop doing — something. In business disputes, this often means a temporary restraining order or preliminary injunction to stop trade secret theft, enforce a non-compete, or prevent asset dissipation while the case is pending.',
    },
    {
      term: 'Derivative Action',
      plainEnglish:
        'A lawsuit filed by a shareholder on behalf of the corporation when the board of directors refuses to act. Under 15 Pa.C.S. §1781-1787, you must first demand that the board take action (or show that demand would be futile) before filing.',
    },
    {
      term: 'Commerce Court',
      plainEnglish:
        'Philadelphia\'s specialized Commerce Program within the Court of Common Pleas. It handles complex business disputes — contract disputes over $50,000, shareholder litigation, trade secret cases, and other commercial matters. Cases are assigned to judges with business law expertise.',
    },
  ],
} as const satisfies JurisdictionRuleConfig
