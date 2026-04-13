import type { JurisdictionRuleConfig } from '../schema'

export const caPersonalInjury = {
  state: 'CA',
  disputeType: 'personal_injury',

  requiredSections: [
    {
      id: 'caption',
      label: 'Caption',
      description:
        'Case caption identifying the court, parties, and case number. Must match the Superior Court where the suit is filed.',
      legalElements: [
        'Court name (Superior Court of California, County of ___)',
        'Plaintiff name (injured party)',
        'Defendant name (party alleged to be at fault)',
        'Case number placeholder (assigned by clerk at filing)',
        'Case type designation (limited civil ≤$25K or unlimited civil >$25K)',
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
        'Identity of any witnesses to the incident',
      ],
      minParagraphs: 3,
    },
    {
      id: 'negligence_elements',
      label: 'Negligence Elements',
      description:
        'The four elements of negligence under CA Civil Code §1714 that the plaintiff must prove: duty, breach, causation, and damages. Each element must be specifically pleaded with supporting facts.',
      legalElements: [
        'Duty — defendant owed a legal duty of care to the plaintiff (CA Civil Code §1714)',
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
        'An itemization of all damages sought, including economic damages (medical expenses, lost wages) and non-economic damages (pain and suffering). California applies pure comparative fault under Proposition 51 (CA Civil Code §1431.2), so non-economic damages are allocated by each defendant\'s percentage of fault.',
      legalElements: [
        'Past and future medical expenses',
        'Past and future lost wages or earning capacity',
        'Pain and suffering, mental anguish, and emotional distress',
        'Physical impairment or disfigurement',
        'Loss of consortium or companionship, if applicable',
      ],
      minParagraphs: 2,
    },
    {
      id: 'verification',
      label: 'Verification',
      description:
        'A sworn statement that the facts in the complaint are true and correct. While not required for most personal injury complaints in California, verification strengthens credibility and is required for certain claims (e.g., government tort claims).',
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
        'Certification that a copy of the complaint and summons was served on the opposing party as required by California Code of Civil Procedure §415.10-415.50.',
      legalElements: [
        'Date of service',
        'Method of service (personal delivery, substituted service, service by mail, or service by publication per CCP §415.10-415.50)',
        'Name and address of the party served',
        'Declaration of the person who performed service',
      ],
      minParagraphs: 1,
    },
  ],

  filingRules: {
    courtName:
      'Superior Court of California — limited civil jurisdiction (claims ≤$25,000) or unlimited civil jurisdiction (claims >$25,000)',
    serviceRequirements:
      'Must serve defendant via summons and complaint through personal delivery, substituted service, service by mail with acknowledgment, or service by publication per CA CCP §415.10-415.50. Service must be completed within 60 days of filing or the court may dismiss (CCP §583.210).',
    filingFee:
      'Approximately $75 for limited civil cases, $435 for unlimited civil cases (fee waiver available via Application for Waiver of Court Fees and Costs, Judicial Council Form FW-001)',
    maxPages: 30,
    fontRequirements: '12-point minimum for body text (California Rules of Court, Rule 2.104)',
    marginRequirements: '1-inch margins on all sides (California Rules of Court, Rule 2.108)',
    copies: 2,
    localFormUrl: 'https://www.courts.ca.gov/forms.htm',
  },

  rejectionReasons: [
    {
      reason: 'Statute of limitations expired',
      howToAvoid:
        'Personal injury claims must be filed within 2 years of the date of injury (CA CCP §335.1). Medical malpractice claims have a 3-year outer limit with a 1-year discovery rule (CA CCP §340.5). Verify the incident date falls within the applicable window before filing.',
      wizardStep: 'facts',
    },
    {
      reason: 'No government tort claim filed before suing a public entity',
      howToAvoid:
        'If the defendant is a government entity or employee, you must file a government tort claim within 6 months of the incident (CA Gov Code §911.2) before filing a lawsuit. Include proof of the claim and any rejection with your complaint.',
      wizardStep: 'claims',
    },
    {
      reason: 'Missing proof of service',
      howToAvoid:
        'Attach a completed proof of service (Judicial Council Form POS-010 or POS-030) showing the date, method, and recipient of service per CCP §415.10-415.50.',
      wizardStep: 'review',
    },
    {
      reason: 'Incorrect court designation in caption',
      howToAvoid:
        'Verify the case type designation — limited civil jurisdiction for claims ≤$25,000 or unlimited civil jurisdiction for claims >$25,000. The caption must include the correct Superior Court county.',
      wizardStep: 'venue',
    },
    {
      reason: 'No pre-suit notice for medical malpractice',
      howToAvoid:
        'Medical malpractice claims require a 90-day notice of intent to sue before filing (CA CCP §364). Include proof of the notice with your complaint.',
      wizardStep: 'claims',
    },
    {
      reason: 'Anti-SLAPP motion risk on protected activity',
      howToAvoid:
        'If your claim arises from defendant\'s protected speech or petitioning activity, it may be subject to a special motion to strike under CCP §425.16 (anti-SLAPP). Ensure your claim is based on tortious conduct, not protected expression.',
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
            'Include a timeline of medical treatment: emergency care, follow-up visits, surgeries, physical therapy, and any ongoing treatment. This establishes the extent of your damages and is critical for calculating economic losses.',
        },
        {
          condition: 'no_witness_information',
          message:
            'If there were witnesses to the incident, include their names and contact information if known. Witness testimony can corroborate your account and strengthen your claim.',
        },
      ],
    },
    claims: {
      required: ['negligence_basis'],
      warnings: [
        {
          condition: 'no_comparative_fault_awareness',
          message:
            'California follows pure comparative fault under Proposition 51 (CA Civil Code §1431.2). Your damages are reduced by your percentage of fault, but you are never completely barred from recovery — even at 99% fault. Address any potential contributory negligence and explain why the defendant bears primary responsibility.',
        },
        {
          condition: 'government_entity_claim_deadline',
          message:
            'If the defendant is a government entity or public employee acting in official capacity, you must file a government tort claim within 6 months of the incident (CA Gov Code §911.2). Failure to file this administrative claim bars your lawsuit. Late claims may be accepted within 1 year if you show excusable neglect (Gov Code §911.4).',
        },
        {
          condition: 'medical_malpractice_without_presuit_notice',
          message:
            'Medical malpractice claims require a 90-day notice of intent to sue to each healthcare provider before filing (CA CCP §364). This tolls the statute of limitations during the notice period. Failure to comply may result in dismissal.',
        },
      ],
    },
    relief: {
      required: [],
      warnings: [
        {
          condition: 'medical_malpractice_micra_cap',
          message:
            'For medical malpractice claims, MICRA (CA Civil Code §3333.2) caps non-economic damages. Under AB 35 (effective January 1, 2023), the cap is $350,000 for non-death cases and $500,000 for wrongful death, increasing by $40,000/$50,000 annually until reaching $750,000/$1,000,000. Specify economic and non-economic damages separately.',
        },
        {
          condition: 'no_economic_vs_noneconomic_separation',
          message:
            'Itemize economic damages (medical bills, lost wages, future care costs) separately from non-economic damages (pain and suffering, emotional distress). Under Proposition 51, each defendant is jointly liable for economic damages but only severally liable for non-economic damages in proportion to their fault.',
        },
      ],
    },
    parties: {
      required: [],
      warnings: [
        {
          condition: 'no_defendant_address',
          message:
            'You will need the defendant\'s address for service of process. California requires personal service of the summons and complaint on the defendant (CCP §415.10).',
        },
      ],
    },
  },

  glossary: [
    {
      term: 'Statute of Limitations',
      plainEnglish:
        'A legal deadline for filing a lawsuit. In California, personal injury claims must be filed within 2 years of the date of injury (CA CCP §335.1). Medical malpractice has a 3-year outer limit with a 1-year discovery rule (CA CCP §340.5). After the deadline, the court will dismiss your case.',
    },
    {
      term: 'Negligence',
      plainEnglish:
        'The legal theory behind most personal injury claims. Under CA Civil Code §1714, everyone has a duty to exercise reasonable care to avoid injuring others. You must prove four things: duty, breach, causation, and damages.',
    },
    {
      term: 'Comparative Fault',
      plainEnglish:
        'California\'s system for splitting blame between parties. Under Proposition 51 (CA Civil Code §1431.2), California follows "pure" comparative fault — your recovery is reduced by your percentage of fault, but you are never completely barred from recovering, even if you are mostly at fault.',
    },
    {
      term: 'Proximate Cause',
      plainEnglish:
        'The legal link between the defendant\'s action and your injury. It means the injury was a foreseeable result of what the defendant did (or failed to do), without any unforeseeable intervening event breaking the chain.',
    },
    {
      term: 'MICRA (Medical Injury Compensation Reform Act)',
      plainEnglish:
        'A California law (Civil Code §3333.2) that caps non-economic damages (pain and suffering) in medical malpractice cases. Under AB 35 (effective 2023), the cap starts at $350,000 for injury cases and $500,000 for wrongful death, increasing annually. It does not cap economic damages like medical bills or lost wages.',
    },
    {
      term: 'Government Tort Claim',
      plainEnglish:
        'A required administrative claim you must file before suing a government entity in California (Gov Code §810-996.6). You have only 6 months from the date of injury to file this claim with the relevant agency. If you skip it, the court will not let you sue.',
    },
    {
      term: 'Demand Letter',
      plainEnglish:
        'A letter sent to the at-fault party (or their insurance company) before filing a lawsuit, demanding compensation for your injuries. While not legally required in most California personal injury cases (except government claims), it is standard practice and often leads to settlement without court.',
    },
    {
      term: 'Non-Economic Damages',
      plainEnglish:
        'Compensation for losses that do not have a specific dollar amount — pain and suffering, emotional distress, loss of enjoyment of life, and disfigurement. Under Proposition 51, each defendant pays only their proportionate share of non-economic damages.',
    },
    {
      term: 'Proof of Service',
      plainEnglish:
        'A court form (usually POS-010) proving you delivered a copy of your complaint and summons to the defendant. California law requires proper service before a case can proceed (CCP §415.10-415.50).',
    },
  ],
} as const satisfies JurisdictionRuleConfig
