import type { GuidedStepConfig } from '../types'

export const fdcpaCheckFlConfig: GuidedStepConfig = {
  title: 'Check for Collector Violations',
  reassurance:
    'Florida has strong consumer protection through the FCCPA (Fla. Stat. §559.55–559.785), which covers BOTH original creditors AND third-party collectors — plus a 2-year statute of limitations, double the federal FDCPA.',

  questions: [
    // === Who is collecting? ===
    {
      id: 'collector_type',
      type: 'single_choice',
      prompt: 'Who is trying to collect this debt?',
      helpText:
        'This determines which laws protect you. Florida\'s FCCPA covers BOTH original creditors and third-party collectors.',
      options: [
        { value: 'original_creditor', label: 'The original creditor (the company I originally owed)' },
        { value: 'collection_agency', label: 'A collection agency' },
        { value: 'debt_buyer', label: 'A debt buyer (LVNV, Portfolio Recovery, Midland Credit, etc.)' },
        { value: 'law_firm', label: 'A law firm collecting the debt' },
        { value: 'unsure', label: 'I am not sure' },
      ],
    },
    {
      id: 'dual_coverage_info',
      type: 'info',
      prompt:
        'Dual Protection Available\n\nSince a third-party collector is involved, you are protected by BOTH:\n\n1. Florida Consumer Collection Practices Act (FCCPA — Fla. Stat. §559.55–559.785) — Florida state law\n2. Federal FDCPA (15 U.S.C. §1692)\n\nYou can recover damages under BOTH statutes. The FCCPA provides up to $1,000 statutory damages per violation PLUS punitive damages PLUS attorney fees. The FDCPA adds up to $1,000 more plus actual damages.',
      showIf: (answers) =>
        answers.collector_type === 'collection_agency' ||
        answers.collector_type === 'debt_buyer' ||
        answers.collector_type === 'law_firm',
    },
    {
      id: 'original_creditor_info',
      type: 'info',
      prompt:
        'FCCPA Covers Original Creditors\n\nUnlike the federal FDCPA, Florida\'s FCCPA (Fla. Stat. §559.55–559.785) covers ORIGINAL CREDITORS — not just third-party collectors. This means your credit card company, hospital, or lender must follow the same anti-harassment rules.\n\nThe federal FDCPA does NOT apply to original creditors. But the FCCPA gives you state-law protection with up to $1,000 in statutory damages per violation, plus punitive damages and attorney fees.',
      showIf: (answers) => answers.collector_type === 'original_creditor',
    },

    // === Florida Registration Check ===
    {
      id: 'registration_check',
      type: 'info',
      prompt:
        'Florida Registration Requirement\n\nDebt collectors operating in Florida must register with the Florida Office of Financial Regulation (OFR).\n\nCheck if the collector is registered: Search the OFR database at flofr.gov.\n\nIf the collector is UNREGISTERED, their collection activity may violate Florida law — this is an additional defense and potential counterclaim. You can also file a complaint with the Florida Department of Agriculture and Consumer Services.',
      showIf: (answers) =>
        answers.collector_type === 'collection_agency' ||
        answers.collector_type === 'debt_buyer',
    },
    {
      id: 'collector_registered',
      type: 'single_choice',
      prompt: 'Is the collector registered with the Florida Office of Financial Regulation?',
      options: [
        { value: 'yes', label: 'Yes — they are registered' },
        { value: 'no', label: 'No — they are NOT registered' },
        { value: 'not_checked', label: 'I have not checked yet' },
      ],
      showIf: (answers) =>
        answers.collector_type === 'collection_agency' ||
        answers.collector_type === 'debt_buyer',
    },
    {
      id: 'unregistered_warning',
      type: 'info',
      prompt:
        'UNREGISTERED COLLECTOR\n\nAn unregistered debt collector operating in Florida may be in violation of state registration requirements. This can be:\n• An additional defense in your case\n• Grounds for a complaint to the Florida Department of Agriculture and Consumer Services\n• Evidence supporting an unfair or deceptive trade practices claim under the Florida DTPA (Fla. Stat. §501)\n\nDocument this finding and raise it in your Answer.',
      showIf: (answers) => answers.collector_registered === 'no',
    },

    // === FDCPA / FCCPA Violations ===
    {
      id: 'violations_header',
      type: 'info',
      prompt:
        'Violation Checklist\n\nAnswer "yes" to any behavior the collector engaged in. Each "yes" is a potential violation of the FCCPA (Fla. Stat. §559.72) and/or FDCPA.',
    },
    {
      id: 'called_odd_hours',
      type: 'yes_no',
      prompt: 'Did the collector call you before 8am or after 9pm?',
    },
    {
      id: 'contacted_at_work',
      type: 'yes_no',
      prompt: 'Did the collector contact you at work after you told them to stop?',
    },
    {
      id: 'communicated_with_employer',
      type: 'yes_no',
      prompt: 'Did the collector communicate with your employer about the debt (other than to verify employment)?',
      helpText:
        'Under §559.72(4), a collector may not communicate with your employer about the debt except to verify employment, locate you, or garnish wages pursuant to a court order.',
    },
    {
      id: 'threatened_arrest',
      type: 'yes_no',
      prompt: 'Did the collector threaten you with arrest, criminal prosecution, or jail?',
      helpText:
        'Under §559.72(7), threatening criminal prosecution to collect a consumer debt is a specific FCCPA violation.',
    },
    {
      id: 'misrepresented_amount',
      type: 'yes_no',
      prompt: 'Did the collector misrepresent the amount you owe?',
      helpText:
        'Under §559.72(9), misrepresenting the amount of a consumer debt is a specific FCCPA violation.',
    },
    {
      id: 'failed_validation',
      type: 'yes_no',
      prompt: 'Did the collector fail to send written validation within 5 days of first contact?',
    },
    {
      id: 'used_profanity',
      type: 'yes_no',
      prompt: 'Did the collector use obscene, profane, or vulgar language?',
      helpText:
        'Under §559.72(6), using profane or obscene language is a specific FCCPA violation.',
    },
    {
      id: 'contacted_third_parties',
      type: 'yes_no',
      prompt: 'Did the collector contact family, friends, or coworkers about the debt?',
    },
    {
      id: 'continued_after_cease',
      type: 'yes_no',
      prompt: 'Did the collector continue after you sent a written cease-and-desist?',
    },
    {
      id: 'false_attorney',
      type: 'yes_no',
      prompt: 'Did the collector falsely claim to be an attorney?',
      helpText:
        'Under §559.72(10), claiming to be an attorney when not authorized to practice law is a specific FCCPA violation.',
    },
    {
      id: 'simulated_legal_process',
      type: 'yes_no',
      prompt: 'Did the collector send documents that simulate legal or court papers?',
      helpText:
        'Under §559.72(3), simulating legal process — such as sending letters designed to look like court documents — is a specific FCCPA violation.',
    },
    {
      id: 'sued_time_barred',
      type: 'yes_no',
      prompt: 'Did the collector sue you on a debt you believe is past the statute of limitations?',
      helpText:
        'Florida\'s SOL for written contracts is 5 years and oral contracts is 4 years (Fla. Stat. §95.11). Suing on a known time-barred debt may violate both the FCCPA and FDCPA.',
    },
    {
      id: 'reported_inaccurate_credit',
      type: 'yes_no',
      prompt: 'Did the collector report inaccurate information to credit bureaus?',
      helpText:
        'Reporting false debt information violates the FCRA (15 U.S.C. §1681) and may support a FCCPA claim under Florida law.',
    },

    // === Counterclaim Info ===
    {
      id: 'counterclaim_info',
      type: 'info',
      prompt:
        'Potential Damages for Violations\n\nFCCPA (Fla. Stat. §559.77):\n• Actual damages\n• Up to $1,000 statutory damages per violation\n• Punitive damages (available under FCCPA — not available under federal FDCPA)\n• Attorney fees and costs\n• 2-YEAR statute of limitations (double the FDCPA\'s 1 year)\n\nFDCPA (15 U.S.C. §1692k) — third-party collectors only:\n• Up to $1,000 statutory damages per action\n• Actual damages\n• Attorney fees and costs\n• 1-year statute of limitations\n\nFCRA (15 U.S.C. §1681) — credit reporting:\n• Actual damages + punitive damages for willful violations\n• Attorney fees\n\nYou can file violations as a COUNTERCLAIM in the same debt case. File complaints with the Florida Department of Agriculture and Consumer Services.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    const violationKeys = [
      'called_odd_hours', 'contacted_at_work', 'communicated_with_employer',
      'threatened_arrest', 'misrepresented_amount', 'failed_validation',
      'used_profanity', 'contacted_third_parties', 'continued_after_cease',
      'false_attorney', 'simulated_legal_process', 'sued_time_barred',
      'reported_inaccurate_credit',
    ]
    const found = violationKeys.filter((k) => answers[k] === 'yes')

    // Coverage type
    const isThirdParty =
      answers.collector_type === 'collection_agency' ||
      answers.collector_type === 'debt_buyer' ||
      answers.collector_type === 'law_firm'

    if (isThirdParty) {
      items.push({
        status: 'info',
        text: 'Dual protection: FCCPA (state) + FDCPA (federal). Can recover under both.',
      })
    } else if (answers.collector_type === 'original_creditor') {
      items.push({
        status: 'info',
        text: 'FCCPA covers original creditors in FL (unlike FDCPA which does not).',
      })
    }

    // Registration
    if (answers.collector_registered === 'no') {
      items.push({
        status: 'info',
        text: 'Collector is UNREGISTERED with FL Office of Financial Regulation — additional defense available.',
      })
    } else if (answers.collector_registered === 'not_checked') {
      items.push({
        status: 'needed',
        text: 'Check collector registration at flofr.gov (FL registration requirement).',
      })
    }

    // Violations
    if (found.length === 0) {
      items.push({
        status: 'info',
        text: 'No violations identified based on your answers.',
      })
    } else {
      items.push({
        status: 'done',
        text: `${found.length} potential violation${found.length > 1 ? 's' : ''} identified.`,
      })

      items.push({
        status: 'needed',
        text: `Document each violation with dates, times, and evidence. Potential damages: up to $1,000 + punitive damages (FCCPA, 2-year SOL)${isThirdParty ? ' + $1,000 (FDCPA, 1-year SOL)' : ''} + actual damages + attorney fees.`,
      })
    }

    return items
  },
}
