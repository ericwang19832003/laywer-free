import type { JurisdictionRuleConfig } from '../schema'

export const paContract = {
  state: 'PA',
  disputeType: 'contract',

  requiredSections: [
    {
      id: 'caption',
      label: 'Caption',
      description:
        'Case caption identifying the court, parties, and docket number. Must match the court where the complaint is filed.',
      legalElements: [
        'Court name (Magisterial District Court, Court of Common Pleas)',
        'Plaintiff name',
        'Defendant name',
        'Docket number placeholder (assigned by Prothonotary at filing)',
        'Civil action designation',
      ],
      minParagraphs: 1,
    },
    {
      id: 'contract_description',
      label: 'Contract Description',
      description:
        'A detailed description of the contract at issue, including the parties, date of formation, subject matter, and key terms. Must establish the existence of a valid, enforceable agreement.',
      legalElements: [
        'Identification of the contracting parties',
        'Date of contract formation',
        'Subject matter and essential terms of the agreement',
        'Whether the contract is written, oral, or implied',
        'Consideration exchanged by both parties',
        'Statute of Frauds compliance if applicable (33 P.S. §1)',
      ],
      minParagraphs: 2,
    },
    {
      id: 'breach_allegations',
      label: 'Breach Allegations',
      description:
        'Specific allegations of how the defendant breached the contract. Must identify the contractual obligations and how the defendant failed to perform.',
      legalElements: [
        'Existence of a valid agreement between the parties',
        'Plaintiff\'s performance or justification for non-performance',
        'Defendant\'s specific breach — which terms or obligations were violated',
        'Causal connection between the breach and plaintiff\'s damages',
        'Whether breach is material or partial',
      ],
      minParagraphs: 3,
    },
    {
      id: 'damages',
      label: 'Damages',
      description:
        'Itemized statement of all damages sought as a result of the breach. Pennsylvania follows the American Rule — attorney\'s fees are not recoverable unless the contract provides or a statute authorizes them.',
      legalElements: [
        'Direct/compensatory damages — the benefit of the bargain',
        'Consequential damages — foreseeable losses flowing from the breach',
        'Incidental damages — costs incurred in responding to the breach',
        'Pre-judgment interest at the legal rate of 6% per annum (41 P.S. §202)',
        'Attorney\'s fees only if contract contains a fee-shifting provision (American Rule applies)',
        'Specific performance if monetary damages are inadequate',
      ],
      minParagraphs: 2,
    },
    {
      id: 'verification',
      label: 'Verification',
      description:
        'A sworn statement that the facts in the complaint are true and correct. Required under Pa.R.C.P. 1024.',
      legalElements: [
        'Statement that the facts set forth are true and correct to the best of the verifier\'s knowledge, information, and belief',
        'Acknowledgment that false statements are subject to penalties under 18 Pa.C.S. §4904 (unsworn falsification to authorities)',
      ],
      minParagraphs: 1,
    },
    {
      id: 'certificate_of_service',
      label: 'Certificate of Service',
      description:
        'Certification that a copy of the complaint was served on all opposing parties or their counsel, as required by Pa.R.C.P. 440.',
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
      'Magisterial District Court (claims $12,000 and under); Court of Common Pleas (unlimited jurisdiction)',
    serviceRequirements:
      'Original process must be served by the sheriff or a competent adult per Pa.R.C.P. 400-405. Subsequent filings served by first-class mail, personal delivery, or electronic means per Pa.R.C.P. 440.',
    filingFee:
      '$100-$300 for Court of Common Pleas (varies by county); lower fees for Magisterial District Court; in forma pauperis (IFP) petition available per Pa.R.C.P. 240',
    maxPages: 30,
    fontRequirements: '12-point minimum for body text',
    marginRequirements: '1-inch margins on all sides',
    copies: 2,
    localFormUrl: 'https://www.pacourts.us/forms',
  },

  rejectionReasons: [
    {
      reason: 'Missing verification',
      howToAvoid:
        'Include a verification under Pa.R.C.P. 1024 stating the facts are true and correct to the best of your knowledge, information, and belief.',
      wizardStep: 'review',
    },
    {
      reason: 'No certificate of service',
      howToAvoid:
        'Attach a certificate of service showing the date, method, and recipient of service per Pa.R.C.P. 440.',
      wizardStep: 'review',
    },
    {
      reason: 'Wrong venue — complaint filed in incorrect county',
      howToAvoid:
        'File in the county where the defendant resides or where the transaction or occurrence took place. Venue rules are governed by Pa.R.C.P. 1006.',
      wizardStep: 'venue',
    },
    {
      reason: 'Statute of limitations expired',
      howToAvoid:
        'The statute of limitations for contract claims in Pennsylvania is 4 years under 42 Pa.C.S. §5525(a). Ensure the complaint is filed within 4 years of the breach.',
      wizardStep: 'facts',
    },
    {
      reason: 'Contract subject to Statute of Frauds not in writing',
      howToAvoid:
        'Certain contracts must be in writing to be enforceable under the Statute of Frauds (33 P.S. §1) — including contracts for the sale of land, agreements not to be performed within one year, and suretyship. If the contract is oral, verify it is not subject to the Statute of Frauds.',
      wizardStep: 'claims',
    },
  ],

  stepValidations: {
    facts: {
      required: ['contract_date'],
      warnings: [
        {
          condition: 'statute_of_limitations_check',
          message:
            'The statute of limitations for contract claims in Pennsylvania is 4 years for both written and oral contracts under 42 Pa.C.S. §5525(a). Verify the complaint will be filed within 4 years of the breach date.',
        },
        {
          condition: 'no_written_contract_evidence',
          message:
            'If the contract was oral, consider whether the Statute of Frauds (33 P.S. §1) applies. Contracts for the sale of goods over $500 are governed by UCC Article 2 (13 Pa.C.S. §2201).',
        },
      ],
    },
    claims: {
      required: ['breach_type'],
      warnings: [
        {
          condition: 'no_statute_of_frauds_analysis',
          message:
            'If the contract involves the sale of land, performance beyond one year, or suretyship, the Statute of Frauds (33 P.S. §1) may require a writing. Oral contracts for the sale of goods over $500 must satisfy UCC 13 Pa.C.S. §2201.',
        },
        {
          condition: 'confession_of_judgment_clause',
          message:
            'Pennsylvania allows confession of judgment clauses in commercial contracts (Pa.R.C.P. 2950-2974). If the contract contains such a clause, a judgment may be entered without trial. Check whether this remedy is available.',
        },
      ],
    },
    relief: {
      required: [],
      warnings: [
        {
          condition: 'no_prejudgment_interest_analysis',
          message:
            'Pennsylvania allows pre-judgment interest at the legal rate of 6% per annum under 41 P.S. §202. Consider requesting pre-judgment interest from the date of the breach to maximize recovery.',
        },
        {
          condition: 'no_attorneys_fees_analysis',
          message:
            'Pennsylvania follows the American Rule — attorney\'s fees are generally not recoverable unless the contract contains a fee-shifting provision or a statute authorizes them. Review the contract for a fee clause before requesting attorney\'s fees.',
        },
      ],
    },
  },

  glossary: [
    {
      term: 'Breach of Contract',
      plainEnglish:
        'When one party fails to perform their obligations under a contract without a legal excuse. The non-breaching party can sue for damages or, in some cases, ask the court to force performance.',
    },
    {
      term: 'Statute of Limitations',
      plainEnglish:
        'The legal deadline to file a lawsuit. In Pennsylvania, the limit is 4 years for both written and oral contract claims under 42 Pa.C.S. §5525(a). After that, the claim is time-barred.',
    },
    {
      term: 'Specific Performance',
      plainEnglish:
        'A court order requiring the breaching party to actually perform their obligations under the contract, rather than just paying money damages. Typically available when the subject matter is unique (e.g., real estate).',
    },
    {
      term: 'Consequential Damages',
      plainEnglish:
        'Losses that result indirectly from a breach of contract — for example, lost profits or expenses caused by the breach. These are recoverable only if they were reasonably foreseeable at the time the contract was made.',
    },
    {
      term: 'Statute of Frauds',
      plainEnglish:
        'A law (33 P.S. §1) requiring certain contracts to be in writing to be enforceable — including contracts for the sale of land, agreements that cannot be performed within one year, and guarantees. Oral contracts falling under this statute are generally unenforceable.',
    },
    {
      term: 'Confession of Judgment',
      plainEnglish:
        'A clause in a contract that allows the creditor to obtain a court judgment against the debtor without filing a lawsuit or going to trial. Pennsylvania is one of the few states that allows this in commercial contracts (Pa.R.C.P. 2950-2974). It is a powerful collection tool.',
    },
    {
      term: 'Pre-Judgment Interest',
      plainEnglish:
        'Interest that accrues on the amount owed from the date of the breach until the court enters judgment. In Pennsylvania, the legal rate is 6% per annum under 41 P.S. §202. You must request it in your complaint.',
    },
    {
      term: 'Mitigation',
      plainEnglish:
        'The legal duty of the injured party to take reasonable steps to minimize their losses after a breach. You cannot recover damages that you could have reasonably avoided. Courts will reduce your award by the amount you failed to mitigate.',
    },
  ],
} as const satisfies JurisdictionRuleConfig
