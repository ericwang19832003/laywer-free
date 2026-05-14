import type { JurisdictionRuleConfig } from '../schema'

export const flRealEstate = {
  state: 'FL',
  disputeType: 'real_estate',

  requiredSections: [
    {
      id: 'caption',
      label: 'Caption',
      description:
        'Case caption identifying the Circuit Court, parties, and case number. All real property actions in Florida must be filed in Circuit Court.',
      legalElements: [
        'Court name (Circuit Court of the ___ Judicial Circuit, in and for ___ County, Florida)',
        'Plaintiff name',
        'Defendant name',
        'Case number placeholder (assigned by clerk at filing)',
      ],
      minParagraphs: 1,
    },
    {
      id: 'property_description',
      label: 'Property Description',
      description:
        'Legal description and address of the real property at issue. Florida real property actions require a specific description of the property sufficient for identification.',
      legalElements: [
        'Street address and county',
        'Legal description (lot, block, subdivision, or metes and bounds)',
        'Parcel identification number (if available)',
        'Recording information for relevant deeds (Official Records Book and Page)',
      ],
      minParagraphs: 1,
    },
    {
      id: 'facts',
      label: 'Statement of Facts',
      description:
        'Chronological recitation of facts giving rise to the dispute. Must include the transaction date, parties involved, and the nature of the property interest at issue.',
      legalElements: [
        'Date and nature of the real estate transaction',
        'Parties to the transaction and their roles',
        'Material representations made by seller or other party',
        'Discovery of defects, fraud, or breach',
        'Efforts to resolve the dispute before litigation',
      ],
      minParagraphs: 3,
    },
    {
      id: 'claims',
      label: 'Claims / Causes of Action',
      description:
        'Each count must be separately stated with the legal basis and elements. Florida requires fact pleading — ultimate facts supporting each element of the claim.',
      legalElements: [
        'Foreclosure defense — challenging standing, notice, or acceleration under FL Stat. §702',
        'Fraud in the inducement — misrepresentation of material fact, reliance, and damages (4-year SOL under FL Stat. §95.11(3)(j))',
        'HOA/Condo disputes — violations of FL Stat. §718 (Condominium Act) or §720 (HOA Act)',
        'FDUTPA claim — deceptive or unfair trade practice under FL Stat. §501.201 et seq.',
        'Seller disclosure violations — failure to disclose known defects under FL Stat. §689.25',
        'Lis pendens — notice of pending litigation affecting title under FL Stat. §48.23',
      ],
      minParagraphs: 3,
    },
    {
      id: 'damages',
      label: 'Damages',
      description:
        'Itemized statement of damages sought, including actual damages, consequential damages, and any statutory remedies. FDUTPA permits attorney fees and declaratory/injunctive relief.',
      legalElements: [
        'Actual damages (diminution in value, cost of repair, out-of-pocket losses)',
        'Consequential damages (relocation costs, lost rental income)',
        'Statutory damages under FDUTPA (attorney fees and costs under FL Stat. §501.2105)',
        'Specific performance (where appropriate for real estate contracts)',
        'Declaratory and injunctive relief',
      ],
      minParagraphs: 2,
    },
    {
      id: 'verification',
      label: 'Verification',
      description:
        'A sworn statement that the facts alleged in the complaint are true and correct. Foreclosure-related filings require verification under FL R. Civ. P. 1.110(b).',
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
      'Circuit Court (all real property actions in Florida must be filed in Circuit Court)',
    serviceRequirements:
      'Must serve all parties via e-mail (preferred), hand delivery, or U.S. mail per FL R. Civ. P. 1.080. E-mail service is mandatory for represented parties registered with the Florida Courts E-Filing Portal.',
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
      reason: 'Missing property description',
      howToAvoid:
        'Include a complete legal description of the property (lot, block, subdivision or metes and bounds) and the street address. Real property actions require identification of the specific property at issue.',
      wizardStep: 'facts',
    },
    {
      reason: 'Filed in wrong court or wrong county',
      howToAvoid:
        'All real property actions must be filed in Circuit Court in the county where the property is located (FL Stat. §47.011). Venue is mandatory for real estate disputes.',
      wizardStep: 'venue',
    },
    {
      reason: 'Missing verification',
      howToAvoid:
        'Include a signed verification under penalty of perjury. Foreclosure-related matters require verification under FL R. Civ. P. 1.110(b).',
      wizardStep: 'review',
    },
    {
      reason: 'No certificate of service',
      howToAvoid:
        'Attach a certificate of service showing the date, method, and recipient of service per FL R. Civ. P. 1.080.',
      wizardStep: 'review',
    },
    {
      reason: 'Failure to note mandatory mediation requirement',
      howToAvoid:
        'Florida requires mandatory mediation in foreclosure actions under FL R. Civ. P. 1.110. Reference the mediation requirement and your willingness to participate.',
      wizardStep: 'claims',
    },
  ],

  stepValidations: {
    facts: {
      required: ['transaction_date'],
      warnings: [
        {
          condition: 'no_property_description',
          message:
            'Include a full legal description of the property (lot/block/subdivision or metes and bounds). Florida real property actions require the property to be specifically identified.',
        },
        {
          condition: 'no_disclosure_timeline',
          message:
            'Note when you discovered the defect or issue. Florida\'s statute of limitations for fraud is 4 years from discovery (FL Stat. §95.11(3)(j)), and 5 years for foreclosure (FL Stat. §95.11(2)(c)).',
        },
      ],
    },
    claims: {
      required: ['claim_type'],
      warnings: [
        {
          condition: 'no_specific_statute_cited',
          message:
            'Cite the specific Florida statute supporting your claim (e.g., §718 for condo disputes, §720 for HOA, §702 for foreclosure defense, §689.25 for disclosure). Specificity strengthens your pleading.',
        },
        {
          condition: 'no_fdutpa_elements',
          message:
            'If raising a FDUTPA claim (FL Stat. §501.201), specify the deceptive or unfair act, your reliance, and the actual damages suffered. FDUTPA allows attorney fees to the prevailing party.',
        },
      ],
    },
    parties: {
      required: [],
      warnings: [
        {
          condition: 'no_hoa_entity_identified',
          message:
            'If your dispute involves an HOA or condo association, identify the association by its registered name and include the management company if applicable.',
        },
      ],
    },
  },

  glossary: [
    {
      term: 'Deed',
      plainEnglish:
        'The legal document that transfers ownership of real property from one person to another. In Florida, deeds must be signed, witnessed by two people, and recorded in the county\'s Official Records (FL Stat. §689).',
    },
    {
      term: 'Title',
      plainEnglish:
        'Your legal right to own and use the property. A "clear title" means no one else has a competing claim. Title insurance protects against hidden defects in title.',
    },
    {
      term: 'Foreclosure (Judicial)',
      plainEnglish:
        'The legal process where a lender asks a court to force the sale of your home because you missed mortgage payments. Florida is a judicial foreclosure state — the lender must file a lawsuit and get a court order (FL Stat. §702).',
    },
    {
      term: 'Lis Pendens',
      plainEnglish:
        'A recorded notice that a lawsuit is pending that affects title to real property. Once recorded, anyone who buys the property takes it subject to the outcome of the lawsuit (FL Stat. §48.23).',
    },
    {
      term: 'Specific Performance',
      plainEnglish:
        'A court order forcing someone to complete a real estate contract as promised, rather than just paying money damages. Courts often grant this for real estate because every property is considered unique.',
    },
    {
      term: 'Mortgage',
      plainEnglish:
        'A loan secured by your property. If you stop making payments, the lender can foreclose. In Florida, the lender must go through the court system to foreclose (judicial foreclosure).',
    },
    {
      term: 'HOA / Condominium Association',
      plainEnglish:
        'An organization that manages a residential community and enforces its rules. Florida has specific laws governing HOAs (FL Stat. §720) and condo associations (FL Stat. §718), including disclosure requirements and dispute resolution procedures.',
    },
    {
      term: 'FDUTPA (Florida Deceptive and Unfair Trade Practices Act)',
      plainEnglish:
        'A Florida consumer protection law (FL Stat. §501.201) that prohibits deceptive or unfair business practices, including in real estate transactions. If you win, you can recover attorney fees and costs.',
    },
    {
      term: 'Mandatory Mediation',
      plainEnglish:
        'A court-required process where both sides meet with a neutral mediator to try to settle the case before trial. Florida requires mediation in foreclosure cases (FL R. Civ. P. 1.110). You must participate in good faith.',
    },
  ],
} as const satisfies JurisdictionRuleConfig
