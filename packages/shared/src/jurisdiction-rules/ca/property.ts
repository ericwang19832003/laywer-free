import type { JurisdictionRuleConfig } from '../schema'

export const caProperty = {
  state: 'CA',
  disputeType: 'property',

  requiredSections: [
    {
      id: 'caption',
      label: 'Caption',
      description:
        'Case caption identifying the court, parties, and case number. Must name the Superior Court in the county where the property is located.',
      legalElements: [
        'Court name (Small Claims, Limited Civil, or Unlimited Civil division of Superior Court)',
        'Plaintiff name (property owner or possessor)',
        'Defendant name (alleged trespasser, converter, or responsible party)',
        'Case number placeholder (assigned by clerk at filing)',
      ],
      minParagraphs: 1,
    },
    {
      id: 'facts',
      label: 'Statement of Facts',
      description:
        'A clear narrative of the property dispute including a description of the property, the nature of the damage or interference, and the dates of relevant events. Photographs, repair estimates, and police reports should be referenced as exhibits.',
      legalElements: [
        'Description and location of the property (address, APN, or identifying details for personal property)',
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
        'The legal theories supporting the claim. California recognizes multiple causes of action for property disputes including trespass, negligence, conversion, and nuisance.',
      legalElements: [
        'Trespass to real property — unauthorized entry or physical invasion (CA CCP §338(b), 3-year SOL for property damage; §338(c), 3-year SOL for trespass)',
        'Negligent property damage — duty, breach, causation, and damages (CA Civil Code §3333)',
        'Conversion of personal property — unauthorized exercise of dominion over another\'s property (CA CCP §338(c), 3-year SOL)',
        'Private nuisance — substantial and unreasonable interference with use and enjoyment of property (CA Civil Code §3479-3496)',
        'Public nuisance — interference affecting an entire community or neighborhood (CA Civil Code §3480)',
        'Vandalism — civil recovery for intentional property destruction (CA Penal Code §594)',
        'Treble damages for timber trespass — wrongful cutting or removal of trees (CA Civil Code §3346)',
      ],
      minParagraphs: 2,
    },
    {
      id: 'damages',
      label: 'Damages',
      description:
        'Specific monetary relief sought, including repair costs, replacement value, diminished value, loss of use, and any enhanced damages for willful conduct. Damages are measured under CA Civil Code §3333 (diminution in value plus loss of use).',
      legalElements: [
        'Cost of repair or restoration to pre-damage condition',
        'Diminished value of property after repair (if applicable)',
        'Fair market replacement value (if property is destroyed or converted)',
        'Loss of use during repair period (CA Civil Code §3333)',
        'Treble damages for wrongful timber cutting (CA Civil Code §3346)',
        'Court costs and reasonable attorney\'s fees (if authorized by statute or contract)',
      ],
      minParagraphs: 2,
    },
    {
      id: 'verification',
      label: 'Verification',
      description:
        'A sworn statement that the facts in the complaint are true and correct. California Code of Civil Procedure §446 allows verification, which strengthens the pleading.',
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
        'Proof that a copy of the complaint and summons was served on the opposing party, as required by CA CCP §415.10-415.95.',
      legalElements: [
        'Date of service',
        'Method of service (personal service, substituted service, service by mail, or service by publication per CCP §415.10-415.50)',
        'Name and address of the party served',
        'Declaration of the person who performed service',
      ],
      minParagraphs: 1,
    },
  ],

  filingRules: {
    courtName:
      'Small Claims division (claims ≤$10,000), Limited Civil division (claims ≤$25,000), or Unlimited Civil division (claims >$25,000) of the Superior Court',
    serviceRequirements:
      'Must serve all parties via personal service, substituted service, or service by mail with acknowledgment of receipt per CA CCP §415.10-415.95. Service by publication requires court order.',
    filingFee:
      '~$75 for Limited Civil; ~$435 for Unlimited Civil (fee waiver available via Form FW-001 for qualifying individuals)',
    maxPages: 25,
    fontRequirements: 'At least 12-point font for body text per California Rules of Court, rule 2.104',
    marginRequirements: '1-inch margins on all sides per California Rules of Court, rule 2.108',
    copies: 2,
    localFormUrl: 'https://www.courts.ca.gov/forms.htm',
  },

  rejectionReasons: [
    {
      reason: 'Missing property description',
      howToAvoid:
        'Include a clear description of the property at issue — street address or APN for real property, or identifying details for personal property. Attach photos as exhibits if available.',
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
        'Specify at least one legal theory (trespass, negligence, conversion, nuisance) and cite the supporting California statute.',
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
        'Include a signed verification stating that the facts in the complaint are true and correct under penalty of perjury under the laws of California.',
      wizardStep: 'review',
    },
    {
      reason: 'No proof of service attached',
      howToAvoid:
        'Attach a proof of service showing the date, method, and recipient of service per CA CCP §415.10-415.95.',
      wizardStep: 'review',
    },
    {
      reason: 'Filed in wrong county',
      howToAvoid:
        'Property disputes must be filed in the county where the property is located (CCP §392) or where the defendant resides (CCP §395). Verify venue before filing.',
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
            'Obtain at least one written repair estimate or appraisal. This establishes the baseline for your damages claim and helps the court assess the amount in controversy for jurisdictional purposes.',
        },
        {
          condition: 'no_police_report_mentioned',
          message:
            'If the damage was caused by criminal conduct (vandalism under CA Penal Code §594, theft), note whether a police report was filed. A police report strengthens your claim and may support enhanced damages.',
        },
      ],
    },
    claims: {
      required: ['liability_type'],
      warnings: [
        {
          condition: 'no_ownership_proof',
          message:
            'Be prepared to prove your ownership or right to possession. For real property, this means a deed, title report, or lease. For personal property, receipts, registration, or other documentation of ownership.',
        },
        {
          condition: 'no_statute_of_limitations_check',
          message:
            'Verify that your claim is within the statute of limitations: 2 years for injury to personal property (CCP §335.1), 3 years for property damage (CCP §338(b)), 3 years for trespass and conversion (CCP §338(c)). Claims filed after the deadline will be dismissed.',
        },
      ],
    },
    relief: {
      required: [],
      warnings: [
        {
          condition: 'no_repair_vs_replacement_specified',
          message:
            'Specify whether you are seeking repair costs or replacement value. Under CA Civil Code §3333, damages for torts are measured by the diminution in value plus loss of use. If the property can be repaired, damages are typically the cost of repair. If destroyed, damages are the fair market value at the time of loss.',
        },
        {
          condition: 'no_treble_damages_considered',
          message:
            'If the defendant wrongfully cut or removed trees on your property, you may be entitled to treble damages under CA Civil Code §3346. Timber trespass carries enhanced penalties to deter destruction of trees.',
        },
      ],
    },
  },

  glossary: [
    {
      term: 'Trespass',
      plainEnglish:
        'Entering someone else\'s property or placing something on it without permission. In California, you have 3 years from the trespass to file a lawsuit (CCP §338(c)).',
    },
    {
      term: 'Conversion',
      plainEnglish:
        'Taking or using someone else\'s personal property without their permission in a way that denies the owner\'s rights. For example, refusing to return borrowed equipment. California gives you 3 years to sue for conversion (CCP §338(c)).',
    },
    {
      term: 'Nuisance',
      plainEnglish:
        'Anything that interferes with your ability to use and enjoy your property — such as excessive noise, pollution, or blocked access. California Civil Code §3479-3496 governs both private nuisance (affecting you) and public nuisance (affecting a community).',
    },
    {
      term: 'Diminished Value',
      plainEnglish:
        'The loss in market value of property even after it has been repaired. For example, a home with a history of water damage may be worth less than an identical home with no such history, even after full repair.',
    },
    {
      term: 'Property Damage',
      plainEnglish:
        'Physical harm to real property (land, buildings) or personal property (vehicles, equipment, belongings). Under CA Civil Code §3333, the owner can recover the diminution in value plus any loss of use.',
    },
    {
      term: 'Treble Damages',
      plainEnglish:
        'Triple the actual damages, awarded as a penalty. In California, treble damages are available for wrongful cutting or removal of trees on another\'s property under CA Civil Code §3346.',
    },
    {
      term: 'Statute of Limitations',
      plainEnglish:
        'A legal deadline for filing a lawsuit. Miss it and your case is dismissed regardless of its merits. In California, personal property injury has a 2-year limit (CCP §335.1), while property damage, trespass, and conversion have a 3-year limit (CCP §338).',
    },
    {
      term: 'Loss of Use',
      plainEnglish:
        'Compensation for being unable to use your property while it is being repaired or replaced. For example, the cost of a rental car while your vehicle is in the shop, or lost rental income on a damaged property.',
    },
  ],
} as const satisfies JurisdictionRuleConfig
