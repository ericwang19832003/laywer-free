import type { GuidedStepConfig } from '../types'

export const debtAnswerPrepNyConfig: GuidedStepConfig = {
  title: 'Prepare Your Answer',
  reassurance:
    'Filing an answer is the single most important step. It prevents automatic judgment against you.',

  questions: [
    {
      id: 'what_is_answer',
      type: 'info',
      prompt:
        'AN ANSWER IS YOUR RESPONSE TO THE LAWSUIT.\n\nThe plaintiff filed a complaint saying you owe money. Your Answer is your official response to the court. If you don\'t file one in time, the court automatically rules against you (a "default judgment") — and the collector can garnish wages and freeze bank accounts.\n\nFiling an Answer forces the plaintiff to PROVE their case. Under the Consumer Credit Fairness Act (2021), plaintiffs must meet strict requirements — many debt collectors cannot.',
    },
    {
      id: 'court_type',
      type: 'single_choice',
      prompt: 'Which court is the case filed in?',
      helpText:
        'Check the top of your summons. NYC Civil Court handles claims up to $50,000. City Courts outside NYC handle claims up to $15,000. Supreme Court handles any amount. Small Claims is $10,000 in NYC, $5,000 elsewhere.',
      options: [
        { value: 'nyc_civil', label: 'NYC Civil Court — up to $50,000' },
        { value: 'city_court', label: 'City Court (outside NYC) — up to $15,000' },
        { value: 'supreme', label: 'Supreme Court — any amount' },
        { value: 'small_claims', label: 'Small Claims' },
        { value: 'unsure', label: 'I am not sure' },
      ],
    },

    // === Service Method & Deadline ===
    {
      id: 'service_method',
      type: 'single_choice',
      prompt: 'How were you served with the lawsuit papers?',
      helpText:
        'This determines your deadline to file an Answer. Check your papers carefully — improper service is a common defense in NY debt cases.',
      options: [
        { value: 'personal_in_state', label: 'Personally handed to me in New York State' },
        { value: 'substituted', label: 'Left with someone at my home/work + mailed' },
        { value: 'nail_and_mail', label: 'Affixed to my door + mailed ("nail and mail")' },
        { value: 'other', label: 'Other method or not sure' },
      ],
    },
    {
      id: 'deadline_personal',
      type: 'info',
      prompt:
        'YOUR DEADLINE: 20 DAYS\n\nSince you were personally served in New York State, you have 20 days from the date of service to file your Answer or make a pre-answer motion (CPLR §320(a)).\n\nCount calendar days (including weekends), but if the last day falls on a Saturday, Sunday, or court holiday, you have until the next business day.',
      showIf: (answers) => answers.service_method === 'personal_in_state',
    },
    {
      id: 'deadline_other',
      type: 'info',
      prompt:
        'YOUR DEADLINE: 30 DAYS\n\nSince you were served by a method other than personal delivery in-state, you have 30 days from the date service is complete to file your Answer or make a pre-answer motion (CPLR §320(a)).\n\nFor substituted service ("leave and mail"), service is complete 10 days after the mailing. For "nail and mail," service is complete 10 days after the mailing and filing of proof of service.\n\nCount calendar days, but if the last day falls on a Saturday, Sunday, or court holiday, you have until the next business day.',
      showIf: (answers) =>
        answers.service_method === 'substituted' ||
        answers.service_method === 'nail_and_mail' ||
        answers.service_method === 'other',
    },

    // === CCFA Compliance Check ===
    {
      id: 'ccfa_info',
      type: 'info',
      prompt:
        'CHECK THE COMPLAINT FOR CCFA COMPLIANCE\n\nSince 2022, the Consumer Credit Fairness Act (CCFA) requires the plaintiff\'s complaint to include ALL of the following:\n\n1. Name of the ORIGINAL creditor (not just the debt buyer)\n2. Last four digits of your account number\n3. Date and amount of your last payment\n4. A copy of the credit agreement or contract\n5. A copy of the charge-off statement\n\nIf ANY of these are missing, the complaint is defective. This is grounds for dismissal or a strong defense in your Answer.\n\nThe CCFA also requires an "Additional Notice of Lawsuit" mailed to you in English and Spanish.',
    },
    {
      id: 'ccfa_compliant',
      type: 'single_choice',
      prompt: 'Does the complaint include all required CCFA documents?',
      helpText:
        'Check for: original creditor name, last 4 of account number, last payment date/amount, copy of credit agreement, and charge-off statement.',
      options: [
        { value: 'yes', label: 'Yes — all documents are attached' },
        { value: 'missing_some', label: 'Some documents are missing' },
        { value: 'missing_most', label: 'Most or all documents are missing' },
        { value: 'unsure', label: 'I am not sure what to look for' },
      ],
    },
    {
      id: 'ccfa_missing_info',
      type: 'info',
      prompt:
        'CCFA DEFICIENCY — STRONG DEFENSE\n\nIf the complaint is missing required CCFA documents, you have a powerful defense. Include this in your Answer:\n\n"Plaintiff has failed to comply with the Consumer Credit Fairness Act (CPLR §3016(j)) by failing to attach the required documents to the complaint, including [list what is missing: the credit agreement / charge-off statement / original creditor identification / account information]."\n\nYou can also move to dismiss under CPLR §3211(a)(1) for failure to comply with CCFA pleading requirements.',
      showIf: (answers) =>
        answers.ccfa_compliant === 'missing_some' ||
        answers.ccfa_compliant === 'missing_most',
    },

    // === Answer Format ===
    {
      id: 'complaint_verified',
      type: 'yes_no',
      prompt: 'Is the complaint verified (signed under oath)?',
      helpText:
        'Look for language like "sworn to before me" or a notary stamp. In NY, if the complaint is verified, your answer must also be verified (CPLR §3020). If it is NOT verified, you can file a general denial.',
    },
    {
      id: 'general_denial_available',
      type: 'info',
      prompt:
        'GENERAL DENIAL AVAILABLE\n\nSince the complaint is NOT verified, you can use a General Denial. This is the simplest and most powerful option — one sentence:\n\n"Defendant denies each and every allegation contained in the complaint."\n\nThis forces the plaintiff to prove EVERY element of their case. You should ALSO list your affirmative defenses separately.\n\nNote: In NYC Civil Court, you can use the court\'s standard Answer form available at the clerk\'s office or online at nycourts.gov.',
      showIf: (answers) => answers.complaint_verified === 'no',
    },
    {
      id: 'specific_denial_required',
      type: 'info',
      prompt:
        'VERIFIED ANSWER REQUIRED\n\nBecause the complaint is verified, your Answer must ALSO be verified — meaning you sign it under oath (CPLR §3020). You must respond to each allegation specifically (CPLR §3018):\n\n• Admit — only if you are certain it is true\n• Deny — if it is false or you have any doubt\n• Deny on information and belief — if you lack sufficient knowledge\n\nDeny as much as possible. Every denial forces the plaintiff to produce evidence. Any allegation you fail to address is deemed ADMITTED.\n\nAlso list your affirmative defenses separately.',
      showIf: (answers) => answers.complaint_verified === 'yes',
    },

    // === Pre-Answer Motion Option ===
    {
      id: 'motion_to_dismiss_info',
      type: 'info',
      prompt:
        'ALTERNATIVE: Pre-Answer Motion to Dismiss (CPLR §3211)\n\nInstead of (or before) an Answer, you can file a motion to dismiss. Strong grounds in NY debt cases:\n\n• §3211(a)(1) — Documentary evidence defeats the claim (e.g., proof of payment)\n• §3211(a)(3) — Plaintiff lacks legal capacity (unlicensed debt buyer)\n• §3211(a)(5) — Statute of limitations expired (3 years under CCFA for consumer debts)\n• §3211(a)(7) — Complaint fails to state a cause of action\n• §3211(a)(8) — Court lacks personal jurisdiction (improper service)\n\nFiling a pre-answer motion EXTENDS your time to answer — you get 10 days after the motion is decided (CPLR §3211(f)).\n\nImportant: In consumer credit cases, improper service is NOT waived by appearing — you can raise it at any time (CCFA amendment to CPLR §3211(e)).',
    },

    {
      id: 'have_complaint',
      type: 'yes_no',
      prompt: "Have you received the plaintiff's complaint?",
    },
    {
      id: 'get_complaint_info',
      type: 'info',
      prompt:
        'Obtain the complaint from the court clerk. In NYC, visit the courthouse listed on your summons or use the eCourts online system (iCourts.nycourts.gov). Outside NYC, contact the clerk of the court where the case was filed.',
      showIf: (answers) => answers.have_complaint === 'no',
    },
    {
      id: 'know_deadline',
      type: 'yes_no',
      prompt: 'Do you know your exact deadline to file an answer?',
      helpText:
        'In New York, you have 20 days if personally served in-state, or 30 days for all other service methods (CPLR §320(a)). Count from the date service was completed.',
    },

    // === Affirmative Defenses ===
    {
      id: 'defenses_info',
      type: 'info',
      prompt:
        'AFFIRMATIVE DEFENSES — List ALL That Apply\n\nYou must raise affirmative defenses in your Answer or risk waiving them (CPLR §3018(b)). Common defenses for NY debt cases:\n\n1. Statute of limitations expired — 3 years for consumer credit debts (CCFA, eff. 4/7/2022). Payment or acknowledgment NO LONGER revives the SOL.\n2. Lack of standing — plaintiff (debt buyer) has no valid chain of assignment from original creditor\n3. CCFA non-compliance — complaint missing required documents\n4. Failure to state a cause of action\n5. Account stated — you never agreed to the stated balance\n6. Payment / accord and satisfaction\n7. Wrong defendant / identity theft / mistaken identity\n8. Improper service (CPLR §308)\n9. Statute of frauds (GOL §5-701)\n10. FDCPA violations (15 U.S.C. §1692) — federal, applies to third-party collectors\n11. NYC: Violations of NYC Admin Code §20-493 (if in NYC — debt collection licensing and prohibited practices)',
    },
    {
      id: 'which_defense',
      type: 'single_choice',
      prompt: 'Which primary defense applies to your situation?',
      options: [
        { value: 'sol_expired', label: 'Statute of limitations has expired (debt older than 3 years)' },
        { value: 'lack_standing', label: 'Plaintiff lacks standing (debt buyer, no proof of assignment)' },
        { value: 'ccfa_deficient', label: 'Complaint missing CCFA-required documents' },
        { value: 'wrong_party', label: 'Wrong party / identity theft' },
        { value: 'amount_disputed', label: 'The amount claimed is incorrect' },
        { value: 'already_paid', label: 'Debt already paid or settled' },
        { value: 'fdcpa_violation', label: 'Collector violated FDCPA' },
        { value: 'improper_service', label: 'I was not properly served' },
        { value: 'general_denial', label: 'General denial (deny everything)' },
        { value: 'not_sure', label: "I'm not sure which defense to use" },
      ],
    },
    {
      id: 'sol_expired_info',
      type: 'info',
      prompt:
        'SOL DEFENSE — 3 YEARS UNDER CCFA\n\nInclude this language in your Answer:\n"Plaintiff\'s claims are barred by the applicable statute of limitations. Pursuant to the Consumer Credit Fairness Act, the statute of limitations for consumer credit transactions is three years, and said period has expired."\n\nKey CCFA changes:\n• SOL reduced from 6 years to 3 years for consumer credit debts\n• Payment on the debt NO LONGER restarts the SOL clock\n• Oral or written acknowledgment NO LONGER revives the SOL\n• Plaintiff must include an SOL affidavit when seeking default judgment\n\nThe court will NOT raise this defense for you — you must assert it.',
      showIf: (answers) => answers.which_defense === 'sol_expired',
    },
    {
      id: 'lack_standing_info',
      type: 'info',
      prompt:
        'LACK OF STANDING DEFENSE\n\nIf the plaintiff is a debt buyer (LVNV Funding, Portfolio Recovery, Midland Credit, Cavalry SPV, etc.), they must prove a complete chain of assignment from the original creditor.\n\nInclude this language:\n"Plaintiff lacks standing to bring this action. Plaintiff has failed to establish a valid and complete chain of assignment from the original creditor to Plaintiff."\n\nUnder the CCFA, the complaint must identify the original creditor and attach the credit agreement. If these are missing, standing is highly questionable.\n\nIn NYC, debt collectors must be licensed by the Department of Consumer and Worker Protection (DCWP) under NYC Admin Code §20-489. An unlicensed collector may lack legal authority to sue.',
      showIf: (answers) => answers.which_defense === 'lack_standing',
    },
    {
      id: 'ccfa_deficient_info',
      type: 'info',
      prompt:
        'CCFA NON-COMPLIANCE DEFENSE\n\nThe Consumer Credit Fairness Act requires the complaint to include specific documents and information. If missing, include:\n\n"Plaintiff\'s complaint fails to comply with the requirements of CPLR §3016(j) as amended by the Consumer Credit Fairness Act, and should be dismissed for failure to state a cause of action."\n\nYou can raise this as both an affirmative defense AND a basis for a motion to dismiss under CPLR §3211(a)(7).\n\nMissing elements to cite: original creditor name, last 4 digits of account, last payment date/amount, copy of credit agreement, charge-off statement.',
      showIf: (answers) => answers.which_defense === 'ccfa_deficient',
    },
    {
      id: 'fdcpa_info',
      type: 'info',
      prompt:
        'FDCPA DEFENSE\n\nNew York has NO state-level equivalent to the Fair Debt Collection Practices Act — it relies on the federal FDCPA (15 U.S.C. §1692) plus common law.\n\nIf a third-party collector violated the FDCPA, you can raise it as an affirmative defense AND file a counterclaim:\n\n• Up to $1,000 in statutory damages per case\n• Actual damages (emotional distress, etc.)\n• Attorney fees and costs\n\nCommon FDCPA violations: calling before 8am or after 9pm, threatening arrest, misrepresenting the debt amount, failing to validate the debt, contacting you after receiving a cease letter.\n\nIn NYC, you also have protections under NYC Admin Code §20-493 (prohibited debt collection practices) and the DCWP SHIELD Collection Rule.',
      showIf: (answers) => answers.which_defense === 'fdcpa_violation',
    },
    {
      id: 'improper_service_info',
      type: 'info',
      prompt:
        'IMPROPER SERVICE DEFENSE\n\nImproper service is a strong defense in NY. Under CPLR §308, personal service must be made by:\n\n1. Personal delivery to you (§308(1))\n2. Leave and mail — delivered to a person of suitable age at your home/work + mailed (§308(2))\n3. Nail and mail — affixed to your door + mailed, only after due diligence (§308(4))\n\n"Sewer service" (filing false proof of service) is rampant in NY debt cases.\n\nCCFA special rule: In consumer credit cases, the defense of improper service is NOT waived by appearing in the case. You can raise it at any time.\n\nInclude: "This Court lacks personal jurisdiction over Defendant due to improper service of process pursuant to CPLR §308."',
      showIf: (answers) => answers.which_defense === 'improper_service',
    },
    {
      id: 'general_denial_info',
      type: 'info',
      prompt:
        'GENERAL DENIAL\n\nIf the complaint is not verified, you can file a general denial:\n"Defendant denies each and every allegation contained in the complaint."\n\nThis forces the plaintiff to prove everything. Even with a general denial, list ALL applicable affirmative defenses separately.\n\nIf you are not sure which specific defense applies, a general denial combined with common affirmative defenses (SOL, lack of standing, CCFA non-compliance) gives you the broadest protection.',
      showIf: (answers) =>
        answers.which_defense === 'general_denial' || answers.which_defense === 'not_sure',
    },

    // === Default Judgment Info ===
    {
      id: 'default_judgment_info',
      type: 'info',
      prompt:
        'IF YOU MISSED YOUR DEADLINE — Vacating a Default Judgment\n\nIf a default judgment was entered against you, you can move to vacate it under CPLR §5015(a):\n\n1. Excusable default (§5015(a)(1)) — must show reasonable excuse + meritorious defense. File within 1 year of notice of entry.\n2. Lack of jurisdiction (§5015(a)(4)) — no time limit. If you were never properly served, the judgment is void.\n3. Fraud or misrepresentation (§5015(a)(3)) — if the plaintiff filed false proof of service.\n\nUnder the CCFA, plaintiffs seeking default judgment must file an affidavit confirming the SOL has not expired. If they failed to do so, this is grounds to vacate.\n\nDo not ignore a default judgment — it can result in wage garnishment, bank account freezes, and property liens.',
    },

    // === NYC-Specific Info ===
    {
      id: 'nyc_extra_protections',
      type: 'info',
      prompt:
        'NYC ADDITIONAL PROTECTIONS\n\nIf your case is in New York City, you have extra protections:\n\n• Debt collectors must be licensed by the NYC Department of Consumer and Worker Protection (DCWP)\n• NYC Admin Code §20-493 prohibits harassment, threats, and deceptive practices\n• The SHIELD Collection Rule limits how often collectors can contact you and allows you to dispute the debt at any time\n• Free legal help is available through the NYC Civil Justice Center and legal aid organizations\n• NYC Civil Court has a dedicated Consumer Credit Part with simplified procedures\n\nCheck if the plaintiff is licensed: search the DCWP License Inquiry at nyc.gov/consumers.',
      showIf: (answers) => answers.court_type === 'nyc_civil',
    },

    // === Filing Info ===
    {
      id: 'filing_info',
      type: 'info',
      prompt:
        'FILING YOUR ANSWER\n\n1. Prepare your Answer — include denials and all affirmative defenses\n2. If the complaint is verified, your Answer must also be verified (signed under oath)\n3. File with the court clerk — in person, by mail, or e-file (NYC courts support NYSCEF e-filing)\n4. Serve a copy on the plaintiff\'s attorney by mail or in person\n5. File proof of service with the court\n6. Keep a file-stamped copy for your records\n\nFiling fees:\n• NYC Civil Court: $45 (non-consumer) or no fee for consumer credit Answer\n• Supreme Court: varies by county\n• Fee waiver: If you cannot afford it, file a Poor Person Application (CPLR Article 11)\n\nDeadline: 20 days (personal service in-state) or 30 days (all other methods). DO NOT MISS THIS.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.have_complaint === 'yes') {
      items.push({ status: 'done', text: "You have the plaintiff's complaint." })
    } else {
      items.push({ status: 'needed', text: 'Obtain the complaint from the court clerk.' })
    }

    if (answers.know_deadline === 'yes') {
      items.push({ status: 'done', text: 'You know your filing deadline.' })
    } else {
      const deadlineText =
        answers.service_method === 'personal_in_state'
          ? '20 days from personal service (CPLR §320(a)).'
          : '30 days from service completion (CPLR §320(a)).'
      items.push({
        status: 'needed',
        text: `Determine your deadline: ${deadlineText}`,
      })
    }

    // CCFA compliance
    if (
      answers.ccfa_compliant === 'missing_some' ||
      answers.ccfa_compliant === 'missing_most'
    ) {
      items.push({
        status: 'info',
        text: 'Complaint may be CCFA-deficient — strong grounds for defense or dismissal.',
      })
    }

    // Answer type
    if (answers.complaint_verified === 'no') {
      items.push({
        status: 'info',
        text: 'General denial available (unverified complaint). Deny all allegations in one sentence.',
      })
    } else if (answers.complaint_verified === 'yes') {
      items.push({
        status: 'info',
        text: 'Verified answer required. Respond to each allegation individually and sign under oath.',
      })
    }

    const defenseLabels: Record<string, string> = {
      sol_expired: 'Statute of limitations expired (3 years under CCFA)',
      lack_standing: 'Lack of standing (debt buyer)',
      ccfa_deficient: 'CCFA non-compliance',
      wrong_party: 'Wrong party / identity theft',
      amount_disputed: 'Disputed amount',
      already_paid: 'Debt already paid',
      fdcpa_violation: 'FDCPA violations',
      improper_service: 'Improper service of process',
      general_denial: 'General denial',
      not_sure: 'General denial (recommended)',
    }

    if (answers.which_defense) {
      items.push({
        status: 'info',
        text: `Primary defense: ${defenseLabels[answers.which_defense] || answers.which_defense}.`,
      })
    }

    // Court-specific filing info
    const courtLabels: Record<string, string> = {
      nyc_civil: 'NYC Civil Court',
      city_court: 'City Court',
      supreme: 'Supreme Court',
      small_claims: 'Small Claims Court',
    }

    if (answers.court_type && courtLabels[answers.court_type]) {
      items.push({
        status: 'info',
        text: `Court: ${courtLabels[answers.court_type]}.`,
      })
    }

    const deadline =
      answers.service_method === 'personal_in_state' ? '20 days' : '30 days'

    items.push({
      status: 'needed',
      text: `File Answer with ALL affirmative defenses within ${deadline}. Serve copy on plaintiff's attorney.`,
    })

    return items
  },
}
