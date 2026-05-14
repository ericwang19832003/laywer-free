import type { JurisdictionRuleConfig } from '../schema'

export const nyPersonalInjury = {
  state: 'NY',
  disputeType: 'personal_injury',

  requiredSections: [
    {
      id: 'caption',
      label: 'Caption',
      description:
        'Case caption identifying the court, parties, and index number. Must match the county where the action is filed (CPLR §503).',
      legalElements: [
        'Court name (Supreme Court or NYC Civil Court)',
        'County where action is brought',
        'Plaintiff name',
        'Defendant name',
        'Index number placeholder (assigned by clerk at filing)',
      ],
      minParagraphs: 1,
    },
    {
      id: 'facts',
      label: 'Facts',
      description:
        'A plain-language narrative of the incident, injuries sustained, and medical treatment received. Must establish the date, location, and circumstances so the court can evaluate timeliness under the 3-year statute of limitations (CPLR §214).',
      legalElements: [
        'Date and location of the incident',
        'Description of how the incident occurred',
        'Injuries sustained (nature and severity)',
        'Medical treatment received and ongoing care',
        'For auto accidents: description of serious injury under Insurance Law §5102(d)',
      ],
      minParagraphs: 3,
    },
    {
      id: 'negligence_elements',
      label: 'Negligence Elements',
      description:
        'The four elements of negligence that plaintiff must establish. New York applies pure comparative fault under CPLR §1411 — plaintiff can recover even at 99% fault, reduced by their percentage of responsibility.',
      legalElements: [
        'Duty — defendant owed plaintiff a duty of reasonable care',
        'Breach — defendant failed to exercise reasonable care',
        'Causation — defendant\'s breach was a proximate cause of plaintiff\'s injuries',
        'Damages — plaintiff suffered actual, compensable harm as a result',
      ],
      minParagraphs: 4,
    },
    {
      id: 'damages',
      label: 'Damages',
      description:
        'Itemized statement of all damages sought. For non-economic damages, CPLR §1601-1602 limits proportional liability when a defendant is less than 50% at fault. For auto accidents, plaintiff must meet the "serious injury" threshold (Insurance Law §5104).',
      legalElements: [
        'Past and future medical expenses',
        'Lost wages and diminished earning capacity',
        'Pain and suffering (past and future)',
        'Loss of enjoyment of life',
        'For auto cases: serious injury category under Insurance Law §5102(d)',
      ],
      minParagraphs: 2,
    },
    {
      id: 'verification',
      label: 'Verification',
      description:
        'A sworn statement that the facts in the complaint are true and correct to the best of plaintiff\'s knowledge. For medical malpractice, a certificate of merit under CPLR §3012-a must accompany the complaint.',
      legalElements: [
        'Signed under penalty of perjury under the laws of the State of New York',
        'Statement that the facts set forth are true and correct to the best of plaintiff\'s knowledge',
        'For medical malpractice: certificate of merit from a licensed physician (CPLR §3012-a)',
      ],
      minParagraphs: 1,
    },
    {
      id: 'proof_of_service',
      label: 'Proof of Service',
      description:
        'Affidavit or affirmation of service demonstrating that the summons and complaint were properly served on the defendant in accordance with CPLR §308.',
      legalElements: [
        'Date of service',
        'Method of service (personal delivery, substituted service, or nail-and-mail per CPLR §308)',
        'Name and address of the person served',
      ],
      minParagraphs: 1,
    },
  ],

  filingRules: {
    courtName:
      'Supreme Court of the State of New York (unlimited jurisdiction) or NYC Civil Court (claims up to $25,000)',
    serviceRequirements:
      'Must serve defendant via personal delivery, substituted service (leave and mail), or nail-and-mail per CPLR §308. Service must be completed within 120 days of filing (CPLR §306-b).',
    filingFee:
      'Approximately $210 for Supreme Court (index number fee). Poor person relief available under CPLR §1101 to waive fees based on financial need.',
    maxPages: 25,
    fontRequirements: '12-point minimum for body text',
    marginRequirements: '1-inch margins on all sides',
    copies: 2,
    localFormUrl: 'https://www.nycourts.gov/forms/',
  },

  rejectionReasons: [
    {
      reason: 'Missing verification or certificate of merit',
      howToAvoid:
        'Include a signed verification. For medical malpractice claims, attach a certificate of merit from a licensed physician as required by CPLR §3012-a.',
      wizardStep: 'review',
    },
    {
      reason: 'No proof of service filed',
      howToAvoid:
        'File an affidavit of service showing the date, method, and recipient of service per CPLR §308. Service must be completed within 120 days of filing.',
      wizardStep: 'review',
    },
    {
      reason: 'Incorrect venue or court name in caption',
      howToAvoid:
        'Verify the county where the cause of action arose or where the defendant resides (CPLR §503). Confirm whether Supreme Court or NYC Civil Court is appropriate based on the amount in controversy.',
      wizardStep: 'venue',
    },
    {
      reason: 'Failure to file notice of claim against government entity',
      howToAvoid:
        'If the defendant is a government entity (city, county, state agency, school district), you must file a Notice of Claim within 90 days of the incident under General Municipal Law §50-e before filing suit.',
      wizardStep: 'facts',
    },
    {
      reason: 'Auto accident complaint fails to allege serious injury',
      howToAvoid:
        'New York is a no-fault state. To sue for personal injury from an auto accident, you must allege a "serious injury" as defined by Insurance Law §5102(d) — e.g., fracture, dismemberment, permanent limitation, or the 90/180-day rule.',
      wizardStep: 'claims',
    },
  ],

  stepValidations: {
    facts: {
      required: ['incident_date'],
      warnings: [
        {
          condition: 'auto_accident_no_serious_injury',
          message:
            'New York is a no-fault state for auto accidents. You must demonstrate a "serious injury" under Insurance Law §5102(d) to recover in a lawsuit. Serious injury includes death, dismemberment, significant disfigurement, fracture, loss of a fetus, permanent limitation of a body organ or member, significant limitation of a body function, or a medically determined injury preventing normal activities for at least 90 of the 180 days following the incident.',
        },
        {
          condition: 'government_entity_notice_of_claim',
          message:
            'If the defendant is a government entity, you must file a Notice of Claim within 90 days of the incident under General Municipal Law §50-e. Failure to file on time will bar your claim. Courts can grant late filing only in narrow circumstances.',
        },
        {
          condition: 'medical_malpractice_sol',
          message:
            'Medical malpractice has a shorter statute of limitations — 2 years and 6 months from the act or from discovery of a foreign object (CPLR §214-a). Standard personal injury is 3 years (CPLR §214). Verify which deadline applies.',
        },
      ],
    },
    claims: {
      required: ['negligence_basis'],
      warnings: [
        {
          condition: 'no_comparative_fault_awareness',
          message:
            'New York follows pure comparative fault under CPLR §1411. The plaintiff can recover even if 99% at fault — damages are simply reduced by their percentage of fault. Be prepared for the defendant to assert comparative negligence.',
        },
        {
          condition: 'auto_accident_no_fault_threshold',
          message:
            'Under Insurance Law §5104, you cannot sue for personal injury from an auto accident unless you suffered a "serious injury" as defined in §5102(d). Your complaint must specifically allege which serious injury category applies.',
        },
        {
          condition: 'proportional_liability_non_economic',
          message:
            'Under CPLR §1601-1602, a defendant who is 50% or less at fault pays only their proportional share of non-economic damages (pain and suffering). This may affect your recovery strategy if multiple defendants are involved.',
        },
      ],
    },
    relief: {
      required: [],
      warnings: [
        {
          condition: 'non_economic_damages_proportional_liability',
          message:
            'For non-economic damages (pain and suffering), CPLR §1601-1602 limits a defendant\'s liability to their proportional share if they are 50% or less at fault. Consider how fault allocation among defendants affects your total recovery.',
        },
        {
          condition: 'serious_injury_category_not_specified',
          message:
            'For auto accident claims, specify which "serious injury" category under Insurance Law §5102(d) you are relying on — e.g., fracture, permanent limitation of use, significant limitation of a body function, or the 90/180-day disability rule.',
        },
      ],
    },
  },

  glossary: [
    {
      term: 'Statute of Limitations',
      plainEnglish:
        'The legal deadline to file your lawsuit. In New York, you generally have 3 years from the date of injury for personal injury (CPLR §214) and 2.5 years for medical malpractice (CPLR §214-a). Miss it and your case is permanently barred.',
    },
    {
      term: 'Negligence',
      plainEnglish:
        'The legal theory behind most personal injury claims. You must prove four things: the defendant owed you a duty of care, they breached that duty, their breach caused your injury, and you suffered actual damages as a result.',
    },
    {
      term: 'Comparative Fault',
      plainEnglish:
        'New York uses "pure" comparative fault (CPLR §1411). Even if you were partly at fault for the accident, you can still recover — your award is just reduced by your percentage of blame. So if you were 30% at fault and had $100,000 in damages, you\'d recover $70,000.',
    },
    {
      term: 'Serious Injury Threshold',
      plainEnglish:
        'Because New York is a no-fault auto insurance state, you can only sue for injuries from a car accident if you suffered a "serious injury" under Insurance Law §5102(d). This includes fractures, dismemberment, permanent limitation of a body part, significant disfigurement, or being unable to perform normal activities for 90 of the 180 days after the accident.',
    },
    {
      term: 'No-Fault Insurance',
      plainEnglish:
        'New York requires auto insurers to pay your medical bills and lost wages regardless of who caused the accident (up to policy limits). In exchange, you can only sue the at-fault driver if your injuries meet the "serious injury" threshold.',
    },
    {
      term: 'Notice of Claim',
      plainEnglish:
        'A mandatory written notice you must file within 90 days of an incident if you plan to sue a government entity (city, county, state agency, public school) under General Municipal Law §50-e. If you miss this deadline, your claim is almost certainly barred.',
    },
    {
      term: 'Certificate of Merit',
      plainEnglish:
        'For medical malpractice cases, CPLR §3012-a requires your attorney to file a certificate stating that a licensed physician has reviewed the facts and believes there is a reasonable basis for the lawsuit. This prevents frivolous malpractice claims.',
    },
    {
      term: 'Non-Economic Damages',
      plainEnglish:
        'Compensation for losses that do not have a specific dollar amount — like pain and suffering, emotional distress, and loss of enjoyment of life. Under CPLR §1601-1602, a defendant who is 50% or less at fault only pays their proportional share of these damages.',
    },
  ],
} as const satisfies JurisdictionRuleConfig
