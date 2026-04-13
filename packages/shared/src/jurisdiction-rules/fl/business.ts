import type { JurisdictionRuleConfig } from '../schema'

export const flBusiness = {
  state: 'FL',
  disputeType: 'business',

  requiredSections: [
    {
      id: 'caption',
      label: 'Caption',
      description:
        'Case caption identifying the Circuit Court, parties, and case number. Complex business disputes in Miami-Dade, Broward, and Palm Beach counties may be assigned to a Complex Business Litigation division.',
      legalElements: [
        'Court name (Circuit Court of the ___ Judicial Circuit, in and for ___ County, Florida)',
        'Plaintiff name (or "derivatively on behalf of [Corporation]" for derivative actions)',
        'Defendant name',
        'Case number placeholder (assigned by clerk at filing)',
      ],
      minParagraphs: 1,
    },
    {
      id: 'facts',
      label: 'Statement of Facts',
      description:
        'Chronological recitation of the facts giving rise to the business dispute. Must include the formation of the business relationship, the wrongful conduct, and the resulting harm.',
      legalElements: [
        'Date and nature of the business relationship (employment, partnership, shareholder, vendor)',
        'Duties owed by the defendant (contractual, fiduciary, statutory)',
        'Specific wrongful acts or omissions',
        'Discovery of the wrongful conduct',
        'Damages suffered as a result',
      ],
      minParagraphs: 3,
    },
    {
      id: 'claims',
      label: 'Claims / Causes of Action',
      description:
        'Each count must be separately stated with legal basis and elements. Florida requires fact pleading — ultimate facts supporting each element of each claim.',
      legalElements: [
        'Breach of fiduciary duty — duty, breach, causation, and damages (FL Stat. §607 for corporations, §605 for LLCs)',
        'Fraud — misrepresentation of material fact, knowledge of falsity, intent to induce reliance, justifiable reliance, and damages (4-year SOL under FL Stat. §95.11(3)(j))',
        'Trade secret misappropriation — existence of trade secret, misappropriation, and damages under FUTSA (FL Stat. §688; 3-year SOL under FL Stat. §95.11(4)(a))',
        'Non-compete / restrictive covenant enforcement — reasonable scope and duration under FL Stat. §542.335 (rebuttable presumption: ≤6mo reasonable, 6mo-2yr presumptively reasonable, >2yr presumptively unreasonable)',
        'FDUTPA claim — deceptive or unfair practice in trade or commerce under FL Stat. §501.201',
        'Shareholder derivative action — demand futility or refusal, individual standing, and corporate injury under FL Stat. §607.07401',
      ],
      minParagraphs: 3,
    },
    {
      id: 'damages',
      label: 'Damages',
      description:
        'Itemized statement of damages sought. Business disputes often involve lost profits, disgorgement, and statutory remedies.',
      legalElements: [
        'Compensatory damages (lost profits, lost business value, out-of-pocket losses)',
        'Disgorgement of profits earned through wrongful conduct',
        'Statutory damages under FDUTPA (attorney fees and costs under FL Stat. §501.2105)',
        'Exemplary damages for willful and malicious trade secret misappropriation (up to 2x actual damages under FL Stat. §688.004)',
        'Pre-judgment and post-judgment interest',
      ],
      minParagraphs: 2,
    },
    {
      id: 'injunctive_relief',
      label: 'Injunctive Relief',
      description:
        'Request for temporary and/or permanent injunctive relief. Common in trade secret, non-compete, and fiduciary duty cases. Must show irreparable harm, likelihood of success, balance of equities, and public interest.',
      legalElements: [
        'Temporary restraining order (TRO) and/or preliminary injunction',
        'Irreparable harm that cannot be compensated by money damages',
        'Likelihood of success on the merits',
        'Balance of hardships favors the movant',
        'Permanent injunction to prevent ongoing or future harm',
      ],
      minParagraphs: 2,
    },
    {
      id: 'verification',
      label: 'Verification',
      description:
        'A sworn statement that the facts alleged in the complaint are true and correct. Recommended for injunctive relief requests and derivative actions.',
      legalElements: [
        'Signed under penalty of perjury under the laws of the State of Florida',
        'Statement that the facts set forth are true and correct to the best of the affiant\'s knowledge and belief',
      ],
      minParagraphs: 1,
    },
    {
      id: 'certificate_of_service',
      label: 'Certificate of Service',
      description:
        'Certification that a copy of the filing was served on all parties or their counsel, as required by FL R. Civ. P. 1.080.',
      legalElements: [
        'Date of service',
        'Method of service (e-mail, hand delivery, or U.S. mail)',
        'Name and address of each party or attorney served',
      ],
      minParagraphs: 1,
    },
  ],

  filingRules: {
    courtName:
      'Circuit Court (Complex Business Litigation divisions available in Miami-Dade, Broward, and Palm Beach counties for qualifying cases)',
    serviceRequirements:
      'Must serve all parties via e-mail (preferred), hand delivery, or U.S. mail per FL R. Civ. P. 1.080. Initial process on defendants via personal service or substituted service under FL Stat. §48.',
    filingFee:
      'Approximately $400 for Circuit Court (fee waiver available via Application for Determination of Civil Indigent Status, FL Stat. §57.081)',
    maxPages: 30,
    fontRequirements: '12-point minimum for body text',
    marginRequirements: '1-inch margins on all sides',
    copies: 1,
    localFormUrl: 'https://www.flcourts.gov/Resources-Services/Court-Improvement/Family-Courts/Family-Law-Self-Help-Information/Family-Law-Forms',
  },

  rejectionReasons: [
    {
      reason: 'Missing verification for injunctive relief',
      howToAvoid:
        'When seeking a TRO or preliminary injunction, include a verified complaint or supporting affidavit attesting to the facts establishing irreparable harm.',
      wizardStep: 'review',
    },
    {
      reason: 'No certificate of service',
      howToAvoid:
        'Attach a certificate of service showing the date, method, and recipient of service per FL R. Civ. P. 1.080.',
      wizardStep: 'review',
    },
    {
      reason: 'Derivative action missing demand or demand futility allegation',
      howToAvoid:
        'For shareholder derivative claims under FL Stat. §607.07401, allege either that demand was made and refused, or that demand would have been futile. Explain the specific facts supporting futility.',
      wizardStep: 'claims',
    },
    {
      reason: 'Incorrect venue',
      howToAvoid:
        'File in the county where the defendant\'s principal place of business is located (FL Stat. §47.011). If seeking Complex Business Litigation division, verify the county offers one.',
      wizardStep: 'venue',
    },
    {
      reason: 'Non-compete claim missing reasonableness analysis',
      howToAvoid:
        'Under FL Stat. §542.335, specify the duration and geographic scope of the restrictive covenant, and address the rebuttable presumption of reasonableness (≤6mo reasonable, 6mo-2yr presumptively reasonable, >2yr presumptively unreasonable).',
      wizardStep: 'claims',
    },
  ],

  stepValidations: {
    facts: {
      required: ['relationship_start_date'],
      warnings: [
        {
          condition: 'no_business_entity_type',
          message:
            'Identify the type of business entity (corporation under FL Stat. §607, LLC under FL Stat. §605, partnership, etc.). The entity type determines the governing statute and available remedies.',
        },
        {
          condition: 'no_written_agreement_referenced',
          message:
            'If there is a written agreement (operating agreement, employment contract, non-compete, NDA), reference it and attach it as an exhibit. Written agreements often contain venue, arbitration, and choice-of-law provisions.',
        },
      ],
    },
    claims: {
      required: ['claim_type'],
      warnings: [
        {
          condition: 'no_specific_duty_identified',
          message:
            'For fiduciary duty claims, specify the source of the duty (officer/director under FL Stat. §607, LLC manager under FL Stat. §605, or contractual). Florida courts require identification of the specific duty breached.',
        },
        {
          condition: 'no_trade_secret_identification',
          message:
            'If raising a FUTSA claim (FL Stat. §688), identify the trade secret with reasonable particularity — describe what it is and the measures taken to maintain its secrecy. Courts may require a trade secret identification order.',
        },
      ],
    },
    parties: {
      required: [],
      warnings: [
        {
          condition: 'no_entity_registration_status',
          message:
            'Verify the business entity\'s registration status with the Florida Division of Corporations (sunbiz.org). An entity that is not in good standing may face litigation capacity issues.',
        },
      ],
    },
  },

  glossary: [
    {
      term: 'Fiduciary Duty',
      plainEnglish:
        'A legal obligation to act in someone else\'s best interest. Corporate officers, directors, and LLC managers owe fiduciary duties (loyalty and care) to the company and its owners. Breach can result in personal liability.',
    },
    {
      term: 'Trade Secret',
      plainEnglish:
        'Confidential business information (formulas, customer lists, processes) that gives you a competitive advantage. Florida\'s Uniform Trade Secrets Act (FL Stat. §688) protects against theft or misuse. You must show you took reasonable steps to keep it secret.',
    },
    {
      term: 'Non-Compete / Restrictive Covenant (Enforceable in FL)',
      plainEnglish:
        'An agreement that limits someone\'s ability to compete after leaving a job or business. Unlike many states, Florida enforces non-competes (FL Stat. §542.335). Courts apply a rebuttable presumption: ≤6 months is reasonable, 6 months to 2 years is presumptively reasonable, over 2 years is presumptively unreasonable.',
    },
    {
      term: 'FDUTPA (Florida Deceptive and Unfair Trade Practices Act)',
      plainEnglish:
        'A Florida consumer protection law (FL Stat. §501.201) that also applies to business-to-business disputes. Prohibits deceptive or unfair practices in trade or commerce. The prevailing party can recover attorney fees.',
    },
    {
      term: 'Shareholder Derivative Action',
      plainEnglish:
        'A lawsuit filed by a shareholder on behalf of the corporation when the company\'s directors refuse to act. You must first demand that the board take action or show that demand would be futile (FL Stat. §607.07401).',
    },
    {
      term: 'Injunctive Relief',
      plainEnglish:
        'A court order requiring someone to do something or stop doing something — as opposed to just paying money. Common in non-compete and trade secret cases. You must show you\'ll suffer irreparable harm without the order.',
    },
    {
      term: 'Restrictive Covenant',
      plainEnglish:
        'A contract clause that restricts what you can do — such as a non-compete, non-solicitation, or non-disclosure agreement. In Florida, these are governed by FL Stat. §542.335, which favors enforcement if the terms are reasonable.',
    },
    {
      term: 'Disgorgement',
      plainEnglish:
        'A remedy that forces the wrongdoer to give up the profits they made from their misconduct. Common in fiduciary duty and trade secret cases — the idea is that they should not profit from their wrongdoing.',
    },
  ],
} as const satisfies JurisdictionRuleConfig
