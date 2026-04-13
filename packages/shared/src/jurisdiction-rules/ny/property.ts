import type { JurisdictionRuleConfig } from '../schema'

export const nyProperty = {
  state: 'NY',
  disputeType: 'property',

  requiredSections: [
    {
      id: 'caption',
      label: 'Caption',
      description:
        'Case caption identifying the court, parties, and index number. Must match the court where the action is filed.',
      legalElements: [
        'Court name (Small Claims Court, Civil Court of the City of New York, or Supreme Court)',
        'Plaintiff name (property owner or party in possession)',
        'Defendant name (party alleged to have caused damage or trespass)',
        'Index number placeholder (assigned by clerk at filing)',
      ],
      minParagraphs: 1,
    },
    {
      id: 'facts',
      label: 'Statement of Facts',
      description:
        'A clear recitation of the facts giving rise to the property claim, including identification of the property, the nature and date of the damage or interference, and the parties involved.',
      legalElements: [
        'Description and location of the property at issue',
        'Plaintiff\'s ownership or possessory interest in the property',
        'Date(s) of the incident or ongoing interference',
        'Nature and extent of damage, trespass, conversion, or nuisance',
        'Efforts to resolve the dispute before filing (demand letters, notice to cease)',
      ],
      minParagraphs: 3,
    },
    {
      id: 'liability_basis',
      label: 'Liability Basis',
      description:
        'The legal theories supporting the claim. New York recognizes multiple causes of action for property disputes including trespass, negligence, conversion, and nuisance.',
      legalElements: [
        'Trespass — unauthorized entry onto or interference with real property (NY RPAPL §861)',
        'Negligence — defendant\'s failure to exercise reasonable care resulting in property damage',
        'Conversion — wrongful exercise of dominion over personal property, 3-year SOL (NY CPLR §214(3))',
        'Property damage — injury to property, 3-year SOL (NY CPLR §214(4))',
        'Private nuisance — substantial and unreasonable interference with the use and enjoyment of property (common law, injunctive relief available)',
        'Criminal mischief — civil recovery for intentional property damage (NY Penal Law §145)',
        'Encroachment/boundary dispute — unauthorized structure or use extending onto adjacent property (NY Real Property Law §339)',
      ],
      minParagraphs: 2,
    },
    {
      id: 'damages',
      label: 'Damages',
      description:
        'Itemization of all damages sought, including cost of repair or replacement, diminished property value, and loss of use during the period of damage.',
      legalElements: [
        'Cost of repair or restoration to pre-damage condition',
        'Diminished value of the property after repair (if applicable)',
        'Loss of use — rental value or other economic loss during the repair period',
        'Replacement cost if property is destroyed or conversion is total',
        'Injunctive relief — request for court order to stop ongoing nuisance or trespass',
        'Consequential damages — additional losses proximately caused by the property harm',
      ],
      minParagraphs: 2,
    },
    {
      id: 'verification',
      label: 'Verification',
      description:
        'A sworn statement that the facts in the complaint are true and correct. Verified complaints are standard in New York property actions and strengthen credibility.',
      legalElements: [
        'Signed under penalty of perjury under the laws of the State of New York',
        'Statement that the facts set forth in the complaint are true and correct to the best of plaintiff\'s knowledge',
      ],
      minParagraphs: 1,
    },
    {
      id: 'proof_of_service',
      label: 'Proof of Service',
      description:
        'Documentation that a copy of the summons and complaint was properly served on the defendant in accordance with New York CPLR Article 3.',
      legalElements: [
        'Date of service',
        'Method of service (personal delivery, substituted service, or nail-and-mail per CPLR §308)',
        'Name and address of the person served',
        'Affidavit of service signed by the process server',
      ],
      minParagraphs: 1,
    },
  ],

  filingRules: {
    courtName:
      'Small Claims Court (claims ≤$10,000), Civil Court of the City of New York (claims ≤$25,000 in NYC), or Supreme Court (unlimited jurisdiction)',
    serviceRequirements:
      'Must serve defendant via personal delivery, substituted service, or nail-and-mail per CPLR §308. Service must be completed at least 30 days before the return date if within New York, or 60 days if outside the state.',
    filingFee:
      '~$45 for Civil Court, ~$210 for Supreme Court (fee waiver available via Poor Person Application under CPLR §1101)',
    maxPages: 25,
    fontRequirements: '12-point minimum for body text',
    marginRequirements: '1-inch margins on all sides',
    copies: 2,
    localFormUrl: 'https://www.nycourts.gov/forms/',
  },

  rejectionReasons: [
    {
      reason: 'Improper venue — action filed in wrong county',
      howToAvoid:
        'File in the county where the property is located or where the defendant resides, per CPLR §503. For real property disputes, venue is typically in the county where the property is situated.',
      wizardStep: 'venue',
    },
    {
      reason: 'Missing verification paragraph',
      howToAvoid:
        'Include a signed verification stating that the facts in the complaint are true and correct under penalty of perjury.',
      wizardStep: 'review',
    },
    {
      reason: 'No proof of service filed',
      howToAvoid:
        'File an affidavit of service signed by the process server showing the date, method, and recipient of service per CPLR §308.',
      wizardStep: 'review',
    },
    {
      reason: 'Claim filed after statute of limitations expired',
      howToAvoid:
        'Property damage and conversion claims must be filed within 3 years of the incident (CPLR §214(3)-(4)). Verify dates before filing.',
      wizardStep: 'facts',
    },
    {
      reason: 'Insufficient description of property or damages',
      howToAvoid:
        'Include a clear description of the property, the nature of the damage or interference, and an itemized list of damages with supporting documentation (photos, repair estimates, appraisals).',
      wizardStep: 'facts',
    },
  ],

  stepValidations: {
    facts: {
      required: ['incident_date'],
      warnings: [
        {
          condition: 'no_damage_documentation',
          message:
            'Document all damage with dated photographs, videos, and written descriptions as soon as possible. Courts give significant weight to contemporaneous evidence of property damage.',
        },
        {
          condition: 'no_repair_estimates',
          message:
            'Obtain at least two written repair or restoration estimates from licensed contractors. Estimates establish the reasonable cost of repair, which is the primary measure of damages for property claims.',
        },
        {
          condition: 'no_demand_letter_sent',
          message:
            'Consider sending a written demand letter before filing suit. A demand letter creates evidence that you attempted to resolve the dispute and may be required for certain claims.',
        },
      ],
    },
    claims: {
      required: ['liability_type'],
      warnings: [
        {
          condition: 'no_proof_of_ownership',
          message:
            'You must prove ownership or lawful possession of the property at issue. Gather deeds, titles, lease agreements, purchase receipts, or other documentation establishing your right to the property.',
        },
        {
          condition: 'no_nuisance_duration',
          message:
            'For nuisance claims, document the duration and frequency of the interference. A private nuisance must be both substantial and unreasonable — isolated incidents may not qualify.',
        },
      ],
    },
    relief: {
      required: [],
      warnings: [
        {
          condition: 'repair_vs_replacement_unclear',
          message:
            'Specify whether you seek the cost of repair or the cost of replacement. The general rule is the lesser of repair cost or diminished value, unless the property is unique or has sentimental value recognized by law.',
        },
        {
          condition: 'no_injunctive_relief_for_nuisance',
          message:
            'For ongoing nuisance or trespass, consider requesting injunctive relief (a court order requiring the defendant to stop the harmful activity). Money damages alone may not prevent continued interference.',
        },
      ],
    },
  },

  glossary: [
    {
      term: 'Trespass',
      plainEnglish:
        'Entering or placing something on someone else\'s property without permission. In New York, even a minor unauthorized entry onto land can be actionable — you do not need to prove actual damage.',
    },
    {
      term: 'Conversion',
      plainEnglish:
        'Taking or using someone else\'s personal property (not land) without permission and treating it as your own. It is the civil equivalent of theft. New York has a 3-year statute of limitations (CPLR §214(3)).',
    },
    {
      term: 'Nuisance',
      plainEnglish:
        'An activity or condition on one property that substantially and unreasonably interferes with a neighbor\'s ability to use and enjoy their property — for example, excessive noise, odors, or pollution.',
    },
    {
      term: 'Diminished Value',
      plainEnglish:
        'The difference in your property\'s market value before and after the damage occurred. Even after repairs, some damage permanently reduces property value — you can recover that loss.',
    },
    {
      term: 'Property Damage',
      plainEnglish:
        'Physical harm to real property (land, buildings) or personal property (belongings, vehicles). In New York, you have 3 years from the date of damage to file a lawsuit (CPLR §214(4)).',
    },
    {
      term: 'Statute of Limitations',
      plainEnglish:
        'A legal deadline to file your lawsuit. For most New York property claims, the deadline is 3 years from the date of the incident. If you miss it, the court will dismiss your case regardless of the merits.',
    },
    {
      term: 'Loss of Use',
      plainEnglish:
        'The economic harm you suffer while your property is being repaired or is otherwise unusable. This can include rental costs for a substitute property or lost rental income.',
    },
    {
      term: 'Injunctive Relief',
      plainEnglish:
        'A court order that requires someone to stop doing something (like trespassing on your land or creating a nuisance). Unlike money damages, an injunction prevents future harm rather than compensating for past harm.',
    },
  ],
} as const satisfies JurisdictionRuleConfig
