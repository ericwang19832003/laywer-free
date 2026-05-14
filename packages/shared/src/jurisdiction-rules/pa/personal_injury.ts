import type { JurisdictionRuleConfig } from '../schema'

export const paPersonalInjury = {
  state: 'PA',
  disputeType: 'personal_injury',

  requiredSections: [
    {
      id: 'caption',
      label: 'Caption',
      description:
        'Case caption identifying the court, parties, and docket number. Must match the court where the complaint is filed.',
      legalElements: [
        'Court name (Court of Common Pleas or Magisterial District Court)',
        'Plaintiff name',
        'Defendant name',
        'Docket number placeholder (assigned by Prothonotary at filing)',
        'Civil action designation',
      ],
      minParagraphs: 1,
    },
    {
      id: 'facts',
      label: 'Statement of Facts',
      description:
        'A clear, chronological statement of the facts giving rise to the claim, including the date, location, and circumstances of the incident. Must establish the factual basis for each element of negligence.',
      legalElements: [
        'Date and time of incident',
        'Location of incident (county where cause of action arose)',
        'Description of how the incident occurred',
        'Identification of all defendants and their roles',
        'Injuries sustained by plaintiff',
      ],
      minParagraphs: 3,
    },
    {
      id: 'negligence_elements',
      label: 'Negligence Elements',
      description:
        'Each element of negligence must be separately alleged. Under Pennsylvania law, the plaintiff must prove duty, breach, causation, and damages. Subject to 42 Pa.C.S. §7102 modified comparative fault (51% bar).',
      legalElements: [
        'Duty of care owed by defendant to plaintiff',
        'Breach of duty — specific acts or omissions constituting negligence',
        'Causation — defendant\'s breach was a factual and proximate cause of plaintiff\'s injuries',
        'Damages — physical, emotional, and financial harm suffered by plaintiff',
        'Comparative fault notice — under 42 Pa.C.S. §7102, plaintiff recovers nothing if more than 50% at fault',
      ],
      minParagraphs: 4,
    },
    {
      id: 'damages',
      label: 'Damages',
      description:
        'Itemized statement of all damages sought, including economic and non-economic damages. Note: limited tort election under 75 Pa.C.S. §1705 may restrict non-economic recovery in auto cases.',
      legalElements: [
        'Medical expenses (past and future)',
        'Lost wages and diminished earning capacity',
        'Pain and suffering',
        'Emotional distress',
        'Property damage',
        'Non-economic damages (subject to limited tort restriction in auto cases per 75 Pa.C.S. §1705)',
      ],
      minParagraphs: 2,
    },
    {
      id: 'verification',
      label: 'Verification',
      description:
        'A sworn statement that the facts in the complaint are true and correct. Required under Pa.R.C.P. 1024 — the complaint must be verified by the party or their attorney.',
      legalElements: [
        'Statement that the facts set forth are true and correct to the best of the verifier\'s knowledge, information, and belief',
        'Acknowledgment that false statements are subject to penalties under 18 Pa.C.S. §4904 (unsworn falsification to authorities)',
      ],
      minParagraphs: 1,
    },
    {
      id: 'certificate_of_service',
      label: 'Certificate of Service',
      description:
        'Certification that a copy of the complaint was served on all opposing parties or their counsel, as required by Pa.R.C.P. 440.',
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
      'Court of Common Pleas (unlimited jurisdiction); Magisterial District Court (claims $12,000 and under)',
    serviceRequirements:
      'Original process must be served by the sheriff or a competent adult per Pa.R.C.P. 400-405. Subsequent filings served by first-class mail, personal delivery, or electronic means per Pa.R.C.P. 440.',
    filingFee:
      '$100-$300 for Court of Common Pleas (varies by county); in forma pauperis (IFP) petition available for those who cannot afford the fee per Pa.R.C.P. 240',
    maxPages: 30,
    fontRequirements: '12-point minimum for body text',
    marginRequirements: '1-inch margins on all sides',
    copies: 2,
    localFormUrl: 'https://www.pacourts.us/forms',
  },

  rejectionReasons: [
    {
      reason: 'Missing verification',
      howToAvoid:
        'Include a verification under Pa.R.C.P. 1024 stating the facts are true and correct to the best of your knowledge, information, and belief.',
      wizardStep: 'review',
    },
    {
      reason: 'No certificate of service',
      howToAvoid:
        'Attach a certificate of service showing the date, method, and recipient of service per Pa.R.C.P. 440.',
      wizardStep: 'review',
    },
    {
      reason: 'Wrong venue — complaint filed in incorrect county',
      howToAvoid:
        'File in the county where the cause of action arose or where the defendant may be served. Venue rules are governed by Pa.R.C.P. 1006 (individuals) and Pa.R.C.P. 2179 (corporations).',
      wizardStep: 'venue',
    },
    {
      reason: 'Missing certificate of merit for medical malpractice',
      howToAvoid:
        'Under 40 P.S. §1303.508 (MCARE Act), a certificate of merit from a qualified medical expert must be filed within 60 days of the complaint. Failure to file may result in dismissal.',
      wizardStep: 'claims',
    },
    {
      reason: 'Government claim without prior notice',
      howToAvoid:
        'Claims against government entities require written notice within 6 months under 42 Pa.C.S. §5522. File a notice of claim before commencing suit.',
      wizardStep: 'facts',
    },
  ],

  stepValidations: {
    facts: {
      required: ['incident_date'],
      warnings: [
        {
          condition: 'limited_tort_auto_case',
          message:
            'If this is an auto accident case, check whether the plaintiff elected limited tort or full tort on their insurance policy. Under 75 Pa.C.S. §1705, limited tort restricts recovery of non-economic damages unless the injury qualifies as a "serious injury" (death, serious impairment of body function, or permanent serious disfigurement).',
        },
        {
          condition: 'government_entity_claim_notice',
          message:
            'If the defendant is a government entity (state, county, municipality, or agency), you must have provided written notice within 6 months of the incident under 42 Pa.C.S. §5522. Failure to provide notice bars the claim.',
        },
        {
          condition: 'statute_of_limitations_approaching',
          message:
            'The statute of limitations for personal injury in Pennsylvania is 2 years from the date of injury under 42 Pa.C.S. §5524. Verify the complaint will be filed before the deadline.',
        },
      ],
    },
    claims: {
      required: ['negligence_basis'],
      warnings: [
        {
          condition: 'no_comparative_fault_awareness',
          message:
            'Pennsylvania follows modified comparative fault under 42 Pa.C.S. §7102. The plaintiff recovers nothing if found more than 50% at fault (51% bar). Consider how fault allocation may affect the claim.',
        },
        {
          condition: 'medical_malpractice_certificate_of_merit',
          message:
            'Medical malpractice claims require a certificate of merit under 40 P.S. §1303.508 (MCARE Act). An appropriate licensed professional must certify that there is a reasonable basis for the claim. The certificate must be filed within 60 days of the complaint.',
        },
        {
          condition: 'fair_share_act_joint_liability',
          message:
            'Under 42 Pa.C.S. §7102(a.2) (Fair Share Act), joint and several liability is limited. A defendant who is 60% or less at fault is only severally liable for their proportionate share of non-economic damages. Only defendants more than 60% at fault face joint and several liability.',
        },
      ],
    },
  },

  glossary: [
    {
      term: 'Statute of Limitations',
      plainEnglish:
        'The legal deadline to file a lawsuit. In Pennsylvania, you have 2 years from the date of injury to file a personal injury complaint (42 Pa.C.S. §5524). After that, your claim is time-barred.',
    },
    {
      term: 'Negligence',
      plainEnglish:
        'The legal theory that someone failed to act with reasonable care and that failure caused your injury. You must prove four elements: duty, breach, causation, and damages.',
    },
    {
      term: 'Comparative Fault (51% Bar)',
      plainEnglish:
        'Pennsylvania\'s rule for shared fault. If you are partly to blame for your injury, your award is reduced by your percentage of fault. But if you are more than 50% at fault, you recover nothing (42 Pa.C.S. §7102).',
    },
    {
      term: 'Limited Tort',
      plainEnglish:
        'A choice on your auto insurance policy that limits your right to sue for non-economic damages (pain and suffering) after a car accident — unless your injury is "serious" (death, serious impairment, or permanent disfigurement). See 75 Pa.C.S. §1705.',
    },
    {
      term: 'Full Tort',
      plainEnglish:
        'A choice on your auto insurance policy that preserves your full right to sue for all damages, including pain and suffering, after a car accident. Costs more in premiums but provides broader legal rights. See 75 Pa.C.S. §1705.',
    },
    {
      term: 'Certificate of Merit',
      plainEnglish:
        'A document required in medical malpractice cases certifying that a qualified medical expert has reviewed the case and believes there is a reasonable basis for the claim. Must be filed within 60 days of the complaint under the MCARE Act (40 P.S. §1303.508).',
    },
    {
      term: 'Sovereign Immunity',
      plainEnglish:
        'The legal doctrine that the government cannot be sued unless it waives immunity. In Pennsylvania, the state and its agencies have limited immunity with specific exceptions (42 Pa.C.S. §8522). Local governments have separate immunity rules (42 Pa.C.S. §8541-8542). Claims require 6-month prior notice.',
    },
    {
      term: 'Non-Economic Damages',
      plainEnglish:
        'Compensation for harm that does not have a specific dollar amount — such as pain and suffering, emotional distress, loss of enjoyment of life, and disfigurement. These may be restricted in limited tort auto cases.',
    },
  ],
} as const satisfies JurisdictionRuleConfig
