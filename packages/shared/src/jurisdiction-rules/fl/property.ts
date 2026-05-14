import type { JurisdictionRuleConfig } from '../schema'

export const flProperty = {
  state: 'FL',
  disputeType: 'property',

  requiredSections: [
    {
      id: 'caption',
      label: 'Caption',
      description:
        'Case caption identifying the court, parties, and case number. Must name the correct Florida court based on the amount in controversy.',
      legalElements: [
        'Court name (Small Claims ≤$8,000, County Court ≤$50,000, or Circuit Court >$50,000)',
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
        'Description and location of the property (address or identifying details for personal property)',
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
        'The legal theories supporting the claim. Florida recognizes multiple causes of action for property disputes including trespass, negligence, conversion, nuisance, and civil theft.',
      legalElements: [
        'Trespass to real property — unauthorized entry or physical invasion (FL Stat. §95.11(3)(a), 4-year SOL for property damage)',
        'Negligent property damage — duty, breach, causation, and damages (note: personal injury negligence is 2-year post-HB 837, but property damage SOL is 4 years under §95.11(3)(a))',
        'Conversion of personal property — unauthorized exercise of dominion over another\'s property (FL Stat. §95.11(3)(h), 4-year SOL)',
        'Nuisance — substantial and unreasonable interference with use and enjoyment of property (FL Stat. §823.01)',
        'Civil theft — civil remedy for theft with treble damages (FL Stat. §772.11)',
        'Easement and boundary disputes — rights of way and encroachments (FL Stat. §704)',
      ],
      minParagraphs: 2,
    },
    {
      id: 'damages',
      label: 'Damages',
      description:
        'Specific monetary relief sought, including repair costs, replacement value, diminished value, loss of use, and any enhanced damages for willful conduct such as treble damages under FL Stat. §772.11 for civil theft.',
      legalElements: [
        'Cost of repair or restoration to pre-damage condition',
        'Diminished value of property after repair (if applicable)',
        'Fair market replacement value (if property is destroyed or converted)',
        'Loss of use during repair period',
        'Treble damages for civil theft (FL Stat. §772.11 — must send written demand 30 days before filing)',
        'Court costs and reasonable attorney\'s fees (if authorized by statute or contract)',
      ],
      minParagraphs: 2,
    },
    {
      id: 'verification',
      label: 'Verification',
      description:
        'A sworn statement that the facts in the complaint are true and correct. Florida law permits verified complaints, which strengthen the pleading and may support default judgment.',
      legalElements: [
        'Signed under penalty of perjury under the laws of the State of Florida',
        'Statement that the facts set forth in the complaint are true and correct to the best of plaintiff\'s knowledge',
      ],
      minParagraphs: 1,
    },
    {
      id: 'certificate_of_service',
      label: 'Certificate of Service',
      description:
        'Certification that a copy of the complaint was served on the opposing party, as required by FL Rule of Civil Procedure 1.070.',
      legalElements: [
        'Date of service',
        'Method of service (personal service or certified mail per FL R. Civ. P. 1.070)',
        'Name and address of the party served',
      ],
      minParagraphs: 1,
    },
  ],

  filingRules: {
    courtName:
      'Small Claims Court (claims ≤$8,000), County Court (claims ≤$50,000), or Circuit Court (claims >$50,000) per FL Stat. §34.01',
    serviceRequirements:
      'Must serve all parties via personal service or certified mail per FL Rule of Civil Procedure 1.070. Service by publication requires court order.',
    filingFee:
      '~$55 for claims ≤$2,500; ~$80 for claims $2,501-$8,000; ~$300 for County Court; ~$400 for Circuit Court (fee waiver available for qualifying individuals)',
    maxPages: 25,
    fontRequirements: 'At least 12-point font for body text',
    marginRequirements: '1-inch margins on all sides',
    copies: 2,
    localFormUrl: 'https://www.flcourts.gov/Resources-Services/Court-Improvement/Family-Courts/Family-Law-Self-Help-Information/Family-Law-Forms',
  },

  rejectionReasons: [
    {
      reason: 'Missing property description',
      howToAvoid:
        'Include a clear description of the property at issue — street address for real property, or identifying details for personal property. Attach photos as exhibits if available.',
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
        'Specify at least one legal theory (trespass, negligence, conversion, nuisance, civil theft) and cite the supporting Florida statute.',
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
        'Include a signed verification stating that the facts in the complaint are true and correct under penalty of perjury under the laws of Florida.',
      wizardStep: 'review',
    },
    {
      reason: 'No certificate of service attached',
      howToAvoid:
        'Attach a certificate of service showing the date, method, and recipient of service per FL R. Civ. P. 1.070.',
      wizardStep: 'review',
    },
    {
      reason: 'Filed in wrong county',
      howToAvoid:
        'Property disputes must be filed in the county where the property is located or where the defendant resides (FL Stat. §47.011). Verify venue before filing.',
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
            'Obtain at least one written repair estimate or appraisal. This establishes the baseline for your damages claim and determines which court has jurisdiction (Small Claims ≤$8K, County ≤$50K, Circuit >$50K).',
        },
        {
          condition: 'no_police_report_mentioned',
          message:
            'If the damage was caused by criminal conduct (vandalism, theft), note whether a police report was filed. A police report strengthens your claim and may support treble damages under FL Stat. §772.11.',
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
            'Verify that your claim is within the statute of limitations: 4 years for property damage (FL Stat. §95.11(3)(a)), 4 years for conversion (FL Stat. §95.11(3)(h)). Claims filed after the deadline will be dismissed.',
        },
        {
          condition: 'no_civil_theft_demand_letter',
          message:
            'If pursuing civil theft under FL Stat. §772.11, you must send a written demand letter at least 30 days before filing suit. Without this demand letter, your treble damages claim may be dismissed.',
        },
      ],
    },
    relief: {
      required: [],
      warnings: [
        {
          condition: 'no_repair_vs_replacement_specified',
          message:
            'Specify whether you are seeking repair costs or replacement value. If the property can be repaired, damages are typically the cost of repair. If destroyed, damages are the fair market value at the time of loss.',
        },
        {
          condition: 'no_treble_damages_considered',
          message:
            'If the defendant stole your property, you may be entitled to treble damages under FL Stat. §772.11 (civil remedy for theft). You must send a written demand letter 30 days before filing and can recover three times the actual damages plus attorney\'s fees.',
        },
      ],
    },
  },

  glossary: [
    {
      term: 'Trespass',
      plainEnglish:
        'Entering someone else\'s property or placing something on it without permission. In Florida, you have 4 years from the trespass to file a lawsuit for property damage (FL Stat. §95.11(3)(a)).',
    },
    {
      term: 'Conversion',
      plainEnglish:
        'Taking or using someone else\'s personal property without their permission in a way that denies the owner\'s rights. For example, refusing to return borrowed equipment. Florida gives you 4 years to sue for conversion (FL Stat. §95.11(3)(h)).',
    },
    {
      term: 'Nuisance',
      plainEnglish:
        'Anything that interferes with your ability to use and enjoy your property — such as excessive noise, pollution, or blocked access. FL Stat. §823.01 governs nuisance claims in Florida.',
    },
    {
      term: 'Diminished Value',
      plainEnglish:
        'The loss in market value of property even after it has been repaired. For example, a home with a history of water damage may be worth less than an identical home with no such history, even after full repair.',
    },
    {
      term: 'Treble Damages (Civil Theft)',
      plainEnglish:
        'Triple the actual damages, awarded as a penalty for theft. Under FL Stat. §772.11, if someone steals your property, you can sue for three times the actual damages plus attorney\'s fees. You must send a written demand letter 30 days before filing.',
    },
    {
      term: 'Property Damage',
      plainEnglish:
        'Physical harm to real property (land, buildings) or personal property (vehicles, equipment, belongings). The owner can recover the cost of repair, diminished value, and loss of use.',
    },
    {
      term: 'Statute of Limitations',
      plainEnglish:
        'A legal deadline for filing a lawsuit. Miss it and your case is dismissed regardless of its merits. In Florida, property damage and conversion have a 4-year limit (FL Stat. §95.11(3)(a) and (3)(h)). Note that negligence for personal injury is only 2 years post-HB 837.',
    },
    {
      term: 'Easement',
      plainEnglish:
        'A legal right to use someone else\'s land for a specific purpose, such as a driveway or utility line. FL Stat. §704 governs easements in Florida. An easement does not give ownership — only a limited right of use.',
    },
  ],
} as const satisfies JurisdictionRuleConfig
