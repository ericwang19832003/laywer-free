import type { JurisdictionRuleConfig } from '../schema'

export const txPersonalInjury = {
  state: 'TX',
  disputeType: 'personal_injury',

  requiredSections: [
    {
      id: 'caption',
      label: 'Caption',
      description:
        'Case caption identifying the court, parties, and cause number. Must match the court where the suit is filed.',
      legalElements: [
        'Court name (County Court at Law or District Court)',
        'Plaintiff name (injured party)',
        'Defendant name (party alleged to be at fault)',
        'Cause number placeholder (assigned by clerk at filing)',
      ],
      minParagraphs: 1,
    },
    {
      id: 'facts',
      label: 'Statement of Facts',
      description:
        'A detailed narrative of the incident, including how it occurred, the injuries sustained, and the medical treatment received. Must establish the factual basis for each element of the negligence claim.',
      legalElements: [
        'Date, time, and location of the incident',
        'Description of how the incident occurred',
        'Injuries sustained by the plaintiff',
        'Medical treatment received and ongoing care',
        'Impact on plaintiff\'s daily life and ability to work',
      ],
      minParagraphs: 3,
    },
    {
      id: 'negligence_elements',
      label: 'Negligence Elements',
      description:
        'The four elements of negligence that the plaintiff must prove: duty, breach, causation, and damages. Each element must be specifically pleaded with supporting facts.',
      legalElements: [
        'Duty — defendant owed a legal duty of care to the plaintiff',
        'Breach — defendant failed to meet the applicable standard of care',
        'Causation — defendant\'s breach was the proximate cause of plaintiff\'s injuries',
        'Damages — plaintiff suffered actual, compensable harm as a result',
      ],
      minParagraphs: 4,
    },
    {
      id: 'damages',
      label: 'Damages',
      description:
        'An itemization of all damages sought, including economic damages (medical expenses, lost wages) and non-economic damages (pain and suffering, mental anguish). Punitive damages are capped under TX CPRC §41.',
      legalElements: [
        'Past and future medical expenses',
        'Past and future lost wages or earning capacity',
        'Pain and suffering, mental anguish, and emotional distress',
        'Physical impairment or disfigurement',
        'Exemplary (punitive) damages, if applicable (TX CPRC §41)',
      ],
      minParagraphs: 2,
    },
    {
      id: 'verification',
      label: 'Verification',
      description:
        'A sworn statement that the facts in the petition are true and correct. While not always required, verification strengthens credibility and may be required by local rules.',
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
      'County Court at Law (claims under $250,000) or District Court (claims $250,000 and above, or medical malpractice)',
    serviceRequirements:
      'Must serve defendant via citation issued by the clerk and delivered by authorized process server, constable, or sheriff per TX Rules of Civil Procedure 99-107. After initial service, subsequent documents may be served per TRCP Rule 21a.',
    filingFee:
      'Approximately $300-$400 for District Court (fee waiver available via Statement of Inability to Afford Payment of Court Costs, TX Gov\'t Code §6.001)',
    maxPages: 30,
    fontRequirements: '14-point minimum for body text',
    marginRequirements: '1-inch margins on all sides',
    copies: 2,
    localFormUrl: 'https://www.txcourts.gov/rules-forms/forms/',
  },

  rejectionReasons: [
    {
      reason: 'Statute of limitations expired',
      howToAvoid:
        'Personal injury claims must be filed within 2 years of the date of injury (TX CPRC §16.003). Verify the incident date falls within this window before filing.',
      wizardStep: 'facts',
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
      reason: 'Incorrect court name in caption',
      howToAvoid:
        'Verify the court name matches the appropriate level — County Court at Law for claims under $250,000, District Court for larger claims or medical malpractice.',
      wizardStep: 'venue',
    },
    {
      reason: 'No pre-suit notice for medical malpractice',
      howToAvoid:
        'For medical malpractice claims, a 60-day pre-suit notice must be sent to the defendant before filing (TX CPRC §74.051). Include proof of the notice with your filing.',
      wizardStep: 'claims',
    },
  ],

  stepValidations: {
    facts: {
      required: ['incident_date'],
      warnings: [
        {
          condition: 'no_injury_description',
          message:
            'Describe all injuries in detail — type, severity, body parts affected, and whether they are permanent or temporary. Vague descriptions weaken your claim.',
        },
        {
          condition: 'no_medical_treatment_timeline',
          message:
            'Include a timeline of medical treatment: emergency care, follow-up visits, surgeries, physical therapy, and any ongoing treatment. This establishes the extent of your damages.',
        },
      ],
    },
    claims: {
      required: ['negligence_basis'],
      warnings: [
        {
          condition: 'no_comparative_fault_awareness',
          message:
            'Texas follows modified comparative fault (TX CPRC §33). If you are found more than 50% at fault, you recover nothing. Address any potential contributory negligence and explain why the defendant bears primary responsibility.',
        },
        {
          condition: 'medical_malpractice_without_presuit_notice',
          message:
            'Medical malpractice claims require a 60-day pre-suit notice to the defendant (TX CPRC §74.051) and an expert report within 120 days of filing (TX CPRC §74.351). Failure to comply can result in dismissal.',
        },
      ],
    },
    relief: {
      required: [],
      warnings: [
        {
          condition: 'no_specific_damages_amounts',
          message:
            'While Texas does not require a specific dollar amount in the petition, itemizing your damages (medical bills, lost wages, etc.) strengthens your claim and helps the court assess appropriate relief.',
        },
        {
          condition: 'punitive_damages_without_basis',
          message:
            'Exemplary (punitive) damages require clear and convincing evidence of fraud, malice, or gross negligence (TX CPRC §41.003). They are capped at the greater of $200,000 or two times economic damages plus non-economic damages up to $750,000 (TX CPRC §41.008).',
        },
      ],
    },
    parties: {
      required: [],
      warnings: [
        {
          condition: 'no_defendant_address',
          message:
            'You will need the defendant\'s address for service of process. The petition must be served via citation delivered by an authorized process server, constable, or sheriff.',
        },
      ],
    },
  },

  glossary: [
    {
      term: 'Statute of Limitations',
      plainEnglish:
        'A legal deadline for filing a lawsuit. In Texas, personal injury claims must be filed within 2 years of the date of injury (TX CPRC §16.003). After that, the court will dismiss your case.',
    },
    {
      term: 'Negligence',
      plainEnglish:
        'The legal theory behind most personal injury claims. It means someone failed to act with reasonable care and that failure caused your injury. You must prove four things: duty, breach, causation, and damages.',
    },
    {
      term: 'Comparative Fault',
      plainEnglish:
        'Texas\'s system for splitting blame between parties (TX CPRC §33). If you are partly at fault for your own injury, your recovery is reduced by your percentage of fault. If you are more than 50% at fault, you get nothing.',
    },
    {
      term: 'Proximate Cause',
      plainEnglish:
        'The legal link between the defendant\'s action and your injury. It means the injury was a foreseeable result of what the defendant did (or failed to do), without any unforeseeable intervening event breaking the chain.',
    },
    {
      term: 'Damages',
      plainEnglish:
        'The money you are asking the court to award. This includes economic damages (medical bills, lost wages) and non-economic damages (pain and suffering, mental anguish). You must prove each category with evidence.',
    },
    {
      term: 'Pre-suit Notice',
      plainEnglish:
        'A written notice you must send to a healthcare provider at least 60 days before filing a medical malpractice lawsuit (TX CPRC §74.051). Skipping this step can get your case dismissed.',
    },
    {
      term: 'Exemplary (Punitive) Damages',
      plainEnglish:
        'Extra damages meant to punish the defendant for particularly bad behavior — fraud, malice, or gross negligence. Texas caps these amounts (TX CPRC §41.008), and you must prove them by clear and convincing evidence.',
    },
    {
      term: 'Verification',
      plainEnglish:
        'A sworn statement at the end of your petition confirming the facts are true. Think of it as signing under oath. It adds credibility and may be required by some courts.',
    },
    {
      term: 'Certificate of Service',
      plainEnglish:
        'A short statement proving you sent a copy of your filing to the other side. Texas courts require this on every document you file (TRCP Rule 21a).',
    },
  ],
} as const satisfies JurisdictionRuleConfig
