import type { JurisdictionRuleConfig } from '../schema'

export const paDebtCollection = {
  state: 'PA',
  disputeType: 'debt_collection',

  requiredSections: [
    {
      id: 'caption',
      label: 'Caption',
      description:
        'Case caption identifying the court, parties, and docket number. Must include the required Notice to Defend per Pa.R.C.P. 1018.',
      legalElements: [
        'Court name (Magisterial District Court for claims up to $12,000 or Court of Common Pleas for unlimited jurisdiction)',
        'Plaintiff name (creditor or debt buyer)',
        'Defendant name (your legal name as it appears on the complaint)',
        'Docket number placeholder (assigned by clerk at filing)',
        'Notice to defend as required by Pa.R.C.P. 1018',
      ],
      minParagraphs: 1,
    },
    {
      id: 'preliminary_objections',
      label: 'Preliminary Objections',
      description:
        'Objections to the legal sufficiency of the complaint, improper venue, or defective service. Filed in lieu of or before an answer when procedural defects exist. Governed by Pa.R.C.P. 1028.',
      legalElements: [
        'Legal insufficiency of the complaint (demurrer) — failure to state a claim upon which relief can be granted (Pa.R.C.P. 1028(a)(4))',
        'Improper venue — action not filed in the county where defendant resides or where the transaction occurred (Pa.R.C.P. 1006)',
        'Lack of capacity to sue — plaintiff cannot prove standing as assignee of the debt',
        'Defective service of process — failure to comply with Pa.R.C.P. 400-441',
      ],
      minParagraphs: 2,
    },
    {
      id: 'answer_denials',
      label: 'Answer with Specific Denials',
      description:
        'Under Pa.R.C.P. 1029, all allegations in the complaint must be specifically admitted or denied. A general denial is NOT permitted in Pennsylvania — each paragraph must be addressed individually. Failure to deny is deemed an admission.',
      legalElements: [
        'Paragraph-by-paragraph response to each allegation in the complaint (Pa.R.C.P. 1029(b))',
        'Specific denial of the debt amount, ownership chain, and account terms',
        'Denial of any allegation for which defendant lacks sufficient knowledge or information (Pa.R.C.P. 1029(c))',
        'Demand that plaintiff prove all claims by a preponderance of evidence',
      ],
      minParagraphs: 3,
    },
    {
      id: 'new_matter',
      label: 'New Matter (Affirmative Defenses)',
      description:
        'Affirmative defenses are filed as "New Matter" under Pa.R.C.P. 1030. The plaintiff must file a reply to new matter within 20 days or the averments are deemed admitted.',
      legalElements: [
        'Statute of limitations — 4-year limit for written and oral contracts (42 Pa.C.S. \u00A75525(a))',
        'Lack of standing — plaintiff cannot prove an unbroken chain of assignment from the original creditor',
        'FCEUA violations — plaintiff engaged in practices prohibited by the Fair Credit Extension Uniformity Act (73 P.S. \u00A72270.1-2270.5)',
        'FDCPA violations — debt collector engaged in unfair, deceptive, or abusive practices (15 U.S.C. \u00A71692 et seq.)',
        'Confession of judgment improperly obtained — judgment entered without proper notice or on an unconscionable contract term',
        'Payment or accord and satisfaction — debt has been paid in full or settled',
      ],
      minParagraphs: 3,
    },
    {
      id: 'verification',
      label: 'Verification',
      description:
        'A sworn statement that the facts in the answer and new matter are true and correct. Pennsylvania requires verification of pleadings containing averments of fact (Pa.R.C.P. 1024).',
      legalElements: [
        'Signed statement that the facts set forth are true and correct to the best of the signer\'s knowledge, information, and belief',
        'Acknowledgment that false statements are subject to penalties under 18 Pa.C.S. \u00A74904 (unsworn falsification to authorities)',
      ],
      minParagraphs: 1,
    },
    {
      id: 'certificate_of_service',
      label: 'Certificate of Service',
      description:
        'Certification that a copy of the answer, new matter, and any preliminary objections were served on the opposing party or their attorney, as required by Pa.R.C.P. 440.',
      legalElements: [
        'Date of service',
        'Method of service (personal delivery, first-class mail, or electronic filing if available)',
        'Name and address of the party or attorney served',
      ],
      minParagraphs: 1,
    },
  ],

  filingRules: {
    courtName:
      'Magisterial District Court (claims up to $12,000) or Court of Common Pleas (unlimited civil jurisdiction)',
    serviceRequirements:
      'Must serve all parties by personal delivery or first-class mail per Pa.R.C.P. 440. Original process served per Pa.R.C.P. 400-441.',
    filingFee:
      '~$50 for Magisterial District Court, ~$100-300 for Court of Common Pleas (In Forma Pauperis petition available for fee waiver under Pa.R.C.P. 240)',
    maxPages: 30,
    fontRequirements: '12-point minimum for body text; some counties require specific fonts (check local rules)',
    marginRequirements: '1-inch margins on all sides',
    copies: 2,
    localFormUrl: 'https://www.pacourts.us/forms',
  },

  rejectionReasons: [
    {
      reason: 'Missing verification paragraph',
      howToAvoid:
        'Include a signed verification stating that the facts are true and correct under penalty of law per Pa.R.C.P. 1024.',
      wizardStep: 'review',
    },
    {
      reason: 'No certificate of service attached',
      howToAvoid:
        'Attach a certificate of service showing the date, method, and recipient of service per Pa.R.C.P. 440.',
      wizardStep: 'review',
    },
    {
      reason: 'General denial used instead of specific denials',
      howToAvoid:
        'Pennsylvania does not permit general denials. Under Pa.R.C.P. 1029, each allegation must be specifically admitted, denied, or denied based on insufficient knowledge. Respond paragraph-by-paragraph.',
      wizardStep: 'claims',
    },
    {
      reason: 'Affirmative defenses not filed as New Matter',
      howToAvoid:
        'Affirmative defenses must be raised as "New Matter" under Pa.R.C.P. 1030. Do not include them in the answer section — file them as a separate section labeled "New Matter."',
      wizardStep: 'claims',
    },
    {
      reason: 'Incorrect court name in caption',
      howToAvoid:
        'Verify the court name matches the complaint. For claims up to $12,000, the case is in Magisterial District Court. For larger amounts, it is in the Court of Common Pleas for the appropriate county.',
      wizardStep: 'venue',
    },
    {
      reason: 'Answer filed after 20-day deadline',
      howToAvoid:
        'The answer to a complaint in the Court of Common Pleas is due within 20 days of service. File early to avoid default judgment. In Magisterial District Court, appearances are scheduled by the court.',
      wizardStep: 'how_to_file',
    },
  ],

  stepValidations: {
    facts: {
      required: ['debt_origination_date'],
      warnings: [
        {
          condition: 'no_validation_notice_mentioned',
          message:
            'Consider noting whether you received a written debt validation notice within 30 days of first contact. Under the FDCPA (15 U.S.C. \u00A71692g), the collector must send one — failure to do so strengthens your defense.',
        },
        {
          condition: 'no_original_creditor_identified',
          message:
            'Identifying the original creditor helps establish (or challenge) the chain of assignment. If the plaintiff is a debt buyer, they must prove they acquired valid ownership of your specific account.',
        },
        {
          condition: 'no_confession_of_judgment_check',
          message:
            'Check whether your original contract contains a confession of judgment clause. Pennsylvania allows these in contracts, but they are increasingly restricted for consumer debt and may be challenged as unconscionable.',
        },
      ],
    },
    claims: {
      required: ['defense_type'],
      warnings: [
        {
          condition: 'no_specific_fdcpa_violations',
          message:
            'If raising an FDCPA defense, specify which provisions were violated (e.g., \u00A71692d harassment, \u00A71692e false representations, \u00A71692f unfair practices). Specificity strengthens your pleading.',
        },
        {
          condition: 'no_fceua_violations',
          message:
            'Consider whether the plaintiff violated the Pennsylvania Fair Credit Extension Uniformity Act (73 P.S. \u00A72270.1-2270.5), which prohibits unfair or deceptive practices in credit extension and debt collection within PA.',
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
        'A legal deadline for the creditor to file a lawsuit. In Pennsylvania, the limit is 4 years for both written and oral contracts (42 Pa.C.S. \u00A75525(a)). After that, the claim is time-barred and you can raise it as a defense.',
    },
    {
      term: 'Specific Denial',
      plainEnglish:
        'Under Pa.R.C.P. 1029, Pennsylvania does not allow you to simply deny everything at once (a "general denial"). Instead, you must respond to each paragraph of the complaint individually — admitting, denying, or stating you lack enough information to respond.',
    },
    {
      term: 'New Matter',
      plainEnglish:
        'The section of your answer where you raise affirmative defenses — legal reasons you should win even if the debt is valid. Filed under Pa.R.C.P. 1030. The plaintiff must reply to your new matter within 20 days or your claims are deemed admitted.',
    },
    {
      term: 'FCEUA (Fair Credit Extension Uniformity Act)',
      plainEnglish:
        'Pennsylvania\'s state debt collection law (73 P.S. \u00A72270.1-2270.5). It prohibits unfair or deceptive practices by creditors and collectors in Pennsylvania, similar to the federal FDCPA but applying to a broader range of entities.',
    },
    {
      term: 'FDCPA (Fair Debt Collection Practices Act)',
      plainEnglish:
        'A federal law (15 U.S.C. \u00A71692) that prohibits debt collectors from using abusive, unfair, or deceptive practices. It does not apply to original creditors — only to third-party collectors and debt buyers.',
    },
    {
      term: 'Confession of Judgment',
      plainEnglish:
        'A clause in some contracts that allows the creditor to obtain a court judgment against you without filing a lawsuit or notifying you first. Pennsylvania permits these, but they are increasingly challenged in consumer debt cases as unconscionable.',
    },
    {
      term: 'In Forma Pauperis (IFP)',
      plainEnglish:
        'A petition to waive court filing fees if you cannot afford them. Under Pa.R.C.P. 240, you can file an IFP petition showing your income and expenses. If approved, the court waives the filing fee.',
    },
    {
      term: 'Magisterial District Court',
      plainEnglish:
        'Pennsylvania\'s local court that handles civil cases up to $12,000, including many debt collection suits. Procedures are less formal than the Court of Common Pleas, and attorneys are not required.',
    },
    {
      term: 'Verification',
      plainEnglish:
        'A sworn statement at the end of your answer confirming the facts are true. Under Pa.R.C.P. 1024, pleadings containing averments of fact must be verified. False statements can result in penalties under 18 Pa.C.S. \u00A74904.',
    },
  ],
} as const satisfies JurisdictionRuleConfig
