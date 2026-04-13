import type { JurisdictionRuleConfig } from '../schema'

export const flContract = {
  state: 'FL',
  disputeType: 'contract',

  requiredSections: [
    {
      id: 'caption',
      label: 'Caption',
      description:
        'Case caption identifying the court, parties, and case number. Must specify Small Claims (≤$8K), County Court (≤$50K), or Circuit Court (>$50K) per FL venue rules.',
      legalElements: [
        'Court name (Small Claims, County Court, or Circuit Court)',
        'County where action is filed (FL Stat. §47.011 — defendant resides or breach occurred)',
        'Plaintiff name',
        'Defendant name',
        'Case number placeholder (assigned by clerk at filing)',
      ],
      minParagraphs: 1,
    },
    {
      id: 'contract_description',
      label: 'Contract Description',
      description:
        'A detailed description of the contract at issue, including the parties, date of formation, essential terms, and whether the contract is written or oral. If oral, address Statute of Frauds (FL Stat. §725.01).',
      legalElements: [
        'Parties to the contract',
        'Date of contract formation',
        'Essential terms (price, performance obligations, timeline)',
        'Whether the contract is written or oral',
        'Statute of Frauds compliance if applicable (FL Stat. §725.01)',
        'Attach or reference the written contract if available',
      ],
      minParagraphs: 2,
    },
    {
      id: 'breach_allegations',
      label: 'Breach Allegations',
      description:
        'Specific allegations of how the defendant breached the contract. Must establish all four elements: valid contract, plaintiff\'s performance, defendant\'s breach, and resulting damages.',
      legalElements: [
        'Existence of a valid and enforceable contract',
        'Plaintiff\'s performance or excuse for non-performance',
        'Defendant\'s material breach of specific contract terms',
        'Damages flowing directly from the breach',
      ],
      minParagraphs: 3,
    },
    {
      id: 'damages',
      label: 'Damages',
      description:
        'Itemized statement of all damages claimed, including direct damages, consequential damages, and any contractual remedies. Address attorney\'s fees if the contract contains a fee-shifting provision.',
      legalElements: [
        'Direct/compensatory damages (benefit of the bargain)',
        'Consequential damages (foreseeable at time of contracting)',
        'Incidental damages',
        'Pre-judgment interest (FL Stat. §55.03 statutory rate)',
        'Attorney\'s fees if contract provides (FL prevailing party reciprocity)',
        'Mitigation of damages — steps taken to minimize losses',
      ],
      minParagraphs: 2,
    },
    {
      id: 'verification',
      label: 'Verification',
      description:
        'A sworn statement that the facts alleged in the complaint are true and correct to the best of plaintiff\'s knowledge and belief.',
      legalElements: [
        'Signed under penalty of perjury under the laws of the State of Florida',
        'Statement that the facts set forth are true and correct to the best of plaintiff\'s knowledge',
      ],
      minParagraphs: 1,
    },
    {
      id: 'certificate_of_service',
      label: 'Certificate of Service',
      description:
        'Certification that a copy of the complaint was served on the opposing party or their attorney, as required by FL Rule of Civil Procedure 1.080.',
      legalElements: [
        'Date of service',
        'Method of service (personal service, certified mail, or e-service)',
        'Name and address of the party or attorney served',
      ],
      minParagraphs: 1,
    },
  ],

  filingRules: {
    courtName:
      'Small Claims Court (claims ≤$8,000), County Court (claims ≤$50,000), or Circuit Court (claims >$50,000)',
    serviceRequirements:
      'Must serve all parties via personal service (FL Stat. §48.031), certified mail, or e-service per FL Rule of Civil Procedure 1.080. Initial process requires personal service by sheriff or certified process server.',
    filingFee:
      '~$300 for Circuit Court, ~$175 for County Court, ~$55 for Small Claims (fee waiver available via Application for Determination of Civil Indigent Status)',
    maxPages: 25,
    fontRequirements: '12-point minimum for body text',
    marginRequirements: '1-inch margins on all sides',
    copies: 2,
    localFormUrl: 'https://www.flcourts.gov/Resources-Services/Court-Improvement/Family-Courts/Family-Law-Self-Help-Information/Family-Law-Forms',
  },

  rejectionReasons: [
    {
      reason: 'Missing verification paragraph',
      howToAvoid:
        'Include a signed verification stating that the facts in the complaint are true and correct under penalty of perjury.',
      wizardStep: 'review',
    },
    {
      reason: 'No certificate of service attached',
      howToAvoid:
        'Attach a certificate of service showing the date, method, and recipient of service per FL Rule of Civil Procedure 1.080.',
      wizardStep: 'review',
    },
    {
      reason: 'Filed in wrong court tier',
      howToAvoid:
        'Verify your claim amount: Small Claims ≤$8,000, County Court ≤$50,000, Circuit Court >$50,000. File in the correct court for your damages amount.',
      wizardStep: 'venue',
    },
    {
      reason: 'Statute of limitations expired',
      howToAvoid:
        'Written contracts have a 5-year SOL (FL Stat. §95.11(2)(b)); oral contracts have a 4-year SOL (FL Stat. §95.11(3)(k)). Verify the breach date falls within the applicable window.',
      wizardStep: 'facts',
    },
    {
      reason: 'Statute of Frauds defense not addressed',
      howToAvoid:
        'If the contract is oral and falls within the Statute of Frauds (FL Stat. §725.01) — e.g., contracts for sale of goods >$500, real property, or contracts not performable within one year — address enforceability in your complaint.',
      wizardStep: 'claims',
    },
    {
      reason: 'Frivolous claim exposure under FL Stat. §57.105',
      howToAvoid:
        'Ensure your claim has factual and legal basis. FL Stat. §57.105 allows the court to award attorney\'s fees against a party who raises claims not supported by material facts or existing law.',
      wizardStep: 'claims',
    },
  ],

  stepValidations: {
    facts: {
      required: ['contract_date'],
      warnings: [
        {
          condition: 'no_written_contract_attached',
          message:
            'If the contract is written, attach a copy or describe it in sufficient detail. If oral, be aware of the Statute of Frauds (FL Stat. §725.01) — certain oral contracts are unenforceable without a writing.',
        },
        {
          condition: 'no_performance_described',
          message:
            'Describe how you performed your obligations under the contract. One of the four elements of breach of contract is that the plaintiff performed or had a valid excuse for non-performance.',
        },
      ],
    },
    claims: {
      required: ['breach_type'],
      warnings: [
        {
          condition: 'no_ucc_article_2_analysis',
          message:
            'If this involves a sale of goods, UCC Article 2 (FL Stat. §672) governs, not common law. UCC has different rules for formation, modification, and remedies. Identify whether this is a goods or services contract.',
        },
        {
          condition: 'no_statute_of_frauds_awareness',
          message:
            'The Statute of Frauds (FL Stat. §725.01) requires certain contracts to be in writing: sale of goods >$500, real property transfers, contracts not performable within one year, and guarantees. If your contract is oral and falls into these categories, address enforceability.',
        },
      ],
    },
    relief: {
      required: [],
      warnings: [
        {
          condition: 'no_attorney_fees_clause_check',
          message:
            'If the contract contains an attorney\'s fees provision, Florida follows prevailing party reciprocity — either side can recover fees. Also consider making an offer of judgment under FL Stat. §768.79, which shifts fees if the opposing party rejects the offer and does worse at trial.',
        },
        {
          condition: 'no_offer_of_judgment_strategy',
          message:
            'FL Stat. §768.79 allows an offer of judgment that shifts attorney\'s fees to the rejecting party if the final judgment is at least 25% less favorable than the offer. This is a powerful litigation tool — consider whether to make one.',
        },
      ],
    },
  },

  glossary: [
    {
      term: 'Breach of Contract',
      plainEnglish:
        'When one party fails to perform their obligations under a contract without a legal excuse. You must prove four elements: (1) a valid contract exists, (2) you performed your part, (3) the other party failed to perform, and (4) you suffered damages.',
    },
    {
      term: 'Statute of Limitations',
      plainEnglish:
        'The legal deadline to file a lawsuit. In Florida, the limit is 5 years for written contracts (FL Stat. §95.11(2)(b)) and 4 years for oral contracts (FL Stat. §95.11(3)(k)). After that, the claim is time-barred.',
    },
    {
      term: 'Specific Performance',
      plainEnglish:
        'A court order requiring the breaching party to actually perform the contract instead of just paying damages. Courts grant this when money damages are inadequate — most commonly in real estate transactions where each property is unique.',
    },
    {
      term: 'Consequential Damages',
      plainEnglish:
        'Losses that result indirectly from the breach — for example, lost profits from a business deal that fell through because of the breach. These are recoverable only if they were foreseeable at the time the contract was formed.',
    },
    {
      term: 'Statute of Frauds',
      plainEnglish:
        'A law (FL Stat. §725.01) requiring certain contracts to be in writing to be enforceable: sale of goods over $500, real property transfers, contracts not performable within one year, and guarantees. If your contract is oral and falls into one of these categories, it may be unenforceable.',
    },
    {
      term: 'Attorney\'s Fees',
      plainEnglish:
        'In Florida, each side normally pays their own attorney — unless the contract has a fee-shifting clause. Florida applies prevailing party reciprocity: if the contract lets one side recover fees, both sides can. FL Stat. §57.105 also allows fee awards for frivolous claims.',
    },
    {
      term: 'Offer of Judgment',
      plainEnglish:
        'A formal settlement offer under FL Stat. §768.79. If the other side rejects it and the final judgment is at least 25% less favorable than your offer, the rejecting party must pay your attorney\'s fees from the date of the offer. It\'s a powerful tool to pressure settlement.',
    },
    {
      term: 'Mitigation',
      plainEnglish:
        'Your legal duty to take reasonable steps to minimize your losses after a breach. You cannot sit back and let damages pile up — courts will reduce your award by any amount you could have reasonably avoided.',
    },
  ],
} as const satisfies JurisdictionRuleConfig
