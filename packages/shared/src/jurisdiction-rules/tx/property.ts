import type { JurisdictionRuleConfig } from '../schema'

export const txProperty = {
  state: 'TX',
  disputeType: 'property',

  requiredSections: [
    {
      id: 'caption',
      label: 'Caption',
      description:
        'Case caption identifying the court, parties, and cause number. Must name the court in the county where the property is located.',
      legalElements: [
        'Court name (Justice of the Peace, County, or District Court)',
        'Plaintiff name (property owner or possessor)',
        'Defendant name (alleged trespasser, converter, or responsible party)',
        'Cause number placeholder (assigned by clerk at filing)',
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
        'Nature and extent of damage, trespass, or conversion',
        'Efforts to mitigate or document the damage (photographs, repair estimates, police reports)',
      ],
      minParagraphs: 3,
    },
    {
      id: 'liability_basis',
      label: 'Liability Basis',
      description:
        'The legal theories supporting the claim. Texas recognizes multiple causes of action for property disputes including trespass, negligence, conversion, and trespass to try title.',
      legalElements: [
        'Trespass to real property — unauthorized entry or physical invasion (TX CPRC §16.003, 2-year SOL)',
        'Negligent property damage — duty, breach, causation, and damages',
        'Conversion of personal property — unauthorized exercise of dominion over another\'s property (TX CPRC §16.004, 4-year SOL)',
        'Trespass to try title — action to recover title or possession of real property (TX Property Code §22)',
        'Criminal mischief — civil recovery for intentional damage (TX Penal Code §28.03)',
        'Exemplary damages — available for willful or malicious destruction (TX CPRC §41)',
      ],
      minParagraphs: 2,
    },
    {
      id: 'damages',
      label: 'Damages',
      description:
        'Specific monetary relief sought, including repair costs, replacement value, diminished value, and any exemplary damages for willful conduct.',
      legalElements: [
        'Cost of repair or restoration to pre-damage condition',
        'Diminished value of property after repair (if applicable)',
        'Fair market replacement value (if property is destroyed or converted)',
        'Loss of use during repair period',
        'Exemplary damages for willful or malicious destruction (TX CPRC §41)',
        'Court costs and reasonable attorney\'s fees (if authorized by statute or contract)',
      ],
      minParagraphs: 2,
    },
    {
      id: 'verification',
      label: 'Verification',
      description:
        'A sworn statement that the facts in the petition are true and correct. Verification strengthens the pleading and is required for certain claims like trespass to try title.',
      legalElements: [
        'Signed under penalty of perjury under the laws of the State of Texas',
        'Statement that the facts set forth in the petition are true and correct to the best of plaintiff\'s knowledge',
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
      'Justice of the Peace Court (claims under $20,000), County Court at Law ($20,000–$250,000), or District Court (claims over $250,000 or trespass to try title)',
    serviceRequirements:
      'Must serve all parties via certified mail, hand delivery, e-service, or fax per TX Rule of Civil Procedure 21a. E-service requires prior written agreement.',
    filingFee:
      '$54 for Justice of the Peace Court; varies for County/District Court (fee waiver available via Statement of Inability to Afford Payment of Court Costs, TX Gov\'t Code §6.001)',
    maxPages: 25,
    fontRequirements: '14-point minimum for body text in JP Court',
    marginRequirements: '1-inch margins on all sides',
    copies: 2,
    localFormUrl: 'https://www.txcourts.gov/rules-forms/forms/',
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
        'Specify at least one legal theory (trespass, negligence, conversion, trespass to try title) and cite the supporting statute.',
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
        'Include a signed verification stating that the facts in the petition are true and correct under penalty of perjury.',
      wizardStep: 'review',
    },
    {
      reason: 'No certificate of service attached',
      howToAvoid:
        'Attach a certificate of service showing the date, method, and recipient of service per TRCP Rule 21a.',
      wizardStep: 'review',
    },
    {
      reason: 'Filed in wrong county',
      howToAvoid:
        'Property disputes must be filed in the county where the property is located, or where the defendant resides. Verify venue before filing.',
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
            'If the damage was caused by criminal conduct (theft, vandalism, criminal mischief), note whether a police report was filed. A police report strengthens your claim and may support exemplary damages.',
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
            'Verify that your claim is within the statute of limitations: 2 years for property damage and trespass (TX CPRC §16.003), 4 years for conversion (TX CPRC §16.004). Claims filed after the deadline will be dismissed.',
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
        {
          condition: 'no_exemplary_damages_considered',
          message:
            'If the damage was willful or malicious, you may be entitled to exemplary (punitive) damages under TX CPRC §41. These require clear and convincing evidence of fraud, malice, or gross negligence.',
        },
      ],
    },
  },

  glossary: [
    {
      term: 'Trespass',
      plainEnglish:
        'Entering someone else\'s property or placing something on it without permission. In Texas, you have 2 years from the trespass to file a lawsuit (TX CPRC §16.003).',
    },
    {
      term: 'Conversion',
      plainEnglish:
        'Taking or using someone else\'s personal property without their permission in a way that denies the owner\'s rights. For example, refusing to return borrowed equipment. Texas gives you 4 years to sue for conversion (TX CPRC §16.004).',
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
      term: 'Boundary Dispute',
      plainEnglish:
        'A disagreement between neighbors about where one property ends and the other begins. Often requires a professional survey and may involve a trespass to try title action under TX Property Code §22.',
    },
    {
      term: 'Exemplary Damages',
      plainEnglish:
        'Extra money a court can award to punish someone who caused damage on purpose or through extreme carelessness. Also called punitive damages. Texas law (TX CPRC §41) requires clear and convincing evidence of malice, fraud, or gross negligence.',
    },
    {
      term: 'Statute of Limitations',
      plainEnglish:
        'A legal deadline for filing a lawsuit. Miss it and your case is dismissed regardless of its merits. In Texas, property damage and trespass have a 2-year limit; conversion has a 4-year limit.',
    },
    {
      term: 'Trespass to Try Title',
      plainEnglish:
        'A special lawsuit used to settle who actually owns a piece of real property. Filed in District Court under TX Property Code §22. Common in boundary disputes and adverse possession claims.',
    },
    {
      term: 'Criminal Mischief',
      plainEnglish:
        'Intentionally damaging or destroying someone else\'s property. It is a crime under TX Penal Code §28.03, but the property owner can also sue civilly to recover repair or replacement costs.',
    },
  ],
} as const satisfies JurisdictionRuleConfig
