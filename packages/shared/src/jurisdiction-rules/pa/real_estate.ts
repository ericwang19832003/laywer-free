import type { JurisdictionRuleConfig } from '../schema'

export const paRealEstate = {
  state: 'PA',
  disputeType: 'real_estate',

  requiredSections: [
    {
      id: 'caption',
      label: 'Caption',
      description:
        'Case caption identifying the Court of Common Pleas, county, parties, and docket number. Venue lies in the county where the real property is located (Pa.R.C.P. 1006(a)).',
      legalElements: [
        'Court of Common Pleas — county where the property is located',
        'Plaintiff name (property owner, buyer, or aggrieved party)',
        'Defendant name (seller, lender, HOA, or other party)',
        'Docket number placeholder (assigned by Prothonotary at filing)',
      ],
      minParagraphs: 1,
    },
    {
      id: 'property_description',
      label: 'Property Description',
      description:
        'Legal description of the real property at issue, including address, parcel number, and county. This establishes venue and identifies the property for any lis pendens filing under Pa.R.C.P. 1531.',
      legalElements: [
        'Street address and municipality',
        'County where the property is located',
        'Tax parcel or UPI number',
        'Legal description (metes and bounds or lot/block from deed)',
      ],
      minParagraphs: 1,
    },
    {
      id: 'facts',
      label: 'Statement of Facts',
      description:
        'Chronological recitation of the facts giving rise to the claim. Must include the transaction date and all material events related to the property dispute.',
      legalElements: [
        'Date of the real estate transaction (agreement of sale, closing, or mortgage origination)',
        'Parties involved and their roles (buyer, seller, lender, agent, HOA)',
        'Timeline of events leading to the dispute',
        'Any notices sent or received (Act 91 notice, seller disclosure form, HOA violations)',
      ],
      minParagraphs: 3,
    },
    {
      id: 'claims',
      label: 'Claims',
      description:
        'Legal causes of action asserted against the defendant. Each claim must identify the applicable statute or common-law basis and the facts supporting it.',
      legalElements: [
        'Fraud in real property transaction — 42 Pa.C.S. §5524 (2-year SOL)',
        'Seller Disclosure Act violations — 68 P.S. §7101-7601 (failure to disclose known defects)',
        'Act 91 defense — 41 P.S. §101-605 (lender failed to provide 30-day notice or offer meeting before foreclosure)',
        'Breach of warranty — implied or express warranty of habitability or title',
        'HOA/Condominium disputes — 68 Pa.C.S. §3101-3414 (Uniform Condominium Act) or §5101-5414 (Uniform Planned Community Act)',
        'Breach of contract — 42 Pa.C.S. §5525 (4-year SOL)',
      ],
      minParagraphs: 3,
    },
    {
      id: 'damages',
      label: 'Damages',
      description:
        'Itemization of all damages sought, including compensatory, consequential, and any statutory damages available under the applicable statutes.',
      legalElements: [
        'Compensatory damages (cost of repairs, diminution in value, out-of-pocket losses)',
        'Consequential damages (relocation costs, lost rental income)',
        'Statutory damages if available under the Seller Disclosure Act',
        'Specific performance (if seeking to compel completion of a real estate contract)',
        'Attorney fees if authorized by statute or contract',
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
      'Court of Common Pleas (exclusive jurisdiction over real property disputes in Pennsylvania)',
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
      reason: 'Missing or incomplete property description',
      howToAvoid:
        'Include the full legal description of the property (address, county, parcel number, metes and bounds or lot/block). This is required for lis pendens filings under Pa.R.C.P. 1531.',
      wizardStep: 'facts',
    },
    {
      reason: 'Wrong venue — filed in incorrect county',
      howToAvoid:
        'Real property actions must be filed in the county where the property is located (Pa.R.C.P. 1006(a)). Verify the county before filing.',
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
      required: ['transaction_date'],
      warnings: [
        {
          condition: 'no_seller_disclosure_mentioned',
          message:
            'If you purchased residential property, note whether you received a Seller Disclosure form. Under the Real Estate Seller Disclosure Act (68 P.S. §7101-7601), sellers must disclose known material defects. Failure to provide the form is itself a violation.',
        },
        {
          condition: 'no_act_91_notice_mentioned',
          message:
            'If this involves a mortgage foreclosure, note whether the lender sent a 30-day Act 91 notice (41 P.S. §101-605) and offered a face-to-face meeting. Failure to comply is a defense to foreclosure.',
        },
      ],
    },
    claims: {
      required: ['claim_type'],
      warnings: [
        {
          condition: 'no_specific_disclosure_defect',
          message:
            'If raising a Seller Disclosure Act claim, specify which defects were not disclosed (e.g., structural damage, water intrusion, environmental hazards). Specificity strengthens your pleading.',
        },
        {
          condition: 'no_hemap_application_mentioned',
          message:
            'If facing foreclosure, consider whether you applied for or were denied HEMAP assistance (35 P.S. §1680.401c-1680.409c). HEMAP provides emergency mortgage assistance that may delay or prevent foreclosure.',
        },
      ],
    },
    parties: {
      required: [],
      warnings: [
        {
          condition: 'no_property_county_identified',
          message:
            'Identifying the county where the property is located is critical — it determines venue (Pa.R.C.P. 1006(a)). Include this when identifying the parties and property.',
        },
      ],
    },
  },

  glossary: [
    {
      term: 'Deed',
      plainEnglish:
        'The legal document that transfers ownership of real property from one person to another. In Pennsylvania, deeds must be recorded in the county recorder of deeds office to be effective against third parties.',
    },
    {
      term: 'Title',
      plainEnglish:
        'Your legal right to own and use property. Title insurance protects against defects in the chain of ownership. A title search checks for liens, easements, and other claims against the property.',
    },
    {
      term: 'Foreclosure (Judicial)',
      plainEnglish:
        'Pennsylvania is a judicial foreclosure state, meaning the lender must file a lawsuit and get a court order before selling your home. This gives you the right to appear in court and raise defenses.',
    },
    {
      term: 'Lis Pendens',
      plainEnglish:
        'A public notice filed with the court (under Pa.R.C.P. 1531) warning that a lawsuit affecting the property is pending. It alerts potential buyers or lenders that the property is in dispute.',
    },
    {
      term: 'Specific Performance',
      plainEnglish:
        'A court order forcing a party to complete a real estate transaction as promised in the contract. Courts use this because every piece of real property is considered unique.',
    },
    {
      term: 'Mortgage',
      plainEnglish:
        'A loan secured by real property. If you stop making payments, the lender can foreclose — but in Pennsylvania, they must go through the court system and comply with Act 91 notice requirements first.',
    },
    {
      term: 'Act 91 Notice',
      plainEnglish:
        'Under the Homeowner\'s Emergency Mortgage Assistance Act (41 P.S. §101-605), your lender must send you a written notice at least 30 days before filing foreclosure. The notice must tell you about your right to a meeting and about HEMAP assistance. Failure to send this notice is a defense to foreclosure.',
    },
    {
      term: 'HEMAP (Homeowner\'s Emergency Mortgage Assistance Program)',
      plainEnglish:
        'A Pennsylvania state program (35 P.S. §1680.401c-1680.409c) that provides emergency loans to homeowners facing foreclosure due to circumstances beyond their control, such as job loss or illness. Applying for HEMAP can delay foreclosure proceedings.',
    },
    {
      term: 'Seller Disclosure Act',
      plainEnglish:
        'Pennsylvania law (68 P.S. §7101-7601) requiring residential property sellers to complete a disclosure form listing known material defects — things like foundation problems, water damage, or lead paint. If the seller lies or fails to disclose, you may have a legal claim.',
    },
    {
      term: 'Condominium / HOA',
      plainEnglish:
        'Condominiums are governed by the Uniform Condominium Act (68 Pa.C.S. §3101-3414) and planned communities (HOAs) by the Uniform Planned Community Act (68 Pa.C.S. §5101-5414). These laws regulate assessments, common areas, governance, and your rights as an owner.',
    },
  ],
} as const satisfies JurisdictionRuleConfig
