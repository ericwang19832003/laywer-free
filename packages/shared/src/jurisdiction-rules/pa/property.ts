import type { JurisdictionRuleConfig } from '../schema'

export const paProperty = {
  state: 'PA',
  disputeType: 'property',

  requiredSections: [
    {
      id: 'caption',
      label: 'Caption',
      description:
        'Case caption identifying the court, parties, and docket number. Must name the Court of Common Pleas or Magisterial District Court in the county where the property is located.',
      legalElements: [
        'Court name (Magisterial District Court or Court of Common Pleas)',
        'Plaintiff name (property owner or possessor)',
        'Defendant name (alleged trespasser, converter, or responsible party)',
        'Docket number placeholder (assigned by clerk at filing)',
      ],
      minParagraphs: 1,
    },
    {
      id: 'facts',
      label: 'Statement of Facts',
      description:
        'A clear narrative of the property dispute including a description of the property, the nature of the damage or interference, and the dates of relevant events. Photos and repair estimates should be referenced as exhibits.',
      legalElements: [
        'Description and location of the property (address, legal description, or identifying details for personal property)',
        'Plaintiff\'s ownership or right to possession',
        'Date(s) of the incident or discovery of damage',
        'Nature and extent of damage, trespass, conversion, or nuisance',
        'Efforts to mitigate or document the damage (photographs, repair estimates, police reports)',
      ],
      minParagraphs: 3,
    },
    {
      id: 'liability_basis',
      label: 'Liability Basis',
      description:
        'The legal theories supporting the claim. Pennsylvania recognizes multiple causes of action for property disputes including trespass, negligence, conversion, and nuisance.',
      legalElements: [
        'Trespass to real property — unauthorized entry or physical invasion (42 Pa.C.S. §5524, 2-year SOL)',
        'Negligent property damage — duty, breach, causation, and damages',
        'Conversion of personal property — unauthorized exercise of dominion over another\'s property (42 Pa.C.S. §5524(3), 2-year SOL)',
        'Private nuisance — unreasonable interference with use and enjoyment of property (common law; 42 Pa.C.S. §5524, 2-year SOL)',
        'Criminal trespass — civil recovery for unlawful entry (18 Pa.C.S. §3503)',
        'Criminal mischief — civil recovery for intentional damage (18 Pa.C.S. §3304)',
      ],
      minParagraphs: 2,
    },
    {
      id: 'damages',
      label: 'Damages',
      description:
        'Specific monetary relief sought, including repair costs, replacement value, diminished value, and loss of use during the repair period.',
      legalElements: [
        'Cost of repair or restoration to pre-damage condition',
        'Diminished value of property after repair (if applicable)',
        'Fair market replacement value (if property is destroyed or converted)',
        'Loss of use during repair period',
        'Court costs and reasonable attorney\'s fees (if authorized by statute or contract)',
      ],
      minParagraphs: 2,
    },
    {
      id: 'verification',
      label: 'Verification',
      description:
        'A sworn statement that the facts in the complaint are true and correct. Under Pa.R.C.P. 1024, all pleadings containing averments of fact must be verified.',
      legalElements: [
        'Signed under penalty of perjury under the laws of the Commonwealth of Pennsylvania',
        'Statement that the facts set forth in the complaint are true and correct to the best of plaintiff\'s knowledge, information, and belief (Pa.R.C.P. 1024)',
      ],
      minParagraphs: 1,
    },
    {
      id: 'certificate_of_service',
      label: 'Certificate of Service',
      description:
        'Certification that a copy of the complaint was delivered to the opposing party or their attorney, as required by Pa.R.C.P. 440.',
      legalElements: [
        'Date of service',
        'Method of service (personal service, certified mail, or first class mail per Pa.R.C.P. 440)',
        'Name and address of the party or attorney served',
      ],
      minParagraphs: 1,
    },
  ],

  filingRules: {
    courtName:
      'Magisterial District Court (claims up to $12,000) or Court of Common Pleas (unlimited jurisdiction)',
    serviceRequirements:
      'Must serve all parties via personal service or mail per Pa.R.C.P. 400-441. In Magisterial District Court, service is by first class mail (Pa.R.C.P.M.D.J. 305).',
    filingFee:
      'Approximately $50 for Magisterial District Court; $100-300 for Court of Common Pleas (In Forma Pauperis fee waiver available per Pa.R.C.P. 240)',
    maxPages: 25,
    marginRequirements: '1-inch margins on all sides',
    copies: 2,
    localFormUrl: 'https://www.pacourts.us/forms',
  },

  rejectionReasons: [
    {
      reason: 'Missing property description',
      howToAvoid:
        'Include a clear description of the property at issue — street address for real property or identifying details for personal property. Attach photos as exhibits if available.',
      wizardStep: 'facts',
    },
    {
      reason: 'No incident date specified',
      howToAvoid:
        'State the specific date(s) of the damage, trespass, or conversion. If the exact date is unknown, provide the approximate date and explain how you discovered the damage.',
      wizardStep: 'facts',
    },
    {
      reason: 'No liability theory identified',
      howToAvoid:
        'Specify at least one legal theory (trespass, negligence, conversion, nuisance) and cite the supporting statute.',
      wizardStep: 'claims',
    },
    {
      reason: 'Damages not itemized',
      howToAvoid:
        'Break down damages into specific categories: repair costs, diminished value, replacement cost, loss of use. Attach repair estimates or appraisals as exhibits.',
      wizardStep: 'relief',
    },
    {
      reason: 'Missing verification paragraph',
      howToAvoid:
        'Include a signed verification stating that the facts in the complaint are true and correct per Pa.R.C.P. 1024.',
      wizardStep: 'review',
    },
    {
      reason: 'No certificate of service attached',
      howToAvoid:
        'Attach a certificate of service showing the date, method, and recipient of service per Pa.R.C.P. 440.',
      wizardStep: 'review',
    },
    {
      reason: 'Filed in wrong county',
      howToAvoid:
        'Property disputes must be filed in the county where the property is located or where the defendant resides (Pa.R.C.P. 1006). Verify venue before filing.',
      wizardStep: 'venue',
    },
  ],

  stepValidations: {
    facts: {
      required: ['incident_date'],
      warnings: [
        {
          condition: 'no_damage_documentation',
          message:
            'Document all damage with photographs, video, or written descriptions before filing. Courts give significant weight to contemporaneous evidence of the property\'s condition.',
        },
        {
          condition: 'no_repair_estimate',
          message:
            'Obtain at least one written repair estimate or appraisal. This establishes the baseline for your damages claim and helps the court assess the amount in controversy.',
        },
        {
          condition: 'no_police_report_mentioned',
          message:
            'If the damage was caused by criminal conduct (trespass under 18 Pa.C.S. §3503 or criminal mischief under 18 Pa.C.S. §3304), note whether a police report was filed. A police report strengthens your civil recovery claim.',
        },
      ],
    },
    claims: {
      required: ['liability_type'],
      warnings: [
        {
          condition: 'no_ownership_proof',
          message:
            'Be prepared to prove your ownership or right to possession. For real property, this means a deed or lease. For personal property, receipts, registration, or other documentation of ownership.',
        },
        {
          condition: 'no_statute_of_limitations_check',
          message:
            'Verify that your claim is within the statute of limitations: 2 years for trespass, conversion, and property damage (42 Pa.C.S. §5524). Claims filed after the deadline will be dismissed.',
        },
      ],
    },
    relief: {
      required: [],
      warnings: [
        {
          condition: 'no_repair_vs_replacement_specified',
          message:
            'Specify whether you are seeking repair costs or replacement value. If the property can be repaired, damages are typically measured by the cost of repair plus any diminished value. If destroyed, damages are the fair market value at the time of loss.',
        },
      ],
    },
  },

  glossary: [
    {
      term: 'Trespass',
      plainEnglish:
        'Entering someone else\'s property or placing something on it without permission. In Pennsylvania, you have 2 years from the trespass to file a lawsuit (42 Pa.C.S. §5524). Criminal trespass under 18 Pa.C.S. §3503 can also support a civil recovery claim.',
    },
    {
      term: 'Conversion',
      plainEnglish:
        'Taking or using someone else\'s personal property without their permission in a way that denies the owner\'s rights. For example, refusing to return borrowed equipment. Pennsylvania gives you 2 years to sue for conversion (42 Pa.C.S. §5524(3)).',
    },
    {
      term: 'Nuisance',
      plainEnglish:
        'An unreasonable interference with your use and enjoyment of your property. Examples include excessive noise, pollution, or a neighbor\'s activity that makes your property unusable. Private nuisance is a common law claim in Pennsylvania with a 2-year statute of limitations (42 Pa.C.S. §5524).',
    },
    {
      term: 'Diminished Value',
      plainEnglish:
        'The loss in market value of property even after it has been repaired. For example, a car that was in an accident may be worth less than an identical car with no accident history, even after full repair.',
    },
    {
      term: 'Property Damage',
      plainEnglish:
        'Physical harm to real property (land, buildings) or personal property (vehicles, equipment, belongings). The owner can recover the cost of repair or replacement, whichever is appropriate.',
    },
    {
      term: 'Statute of Limitations',
      plainEnglish:
        'A legal deadline for filing a lawsuit. Miss it and your case is dismissed regardless of its merits. In Pennsylvania, property damage, trespass, and conversion all have a 2-year limit (42 Pa.C.S. §5524).',
    },
    {
      term: 'Loss of Use',
      plainEnglish:
        'Compensation for the period during which your property was unusable due to damage. For example, if your car is in the shop for two weeks, you can claim the cost of a rental car during that period.',
    },
  ],
} as const satisfies JurisdictionRuleConfig
