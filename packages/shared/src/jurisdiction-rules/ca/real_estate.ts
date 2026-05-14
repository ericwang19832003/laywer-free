import type { JurisdictionRuleConfig } from '../schema'

export const caRealEstate = {
  state: 'CA',
  disputeType: 'real_estate',

  requiredSections: [
    {
      id: 'caption',
      label: 'Caption',
      description:
        'Case caption identifying the Superior Court, parties, and case number. Real property disputes must be filed in the county where the property is located (CCP §392).',
      legalElements: [
        'Superior Court of California, County of [property location]',
        'Plaintiff name (property owner, buyer, or aggrieved party)',
        'Defendant name (seller, lender, HOA, or title holder)',
        'Case number placeholder (assigned by clerk at filing)',
      ],
      minParagraphs: 1,
    },
    {
      id: 'property_description',
      label: 'Property Description',
      description:
        'Legal description of the real property at issue. Necessary for any action affecting title or possession, and required for recording a lis pendens (CCP §405.20).',
      legalElements: [
        'Street address of the property',
        'Assessor\'s Parcel Number (APN)',
        'Legal description (lot, block, tract, or metes and bounds as shown on the deed)',
        'County where the property is situated',
      ],
      minParagraphs: 1,
    },
    {
      id: 'facts',
      label: 'Facts',
      description:
        'Chronological narrative of the transaction, defects, fraud, or dispute giving rise to the claims. Include dates, parties involved, and how the injury occurred.',
      legalElements: [
        'Date of purchase, transfer, or transaction at issue',
        'Description of the property defects, title defects, or misrepresentations',
        'Actions taken by the defendant (e.g., failure to disclose, dual tracking, HOA violations)',
        'Harm suffered by the plaintiff (financial loss, loss of property, clouded title)',
      ],
      minParagraphs: 3,
    },
    {
      id: 'claims',
      label: 'Claims / Causes of Action',
      description:
        'Each cause of action stated as a separate count with supporting legal authority. Common real estate claims include disclosure violations, fraud, foreclosure defense, HOA disputes, and UCL violations.',
      legalElements: [
        'Failure to provide Transfer Disclosure Statement (CA Civil Code §1102–1102.17)',
        'Fraud or intentional misrepresentation (elements: misrepresentation, knowledge of falsity, intent to induce reliance, justifiable reliance, resulting damage)',
        'Wrongful foreclosure / HBOR violations (CA Civil Code §2923.5–2923.7 — dual tracking, single point of contact)',
        'Non-judicial foreclosure defects (CA Civil Code §2924–2924r)',
        'Davis-Stirling Act violations — HOA governance disputes (CA Civil Code §4000–6150)',
        'Breach of warranty of habitability or covenant of quiet enjoyment',
        'Violation of Statute of Frauds — unwritten real estate contract (CA Civil Code §1624)',
        'Unfair business practices (CA Bus. & Prof. Code §17200)',
        'Quiet title (CCP §318–325)',
      ],
      minParagraphs: 3,
    },
    {
      id: 'damages',
      label: 'Damages / Prayer for Relief',
      description:
        'Specific relief sought, including monetary damages, specific performance, injunctive relief, and/or recording of a lis pendens. Real property cases often seek equitable remedies beyond money damages.',
      legalElements: [
        'Compensatory damages (cost of repairs, diminution in value, out-of-pocket losses)',
        'Specific performance (compelling completion of a real estate contract)',
        'Injunctive relief (restraining foreclosure sale, halting HOA action)',
        'Lis pendens — notice of pending action affecting real property (CCP §405.20)',
        'Punitive damages where fraud is alleged (CA Civil Code §3294)',
        'Attorney fees where authorized by statute or contract',
        'Costs of suit',
      ],
      minParagraphs: 2,
    },
    {
      id: 'verification',
      label: 'Verification',
      description:
        'A sworn statement that the facts in the complaint are true and correct. Verification is required for quiet title actions and lis pendens filings (CCP §446).',
      legalElements: [
        'Signed under penalty of perjury under the laws of the State of California',
        'Statement that the facts set forth are true and correct to the best of plaintiff\'s knowledge',
      ],
      minParagraphs: 1,
    },
    {
      id: 'proof_of_service',
      label: 'Proof of Service',
      description:
        'Proof that the complaint and summons were served on all defendants per California Code of Civil Procedure §415.10–415.95.',
      legalElements: [
        'Date of service',
        'Method of service (personal service, substituted service, or service by mail with acknowledgment)',
        'Name and address of each party served',
        'Declaration of the person who performed service',
      ],
      minParagraphs: 1,
    },
  ],

  filingRules: {
    courtName:
      'Superior Court of California — unlimited civil jurisdiction for title disputes and actions affecting real property',
    serviceRequirements:
      'Must serve all defendants via personal service, substituted service, or service by mail with acknowledgment of receipt per CCP §415.10–415.95. Lis pendens must also be recorded with the county recorder.',
    filingFee:
      'Approximately $435 for unlimited civil cases; fee waiver available via form FW-001 (Request for Fee Waiver)',
    maxPages: 28,
    fontRequirements: '12-point minimum for body text; California Rules of Court, Rule 2.104',
    marginRequirements: '1-inch margins on all sides; California Rules of Court, Rule 2.108',
    copies: 2,
    localFormUrl: 'https://www.courts.ca.gov/forms.htm',
  },

  rejectionReasons: [
    {
      reason: 'Missing property legal description',
      howToAvoid:
        'Include the full legal description, APN, and street address of the property. This is required for any action affecting title and for recording a lis pendens.',
      wizardStep: 'facts',
    },
    {
      reason: 'Missing verification on quiet title or lis pendens action',
      howToAvoid:
        'Include a signed verification under penalty of perjury. Quiet title complaints and lis pendens applications must be verified (CCP §446, §761.020).',
      wizardStep: 'review',
    },
    {
      reason: 'Filed in wrong county',
      howToAvoid:
        'Real property actions must be filed in the county where the property is located (CCP §392). This is a mandatory venue rule — not waivable.',
      wizardStep: 'venue',
    },
    {
      reason: 'No proof of service attached',
      howToAvoid:
        'Attach a completed proof of service showing date, method, and recipient per CCP §415.10–415.95.',
      wizardStep: 'review',
    },
    {
      reason: 'Lis pendens not recorded with county recorder',
      howToAvoid:
        'If seeking to affect title, record a lis pendens with the county recorder\'s office concurrent with filing the complaint (CCP §405.20).',
      wizardStep: 'relief',
    },
    {
      reason: 'Statute of Frauds — no written agreement attached',
      howToAvoid:
        'Real estate contracts must be in writing to be enforceable (CA Civil Code §1624). Attach a copy of the written agreement or explain why equitable exceptions apply.',
      wizardStep: 'facts',
    },
  ],

  stepValidations: {
    facts: {
      required: ['transaction_date'],
      warnings: [
        {
          condition: 'no_title_report_mentioned',
          message:
            'Consider obtaining a preliminary title report before filing. It reveals liens, encumbrances, and ownership history that strengthen your claims and help identify all necessary defendants.',
        },
        {
          condition: 'no_property_defects_described',
          message:
            'Describe the specific property defects, title defects, or misrepresentations at issue. Vague allegations weaken your complaint — courts require factual specificity.',
        },
        {
          condition: 'no_disclosure_timeline',
          message:
            'Note when the seller was required to provide the Transfer Disclosure Statement (TDS) and whether it was delivered. Under CA Civil Code §1102.3, the TDS must be provided before transfer.',
        },
      ],
    },
    claims: {
      required: ['claim_type'],
      warnings: [
        {
          condition: 'no_tds_violation_details',
          message:
            'If alleging disclosure violations, specify which items on the Transfer Disclosure Statement (CA Civil Code §1102–1102.17) were omitted or misrepresented. The TDS covers structural, environmental, and neighborhood hazard disclosures.',
        },
        {
          condition: 'no_hbor_protections_cited',
          message:
            'For foreclosure defense, consider citing the Homeowner Bill of Rights (CA Civil Code §2923.5–2923.7): prohibition on dual tracking, requirement for single point of contact, and right to explore loan modification before foreclosure.',
        },
        {
          condition: 'no_statute_of_limitations_analysis',
          message:
            'Check applicable statutes of limitations: 3 years for fraud (CCP §338(d)), 4 years for breach of written contract (CCP §337), 4 years for UCL claims (Bus. & Prof. Code §17208), no time limit for quiet title against void deeds.',
        },
      ],
    },
    relief: {
      required: [],
      warnings: [
        {
          condition: 'no_specific_performance_vs_damages_analysis',
          message:
            'Consider whether specific performance (forcing completion of the deal) or monetary damages better serves your goals. Specific performance is available for real estate contracts because each parcel is considered unique.',
        },
        {
          condition: 'no_lis_pendens_considered',
          message:
            'If your action affects title to or possession of real property, consider recording a lis pendens (CCP §405.20). This puts future buyers on notice and prevents the defendant from transferring the property during litigation.',
        },
      ],
    },
  },

  glossary: [
    {
      term: 'Deed',
      plainEnglish:
        'The legal document that transfers ownership of real property from one person to another. Common types include grant deeds, quitclaim deeds, and trust deeds. It must be recorded with the county recorder to be effective against third parties.',
    },
    {
      term: 'Title',
      plainEnglish:
        'Your legal right to own, use, and sell a piece of property. A "clear title" means no one else has a competing claim. A "clouded title" means there is a dispute or defect that could affect your ownership.',
    },
    {
      term: 'Foreclosure',
      plainEnglish:
        'The legal process a lender uses to take your property when you stop making mortgage payments. In California, most foreclosures are "non-judicial" — the lender sells the property without going to court, following the steps in Civil Code §2924.',
    },
    {
      term: 'Lis Pendens',
      plainEnglish:
        'A recorded notice that tells the world there is a pending lawsuit affecting a piece of property. It prevents the owner from selling the property to an unsuspecting buyer while the case is pending (CCP §405.20).',
    },
    {
      term: 'Specific Performance',
      plainEnglish:
        'A court order that forces someone to complete a real estate deal instead of just paying money damages. Courts grant this for real estate because every property is unique — money cannot replace a specific home or parcel.',
    },
    {
      term: 'Deed of Trust',
      plainEnglish:
        'The security document that gives your lender the right to foreclose if you default on your mortgage. In California, most home loans use a deed of trust (not a mortgage), which allows non-judicial foreclosure.',
    },
    {
      term: 'HOA / Davis-Stirling Act',
      plainEnglish:
        'The Davis-Stirling Common Interest Development Act (Civil Code §4000–6150) governs homeowners associations in California. It covers HOA elections, assessments, maintenance obligations, dispute resolution, and homeowner rights.',
    },
    {
      term: 'Adverse Possession',
      plainEnglish:
        'A way to gain legal ownership of someone else\'s property by occupying it openly, continuously, and without permission for at least 5 years while paying property taxes (CCP §318–325). It is rare and difficult to prove.',
    },
    {
      term: 'Transfer Disclosure Statement (TDS)',
      plainEnglish:
        'A form the seller must give the buyer listing all known defects and conditions of the property — structural issues, environmental hazards, neighborhood problems, and more (Civil Code §1102–1102.17). Failure to disclose is grounds for a lawsuit.',
    },
    {
      term: 'Homeowner Bill of Rights (HBOR)',
      plainEnglish:
        'A California law (Civil Code §2923.5–2923.7) that protects homeowners facing foreclosure. It prohibits "dual tracking" (foreclosing while reviewing a loan modification), requires a single point of contact at the lender, and gives homeowners the right to sue for violations.',
    },
  ],
} as const satisfies JurisdictionRuleConfig
