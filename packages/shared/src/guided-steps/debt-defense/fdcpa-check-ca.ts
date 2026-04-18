import type { GuidedStepConfig } from '../types'

export const fdcpaCheckCaConfig: GuidedStepConfig = {
  title: 'Check for Collector Violations',
  reassurance:
    'California has some of the strongest consumer protection laws in the country. The Rosenthal Act covers ORIGINAL creditors too — not just third-party collectors.',

  questions: [
    // === Who is collecting? ===
    {
      id: 'collector_type',
      type: 'single_choice',
      prompt: 'Who is trying to collect this debt?',
      helpText:
        'This determines which laws protect you. California\'s Rosenthal Act covers BOTH original creditors and third-party collectors.',
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
        'Dual Protection Available\n\nSince a third-party collector is involved, you are protected by BOTH:\n\n1. Rosenthal Fair Debt Collection Practices Act (Civ. Code §1788) — California state law\n2. Federal FDCPA (15 U.S.C. §1692)\n\nYou can recover damages under BOTH statutes — up to $1,000 each, plus actual damages and attorney fees.',
      showIf: (answers) =>
        answers.collector_type === 'collection_agency' ||
        answers.collector_type === 'debt_buyer' ||
        answers.collector_type === 'law_firm',
    },
    {
      id: 'original_creditor_info',
      type: 'info',
      prompt:
        'Rosenthal Act Covers Original Creditors\n\nUnlike most states, California\'s Rosenthal Act (Civ. Code §1788) covers ORIGINAL CREDITORS — not just third-party collectors. This means your credit card company, hospital, or lender must follow the same anti-harassment rules.\n\nThe federal FDCPA does NOT apply to original creditors. But the Rosenthal Act gives you state-law protection with up to $1,000 in statutory damages.',
      showIf: (answers) => answers.collector_type === 'original_creditor',
    },

    // === SB 908 Licensing Check ===
    {
      id: 'licensing_check',
      type: 'info',
      prompt:
        'SB 908 — Debt Collection Licensing (Financial Code §100000)\n\nSince January 1, 2022, debt collectors operating in California MUST be licensed by the Department of Financial Protection and Innovation (DFPI).\n\nCheck if the collector is licensed: Search the NMLS Consumer Access database at nmlsconsumeraccess.org.\n\nIf the collector is UNLICENSED, their collection activity may violate California law — this is an additional defense and potential counterclaim.',
      showIf: (answers) =>
        answers.collector_type === 'collection_agency' ||
        answers.collector_type === 'debt_buyer',
    },
    {
      id: 'collector_licensed',
      type: 'single_choice',
      prompt: 'Is the collector licensed with the DFPI (checked NMLS database)?',
      options: [
        { value: 'yes', label: 'Yes — they are licensed' },
        { value: 'no', label: 'No — they are NOT licensed' },
        { value: 'not_checked', label: 'I have not checked yet' },
      ],
      showIf: (answers) =>
        answers.collector_type === 'collection_agency' ||
        answers.collector_type === 'debt_buyer',
    },
    {
      id: 'unlicensed_warning',
      type: 'info',
      prompt:
        'UNLICENSED COLLECTOR\n\nAn unlicensed debt collector operating in California may be in violation of Financial Code §100002. This can be:\n• An additional defense in your case\n• Grounds for a complaint to the DFPI\n• Evidence of an unfair business practice under Bus. & Prof. Code §17200\n\nDocument this finding and raise it in your Answer.',
      showIf: (answers) => answers.collector_licensed === 'no',
    },

    // === FDCPA / Rosenthal Violations ===
    {
      id: 'violations_header',
      type: 'info',
      prompt:
        'Violation Checklist\n\nAnswer "yes" to any behavior the collector engaged in. Each "yes" is a potential violation of the Rosenthal Act and/or FDCPA.',
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
      id: 'threatened_arrest',
      type: 'yes_no',
      prompt: 'Did the collector threaten you with arrest or jail?',
    },
    {
      id: 'misrepresented_amount',
      type: 'yes_no',
      prompt: 'Did the collector misrepresent the amount you owe?',
    },
    {
      id: 'failed_validation',
      type: 'yes_no',
      prompt: 'Did the collector fail to send written validation within 5 days of first contact?',
    },
    {
      id: 'used_profanity',
      type: 'yes_no',
      prompt: 'Did the collector use obscene or profane language?',
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
    },
    {
      id: 'sued_time_barred',
      type: 'yes_no',
      prompt: 'Did the collector sue you on a debt you believe is past the statute of limitations?',
      helpText:
        'Under AB 1526, collectors must disclose when debt is time-barred. Suing on known time-barred debt may violate both the Rosenthal Act and FDCPA.',
    },
    {
      id: 'no_sol_disclosure',
      type: 'yes_no',
      prompt: 'Did the collector attempt to collect a time-barred debt WITHOUT disclosing that the SOL had expired?',
      helpText:
        'AB 1526 (Civ. Code §1788.14(e)) requires written disclosure that the debt is time-barred before any collection attempt.',
      showIf: (answers) => answers.sued_time_barred === 'yes',
    },
    {
      id: 'reported_inaccurate_credit',
      type: 'yes_no',
      prompt: 'Did the collector report inaccurate information to credit bureaus?',
      helpText:
        'Reporting false debt information violates the CCRAA (Civ. Code §1785) and FCRA (15 U.S.C. §1681).',
    },

    // === Counterclaim Info ===
    {
      id: 'counterclaim_info',
      type: 'info',
      prompt:
        'Potential Damages for Violations\n\nRosenthal Act (Civ. Code §1788.30):\n• Up to $1,000 statutory damages per action\n• Actual damages\n• Attorney fees and costs\n\nFDCPA (15 U.S.C. §1692k) — third-party collectors only:\n• Up to $1,000 statutory damages per action\n• Actual damages\n• Attorney fees and costs\n\nCCRAA (Civ. Code §1785.31) — credit reporting:\n• Actual damages + punitive damages for willful violations\n• Attorney fees\n\nYou can file violations as a COUNTERCLAIM in the same debt case.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    const violationKeys = [
      'called_odd_hours', 'contacted_at_work', 'threatened_arrest',
      'misrepresented_amount', 'failed_validation', 'used_profanity',
      'contacted_third_parties', 'continued_after_cease', 'false_attorney',
      'sued_time_barred', 'reported_inaccurate_credit',
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
        text: 'Dual protection: Rosenthal Act (state) + FDCPA (federal). Can recover under both.',
      })
    } else if (answers.collector_type === 'original_creditor') {
      items.push({
        status: 'info',
        text: 'Rosenthal Act covers original creditors in CA (unlike FDCPA which does not).',
      })
    }

    // Licensing
    if (answers.collector_licensed === 'no') {
      items.push({
        status: 'info',
        text: 'Collector is UNLICENSED under SB 908 — additional defense available.',
      })
    } else if (answers.collector_licensed === 'not_checked') {
      items.push({
        status: 'needed',
        text: 'Check collector licensing at nmlsconsumeraccess.org (SB 908 requirement).',
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

      if (answers.no_sol_disclosure === 'yes') {
        items.push({
          status: 'info',
          text: 'AB 1526 violation: No SOL disclosure before collecting time-barred debt (Civ. Code §1788.14(e)).',
        })
      }

      items.push({
        status: 'needed',
        text: `Document each violation with dates, times, and evidence. Potential damages: up to $1,000 (Rosenthal)${isThirdParty ? ' + $1,000 (FDCPA)' : ''} + actual damages + attorney fees.`,
      })
    }

    return items
  },
}
