import type { GuidedStepConfig } from '../types'

export const piJudgmentGuideConfig: GuidedStepConfig = {
  title: 'Understanding Your Judgment',
  reassurance:
    'A judgment is not the end of your case — it\'s the beginning of a new phase. Understanding what happens after judgment is critical.',

  questions: [
    // 1. Overview
    {
      id: 'judgment_overview',
      type: 'info',
      prompt:
        'After trial or dispositive ruling, the court enters a judgment. This step helps you understand what the judgment means and what to do next. Important: winning a judgment does NOT automatically mean you get paid.',
    },

    // 2. Judgment entered?
    {
      id: 'judgment_entered',
      type: 'yes_no',
      prompt: 'Has the court entered a judgment in your case?',
    },

    // 3. Outcome
    {
      id: 'who_prevailed',
      type: 'single_choice',
      prompt: 'What was the outcome?',
      options: [
        { value: 'plaintiff_won', label: 'I won (judgment in my favor)' },
        { value: 'defendant_won', label: 'I lost (judgment against me)' },
        { value: 'mixed', label: 'Mixed result (partial win)' },
        {
          value: 'settled_before',
          label: 'Case settled before judgment',
        },
      ],
      showIf: (answers) => answers.judgment_entered === 'yes',
    },

    // 4. Judgment amount
    {
      id: 'judgment_amount',
      type: 'text',
      prompt: 'What is the judgment amount?',
      placeholder: 'e.g., $75,000',
      showIf: (answers) =>
        answers.who_prevailed === 'plaintiff_won' ||
        answers.who_prevailed === 'mixed',
    },

    // 5. Costs awarded?
    {
      id: 'costs_awarded',
      type: 'yes_no',
      prompt: 'Were court costs or attorney fees awarded?',
      showIf: (answers) =>
        answers.who_prevailed === 'plaintiff_won' ||
        answers.who_prevailed === 'mixed',
    },

    // 6. Winning next steps
    {
      id: 'winning_next_steps',
      type: 'info',
      prompt:
        'Congratulations. Here\'s what happens now:\n\n1. Wait for the judgment to become final (30 days if no post-trial motions)\n2. If the defendant pays voluntarily — great. File a Satisfaction of Judgment with the court.\n3. If the defendant does NOT pay — you\'ll need to enforce the judgment (see below)\n4. Post-judgment interest accrues at 5% per year from the date of judgment (Texas Finance Code §304.003)',
      showIf: (answers) =>
        answers.who_prevailed === 'plaintiff_won' ||
        answers.who_prevailed === 'mixed',
    },

    // 7. Defendant paying?
    {
      id: 'defendant_paying',
      type: 'yes_no',
      prompt: 'Is the defendant paying the judgment voluntarily?',
      showIf: (answers) =>
        answers.who_prevailed === 'plaintiff_won' ||
        answers.who_prevailed === 'mixed',
    },

    // 8. Enforcement options
    {
      id: 'enforcement_options',
      type: 'info',
      prompt:
        'Judgment Enforcement Options\n\nIf the defendant won\'t pay, you have several tools:\n\n1. Abstract of Judgment — file with the county clerk to create a lien on defendant\'s real property\n2. Writ of Execution — court order directing the constable/sheriff to seize and sell non-exempt property\n3. Garnishment — court order directing defendant\'s bank or employer to pay you\n4. Turnover Order — court order requiring defendant to turn over specific property\n5. Post-Judgment Discovery — interrogatories and depositions to find defendant\'s assets\n\nRemember: Texas has broad personal property exemptions (homestead, personal property up to $100K for individuals). Not everything can be seized.',
      showIf: (answers) => answers.defendant_paying === 'no',
    },

    // 9. Satisfaction info
    {
      id: 'satisfaction_info',
      type: 'info',
      prompt:
        'Filing Satisfaction of Judgment\n\nOnce the defendant pays the full judgment amount, you MUST file a Satisfaction of Judgment (also called Release of Judgment) with the court. This:\n\n- Officially closes the case\n- Releases any liens on defendant\'s property\n- Prevents further enforcement actions\n\nFailure to file satisfaction after payment can expose you to liability.',
      showIf: (answers) => answers.defendant_paying === 'yes',
    },

    // 10. Losing next steps
    {
      id: 'losing_next_steps',
      type: 'info',
      prompt:
        'The judgment went against you. You have options:\n\n1. Motion for New Trial (TRCP 329b) — must be filed within 30 DAYS of judgment\n   - Grounds: jury misconduct, newly discovered evidence, excessive/inadequate damages, error in law\n   - If not ruled on within 75 days, it\'s overruled by operation of law\n\n2. Appeal — file Notice of Appeal:\n   - Without post-trial motion: 30 days from judgment (TRAP 26.1)\n   - With timely post-trial motion: 90 days from judgment\n   - These deadlines are JURISDICTIONAL — courts CANNOT grant extensions\n   - Appellate filing fee: $175 + $205 record deposit\n\nDo not delay. These deadlines are the most unforgiving in Texas civil practice.',
      showIf: (answers) => answers.who_prevailed === 'defendant_won',
    },

    // 11. Appeal consideration
    {
      id: 'appeal_consideration',
      type: 'yes_no',
      prompt: 'Are you considering an appeal?',
      showIf: (answers) =>
        answers.who_prevailed === 'defendant_won' ||
        answers.who_prevailed === 'mixed',
    },

    // 12. Appeal warning
    {
      id: 'appeal_warning',
      type: 'info',
      prompt:
        'Appeal Considerations\n\n- Appeals are expensive (filing fees, record preparation, briefing)\n- The appellate court only reviews legal errors — they generally don\'t re-weigh evidence\n- You must preserve error at trial (object on the record) to raise it on appeal\n- Consider consulting an appellate attorney — appellate practice is a specialty\n- Supersedeas bond may be required to stay enforcement during appeal',
      showIf: (answers) => answers.appeal_consideration === 'yes',
    },

    // 13. Settled guidance
    {
      id: 'settled_guidance',
      type: 'info',
      prompt:
        'Settlement Before Judgment\n\nIf your case settled, make sure:\n\n1. Settlement agreement is signed by both parties\n2. Payment has been received (or payment schedule confirmed)\n3. All liens are satisfied (hospital liens, Medicare/Medicaid, attorney liens)\n4. Dismissal paperwork is filed with the court (Agreed Motion to Dismiss or Notice of Nonsuit)\n5. The case is not truly over until dismissal is entered on the docket',
      showIf: (answers) => answers.who_prevailed === 'settled_before',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    // Judgment status
    if (answers.judgment_entered === 'yes') {
      items.push({ status: 'done', text: 'Judgment has been entered by the court.' })
    } else if (answers.judgment_entered === 'no') {
      items.push({ status: 'needed', text: 'Judgment has not yet been entered.' })
    }

    // Outcome-specific summaries
    const won =
      answers.who_prevailed === 'plaintiff_won' ||
      answers.who_prevailed === 'mixed'

    if (won) {
      const outcomeLabel =
        answers.who_prevailed === 'plaintiff_won'
          ? 'Judgment in your favor'
          : 'Mixed result (partial win)'
      items.push({ status: 'info', text: `Outcome: ${outcomeLabel}.` })

      if (answers.judgment_amount) {
        items.push({
          status: 'info',
          text: `Judgment amount: ${answers.judgment_amount}.`,
        })
      }

      if (answers.defendant_paying === 'yes') {
        items.push({
          status: 'needed',
          text: 'File Satisfaction of Judgment with the court after full payment is received.',
        })
      } else if (answers.defendant_paying === 'no') {
        items.push({
          status: 'needed',
          text: 'Defendant is not paying voluntarily. Pursue enforcement: Abstract of Judgment, Writ of Execution, garnishment, turnover order, or post-judgment discovery.',
        })
      }

      items.push({
        status: 'info',
        text: 'Post-judgment interest accrues at 5% per year (Texas Finance Code §304.003).',
      })
    }

    if (answers.who_prevailed === 'defendant_won') {
      items.push({
        status: 'info',
        text: 'Outcome: Judgment against you.',
      })
      items.push({
        status: 'needed',
        text: 'Critical deadline: Motion for New Trial must be filed within 30 DAYS of judgment.',
      })
      items.push({
        status: 'needed',
        text: 'Critical deadline: Notice of Appeal — 30 days from judgment (no post-trial motion) or 90 days (with timely post-trial motion). These are JURISDICTIONAL.',
      })
    }

    if (
      answers.appeal_consideration === 'yes' &&
      (answers.who_prevailed === 'defendant_won' ||
        answers.who_prevailed === 'mixed')
    ) {
      items.push({
        status: 'needed',
        text: 'Considering appeal — consult an appellate attorney. Supersedeas bond may be required.',
      })
    }

    if (answers.who_prevailed === 'settled_before') {
      items.push({
        status: 'info',
        text: 'Outcome: Case settled before judgment.',
      })
      items.push({
        status: 'needed',
        text: 'Ensure settlement agreement is signed, payment received, all liens satisfied, and dismissal filed with the court.',
      })
    }

    return items
  },
}
