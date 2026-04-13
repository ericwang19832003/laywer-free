import type { JurisdictionRuleConfig } from '../schema'

export const txRealEstate = {
  state: 'TX',
  disputeType: 'real_estate',

  requiredSections: [
    {
      id: 'caption',
      label: 'Caption',
      description:
        'Case caption identifying the court, parties, and cause number. Title disputes and other real property actions must be filed in the District Court of the county where the property is located (TX CPRC §15.011).',
      legalElements: [
        'Court name (District Court — exclusive jurisdiction for title disputes)',
        'County where real property is located (mandatory venue, TX CPRC §15.011)',
        'Plaintiff name (property owner, buyer, or aggrieved party)',
        'Defendant name (adverse claimant, seller, HOA, or mortgage servicer)',
        'Cause number placeholder (assigned by clerk at filing)',
      ],
      minParagraphs: 1,
    },
    {
      id: 'property_description',
      label: 'Property Description',
      description:
        'Full legal description of the real property at issue. Texas courts require specificity when adjudicating property rights — a street address alone is insufficient.',
      legalElements: [
        'Full legal description from the deed or survey (lot, block, subdivision, or metes and bounds)',
        'Street address and county',
        'Survey or plat reference (if applicable)',
        'Tax parcel or property ID number (if available)',
      ],
      minParagraphs: 1,
    },
    {
      id: 'facts',
      label: 'Facts',
      description:
        'Chronological narrative of the transaction, defect, or dispute. Include dates, parties involved, and how the problem arose. For fraud claims, plead with particularity (TX R. Civ. P. 91a).',
      legalElements: [
        'Date and nature of the real estate transaction or event',
        'Parties to the transaction (buyer, seller, lender, title company, HOA)',
        'Description of the defect, fraud, or adverse claim',
        'Actions taken to resolve the dispute before litigation',
        'Copies or references to deed, contract, or title policy',
      ],
      minParagraphs: 3,
    },
    {
      id: 'claims',
      label: 'Claims',
      description:
        'Legal causes of action arising from the real estate dispute. Each claim must identify the statutory or common-law basis and the elements the plaintiff must prove.',
      legalElements: [
        'Trespass to try title (TX Property Code §22.001) — to resolve competing title claims',
        'Breach of warranty of title — seller conveyed defective title',
        'Fraud in a real estate transaction (TX CPRC §16.004 — 4-year SOL)',
        'DTPA violations in real estate (TX Bus. & Com. Code §27) — deceptive practices by seller, agent, or title company',
        'Wrongful foreclosure or defective foreclosure process (TX Property Code §51)',
        'HOA enforcement disputes (TX Property Code §209)',
        'Quiet title — remove cloud on title',
      ],
      minParagraphs: 2,
    },
    {
      id: 'damages',
      label: 'Damages',
      description:
        'Itemized statement of financial harm. Texas allows actual damages, diminished property value, mental anguish (if fraud), and treble damages under the DTPA.',
      legalElements: [
        'Purchase price or fair market value of the property',
        'Cost of title defect cure or additional title insurance',
        'Diminished property value due to encumbrance or defect',
        'Out-of-pocket losses (legal fees to clear title, lost rent, relocation costs)',
        'Treble damages under DTPA (TX Bus. & Com. Code §27.01) if applicable',
        'Exemplary damages for fraud (TX CPRC §41.003)',
      ],
      minParagraphs: 2,
    },
    {
      id: 'verification',
      label: 'Verification',
      description:
        'A sworn statement that the facts in the petition are true and correct. Verified petitions are standard in real property actions and may be required for trespass to try title.',
      legalElements: [
        'Signed under penalty of perjury under the laws of the State of Texas',
        'Statement that the facts set forth are true and correct to the best of plaintiff\'s knowledge',
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
      'District Court of the county where the real property is located (exclusive jurisdiction for title disputes; mandatory venue under TX CPRC §15.011)',
    serviceRequirements:
      'Must serve all parties via citation issued by the clerk and served by a constable, sheriff, or authorized process server per TRCP Rules 99-107. For unknown defendants in title actions, service by publication may be required (TRCP Rule 109).',
    filingFee:
      'Approximately $300–$350 for District Court filing (fee waiver available via Statement of Inability to Afford Payment of Court Costs, TX Gov\'t Code §6.001)',
    maxPages: 30,
    fontRequirements: '14-point minimum for body text recommended; check local rules',
    marginRequirements: '1-inch margins on all sides',
    copies: 2,
    localFormUrl: 'https://www.txcourts.gov/rules-forms/forms/',
  },

  rejectionReasons: [
    {
      reason: 'Missing or incomplete legal description of the property',
      howToAvoid:
        'Include the full legal description (lot, block, subdivision or metes and bounds) from the deed or survey. A street address alone is insufficient for real property actions.',
      wizardStep: 'facts',
    },
    {
      reason: 'Filed in wrong county',
      howToAvoid:
        'Real property actions must be filed in the county where the land is located (TX CPRC §15.011 — mandatory venue). Verify the property address and file in that county\'s District Court.',
      wizardStep: 'venue',
    },
    {
      reason: 'Missing verification paragraph',
      howToAvoid:
        'Include a signed verification stating that the facts in the petition are true and correct under penalty of perjury. Trespass to try title actions typically require verification.',
      wizardStep: 'review',
    },
    {
      reason: 'No certificate of service attached',
      howToAvoid:
        'Attach a certificate of service showing the date, method, and recipient of service per TRCP Rule 21a.',
      wizardStep: 'review',
    },
    {
      reason: 'Fraud claim not pleaded with particularity',
      howToAvoid:
        'Texas requires fraud claims to be pleaded with specificity — state who made the misrepresentation, what was said, when, and how you relied on it to your detriment.',
      wizardStep: 'claims',
    },
    {
      reason: 'No lis pendens filed',
      howToAvoid:
        'For title disputes, file a lis pendens notice in the county real property records to put third parties on notice of the pending litigation (TX Property Code §12.007).',
      wizardStep: 'how_to_file',
    },
  ],

  stepValidations: {
    facts: {
      required: ['transaction_date'],
      warnings: [
        {
          condition: 'no_deed_or_contract_copy_mentioned',
          message:
            'Attach or reference copies of the deed, purchase contract, or title policy. These documents are critical evidence in real estate disputes and courts expect them.',
        },
        {
          condition: 'no_property_defect_description',
          message:
            'Describe the specific defect, encumbrance, or adverse claim affecting the property. Vague allegations weaken your petition — be specific about what is wrong with the title or transaction.',
        },
      ],
    },
    claims: {
      required: ['claim_type'],
      warnings: [
        {
          condition: 'no_title_search_referenced',
          message:
            'Reference a title search or title commitment showing the defect or competing claim. A title search from a reputable title company strengthens your pleading.',
        },
        {
          condition: 'no_recording_history_described',
          message:
            'Describe the recording history of the deed or lien in the county real property records (TX Property Code §12). Gaps in the chain of title support title defect claims.',
        },
      ],
    },
    relief: {
      required: [],
      warnings: [
        {
          condition: 'no_specific_performance_vs_damages_analysis',
          message:
            'Consider whether you seek specific performance (e.g., transfer of title, removal of lien) or monetary damages, or both. In real estate cases, specific performance is often the preferred remedy because each parcel of land is considered unique.',
        },
      ],
    },
  },

  glossary: [
    {
      term: 'Deed',
      plainEnglish:
        'A legal document that transfers ownership of real property from one person to another. In Texas, deeds must be in writing and recorded in the county clerk\'s office to protect the buyer\'s rights.',
    },
    {
      term: 'Title',
      plainEnglish:
        'Your legal right to own, use, and sell a piece of property. A "clear title" means no one else has a competing claim. A "clouded title" means there is a defect or dispute that must be resolved.',
    },
    {
      term: 'Foreclosure',
      plainEnglish:
        'The legal process where a lender takes back property because the borrower stopped making mortgage payments. In Texas, most foreclosures are non-judicial — the lender can sell the property at public auction without going to court (TX Property Code §51).',
    },
    {
      term: 'Lis Pendens',
      plainEnglish:
        'A public notice filed in the county records that warns everyone a lawsuit is pending over a piece of property. It prevents the property from being sold to an innocent buyer while the case is active (TX Property Code §12.007).',
    },
    {
      term: 'Specific Performance',
      plainEnglish:
        'A court order forcing someone to complete a real estate deal as promised in the contract. Courts use this remedy because every piece of land is unique — money damages alone may not be enough.',
    },
    {
      term: 'Deed of Trust',
      plainEnglish:
        'The document that gives a lender a security interest in your property when you take out a mortgage. In Texas, the deed of trust allows non-judicial foreclosure if you default on the loan.',
    },
    {
      term: 'HOA Lien',
      plainEnglish:
        'A claim placed on your property by a homeowners association for unpaid dues or assessments. Under TX Property Code §209, the HOA can foreclose on the lien, but must follow specific notice and procedural requirements.',
    },
    {
      term: 'Adverse Possession',
      plainEnglish:
        'A way to gain legal ownership of someone else\'s land by openly occupying it for a statutory period (3, 5, 10, or 25 years in Texas, depending on the circumstances — TX CPRC §16.024–16.025). The occupant must use the land openly, continuously, and without the owner\'s permission.',
    },
    {
      term: 'Trespass to Try Title',
      plainEnglish:
        'A Texas lawsuit to determine who legally owns a piece of property. It is the proper legal action when two or more people claim ownership of the same land (TX Property Code §22).',
    },
    {
      term: 'DTPA (Deceptive Trade Practices Act)',
      plainEnglish:
        'A Texas consumer protection law (TX Bus. & Com. Code §27) that prohibits deceptive or misleading practices. In real estate, it can be used against sellers, agents, or title companies who misrepresent the condition or status of a property. Successful plaintiffs may recover treble damages.',
    },
  ],
} as const satisfies JurisdictionRuleConfig
