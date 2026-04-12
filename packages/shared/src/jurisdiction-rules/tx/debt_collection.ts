import type { JurisdictionRuleConfig } from '../schema'

export const txDebtCollection = {
  state: 'TX',
  disputeType: 'debt_collection',

  requiredSections: [
    {
      id: 'caption',
      label: 'Caption',
      description:
        'Case caption identifying the court, parties, and cause number. Must match the court where the suit was filed.',
      legalElements: [
        'Court name (Justice of the Peace, County, or District Court)',
        'Plaintiff name (creditor or debt buyer)',
        'Defendant name (your legal name as it appears on the petition)',
        'Cause number placeholder (assigned by clerk at filing)',
      ],
      minParagraphs: 1,
    },
    {
      id: 'general_denial',
      label: 'General Denial',
      description:
        'A blanket denial of all allegations in the plaintiff\'s petition. Under TX Rule of Civil Procedure 92, a general denial puts the plaintiff to its burden of proof on every element.',
      legalElements: [
        'Denial of each and every allegation (TRCP Rule 92)',
        'Demand that plaintiff prove all claims by a preponderance of evidence',
      ],
      minParagraphs: 1,
    },
    {
      id: 'affirmative_defenses',
      label: 'Affirmative Defenses',
      description:
        'Specific legal defenses that, if proven, defeat the plaintiff\'s claim even if the underlying debt is valid. Must be pleaded or they are waived (TRCP Rule 94).',
      legalElements: [
        'Statute of limitations — 4-year limit for debt on a written contract (TX CPRC §16.004)',
        'Lack of standing — plaintiff cannot prove an unbroken chain of assignment from the original creditor',
        'FDCPA violations — debt collector engaged in unfair, deceptive, or abusive practices (15 U.S.C. §1692 et seq.)',
        'Improper service — plaintiff failed to serve defendant in compliance with TRCP Rules 106-108',
      ],
      minParagraphs: 3,
    },
    {
      id: 'verification',
      label: 'Verification',
      description:
        'A sworn statement that the facts in the answer are true and correct. Required when the plaintiff\'s petition is verified (TRCP Rule 93).',
      legalElements: [
        'Signed under penalty of perjury under the laws of the State of Texas',
        'Statement that the facts set forth in the answer are true and correct to the best of defendant\'s knowledge',
      ],
      minParagraphs: 1,
    },
    {
      id: 'certificate_of_service',
      label: 'Certificate of Service',
      description:
        'Certification that a copy of the answer was delivered to the opposing party or their attorney, as required by TRCP Rule 21a.',
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
      'Justice of the Peace Court (claims under $20,000) or County/District Court (claims $20,000 and above)',
    serviceRequirements:
      'Must serve all parties via certified mail, hand delivery, e-service, or fax per TX Rule of Civil Procedure 21a. E-service requires prior written agreement.',
    filingFee:
      '$54 for Justice of the Peace Court (fee waiver available via Statement of Inability to Afford Payment of Court Costs, TX Gov\'t Code §6.001)',
    maxPages: 25,
    fontRequirements: '14-point minimum for body text in JP Court',
    marginRequirements: '1-inch margins on all sides',
    copies: 2,
    localFormUrl: 'https://www.txcourts.gov/rules-forms/forms/',
  },

  rejectionReasons: [
    {
      reason: 'Missing verification paragraph',
      howToAvoid:
        'Include a signed verification stating that the facts in the answer are true and correct under penalty of perjury.',
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
        'Verify the court name matches exactly what appears on the plaintiff\'s original petition. Check JP Court vs. County Court vs. District Court.',
      wizardStep: 'venue',
    },
    {
      reason: 'No cause number referenced',
      howToAvoid:
        'Include the cause number from the plaintiff\'s petition in your caption. If you have not yet been assigned one, write "Cause No. ____________" and the clerk will assign it.',
      wizardStep: 'parties',
    },
  ],

  stepValidations: {
    facts: {
      required: ['debt_origination_date'],
      warnings: [
        {
          condition: 'no_validation_notice_mentioned',
          message:
            'Consider noting whether you received a written debt validation notice within 30 days of first contact. Under the FDCPA (15 U.S.C. §1692g), the collector must send one — failure to do so strengthens your defense.',
        },
        {
          condition: 'no_original_creditor_identified',
          message:
            'Identifying the original creditor helps establish (or challenge) the chain of assignment. If the plaintiff is a debt buyer, they must prove they acquired valid ownership.',
        },
      ],
    },
    claims: {
      required: ['defense_type'],
      warnings: [
        {
          condition: 'no_specific_fdcpa_violations',
          message:
            'If raising an FDCPA defense, specify which provisions were violated (e.g., §1692d harassment, §1692e false representations, §1692f unfair practices). Specificity strengthens your pleading.',
        },
      ],
    },
    parties: {
      required: [],
      warnings: [
        {
          condition: 'no_opposing_party_address',
          message:
            'You will need the plaintiff\'s or their attorney\'s address for the certificate of service. Check the original petition for this information.',
        },
      ],
    },
  },

  glossary: [
    {
      term: 'Statute of Limitations',
      plainEnglish:
        'A legal deadline for the creditor to file a lawsuit. In Texas, the limit is usually 4 years for debt on a written contract (TX CPRC §16.004). After that, the claim is time-barred.',
    },
    {
      term: 'General Denial',
      plainEnglish:
        'A one-paragraph response that denies everything the plaintiff claims. It forces them to prove every part of their case — you do not have to explain why you deny it.',
    },
    {
      term: 'Affirmative Defense',
      plainEnglish:
        'A legal reason why the plaintiff should lose even if the debt is real. For example, the lawsuit was filed too late, or the collector broke the law when trying to collect.',
    },
    {
      term: 'FDCPA (Fair Debt Collection Practices Act)',
      plainEnglish:
        'A federal law (15 U.S.C. §1692) that prohibits debt collectors from using abusive, unfair, or deceptive practices. It does not apply to original creditors — only to third-party collectors and debt buyers.',
    },
    {
      term: 'Verification',
      plainEnglish:
        'A sworn statement at the end of your answer confirming the facts are true. Think of it as signing under oath. Some courts require it if the plaintiff\'s petition is verified.',
    },
    {
      term: 'Certificate of Service',
      plainEnglish:
        'A short statement proving you sent a copy of your filing to the other side. Texas courts require this on every document you file (TRCP Rule 21a).',
    },
    {
      term: 'Fee Waiver',
      plainEnglish:
        'If you cannot afford the filing fee, you can file a Statement of Inability to Afford Payment of Court Costs. The court waives the fee if you qualify based on income or government assistance.',
    },
    {
      term: 'Original Creditor',
      plainEnglish:
        'The company you originally owed money to (e.g., the credit card company or hospital). They may have sold the debt to a debt buyer, who is now suing you.',
    },
    {
      term: 'Debt Validation',
      plainEnglish:
        'Your right under the FDCPA to demand proof that the debt is real and that the collector has the right to collect it. The collector must respond within 30 days or stop collection activity.',
    },
  ],
} as const satisfies JurisdictionRuleConfig
