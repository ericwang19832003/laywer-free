import type { JurisdictionRuleConfig } from '../schema'

export const txContract = {
  state: 'TX',
  disputeType: 'contract',

  requiredSections: [
    {
      id: 'caption',
      label: 'Caption',
      description:
        'Case caption identifying the court, parties, and cause number. Must match the court where the suit is filed.',
      legalElements: [
        'Court name (Justice of the Peace, County, or District Court)',
        'Plaintiff name (party bringing the breach claim)',
        'Defendant name (party alleged to have breached)',
        'Cause number placeholder (assigned by clerk at filing)',
      ],
      minParagraphs: 1,
    },
    {
      id: 'contract_description',
      label: 'Contract Description',
      description:
        'A detailed description of the contract at issue — its type, date of execution, the parties involved, and the material terms. This establishes the existence of a valid, enforceable agreement.',
      legalElements: [
        'Type of contract (written, oral, promissory note, service agreement, sale of goods under UCC Article 2)',
        'Date of execution or formation',
        'Identities of all parties to the contract',
        'Material terms — price, performance obligations, deadlines, payment schedule',
        'Whether consideration was exchanged',
      ],
      minParagraphs: 2,
    },
    {
      id: 'breach_allegations',
      label: 'Breach Allegations',
      description:
        'Specific allegations of how the defendant breached the contract. Must identify which terms were violated, what was promised versus what occurred, and when the breach happened. Texas requires the four elements: (1) valid contract, (2) plaintiff performed or tendered performance, (3) defendant breached, (4) plaintiff sustained damages.',
      legalElements: [
        'Plaintiff performed or tendered performance of their obligations under the contract',
        'Identification of the specific contract terms the defendant breached',
        'Description of how the defendant failed to perform — what was promised versus what occurred',
        'Date or time period when the breach occurred',
        'Whether the breach is material (going to the essence of the contract) or partial',
      ],
      minParagraphs: 3,
    },
    {
      id: 'damages',
      label: 'Damages',
      description:
        'A statement of the damages sustained as a result of the breach. Texas law allows recovery of actual damages, consequential damages, and attorney\'s fees for breach of contract (TX CPRC §38.001).',
      legalElements: [
        'Actual (direct) damages — the difference between what was promised and what was received',
        'Consequential damages — foreseeable losses flowing from the breach (e.g., lost profits, additional costs incurred)',
        'Attorney\'s fees — recoverable under TX CPRC §38.001 for breach of oral or written contract',
        'Pre-judgment and post-judgment interest',
        'Request for specific performance if applicable (real property or unique goods)',
      ],
      minParagraphs: 2,
    },
    {
      id: 'verification',
      label: 'Verification',
      description:
        'A sworn statement that the facts in the petition are true and correct. Verification strengthens the petition and may be required for certain relief such as temporary restraining orders.',
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
      'Justice of the Peace Court (claims under $20,000), County Court at Law ($20,000–$250,000), or District Court (claims over $250,000 or equitable relief)',
    serviceRequirements:
      'Must serve all parties via citation issued by the clerk and served by a constable, sheriff, or authorized process server per TRCP Rules 99–107. After initial service, subsequent documents served per TRCP Rule 21a.',
    filingFee:
      '$54 for Justice of the Peace Court; varies by county for County and District Courts (fee waiver available via Statement of Inability to Afford Payment of Court Costs, TX Gov\'t Code §6.001)',
    maxPages: 25,
    fontRequirements: '14-point minimum for body text in JP Court',
    marginRequirements: '1-inch margins on all sides',
    copies: 2,
    localFormUrl: 'https://www.txcourts.gov/rules-forms/forms/',
  },

  rejectionReasons: [
    {
      reason: 'Contract not adequately described',
      howToAvoid:
        'Include the type of contract (written, oral, promissory note), date of execution, the parties, and the material terms. Attach a copy of the written contract as an exhibit if available.',
      wizardStep: 'facts',
    },
    {
      reason: 'Breach allegations too vague',
      howToAvoid:
        'Specify exactly which contract terms were breached, how the defendant failed to perform, and the date or time period of the breach. Do not simply state "defendant breached the contract."',
      wizardStep: 'claims',
    },
    {
      reason: 'No damages amount stated',
      howToAvoid:
        'State a specific dollar amount for actual damages. If claiming consequential damages, explain how they were foreseeable and quantify them.',
      wizardStep: 'relief',
    },
    {
      reason: 'Missing verification paragraph',
      howToAvoid:
        'Include a signed verification stating that the facts in the petition are true and correct under penalty of perjury.',
      wizardStep: 'review',
    },
    {
      reason: 'No certificate of service attached',
      howToAvoid:
        'Attach a certificate of service showing the date, method, and recipient of service per TRCP Rule 21a.',
      wizardStep: 'review',
    },
    {
      reason: 'Incorrect venue',
      howToAvoid:
        'File in the county of the defendant\'s residence or where the contract was to be performed (TX CPRC §15.002). State the basis for venue in the petition.',
      wizardStep: 'venue',
    },
  ],

  stepValidations: {
    facts: {
      required: ['contract_date'],
      warnings: [
        {
          condition: 'no_contract_copy_mentioned',
          message:
            'If you have a written copy of the contract, attach it as an exhibit. Courts give more weight to claims supported by documentary evidence. If the contract was oral, describe the circumstances of formation in detail.',
        },
        {
          condition: 'no_performance_described',
          message:
            'Describe how you performed your obligations under the contract. One of the four required elements of breach of contract in Texas is that the plaintiff performed or tendered performance.',
        },
      ],
    },
    claims: {
      required: ['breach_type'],
      warnings: [
        {
          condition: 'no_specific_terms_breached',
          message:
            'Identify which specific terms or provisions of the contract were breached. Vague allegations like "defendant breached the contract" are insufficient — specify what was promised and what actually happened.',
        },
        {
          condition: 'no_breach_date',
          message:
            'Include the date or time period when the breach occurred. This is important for statute of limitations analysis — 4 years for written contracts (TX CPRC §16.004) and 2 years for oral contracts (TX CPRC §16.003).',
        },
      ],
    },
    relief: {
      required: [],
      warnings: [
        {
          condition: 'no_attorneys_fees_requested',
          message:
            'Texas CPRC §38.001 allows recovery of attorney\'s fees for breach of oral or written contracts. Consider requesting attorney\'s fees even if you are self-represented — the statute permits reasonable fees.',
        },
        {
          condition: 'no_specific_performance_considered',
          message:
            'If the subject of the contract involves real property or unique goods, consider requesting specific performance (court-ordered completion of the contract) in addition to or instead of money damages.',
        },
      ],
    },
  },

  glossary: [
    {
      term: 'Breach of Contract',
      plainEnglish:
        'When one party fails to do what they promised in a contract. In Texas, you must prove four things: (1) a valid contract existed, (2) you performed your part, (3) the other side failed to perform, and (4) you suffered damages as a result.',
    },
    {
      term: 'Statute of Limitations',
      plainEnglish:
        'A legal deadline for filing a lawsuit. In Texas, you have 4 years from the breach to sue on a written contract (TX CPRC §16.004) and 2 years for an oral contract (TX CPRC §16.003). After that, the claim is time-barred.',
    },
    {
      term: 'Specific Performance',
      plainEnglish:
        'A court order requiring the breaching party to actually do what they promised, instead of just paying money. Texas courts grant this mainly for real estate deals or contracts involving unique goods that money cannot replace.',
    },
    {
      term: 'Consequential Damages',
      plainEnglish:
        'Losses that result indirectly from the breach — for example, lost profits from a business deal that fell through because the other side did not deliver on time. These must have been foreseeable when the contract was signed.',
    },
    {
      term: 'Mitigation of Damages',
      plainEnglish:
        'Your legal duty to take reasonable steps to reduce your losses after a breach. For example, if a contractor walks off the job, you must try to hire a replacement at a reasonable price rather than letting the project sit idle and damages pile up.',
    },
    {
      term: 'Material Breach',
      plainEnglish:
        'A breach so serious that it goes to the heart of the contract and defeats the purpose of the agreement. A material breach excuses the other party from further performance. A minor breach does not — you must still perform and can only sue for the difference.',
    },
    {
      term: 'Attorney\'s Fees (CPRC §38.001)',
      plainEnglish:
        'Texas law allows the winning party in a breach of contract case to recover reasonable attorney\'s fees from the losing party. This applies to both written and oral contracts. You can request fees even if you represent yourself.',
    },
    {
      term: 'Verification',
      plainEnglish:
        'A sworn statement at the end of your petition confirming the facts are true. Think of it as signing under oath. It adds credibility and may be required for certain types of emergency relief.',
    },
    {
      term: 'Certificate of Service',
      plainEnglish:
        'A short statement proving you sent a copy of your filing to the other side. Texas courts require this on every document you file (TRCP Rule 21a).',
    },
  ],
} as const satisfies JurisdictionRuleConfig
