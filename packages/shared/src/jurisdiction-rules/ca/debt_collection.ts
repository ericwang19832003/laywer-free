import type { JurisdictionRuleConfig } from '../schema'

export const caDebtCollection = {
  state: 'CA',
  disputeType: 'debt_collection',

  requiredSections: [
    {
      id: 'caption',
      label: 'Caption',
      description:
        'Case caption identifying the court, parties, and case number. Must match the court where the suit was filed.',
      legalElements: [
        'Court name (Small Claims, Limited Civil, or Unlimited Civil)',
        'Plaintiff name (creditor, debt buyer, or debt collector)',
        'Defendant name (your legal name as it appears on the complaint)',
        'Case number placeholder (assigned by clerk at filing)',
      ],
      minParagraphs: 1,
    },
    {
      id: 'general_denial',
      label: 'General Denial',
      description:
        'A blanket denial of all allegations in the plaintiff\'s complaint. Under CCP §431.30, a general denial puts the plaintiff to its burden of proof on every element. If the complaint is verified, the answer must also be verified.',
      legalElements: [
        'Denial of each and every allegation (CCP §431.30)',
        'Demand that plaintiff prove all claims by a preponderance of evidence',
        'Note whether complaint is verified (verified complaint requires verified answer)',
      ],
      minParagraphs: 1,
    },
    {
      id: 'affirmative_defenses',
      label: 'Affirmative Defenses',
      description:
        'Specific legal defenses that, if proven, defeat the plaintiff\'s claim even if the underlying debt is valid. Must be pleaded in the answer or they are waived.',
      legalElements: [
        'Statute of limitations — 4-year limit for written contracts including credit cards (CCP §337, §337.2); 2-year limit for oral contracts (CCP §339)',
        'Lack of standing — plaintiff cannot prove an unbroken chain of assignment from the original creditor',
        'Rosenthal Fair Debt Collection Practices Act violations — collector engaged in unfair, deceptive, or abusive practices (CA Civil Code §1788 et seq.)',
        'FDCPA violations — debt collector engaged in unfair, deceptive, or abusive practices (15 U.S.C. §1692 et seq.)',
        'Payment / accord and satisfaction — debt was already paid or settled',
        'Statute of frauds — no written agreement exists to support the claimed debt',
      ],
      minParagraphs: 3,
    },
    {
      id: 'verification',
      label: 'Verification',
      description:
        'A sworn statement that the facts in the answer are true and correct. Required when the plaintiff\'s complaint is verified (CCP §446).',
      legalElements: [
        'Signed under penalty of perjury under the laws of the State of California',
        'Statement that the facts set forth in the answer are true and correct to the best of defendant\'s knowledge',
      ],
      minParagraphs: 1,
    },
    {
      id: 'proof_of_service',
      label: 'Proof of Service',
      description:
        'A declaration proving that a copy of the answer was delivered to the opposing party or their attorney, as required by CCP §1013.',
      legalElements: [
        'Date of service',
        'Method of service (personal delivery, mail, electronic service, or overnight delivery)',
        'Name and address of the party or attorney served',
      ],
      minParagraphs: 1,
    },
  ],

  filingRules: {
    courtName:
      'Small Claims Court (claims ≤$10,000), Limited Civil Court (claims ≤$25,000), or Unlimited Civil Court (claims >$25,000)',
    serviceRequirements:
      'Must serve all parties via personal delivery, mail, or electronic service per CCP §1013. Electronic service requires prior consent.',
    filingFee:
      '~$75 for Limited Civil; ~$435 for Unlimited Civil. Fee waiver available via form FW-001 (Request for Fee Waiver) for those who qualify based on income or government benefits.',
    maxPages: 25,
    fontRequirements: '12-point minimum for body text',
    marginRequirements: '1-inch margins on all sides',
    copies: 2,
    localFormUrl: 'https://www.courts.ca.gov/forms.htm',
  },

  rejectionReasons: [
    {
      reason: 'Missing verification paragraph',
      howToAvoid:
        'Include a signed verification stating that the facts in the answer are true and correct under penalty of perjury. Required if the plaintiff\'s complaint is verified (CCP §446).',
      wizardStep: 'review',
    },
    {
      reason: 'No proof of service attached',
      howToAvoid:
        'Attach a proof of service showing the date, method, and recipient of service per CCP §1013.',
      wizardStep: 'review',
    },
    {
      reason: 'Incorrect court name in caption',
      howToAvoid:
        'Verify the court name matches exactly what appears on the plaintiff\'s original complaint. Check Small Claims vs. Limited Civil vs. Unlimited Civil.',
      wizardStep: 'venue',
    },
    {
      reason: 'No case number referenced',
      howToAvoid:
        'Include the case number from the plaintiff\'s complaint in your caption. If you have not yet been assigned one, write "Case No. ____________" and the clerk will assign it.',
      wizardStep: 'parties',
    },
    {
      reason: 'Answer not verified when complaint is verified',
      howToAvoid:
        'If the plaintiff filed a verified complaint, your answer must also be verified under CCP §446. Check the complaint for a verification page.',
      wizardStep: 'facts',
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
            'Identifying the original creditor helps establish (or challenge) the chain of assignment. If the plaintiff is a debt buyer, they must prove they acquired valid ownership of the debt.',
        },
      ],
    },
    claims: {
      required: ['defense_type'],
      warnings: [
        {
          condition: 'no_rosenthal_act_specifics',
          message:
            'If raising a Rosenthal Act defense (CA Civil Code §1788), specify which provisions were violated. Unlike the federal FDCPA, the Rosenthal Act covers original creditors too — not just third-party collectors and debt buyers.',
        },
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
          condition: 'no_debt_collector_license_check',
          message:
            'Under SB 1286 (2020), debt collectors operating in California must be licensed. Check whether the plaintiff holds a valid CA debt collector license — lack of licensure can be a defense.',
        },
      ],
    },
  },

  glossary: [
    {
      term: 'Statute of Limitations',
      plainEnglish:
        'A legal deadline for the creditor to file a lawsuit. In California, the limit is 4 years for written contracts and credit card debt (CCP §337, §337.2) and 2 years for oral contracts (CCP §339). After that, the claim is time-barred.',
    },
    {
      term: 'General Denial',
      plainEnglish:
        'A response that denies everything the plaintiff claims. It forces them to prove every part of their case — you do not have to explain why you deny it (CCP §431.30).',
    },
    {
      term: 'Affirmative Defense',
      plainEnglish:
        'A legal reason why the plaintiff should lose even if the debt is real. For example, the lawsuit was filed too late, or the collector broke the law when trying to collect.',
    },
    {
      term: 'Rosenthal Fair Debt Collection Practices Act',
      plainEnglish:
        'California\'s own debt collection law (CA Civil Code §1788). Unlike the federal FDCPA, the Rosenthal Act covers original creditors too — not just third-party debt collectors and buyers.',
    },
    {
      term: 'FDCPA (Fair Debt Collection Practices Act)',
      plainEnglish:
        'A federal law (15 U.S.C. §1692) that prohibits debt collectors from using abusive, unfair, or deceptive practices. It does not apply to original creditors — only to third-party collectors and debt buyers.',
    },
    {
      term: 'Proof of Service',
      plainEnglish:
        'A declaration proving you sent a copy of your filing to the other side. California courts require this on every document you file (CCP §1013).',
    },
    {
      term: 'Fee Waiver',
      plainEnglish:
        'If you cannot afford the filing fee, you can file form FW-001 (Request for Fee Waiver). The court waives the fee if you qualify based on income or government benefits.',
    },
    {
      term: 'Debt Validation',
      plainEnglish:
        'Your right under the FDCPA to demand proof that the debt is real and that the collector has the right to collect it. The collector must respond within 30 days or stop collection activity.',
    },
    {
      term: 'Accord and Satisfaction',
      plainEnglish:
        'A defense that applies when the debt was already settled — for example, if you and the creditor agreed on a lesser payment and you paid it. The original claim is then extinguished.',
    },
  ],
} as const satisfies JurisdictionRuleConfig
