import type { JurisdictionRuleConfig } from '../schema'

export const nyRealEstate = {
  state: 'NY',
  disputeType: 'real_estate',

  requiredSections: [
    {
      id: 'caption',
      label: 'Caption',
      description:
        'Case caption identifying the Supreme Court, county, parties, and index number. Real property actions must be brought in Supreme Court (NY Constitution Art. VI §7).',
      legalElements: [
        'Supreme Court, State of New York, County of [county where property is located]',
        'Plaintiff name (property owner, buyer, or homeowner in foreclosure defense)',
        'Defendant name (adverse claimant, seller, lender, or co-op/condo board)',
        'Index number placeholder (assigned by county clerk at filing)',
      ],
      minParagraphs: 1,
    },
    {
      id: 'property_description',
      label: 'Property Description',
      description:
        'Legal description of the real property at issue. Must include enough detail to identify the property in county land records.',
      legalElements: [
        'Street address of the property',
        'County where the property is located',
        'Block and lot number (from tax map or deed)',
        'Section and tax map designation if applicable',
        'Type of property (single-family, co-op, condo, multi-family)',
      ],
      minParagraphs: 1,
    },
    {
      id: 'facts',
      label: 'Statement of Facts',
      description:
        'Chronological narrative of the real estate transaction, property defects, fraud, or foreclosure circumstances. Include dates, parties involved, and specific conduct giving rise to the claims.',
      legalElements: [
        'Date of transaction or contract of sale',
        'Identity of all parties to the transaction (buyer, seller, broker, lender)',
        'Description of property defects, title issues, or fraudulent conduct',
        'Timeline of discovery of issues (important for statute of limitations)',
        'Any disclosure or non-disclosure by seller (Property Condition Disclosure Act, RPL §462-467)',
        'For foreclosure: date of default, pre-foreclosure notices received, and loss mitigation efforts',
      ],
      minParagraphs: 3,
    },
    {
      id: 'claims',
      label: 'Claims / Causes of Action',
      description:
        'Each cause of action must be stated as a separate count with the legal basis and factual support. Common claims include fraud, breach of warranty, PCDA violation, GBL §349 deceptive practices, quiet title (RPAPL Art. 15), and foreclosure defenses.',
      legalElements: [
        'Fraud — intentional misrepresentation of material fact regarding property condition or title (CPLR §213(8), 6-year SOL)',
        'Breach of warranty of habitability or express warranty in contract of sale',
        'Property Condition Disclosure Act violation — seller failed to provide disclosure or provided false disclosure (RPL §462-467)',
        'GBL §349 — deceptive business practices in real estate transaction (NY Gen. Bus. Law §349)',
        'Quiet title — action to compel determination of claims to real property (RPAPL Article 15)',
        'Foreclosure defense — challenging standing, compliance with pre-foreclosure requirements (Banking Law §6-l), or CPLR §3408 mandatory settlement conference',
        'Co-op/condo claims — breach of proprietary lease, violation of business judgment rule, or discrimination',
      ],
      minParagraphs: 3,
    },
    {
      id: 'damages',
      label: 'Damages / Relief Requested',
      description:
        'Specific relief sought, including monetary damages, specific performance, declaratory judgment, or injunctive relief. Real property actions may include lis pendens filing (CPLR §6501).',
      legalElements: [
        'Compensatory damages (cost of repairs, diminution in value, out-of-pocket losses)',
        'Specific performance of contract of sale (equity remedy)',
        'Declaratory judgment on title or ownership rights',
        'Injunctive relief (restraining order against foreclosure sale or construction)',
        'Lis pendens / notice of pendency (CPLR §6501) to put future purchasers on notice',
        'Attorney fees if authorized by contract or statute (GBL §349 allows reasonable attorney fees)',
        'Treble damages under GBL §349 (up to $1,000 statutory or actual damages)',
      ],
      minParagraphs: 2,
    },
    {
      id: 'verification',
      label: 'Verification',
      description:
        'A sworn statement that the facts in the petition are true and correct. Verification is required for certain real property actions under CPLR §3020-3023.',
      legalElements: [
        'Signed under penalty of perjury under the laws of the State of New York',
        'Statement that the facts set forth are true to the best of the petitioner\'s knowledge, information, and belief',
      ],
      minParagraphs: 1,
    },
    {
      id: 'proof_of_service',
      label: 'Proof of Service',
      description:
        'Affidavit or certification that all parties were served in accordance with CPLR Article 3 (personal service) or as directed by the court.',
      legalElements: [
        'Date of service',
        'Method of service (personal delivery, substituted service, or service by publication per CPLR §308)',
        'Name and address of each party served',
        'For lis pendens: proof of filing with county clerk (CPLR §6501)',
      ],
      minParagraphs: 1,
    },
  ],

  filingRules: {
    courtName:
      'Supreme Court, State of New York (exclusive jurisdiction for real property actions)',
    serviceRequirements:
      'Personal service required under CPLR §308 (personal delivery, leave-and-mail, or nail-and-mail with court permission). Service by publication available for unknown defendants with court order.',
    filingFee:
      '$210 index number filing fee (poor person relief available under CPLR §1101 to waive fees)',
    maxPages: 30,
    fontRequirements: 'No specific font requirement, but 12-point minimum is standard practice',
    marginRequirements: '1-inch margins on all sides',
    copies: 3,
    localFormUrl: 'https://www.nycourts.gov/forms/index.shtml',
  },

  rejectionReasons: [
    {
      reason: 'Missing property description (block/lot)',
      howToAvoid:
        'Include the full legal description of the property — street address, county, and block/lot number from the deed or tax records. The court needs this to identify the real property at issue.',
      wizardStep: 'facts',
    },
    {
      reason: 'Wrong court — filed outside Supreme Court',
      howToAvoid:
        'Real property actions in New York must be filed in Supreme Court. Do not file in Civil Court, District Court, or Small Claims Court for title, foreclosure, or property disputes.',
      wizardStep: 'venue',
    },
    {
      reason: 'Wrong venue — filed in wrong county',
      howToAvoid:
        'Under CPLR §507, venue for real property actions is mandatory in the county where the property is located. File in the county where the real property sits, not where you live.',
      wizardStep: 'venue',
    },
    {
      reason: 'Missing verification',
      howToAvoid:
        'Include a signed verification under CPLR §3020-3023. Certain real property pleadings require verification — include it to avoid rejection.',
      wizardStep: 'review',
    },
    {
      reason: 'No lis pendens filed with property claim',
      howToAvoid:
        'If you are asserting a claim that affects title or possession, file a notice of pendency (lis pendens) with the county clerk under CPLR §6501. This is not required but strongly recommended to protect your interest.',
      wizardStep: 'relief',
    },
    {
      reason: 'Insufficient service of process',
      howToAvoid:
        'Serve all defendants personally under CPLR §308. If a defendant cannot be found, apply for alternative service (substituted or by publication). Attach proof of service.',
      wizardStep: 'review',
    },
  ],

  stepValidations: {
    facts: {
      required: ['transaction_date'],
      warnings: [
        {
          condition: 'no_title_search_mentioned',
          message:
            'Consider mentioning whether a title search was performed. Title defects, liens, and encumbrances are central to many real property claims and a title search establishes the chain of ownership.',
        },
        {
          condition: 'no_property_condition_issues',
          message:
            'If the property has physical defects, describe them in detail. Under the Property Condition Disclosure Act (RPL §462-467), the seller must disclose known conditions — or pay a $500 credit at closing in lieu of disclosure.',
        },
        {
          condition: 'no_foreclosure_timeline',
          message:
            'For foreclosure defense: include the date of default, dates of pre-foreclosure notices, and any loss mitigation attempts. New York requires mandatory settlement conferences under CPLR §3408 for residential foreclosures.',
        },
      ],
    },
    claims: {
      required: ['claim_type'],
      warnings: [
        {
          condition: 'pcda_credit_vs_disclosure',
          message:
            'Under the NY Property Condition Disclosure Act, sellers may choose to pay a $500 credit at closing instead of providing a disclosure form. If the seller paid the credit, a PCDA non-disclosure claim may be weaker — focus on fraud or GBL §349 instead.',
        },
        {
          condition: 'no_mandatory_settlement_conference',
          message:
            'In residential foreclosure cases, CPLR §3408 requires mandatory settlement conferences. If the lender did not comply, this is a strong procedural defense. Note whether a conference was held or requested.',
        },
        {
          condition: 'no_standing_challenge_in_foreclosure',
          message:
            'In foreclosure defense, consider challenging the lender\'s standing — the plaintiff must prove it held or was assigned the note and mortgage at the time the action was commenced.',
        },
      ],
    },
    relief: {
      required: [],
      warnings: [
        {
          condition: 'no_specific_performance_requested',
          message:
            'If seeking to enforce a real estate contract, specific performance is the standard equitable remedy because each parcel of land is considered unique. Consider requesting it.',
        },
        {
          condition: 'no_lis_pendens_mentioned',
          message:
            'Consider filing a notice of pendency (lis pendens) under CPLR §6501 to put third parties on notice of your claim. This prevents the property from being sold to a bona fide purchaser without notice during litigation.',
        },
      ],
    },
    parties: {
      required: [],
      warnings: [
        {
          condition: 'no_doe_defendants',
          message:
            'In real property actions, consider naming "John Doe" and "Jane Doe" defendants for unknown parties who may claim an interest in the property. You can amend to add their real names later.',
        },
      ],
    },
  },

  glossary: [
    {
      term: 'Deed',
      plainEnglish:
        'The legal document that transfers ownership of real property from one person to another. It must be signed, notarized, and recorded with the county clerk to be effective against third parties.',
    },
    {
      term: 'Title',
      plainEnglish:
        'Your legal right to own, use, and sell a property. A "clear title" means no one else has a competing claim. A title search checks public records to verify this before you buy.',
    },
    {
      term: 'Foreclosure (Judicial)',
      plainEnglish:
        'The legal process where a lender sues in court to take your property because you stopped making mortgage payments. New York is a judicial foreclosure state — the lender must file a lawsuit and get a court order before selling your home.',
    },
    {
      term: 'Lis Pendens (Notice of Pendency)',
      plainEnglish:
        'A public notice filed with the county clerk warning that a lawsuit affecting a specific property is pending. Under CPLR §6501, it puts anyone who might buy the property on notice of your claim.',
    },
    {
      term: 'Specific Performance',
      plainEnglish:
        'A court order forcing the other side to go through with a real estate deal instead of just paying money damages. Courts grant this because every piece of land is considered unique — money alone cannot replace it.',
    },
    {
      term: 'Mortgage',
      plainEnglish:
        'A loan secured by your property. If you stop paying, the lender can foreclose. In New York, the mortgage document is recorded with the county clerk and creates a lien on the property.',
    },
    {
      term: 'Co-op / Condo',
      plainEnglish:
        'Two common ways to own an apartment in New York. In a co-op, you own shares in a corporation that owns the building and you get a proprietary lease. In a condo, you own your individual unit outright plus a share of common areas.',
    },
    {
      term: 'Property Condition Disclosure Act (PCDA)',
      plainEnglish:
        'A New York law (RPL §462-467) requiring home sellers to give buyers a written disclosure of known property defects before closing. If the seller does not provide the form, the buyer gets a $500 credit at closing — but may still sue for fraud if defects were concealed.',
    },
    {
      term: 'Mandatory Settlement Conference',
      plainEnglish:
        'A court-supervised meeting required in residential foreclosure cases under CPLR §3408. The homeowner and lender must negotiate in good faith to explore alternatives to foreclosure, such as loan modification or repayment plans.',
    },
  ],
} as const satisfies JurisdictionRuleConfig
