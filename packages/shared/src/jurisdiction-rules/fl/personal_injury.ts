import type { JurisdictionRuleConfig } from '../schema'

export const flPersonalInjury = {
  state: 'FL',
  disputeType: 'personal_injury',

  requiredSections: [
    {
      id: 'caption',
      label: 'Caption',
      description:
        'Case caption identifying the court, parties, and case number. Must specify County Court (≤$50K) or Circuit Court (>$50K) per FL venue rules.',
      legalElements: [
        'Court name (County Court or Circuit Court)',
        'County where action is filed (FL Stat. §47.011)',
        'Plaintiff name',
        'Defendant name',
        'Case number placeholder (assigned by clerk at filing)',
      ],
      minParagraphs: 1,
    },
    {
      id: 'facts',
      label: 'Statement of Facts',
      description:
        'A chronological account of the incident giving rise to the personal injury claim, including date, location, parties involved, and how the injury occurred.',
      legalElements: [
        'Date and location of the incident',
        'Description of how the injury occurred',
        'Identification of all parties involved',
        'Description of injuries sustained',
        'Medical treatment received or ongoing',
      ],
      minParagraphs: 3,
    },
    {
      id: 'negligence_elements',
      label: 'Negligence Elements',
      description:
        'Allegations establishing each element of negligence under Florida law: duty, breach, causation, and damages. Must account for FL modified comparative fault (51% bar, HB 837, 2023).',
      legalElements: [
        'Duty of care owed by defendant to plaintiff',
        'Breach of that duty by defendant\'s act or omission',
        'Proximate cause — defendant\'s breach was a substantial factor in causing injury',
        'Actual damages suffered by plaintiff',
        'Comparative fault allocation (FL Stat. §768.81 — plaintiff must be ≤50% at fault to recover)',
      ],
      minParagraphs: 4,
    },
    {
      id: 'damages',
      label: 'Damages',
      description:
        'Itemized statement of all damages claimed, including economic (medical bills, lost wages) and non-economic (pain and suffering). Must address PIP exhaustion for auto cases (FL Stat. §627.736).',
      legalElements: [
        'Past and future medical expenses',
        'Lost wages and diminished earning capacity',
        'Pain and suffering',
        'PIP benefits exhaustion if auto accident (FL Stat. §627.736 — $10K)',
        'Permanent injury threshold for auto tort (FL Stat. §627.737)',
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
      'County Court (claims ≤$50,000) or Circuit Court (claims >$50,000)',
    serviceRequirements:
      'Must serve all parties via personal service (FL Stat. §48.031), certified mail, or e-service per FL Rule of Civil Procedure 1.080. Initial process requires personal service by sheriff or certified process server.',
    filingFee:
      '~$300 for Circuit Court (fee waiver available via Application for Determination of Civil Indigent Status)',
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
      reason: 'Filed in wrong court (County vs. Circuit)',
      howToAvoid:
        'Verify your claim amount: County Court handles claims ≤$50,000, Circuit Court handles claims >$50,000. File in the correct court for your damages amount.',
      wizardStep: 'venue',
    },
    {
      reason: 'Statute of limitations expired (2-year SOL)',
      howToAvoid:
        'FL Stat. §95.11(3)(a) requires negligence claims to be filed within 2 years of the injury (reduced from 4 years by HB 837, 2023). Verify your incident date falls within this window.',
      wizardStep: 'facts',
    },
    {
      reason: 'Missing pre-suit notice for medical malpractice',
      howToAvoid:
        'Medical malpractice claims require a 90-day pre-suit notice under FL Stat. §766.106. Send the notice before filing and include proof in your complaint.',
      wizardStep: 'claims',
    },
    {
      reason: 'Missing government claim notice for sovereign immunity waiver',
      howToAvoid:
        'Claims against government entities require prior written notice under FL Stat. §768.28. The cap is $200K per claim / $300K aggregate. File the notice before filing suit.',
      wizardStep: 'claims',
    },
  ],

  stepValidations: {
    facts: {
      required: ['incident_date'],
      warnings: [
        {
          condition: 'no_pip_exhaustion_mentioned',
          message:
            'If this is an auto accident, you must exhaust PIP benefits ($10,000 under FL Stat. §627.736) before filing a tort claim. Additionally, you must meet the permanent injury threshold under FL Stat. §627.737 (significant/permanent loss, scarring, or death).',
        },
        {
          condition: 'no_medical_treatment_described',
          message:
            'Describe all medical treatment received. Florida courts require evidence of actual injury and treatment to establish damages.',
        },
      ],
    },
    claims: {
      required: ['negligence_basis'],
      warnings: [
        {
          condition: 'no_comparative_fault_awareness',
          message:
            'Florida uses modified comparative fault with a 51% bar (FL Stat. §768.81, HB 837, 2023). If you are found more than 50% at fault, you recover nothing. Address how fault should be allocated.',
        },
        {
          condition: 'medical_malpractice_pre_suit_notice',
          message:
            'Medical malpractice claims under FL Stat. §766 require a 90-day pre-suit notice (FL Stat. §766.106). The notice must include a verified written medical expert opinion. Failure to send the notice can result in dismissal.',
        },
        {
          condition: 'government_entity_sovereign_immunity',
          message:
            'Claims against government entities are subject to sovereign immunity limits under FL Stat. §768.28 ($200K per claim, $300K cap). Written notice to the government entity is required before filing suit.',
        },
      ],
    },
    relief: {
      required: [],
      warnings: [
        {
          condition: 'pip_threshold_not_met',
          message:
            'For auto accident claims, you must demonstrate that injuries meet the permanent injury threshold under FL Stat. §627.737 — significant and permanent loss of a bodily function, permanent injury, significant/permanent scarring or disfigurement, or death. Without meeting this threshold, you cannot pursue a tort claim beyond PIP.',
        },
        {
          condition: 'no_sovereign_immunity_cap_awareness',
          message:
            'If suing a government entity, damages are capped at $200,000 per claim and $300,000 aggregate under FL Stat. §768.28. A claims bill to the Legislature is required for amounts exceeding these caps.',
        },
      ],
    },
  },

  glossary: [
    {
      term: 'Statute of Limitations',
      plainEnglish:
        'The legal deadline to file a lawsuit. In Florida, the limit for negligence claims is 2 years from the date of injury (FL Stat. §95.11(3)(a), reduced from 4 years by HB 837 in 2023). After that, the claim is time-barred.',
    },
    {
      term: 'Negligence',
      plainEnglish:
        'A legal claim that someone failed to act with reasonable care, causing injury. You must prove four elements: duty, breach, causation, and damages.',
    },
    {
      term: 'Comparative Fault (51% Bar)',
      plainEnglish:
        'Florida\'s modified comparative fault system (FL Stat. §768.81, HB 837). If you are found more than 50% at fault for your own injury, you recover nothing. If 50% or less at fault, your award is reduced by your percentage of fault.',
    },
    {
      term: 'PIP (Personal Injury Protection)',
      plainEnglish:
        'Florida\'s no-fault auto insurance (FL Stat. §627.736). Every driver must carry $10,000 in PIP coverage, which pays your medical bills regardless of who caused the accident. You must exhaust PIP before filing a tort lawsuit.',
    },
    {
      term: 'Permanent Injury Threshold',
      plainEnglish:
        'To sue for pain and suffering after a car accident in Florida, your injuries must meet the threshold under FL Stat. §627.737: significant/permanent loss of a bodily function, permanent injury, significant scarring/disfigurement, or death.',
    },
    {
      term: 'Pre-Suit Notice (Medical Malpractice)',
      plainEnglish:
        'Before suing a doctor or hospital in Florida, you must send a 90-day pre-suit notice under FL Stat. §766.106. This notice must include a verified medical expert opinion that the standard of care was breached.',
    },
    {
      term: 'Sovereign Immunity',
      plainEnglish:
        'Government entities in Florida have limited liability under FL Stat. §768.28. You can sue the state or local government, but damages are capped at $200,000 per claim and $300,000 total. Written notice is required before filing.',
    },
    {
      term: 'Proximate Cause',
      plainEnglish:
        'The legal connection between the defendant\'s action and your injury. You must show that the defendant\'s negligence was a substantial factor in causing your harm — not just that it happened to occur nearby.',
    },
    {
      term: 'Certificate of Service',
      plainEnglish:
        'A short statement proving you sent a copy of your filing to the other side. Florida courts require this on every document you file (FL Rule of Civil Procedure 1.080).',
    },
  ],
} as const satisfies JurisdictionRuleConfig
