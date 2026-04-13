import type { JurisdictionRuleConfig } from '../schema'

export const flDebtCollection = {
  state: 'FL',
  disputeType: 'debt_collection',

  requiredSections: [
    {
      id: 'caption',
      label: 'Caption',
      description:
        'Case caption identifying the court, parties, and case number. Must match the court where the suit was filed.',
      legalElements: [
        'Court name (Small Claims ≤$8,000, County Court ≤$50,000, or Circuit Court >$50,000)',
        'Plaintiff name (creditor, debt buyer, or collection agency)',
        'Defendant name (your legal name as it appears on the complaint)',
        'Case number placeholder (assigned by clerk at filing)',
      ],
      minParagraphs: 1,
    },
    {
      id: 'general_denial',
      label: 'General Denial',
      description:
        'A blanket denial of all allegations in the plaintiff\'s complaint. Under FL Rule of Civil Procedure 1.110, a general denial puts the plaintiff to its burden of proof on every element.',
      legalElements: [
        'Denial of each and every allegation (FL R. Civ. P. 1.110)',
        'Demand that plaintiff prove all claims by a preponderance of evidence',
      ],
      minParagraphs: 1,
    },
    {
      id: 'affirmative_defenses',
      label: 'Affirmative Defenses',
      description:
        'Specific legal defenses that, if proven, defeat the plaintiff\'s claim even if the underlying debt is valid. Must be pleaded or they are waived.',
      legalElements: [
        'Statute of limitations — 5-year limit for written contracts (FL Stat. §95.11(2)(b)); 4-year limit for oral contracts (FL Stat. §95.11(3)(k))',
        'Lack of standing — plaintiff cannot prove an unbroken chain of assignment from the original creditor',
        'FCCPA violations — collector engaged in prohibited practices under FL Stat. §559.72',
        'FDCPA violations — debt collector engaged in unfair, deceptive, or abusive practices (15 U.S.C. §1692 et seq.)',
        'Accord and satisfaction — debt was previously settled or resolved',
      ],
      minParagraphs: 3,
    },
    {
      id: 'verification',
      label: 'Verification',
      description:
        'A sworn statement that the facts in the answer are true and correct. Required when the plaintiff\'s complaint is verified.',
      legalElements: [
        'Signed under penalty of perjury under the laws of the State of Florida',
        'Statement that the facts set forth in the answer are true and correct to the best of defendant\'s knowledge',
      ],
      minParagraphs: 1,
    },
    {
      id: 'certificate_of_service',
      label: 'Certificate of Service',
      description:
        'Certification that a copy of the answer was delivered to the opposing party or their attorney, as required by FL Rule of Civil Procedure 1.080.',
      legalElements: [
        'Date of service',
        'Method of service (mail, hand delivery, e-service, or fax)',
        'Name and address of the party or attorney served',
      ],
      minParagraphs: 1,
    },
  ],

  filingRules: {
    courtName:
      'Small Claims Court (claims ≤$8,000), County Court (claims ≤$50,000), or Circuit Court (claims >$50,000)',
    serviceRequirements:
      'Must serve all parties via mail, hand delivery, e-service, or fax per FL Rule of Civil Procedure 1.080. Venue is in the county where the defendant resides (FL Stat. §47.011).',
    filingFee:
      '~$55 for County Court, ~$400 for Circuit Court (fee waiver available via Application for Determination of Civil Indigent Status)',
    maxPages: 25,
    fontRequirements: '12-point minimum for body text',
    marginRequirements: '1-inch margins on all sides',
    copies: 2,
    localFormUrl: 'https://www.flcourts.gov/resources-and-services/court-improvement/family-courts/family-law-self-help-information/family-law-forms',
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
        'Attach a certificate of service showing the date, method, and recipient of service per FL R. Civ. P. 1.080.',
      wizardStep: 'review',
    },
    {
      reason: 'Incorrect court name in caption',
      howToAvoid:
        'Verify the court name matches exactly what appears on the plaintiff\'s original complaint. Check Small Claims vs. County Court vs. Circuit Court.',
      wizardStep: 'venue',
    },
    {
      reason: 'No case number referenced',
      howToAvoid:
        'Include the case number from the plaintiff\'s complaint in your caption. If you have not yet been assigned one, write "Case No. ____________" and the clerk will assign it.',
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
          condition: 'no_specific_fccpa_violations',
          message:
            'If raising an FCCPA defense, specify which provisions of FL Stat. §559.72 were violated. The FCCPA covers original creditors AND third-party collectors, unlike the federal FDCPA.',
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
          condition: 'no_opposing_party_address',
          message:
            'You will need the plaintiff\'s or their attorney\'s address for the certificate of service. Check the original complaint for this information.',
        },
      ],
    },
  },

  glossary: [
    {
      term: 'Statute of Limitations',
      plainEnglish:
        'A legal deadline for the creditor to file a lawsuit. In Florida, the limit is 5 years for written contracts (FL Stat. §95.11(2)(b)) and 4 years for oral contracts (FL Stat. §95.11(3)(k)). Tolling provisions under FL Stat. §95.051 may extend the deadline.',
    },
    {
      term: 'General Denial',
      plainEnglish:
        'A one-paragraph response that denies everything the plaintiff claims. Under FL R. Civ. P. 1.110, it forces them to prove every part of their case — you do not have to explain why you deny it.',
    },
    {
      term: 'Affirmative Defense',
      plainEnglish:
        'A legal reason why the plaintiff should lose even if the debt is real. For example, the lawsuit was filed too late, or the collector broke state or federal law when trying to collect.',
    },
    {
      term: 'FCCPA (Florida Consumer Collection Practices Act)',
      plainEnglish:
        'A Florida state law (FL Stat. §559.55-559.785) that prohibits abusive debt collection practices. Unlike the federal FDCPA, the FCCPA applies to original creditors AND third-party collectors.',
    },
    {
      term: 'FDCPA (Fair Debt Collection Practices Act)',
      plainEnglish:
        'A federal law (15 U.S.C. §1692) that prohibits debt collectors from using abusive, unfair, or deceptive practices. It does not apply to original creditors — only to third-party collectors and debt buyers.',
    },
    {
      term: 'Certificate of Service',
      plainEnglish:
        'A short statement proving you sent a copy of your filing to the other side. Florida courts require this on every document you file (FL R. Civ. P. 1.080).',
    },
    {
      term: 'Fee Waiver',
      plainEnglish:
        'If you cannot afford the filing fee, you can file an Application for Determination of Civil Indigent Status. The court waives the fee if you qualify based on income or government assistance.',
    },
    {
      term: 'Debt Validation',
      plainEnglish:
        'Your right under the FDCPA to demand proof that the debt is real and that the collector has the right to collect it. The collector must respond within 30 days or stop collection activity.',
    },
    {
      term: 'Accord and Satisfaction',
      plainEnglish:
        'A defense that the debt was already settled or resolved through a prior agreement. If you and the creditor agreed on a different payment and you fulfilled it, the original debt is extinguished.',
    },
  ],
} as const satisfies JurisdictionRuleConfig
