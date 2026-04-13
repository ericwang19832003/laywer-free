import type { JurisdictionRuleConfig } from '../schema'

export const nyContract = {
  state: 'NY',
  disputeType: 'contract',

  requiredSections: [
    {
      id: 'caption',
      label: 'Caption',
      description:
        'Case caption identifying the court, parties, and index number. Must name the correct court (Small Claims, Civil Court, or Supreme Court) based on the amount in controversy.',
      legalElements: [
        'Court name (Small Claims Court ≤$10K, NYC Civil Court ≤$25K, Supreme Court unlimited)',
        'County where action is brought (CPLR §503 — defendant\'s residence or place of business)',
        'Plaintiff name and address',
        'Defendant name and address',
        'Index number placeholder (assigned by clerk at filing)',
      ],
      minParagraphs: 1,
    },
    {
      id: 'contract_description',
      label: 'Contract Description',
      description:
        'A detailed description of the contract at issue, including the parties, date, subject matter, and key terms. Under NY General Obligations Law §5-701 (Statute of Frauds), certain contracts must be in writing to be enforceable.',
      legalElements: [
        'Date of the contract (or approximate date if oral)',
        'Parties to the contract',
        'Subject matter and key terms of the agreement',
        'Whether the contract is written or oral (GOL §5-701 Statute of Frauds analysis)',
        'Consideration exchanged by each party',
        'Any modifications or amendments to the original contract',
      ],
      minParagraphs: 2,
    },
    {
      id: 'breach_allegations',
      label: 'Breach Allegations',
      description:
        'Specific factual allegations establishing each element of a breach of contract claim under New York law. Must be pleaded with specificity per CPLR §3015(a).',
      legalElements: [
        'Existence of a valid and enforceable contract',
        'Performance by the plaintiff (or excuse for non-performance)',
        'Breach by the defendant — identify the specific contractual provisions violated',
        'Damages resulting from the breach — causal connection between breach and harm',
        'Specificity of allegations as required by CPLR §3015(a)',
      ],
      minParagraphs: 3,
    },
    {
      id: 'damages',
      label: 'Damages',
      description:
        'Itemized statement of all damages sought, including actual damages, consequential damages, and pre-judgment interest at 9% per annum under CPLR §5004. Attorney\'s fees are generally NOT recoverable in New York unless the contract provides for them or a statute authorizes them.',
      legalElements: [
        'Actual (direct) damages — the benefit of the bargain or out-of-pocket losses',
        'Consequential damages — foreseeable losses flowing from the breach (Hadley v. Baxendale standard)',
        'Pre-judgment interest at 9% per annum from date of breach (CPLR §5004)',
        'Liquidated damages if specified in the contract (enforceable if a reasonable estimate of anticipated damages)',
        'Attorney\'s fees only if contractual provision or statute authorizes (not default under NY law)',
        'Specific performance for real property or unique goods where monetary damages are inadequate',
      ],
      minParagraphs: 2,
    },
    {
      id: 'verification',
      label: 'Verification',
      description:
        'A sworn statement that the facts in the complaint are true and correct. While not always required in NY Supreme Court, verification is necessary if you want the option of accelerated judgment on an instrument under CPLR §3213.',
      legalElements: [
        'Statement that the facts set forth are true to the knowledge of the signer',
        'Signed under penalty of perjury under the laws of the State of New York',
        'Notarization if required by the specific court',
      ],
      minParagraphs: 1,
    },
    {
      id: 'proof_of_service',
      label: 'Proof of Service',
      description:
        'Proof that a copy of the summons and complaint was properly served on the defendant in accordance with CPLR Article 3 (personal service, substituted service, or service by mail and filing).',
      legalElements: [
        'Date of service',
        'Method of service (personal delivery per CPLR §308(1), substituted service per CPLR §308(2), or nail-and-mail per CPLR §308(4))',
        'Name and address of the person served',
        'Affidavit of service signed by the process server',
      ],
      minParagraphs: 1,
    },
  ],

  filingRules: {
    courtName:
      'Small Claims Court (claims ≤$10,000), NYC Civil Court (claims ≤$25,000), or Supreme Court (unlimited jurisdiction)',
    serviceRequirements:
      'Must serve defendant via personal delivery (CPLR §308(1)), substituted service (CPLR §308(2)), or nail-and-mail (CPLR §308(4)). Service by mail alone is generally insufficient for commencing an action.',
    filingFee:
      '~$45 for Civil Court, ~$210 for Supreme Court (fee waiver available via Poor Person Application under CPLR §1101)',
    maxPages: 30,
    fontRequirements: '12-point minimum for body text',
    marginRequirements: '1-inch margins on all sides',
    copies: 2,
    localFormUrl: 'https://www.nycourts.gov/forms/',
  },

  rejectionReasons: [
    {
      reason: 'Insufficient specificity in pleading contract terms',
      howToAvoid:
        'Under CPLR §3015(a), conditions precedent to a contract claim must be pleaded specifically. Identify the contract date, parties, key terms, and the specific provisions breached.',
      wizardStep: 'facts',
    },
    {
      reason: 'Statute of Frauds violation — oral contract for covered category',
      howToAvoid:
        'Under NY General Obligations Law §5-701, contracts that cannot be performed within one year, contracts for the sale of goods over $500 (UCC §2-201), and real property contracts must be in writing. If your contract falls into a covered category, you must attach the written agreement.',
      wizardStep: 'facts',
    },
    {
      reason: 'Wrong court or venue selected',
      howToAvoid:
        'Verify venue under CPLR §503 — file in the county where the defendant resides or regularly transacts business. Confirm the court tier matches your claim amount: Small Claims ≤$10K, Civil Court ≤$25K, Supreme Court for larger amounts.',
      wizardStep: 'venue',
    },
    {
      reason: 'Missing or incorrect index number',
      howToAvoid:
        'Include the index number from the court clerk in your caption. If not yet assigned, write "Index No. ____________" and the clerk will assign it at filing.',
      wizardStep: 'parties',
    },
    {
      reason: 'Improper service of process',
      howToAvoid:
        'New York requires personal service under CPLR Article 3 to commence an action. Service by regular mail alone is insufficient. Use a professional process server and obtain a signed affidavit of service.',
      wizardStep: 'review',
    },
  ],

  stepValidations: {
    facts: {
      required: ['contract_date'],
      warnings: [
        {
          condition: 'no_contract_copy_attached',
          message:
            'If you have a written contract, attach a copy. If the contract is oral, be prepared to prove its terms through witness testimony or other evidence. Under NY GOL §5-701 (Statute of Frauds), certain contracts must be in writing to be enforceable.',
        },
        {
          condition: 'statute_of_frauds_risk',
          message:
            'Check whether your contract falls under the Statute of Frauds (NY GOL §5-701). Contracts that cannot be performed within one year, real property contracts, and sale of goods over $500 (UCC §2-201) must be in writing. An oral contract in a covered category may be unenforceable.',
        },
        {
          condition: 'sol_approaching',
          message:
            'The statute of limitations for breach of contract in New York is 6 years (CPLR §213(2)). If the breach occurred more than 5 years ago, file promptly to avoid being time-barred.',
        },
      ],
    },
    claims: {
      required: ['breach_type'],
      warnings: [
        {
          condition: 'insufficient_pleading_specificity',
          message:
            'Under CPLR §3015(a), contract claims must be pleaded with specificity. Identify the exact contract provisions breached, when the breach occurred, and how the defendant failed to perform.',
        },
        {
          condition: 'accelerated_judgment_available',
          message:
            'If your claim is based on an instrument (promissory note, guarantee, or other document for the payment of money only), you may be eligible for accelerated judgment under CPLR §3213. This can significantly shorten the litigation timeline.',
        },
      ],
    },
    relief: {
      required: [],
      warnings: [
        {
          condition: 'pre_judgment_interest_omitted',
          message:
            'Under CPLR §5004, you are entitled to pre-judgment interest at 9% per annum from the date of the breach. Include this in your damages calculation — it can substantially increase your recovery.',
        },
        {
          condition: 'attorney_fees_not_contractual',
          message:
            'In New York, attorney\'s fees are generally NOT recoverable unless the contract contains a fee-shifting provision or a specific statute authorizes them. Do not claim attorney\'s fees without a contractual or statutory basis.',
        },
      ],
    },
  },

  glossary: [
    {
      term: 'Breach of Contract',
      plainEnglish:
        'When one party fails to do what they promised in a contract. In New York, you must prove four things: (1) a valid contract existed, (2) you performed your part, (3) the other side failed to perform, and (4) you suffered damages as a result.',
    },
    {
      term: 'Statute of Limitations',
      plainEnglish:
        'A legal deadline for filing a lawsuit. In New York, you have 6 years to sue for breach of contract (CPLR §213(2)). After that, the court will dismiss your case as time-barred, no matter how strong it is.',
    },
    {
      term: 'Specific Performance',
      plainEnglish:
        'A court order forcing the other party to do what they promised, instead of just paying money. In New York, this is usually only available for real property or unique goods where money cannot make you whole.',
    },
    {
      term: 'Consequential Damages',
      plainEnglish:
        'Losses that flow indirectly from the breach — for example, lost profits or costs you incurred because the other party did not perform. These must have been reasonably foreseeable at the time the contract was made.',
    },
    {
      term: 'Statute of Frauds',
      plainEnglish:
        'A rule under NY General Obligations Law §5-701 that requires certain contracts to be in writing to be enforceable. This includes contracts that cannot be completed within one year, real property contracts, and sale of goods over $500.',
    },
    {
      term: 'Pre-judgment Interest',
      plainEnglish:
        'Interest that accrues on your damages from the date of the breach until the court enters judgment. In New York, the rate is 9% per year (CPLR §5004). It compensates you for the time value of money you were owed.',
    },
    {
      term: 'Liquidated Damages',
      plainEnglish:
        'A specific dollar amount written into the contract that the parties agree to pay if one side breaches. New York courts enforce these clauses if the amount is a reasonable estimate of anticipated damages, not a penalty.',
    },
    {
      term: 'Mitigation of Damages',
      plainEnglish:
        'Your duty to take reasonable steps to minimize your losses after a breach. For example, if a contractor walks off the job, you should hire a replacement at a reasonable price rather than letting the project sit idle.',
    },
  ],
} as const satisfies JurisdictionRuleConfig
