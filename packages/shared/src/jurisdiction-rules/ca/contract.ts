import type { JurisdictionRuleConfig } from '../schema'

export const caContract = {
  state: 'CA',
  disputeType: 'contract',

  requiredSections: [
    {
      id: 'caption',
      label: 'Caption',
      description:
        'Case caption identifying the court, parties, and case number. Must match the court where the suit is filed.',
      legalElements: [
        'Court name (Small Claims, Limited Civil, or Unlimited Civil)',
        'Plaintiff name (party bringing the breach claim)',
        'Defendant name (party alleged to have breached)',
        'Case number placeholder (assigned by clerk at filing)',
      ],
      minParagraphs: 1,
    },
    {
      id: 'contract_description',
      label: 'Contract Description',
      description:
        'A detailed description of the contract at issue — its type, date of execution, the parties involved, and the material terms. This establishes the existence of a valid, enforceable agreement under California Civil Code §1549–1701.',
      legalElements: [
        'Type of contract (written, oral, implied, service agreement, sale of goods under CA Commercial Code §2-101 et seq.)',
        'Date of execution or formation',
        'Identities of all parties to the contract',
        'Material terms — price, performance obligations, deadlines, payment schedule',
        'Whether consideration was exchanged',
        'Whether the contract falls under the Statute of Frauds (Civil Code §1624) and must be in writing',
      ],
      minParagraphs: 2,
    },
    {
      id: 'breach_allegations',
      label: 'Breach Allegations',
      description:
        'Specific allegations of how the defendant breached the contract. Must identify which terms were violated, what was promised versus what occurred, and when the breach happened. California requires: (1) existence of a valid contract, (2) plaintiff\'s performance or excuse for nonperformance, (3) defendant\'s breach, (4) resulting damages.',
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
        'A statement of the damages sustained as a result of the breach. California Civil Code §3300 provides the measure of damages for breach of contract. The plaintiff has a duty to mitigate damages under Civil Code §3359.',
      legalElements: [
        'Actual (direct) damages — the difference between what was promised and what was received (Civil Code §3300)',
        'Consequential damages — foreseeable losses flowing from the breach (e.g., lost profits, additional costs incurred)',
        'Attorney\'s fees — recoverable if the contract contains a fee provision (Civil Code §1717 makes such provisions reciprocal)',
        'Pre-judgment and post-judgment interest',
        'Specific performance if applicable — available for unique goods or real property (Civil Code §3384–3395)',
        'Quantum meruit — recovery for value of services rendered even without an enforceable contract',
      ],
      minParagraphs: 2,
    },
    {
      id: 'verification',
      label: 'Verification',
      description:
        'A sworn statement that the facts in the complaint are true and correct. Under CCP §446, a verified complaint requires the answer to also be verified.',
      legalElements: [
        'Signed under penalty of perjury under the laws of the State of California',
        'Statement that the facts set forth in the complaint are true and correct to the best of plaintiff\'s knowledge',
      ],
      minParagraphs: 1,
    },
    {
      id: 'proof_of_service',
      label: 'Proof of Service',
      description:
        'Certification that a copy of the complaint and summons was delivered to the opposing party, as required by CCP §415.10–415.50.',
      legalElements: [
        'Date of service',
        'Method of service (personal service, substituted service, service by mail with acknowledgment, or service by publication)',
        'Name and address of the party served',
      ],
      minParagraphs: 1,
    },
  ],

  filingRules: {
    courtName:
      'Small Claims Court (claims up to $10,000), Limited Civil Court ($10,001–$25,000), or Unlimited Civil Court (claims over $25,000)',
    serviceRequirements:
      'Must serve defendant via personal service (CCP §415.10), substituted service (CCP §415.20), or service by mail with acknowledgment of receipt (CCP §415.30). Service by publication allowed only with court order (CCP §415.50).',
    filingFee:
      'Approximately $75 for Limited Civil cases; approximately $435 for Unlimited Civil cases. Fee waiver available for qualifying low-income litigants (Form FW-001).',
    maxPages: 25,
    fontRequirements: '12-point minimum for body text in all civil courts',
    marginRequirements: '1-inch margins on all sides',
    copies: 2,
    localFormUrl: 'https://www.courts.ca.gov/forms.htm',
  },

  rejectionReasons: [
    {
      reason: 'Contract not adequately described',
      howToAvoid:
        'Include the type of contract (written, oral, implied), date of execution, the parties, and the material terms. Attach a copy of the written contract as an exhibit if available. If the contract must be in writing under the Statute of Frauds (Civil Code §1624), explain why it qualifies.',
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
        'State a specific dollar amount for actual damages. If claiming consequential damages, explain how they were foreseeable and quantify them. Reference Civil Code §3300 for the measure of damages.',
      wizardStep: 'relief',
    },
    {
      reason: 'Missing verification paragraph',
      howToAvoid:
        'Include a signed verification stating that the facts in the complaint are true and correct under penalty of perjury.',
      wizardStep: 'review',
    },
    {
      reason: 'No proof of service attached',
      howToAvoid:
        'Attach a proof of service showing the date, method, and recipient of service per CCP §415.10–415.50.',
      wizardStep: 'review',
    },
    {
      reason: 'Incorrect venue',
      howToAvoid:
        'File in the county where the defendant resides or where the contract was to be performed (CCP §395). State the basis for venue in the complaint.',
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
            'Describe how you performed your obligations under the contract. One of the four required elements of breach of contract in California is that the plaintiff performed or tendered performance.',
        },
      ],
    },
    claims: {
      required: ['breach_type'],
      warnings: [
        {
          condition: 'no_statute_of_frauds_analysis',
          message:
            'If the contract involves real property, goods over $500, or agreements that cannot be performed within one year, it may be subject to the Statute of Frauds (Civil Code §1624) and must be in writing to be enforceable.',
        },
        {
          condition: 'no_specific_terms_breached',
          message:
            'Identify which specific terms or provisions of the contract were breached. Vague allegations like "defendant breached the contract" are insufficient — specify what was promised and what actually happened.',
        },
      ],
    },
    relief: {
      required: [],
      warnings: [
        {
          condition: 'no_attorneys_fees_analysis',
          message:
            'Under California Civil Code §1717, if the contract contains an attorney\'s fees provision, the prevailing party is entitled to recover reasonable fees — even if the provision only names one party. Review your contract for a fee clause.',
        },
        {
          condition: 'no_specific_performance_considered',
          message:
            'If the contract involves real property or unique goods, consider requesting specific performance (Civil Code §3384–3395) in addition to or instead of money damages.',
        },
      ],
    },
  },

  glossary: [
    {
      term: 'Breach of Contract',
      plainEnglish:
        'When one party fails to do what they promised in a contract. In California, you must prove four things: (1) a valid contract existed, (2) you performed your part or were excused from performing, (3) the other side failed to perform, and (4) you suffered damages as a result.',
    },
    {
      term: 'Statute of Limitations',
      plainEnglish:
        'A legal deadline for filing a lawsuit. In California, you have 4 years from the breach to sue on a written contract (CCP §337) and 2 years for an oral contract (CCP §339). After that, the claim is time-barred.',
    },
    {
      term: 'Specific Performance',
      plainEnglish:
        'A court order requiring the breaching party to actually do what they promised, instead of just paying money. California courts grant this for real estate deals or contracts involving unique goods that money cannot replace (Civil Code §3384–3395).',
    },
    {
      term: 'Consequential Damages',
      plainEnglish:
        'Losses that result indirectly from the breach — for example, lost profits from a business deal that fell through because the other side did not deliver on time. These must have been foreseeable when the contract was signed.',
    },
    {
      term: 'Mitigation of Damages',
      plainEnglish:
        'Your legal duty to take reasonable steps to reduce your losses after a breach (Civil Code §3359). For example, if a contractor walks off the job, you must try to hire a replacement at a reasonable price rather than letting the project sit idle.',
    },
    {
      term: 'Material Breach',
      plainEnglish:
        'A breach so serious that it goes to the heart of the contract and defeats the purpose of the agreement. A material breach excuses the other party from further performance. A minor breach does not — you must still perform and can only sue for the difference.',
    },
    {
      term: 'Attorney\'s Fees (Civil Code §1717)',
      plainEnglish:
        'If your contract has a clause allowing one party to recover attorney\'s fees, California law makes that clause reciprocal — whichever side wins can recover fees, even if the clause only named one party.',
    },
    {
      term: 'Quantum Meruit',
      plainEnglish:
        'A Latin term meaning "as much as deserved." It allows you to recover the reasonable value of services you provided even if there was no enforceable written contract. Courts use this to prevent unjust enrichment.',
    },
    {
      term: 'Statute of Frauds (Civil Code §1624)',
      plainEnglish:
        'A law requiring certain types of contracts to be in writing to be enforceable — including real estate deals, agreements that cannot be performed within one year, and sales of goods over $500. An oral agreement on these topics generally cannot be enforced.',
    },
  ],
} as const satisfies JurisdictionRuleConfig
