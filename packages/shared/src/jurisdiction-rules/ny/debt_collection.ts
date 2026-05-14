import type { JurisdictionRuleConfig } from '../schema'

export const nyDebtCollection = {
  state: 'NY',
  disputeType: 'debt_collection',

  requiredSections: [
    {
      id: 'caption',
      label: 'Caption',
      description:
        'Case caption identifying the court, parties, and index/docket number. Must match the court where the suit was filed.',
      legalElements: [
        'Court name (NYC Civil Court, Small Claims, or Supreme Court)',
        'Plaintiff name (creditor or debt buyer)',
        'Defendant name (your legal name as it appears on the summons)',
        'Index/docket number (assigned by clerk at filing)',
      ],
      minParagraphs: 1,
    },
    {
      id: 'answer_denials',
      label: 'Specific Denials',
      description:
        'New York requires specific denials under CPLR \u00A73018. Unlike a general denial, you must respond to each allegation individually \u2014 admitting, denying, or stating you lack sufficient knowledge to admit or deny.',
      legalElements: [
        'Specific denial of each material allegation (CPLR \u00A73018)',
        'Denial of knowledge or information sufficient to form a belief as to allegations you cannot verify',
        'Admission of any allegations that are true (e.g., your name and address)',
        'Demand that plaintiff prove all claims by a preponderance of evidence',
      ],
      minParagraphs: 2,
    },
    {
      id: 'affirmative_defenses',
      label: 'Affirmative Defenses',
      description:
        'Specific legal defenses that, if proven, defeat the plaintiff\'s claim even if the underlying debt is valid. Must be pleaded in the answer or they are waived (CPLR \u00A73018(b)).',
      legalElements: [
        'Statute of limitations \u2014 3-year limit for consumer credit transactions (CPLR \u00A7214(2), as amended by Consumer Credit Fairness Act 2021)',
        'Statute of limitations \u2014 6-year limit for written contracts (CPLR \u00A7213(2))',
        'Lack of standing \u2014 plaintiff cannot prove an unbroken chain of assignment from the original creditor',
        'FDCPA violations \u2014 debt collector engaged in unfair, deceptive, or abusive practices (15 U.S.C. \u00A71692 et seq.)',
        'Consumer Credit Fairness Act \u2014 complaint fails to include required specifics (original creditor, charge-off balance, last payment date)',
        'Failure to state a cause of action \u2014 complaint does not meet pleading requirements (CPLR \u00A73015(a), \u00A73211(a)(7))',
        'Violation of NY General Business Law \u00A7601 \u2014 debt collection regulations',
      ],
      minParagraphs: 3,
    },
    {
      id: 'verification',
      label: 'Verification',
      description:
        'A sworn statement that the facts in the answer are true and correct. Required when the plaintiff\'s complaint is verified (CPLR \u00A73020(a)). If the complaint is verified and your answer is not, the answer may be treated as a general denial.',
      legalElements: [
        'Signed under penalty of perjury under the laws of the State of New York',
        'Statement that the facts set forth in the answer are true and correct to the best of defendant\'s knowledge',
      ],
      minParagraphs: 1,
    },
    {
      id: 'proof_of_service',
      label: 'Proof of Service',
      description:
        'Certification that a copy of the answer was delivered to the opposing party or their attorney, as required by CPLR \u00A72103.',
      legalElements: [
        'Date of service',
        'Method of service (personal delivery, mail, or electronic means per CPLR \u00A72103)',
        'Name and address of the party or attorney served',
      ],
      minParagraphs: 1,
    },
  ],

  filingRules: {
    courtName:
      'NYC Civil Court (claims up to $25,000), Small Claims Court (claims up to $10,000), or Supreme Court (unlimited jurisdiction)',
    serviceRequirements:
      'Must serve all parties via personal delivery, first-class mail, or electronic means per CPLR \u00A72103. Answer deadline is 20 days after personal service or 30 days after service by mail.',
    filingFee:
      '~$45 for Civil Court, ~$210 for Supreme Court. Poor person relief available under CPLR \u00A71101 if you cannot afford the fee.',
    maxPages: 25,
    fontRequirements: '12-point minimum for body text',
    marginRequirements: '1-inch margins on all sides',
    copies: 2,
    localFormUrl: 'https://www.nycourts.gov/forms/',
  },

  rejectionReasons: [
    {
      reason: 'Answer not verified when complaint is verified',
      howToAvoid:
        'Check whether the plaintiff\'s complaint includes a verification. If so, your answer must also be verified under CPLR \u00A73020(a).',
      wizardStep: 'review',
    },
    {
      reason: 'General denial used instead of specific denials',
      howToAvoid:
        'New York requires specific denials under CPLR \u00A73018. Respond to each allegation individually \u2014 do not use a blanket general denial.',
      wizardStep: 'facts',
    },
    {
      reason: 'No proof of service attached',
      howToAvoid:
        'Attach a proof of service showing the date, method, and recipient of service per CPLR \u00A72103.',
      wizardStep: 'review',
    },
    {
      reason: 'Incorrect court name in caption',
      howToAvoid:
        'Verify the court name matches exactly what appears on the plaintiff\'s summons and complaint. Check Civil Court vs. Small Claims vs. Supreme Court.',
      wizardStep: 'venue',
    },
    {
      reason: 'Filed after answer deadline',
      howToAvoid:
        'Answer within 20 days of personal service or 30 days of mail service. If you miss the deadline, move to vacate the default judgment under CPLR \u00A75015.',
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
            'Consider noting whether you received a written debt validation notice within 30 days of first contact. Under the FDCPA (15 U.S.C. \u00A71692g), the collector must send one \u2014 failure to do so strengthens your defense.',
        },
        {
          condition: 'no_debt_buyer_vs_original_creditor',
          message:
            'Identify whether the plaintiff is the original creditor or a debt buyer. Debt buyers must prove an unbroken chain of assignment and comply with the Consumer Credit Fairness Act\u2019s additional pleading requirements.',
        },
      ],
    },
    claims: {
      required: ['defense_type'],
      warnings: [
        {
          condition: 'no_consumer_credit_fairness_act_specifics',
          message:
            'Under the Consumer Credit Fairness Act (2021), the complaint must identify the original creditor, charge-off balance, and last payment date. Check whether the complaint meets these requirements \u2014 if not, move to dismiss under CPLR \u00A73211(a)(7).',
        },
        {
          condition: 'no_sol_calculation',
          message:
            'Verify whether the 3-year consumer credit SOL (CPLR \u00A7214(2)) or 6-year written contract SOL (CPLR \u00A7213(2)) applies. The Consumer Credit Fairness Act shortened the consumer credit SOL from 6 to 3 years effective April 2022.',
        },
      ],
    },
    parties: {
      required: [],
      warnings: [
        {
          condition: 'no_debt_collector_licensing_check',
          message:
            'Verify that the debt collector or debt buyer is properly licensed under NY Department of Financial Services regulations. An unlicensed collector may lack standing to sue.',
        },
      ],
    },
  },

  glossary: [
    {
      term: 'Statute of Limitations (Consumer Credit)',
      plainEnglish:
        'A legal deadline for the creditor to file a lawsuit. In New York, the limit is 3 years for consumer credit transactions (CPLR \u00A7214(2), as amended by the Consumer Credit Fairness Act in 2021). After that, the claim is time-barred.',
    },
    {
      term: 'Specific Denial',
      plainEnglish:
        'New York does not allow a blanket "general denial." Under CPLR \u00A73018, you must respond to each allegation individually \u2014 admitting it, denying it, or saying you lack enough information to admit or deny it.',
    },
    {
      term: 'Affirmative Defense',
      plainEnglish:
        'A legal reason why the plaintiff should lose even if the debt is real. For example, the lawsuit was filed too late (statute of limitations), or the collector broke the law when trying to collect.',
    },
    {
      term: 'FDCPA (Fair Debt Collection Practices Act)',
      plainEnglish:
        'A federal law (15 U.S.C. \u00A71692) that prohibits debt collectors from using abusive, unfair, or deceptive practices. It does not apply to original creditors \u2014 only to third-party collectors and debt buyers.',
    },
    {
      term: 'Consumer Credit Fairness Act',
      plainEnglish:
        'A 2021 New York law (S153/A2382) that shortened the statute of limitations for consumer credit debt from 6 years to 3 years, and requires debt collectors to include more details in their complaints \u2014 such as the original creditor and last payment date.',
    },
    {
      term: 'Proof of Service',
      plainEnglish:
        'A short statement proving you sent a copy of your filing to the other side. New York courts require this on every document you file (CPLR \u00A72103).',
    },
    {
      term: 'Poor Person Relief',
      plainEnglish:
        'If you cannot afford the filing fee, you can apply for poor person relief under CPLR \u00A71101. The court waives the fee if you qualify based on income or financial hardship.',
    },
    {
      term: 'Debt Validation',
      plainEnglish:
        'Your right under the FDCPA to demand proof that the debt is real and that the collector has the right to collect it. The collector must respond within 30 days or stop collection activity.',
    },
  ],
} as const satisfies JurisdictionRuleConfig
