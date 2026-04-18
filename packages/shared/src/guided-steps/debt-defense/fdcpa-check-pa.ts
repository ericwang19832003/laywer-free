import type { GuidedStepConfig } from '../types'

export const fdcpaCheckPaConfig: GuidedStepConfig = {
  title: 'Check for Collector Violations',
  reassurance:
    'Pennsylvania has strong consumer protection laws. FCEUA violations are enforced through the UTPCPL — which allows treble (3x) damages.',

  questions: [
    // === Who is collecting? ===
    {
      id: 'collector_type',
      type: 'single_choice',
      prompt: 'Who is trying to collect this debt?',
      helpText:
        'Pennsylvania\'s FCEUA covers BOTH original creditors and third-party collectors.',
      options: [
        { value: 'original_creditor', label: 'The original creditor' },
        { value: 'collection_agency', label: 'A collection agency' },
        { value: 'debt_buyer', label: 'A debt buyer (LVNV, Portfolio Recovery, Midland Credit, etc.)' },
        { value: 'law_firm', label: 'A law firm collecting the debt' },
        { value: 'unsure', label: 'I am not sure' },
      ],
    },
    {
      id: 'triple_protection_info',
      type: 'info',
      prompt:
        'Triple Protection Available\n\nSince a third-party collector is involved, you are protected by:\n\n1. FCEUA (73 P.S. §2270.1) — PA state law\n2. Federal FDCPA (15 U.S.C. §1692)\n3. UTPCPL (73 P.S. §201-1) — FCEUA violations automatically trigger UTPCPL\n\nThe UTPCPL allows up to TREBLE (3x) actual damages — this is extremely powerful.',
      showIf: (answers) =>
        answers.collector_type === 'collection_agency' ||
        answers.collector_type === 'debt_buyer' ||
        answers.collector_type === 'law_firm',
    },
    {
      id: 'original_creditor_info',
      type: 'info',
      prompt:
        'FCEUA Covers Original Creditors\n\nPennsylvania\'s FCEUA (73 P.S. §2270.1) covers ORIGINAL CREDITORS collecting their own debts — similar to California\'s Rosenthal Act.\n\nViolations are enforced through the UTPCPL, which allows up to treble damages.',
      showIf: (answers) => answers.collector_type === 'original_creditor',
    },

    // === FCEUA-Specific Violations ===
    {
      id: 'violations_header',
      type: 'info',
      prompt:
        'Violation Checklist\n\nThe FCEUA has stricter rules than the federal FDCPA in some areas. Answer "yes" to any behavior the collector engaged in.',
    },
    {
      id: 'called_odd_hours',
      type: 'yes_no',
      prompt: 'Did the collector call you before 8am or after 9pm?',
    },
    {
      id: 'excessive_calls',
      type: 'yes_no',
      prompt: 'Did the collector call you more than once per week about the same debt?',
      helpText:
        'The FCEUA limits collectors to ONE phone conversation per week about a specific debt. 7+ calls in 7 days is presumed harassment.',
    },
    {
      id: 'excessive_calls_info',
      type: 'info',
      prompt:
        'FCEUA Violation: Call Frequency\n\nThe FCEUA limits collectors to one phone conversation per week about a specific debt. Making 7 or more calls in a 7-day period is presumed harassment under 73 P.S. §2270.4.\n\nThis is STRICTER than the federal FDCPA, which has no specific per-week call limit. Document every call — date, time, and duration.',
      showIf: (answers) => answers.excessive_calls === 'yes',
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
      id: 'social_media_contact',
      type: 'yes_no',
      prompt: 'Did the collector contact you publicly on social media about the debt?',
      helpText:
        'The FCEUA prohibits publicly visible social media contact about debt. Private messages may be allowed.',
    },
    {
      id: 'social_media_info',
      type: 'info',
      prompt:
        'FCEUA Violation: Public Social Media Contact\n\nThe FCEUA prohibits publicly visible social media contact about a debt. If the collector posted on your wall, commented publicly, or contacted you in any publicly visible way on social media, this is a violation.\n\nPrivate/direct messages may be permitted under certain conditions.',
      showIf: (answers) => answers.social_media_contact === 'yes',
    },
    {
      id: 'sued_time_barred',
      type: 'yes_no',
      prompt: 'Did the collector sue you on a debt past the 4-year statute of limitations?',
    },
    {
      id: 'reported_inaccurate_credit',
      type: 'yes_no',
      prompt: 'Did the collector report inaccurate information to credit bureaus?',
    },

    // === Counterclaim / Damages ===
    {
      id: 'counterclaim_info',
      type: 'info',
      prompt:
        'Potential Damages for Violations\n\nFDCPA (15 U.S.C. §1692k):\n• $1,000 statutory damages\n• Actual damages + attorney fees\n• 1-year SOL to sue\n\nFCEUA (73 P.S. §2270.1) → enforced through UTPCPL:\n• Up to TREBLE (3x) actual damages, minimum $100\n• Attorney fees if you win\n• 6-year SOL to sue\n• 2-year SOL for FCEUA-specific claims\n\nThe UTPCPL treble damages make PA one of the best states for fighting back against abusive collectors.\n\nFile violations as a COUNTERCLAIM in the same debt case.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    const isThirdParty =
      answers.collector_type === 'collection_agency' ||
      answers.collector_type === 'debt_buyer' ||
      answers.collector_type === 'law_firm'

    if (isThirdParty) {
      items.push({
        status: 'info',
        text: 'Triple protection: FCEUA + FDCPA + UTPCPL (treble damages available).',
      })
    } else if (answers.collector_type === 'original_creditor') {
      items.push({
        status: 'info',
        text: 'FCEUA covers original creditors → UTPCPL treble damages available.',
      })
    }

    const violationKeys = [
      'called_odd_hours', 'excessive_calls', 'contacted_at_work', 'threatened_arrest',
      'misrepresented_amount', 'failed_validation', 'used_profanity',
      'contacted_third_parties', 'continued_after_cease', 'false_attorney',
      'social_media_contact', 'sued_time_barred', 'reported_inaccurate_credit',
    ]
    const found = violationKeys.filter((k) => answers[k] === 'yes')

    if (found.length === 0) {
      items.push({ status: 'info', text: 'No violations identified based on your answers.' })
    } else {
      items.push({
        status: 'done',
        text: `${found.length} potential violation${found.length > 1 ? 's' : ''} identified.`,
      })

      if (answers.excessive_calls === 'yes') {
        items.push({
          status: 'info',
          text: 'FCEUA: Exceeded 1 call/week limit (73 P.S. §2270.4) — stricter than federal FDCPA.',
        })
      }

      items.push({
        status: 'needed',
        text: `Document each violation. UTPCPL counterclaim: up to 3x actual damages (min $100)${isThirdParty ? ' + $1,000 FDCPA statutory damages' : ''} + attorney fees.`,
      })
    }

    return items
  },
}
