import type { GuidedStepConfig } from '../types'

export const fdcpaCheckNyConfig: GuidedStepConfig = {
  title: 'Check for Collector Violations',
  reassurance:
    'New York does NOT have a state-level debt collection act like California\'s Rosenthal Act. Only the federal FDCPA covers third-party collectors. However, NYC residents have additional protections, and GBL §349 can be a powerful tool against abusive collectors.',

  questions: [
    // === Who is collecting? ===
    {
      id: 'collector_type',
      type: 'single_choice',
      prompt: 'Who is trying to collect this debt?',
      helpText:
        'This determines which laws protect you. In New York, the federal FDCPA only covers third-party collectors — NOT original creditors. There is no state equivalent that fills this gap.',
      options: [
        { value: 'original_creditor', label: 'The original creditor (the company I originally owed)' },
        { value: 'collection_agency', label: 'A collection agency' },
        { value: 'debt_buyer', label: 'A debt buyer (LVNV, Portfolio Recovery, Midland Credit, etc.)' },
        { value: 'law_firm', label: 'A law firm collecting the debt' },
        { value: 'unsure', label: 'I am not sure' },
      ],
    },
    {
      id: 'third_party_coverage_info',
      type: 'info',
      prompt:
        'FDCPA Protection Available\n\nSince a third-party collector is involved, you are protected by the federal FDCPA (15 U.S.C. §1692). New York does NOT have a state-level debt collection act, so the FDCPA is your primary protection.\n\nAdditional tools:\n• GBL §349 — deceptive business practices (applies to ANY collector, including original creditors)\n• NYC Admin Code §20-489 — collector licensing requirements (NYC only)\n• SHIELD Collection Rule — NYC consumer protections\n\nFDCPA damages: up to $1,000 statutory + actual damages + attorney fees.',
      showIf: (answers) =>
        answers.collector_type === 'collection_agency' ||
        answers.collector_type === 'debt_buyer' ||
        answers.collector_type === 'law_firm',
    },
    {
      id: 'original_creditor_info',
      type: 'info',
      prompt:
        'Limited Protection for Original Creditors\n\nUnlike California (which has the Rosenthal Act covering original creditors), New York has NO state-level debt collection law that applies to original creditors. The federal FDCPA does NOT cover original creditors.\n\nHowever, you still have options:\n• GBL §349 — New York\'s deceptive business practices statute applies broadly. If the original creditor engaged in deceptive or abusive conduct, you may have a claim. Damages: $50 statutory minimum + treble damages up to $1,000 + attorney fees.\n• If the creditor is also a debt buyer or assigned the debt, FDCPA may apply.\n\nThis is a significant gap in New York consumer protection compared to states like California.',
      showIf: (answers) => answers.collector_type === 'original_creditor',
    },

    // === NYC-Specific: Licensing Check ===
    {
      id: 'in_nyc',
      type: 'yes_no',
      prompt: 'Are you located in New York City (any of the five boroughs)?',
      helpText:
        'NYC has additional consumer protections beyond state and federal law, including collector licensing requirements.',
      showIf: (answers) =>
        answers.collector_type === 'collection_agency' ||
        answers.collector_type === 'debt_buyer' ||
        answers.collector_type === 'law_firm',
    },
    {
      id: 'nyc_licensing_info',
      type: 'info',
      prompt:
        'NYC Admin Code §20-489 — Debt Collection Licensing\n\nDebt collectors operating in New York City MUST be licensed with the NYC Department of Consumer and Worker Protection (DCWP).\n\nCheck if the collector is licensed: Search the DCWP license database at nyc.gov/consumers.\n\nThe SHIELD Collection Rule also provides additional protections for NYC residents, including requirements for clear and accurate debt validation notices.\n\nIf the collector is UNLICENSED, their collection activity may violate NYC law — this is an additional defense and potential counterclaim.',
      showIf: (answers) => answers.in_nyc === 'yes',
    },
    {
      id: 'collector_licensed_nyc',
      type: 'single_choice',
      prompt: 'Is the collector licensed with the NYC DCWP (checked license database)?',
      options: [
        { value: 'yes', label: 'Yes — they are licensed' },
        { value: 'no', label: 'No — they are NOT licensed' },
        { value: 'not_checked', label: 'I have not checked yet' },
      ],
      showIf: (answers) => answers.in_nyc === 'yes',
    },
    {
      id: 'unlicensed_warning',
      type: 'info',
      prompt:
        'UNLICENSED COLLECTOR\n\nAn unlicensed debt collector operating in New York City may be in violation of NYC Admin Code §20-489. This can be:\n• An additional defense in your case\n• Grounds for a complaint to the NYC DCWP\n• Evidence of a deceptive business practice under GBL §349\n\nDocument this finding and raise it in your Answer.',
      showIf: (answers) => answers.collector_licensed_nyc === 'no',
    },

    // === FDCPA Violations ===
    {
      id: 'violations_header',
      type: 'info',
      prompt:
        'Violation Checklist\n\nAnswer "yes" to any behavior the collector engaged in. Each "yes" is a potential violation of the FDCPA (third-party collectors) and/or GBL §349 (any collector).\n\nNote: In New York, the FDCPA is the primary statute for third-party collector violations. Original creditors are NOT covered by the FDCPA but may be liable under GBL §349 for deceptive practices.',
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
        'Under the Consumer Credit Fairness Act (2021), collectors must include an SOL affidavit when seeking default judgments. Suing on known time-barred debt may violate the FDCPA.',
    },
    {
      id: 'no_sol_affidavit',
      type: 'yes_no',
      prompt: 'Did the collector seek a default judgment WITHOUT filing a statute of limitations affidavit?',
      helpText:
        'The Consumer Credit Fairness Act (CPLR §3215(f)) now requires collectors to file an affidavit confirming the debt is within the statute of limitations when seeking default judgments.',
      showIf: (answers) => answers.sued_time_barred === 'yes',
    },
    {
      id: 'reported_inaccurate_credit',
      type: 'yes_no',
      prompt: 'Did the collector report inaccurate information to credit bureaus?',
      helpText:
        'Reporting false debt information violates the FCRA (15 U.S.C. §1681) and may constitute a deceptive practice under GBL §349.',
    },

    // === Counterclaim Info ===
    {
      id: 'counterclaim_info',
      type: 'info',
      prompt:
        'Potential Damages for Violations\n\nFDCPA (15 U.S.C. §1692k) — third-party collectors only:\n• Up to $1,000 statutory damages per action\n• Actual damages\n• Attorney fees and costs\n\nGBL §349 — any collector (including original creditors):\n• $50 statutory minimum per violation\n• Treble damages up to $1,000 for willful or knowing violations\n• Attorney fees and costs\n• Injunctive relief available\n\nFCRA (15 U.S.C. §1681) — credit reporting:\n• Actual damages + punitive damages for willful violations\n• Attorney fees\n\nYou can file violations as a COUNTERCLAIM in the same debt case.',
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
        text: 'FDCPA protection applies (third-party collector). No state-level debt collection act in NY — GBL §349 provides supplemental coverage.',
      })
    } else if (answers.collector_type === 'original_creditor') {
      items.push({
        status: 'info',
        text: 'FDCPA does NOT cover original creditors in NY. No state debt collection act. GBL §349 (deceptive practices) is your primary tool — $50 statutory + treble damages up to $1,000 + attorney fees.',
      })
    }

    // NYC Licensing
    if (answers.collector_licensed_nyc === 'no') {
      items.push({
        status: 'info',
        text: 'Collector is UNLICENSED under NYC Admin Code §20-489 — additional defense available.',
      })
    } else if (answers.collector_licensed_nyc === 'not_checked') {
      items.push({
        status: 'needed',
        text: 'Check collector licensing at nyc.gov/consumers (NYC DCWP requirement).',
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

      if (answers.no_sol_affidavit === 'yes') {
        items.push({
          status: 'info',
          text: 'Consumer Credit Fairness Act violation: No SOL affidavit filed for default judgment (CPLR §3215(f)).',
        })
      }

      items.push({
        status: 'needed',
        text: `Document each violation with dates, times, and evidence. Potential damages: ${isThirdParty ? 'up to $1,000 (FDCPA) + ' : ''}up to $1,000 treble (GBL §349) + actual damages + attorney fees.`,
      })
    }

    return items
  },
}
