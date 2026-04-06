import type { GuidedStepConfig } from '../types'

export const debtPostJudgmentConfig: GuidedStepConfig = {
  title: 'After the Ruling',
  reassurance:
    'Understanding your rights after judgment helps protect your finances.',

  questions: [
    {
      id: 'case_outcome',
      type: 'single_choice',
      prompt: 'What was the outcome?',
      options: [
        { value: 'dismissed', label: 'Case was dismissed' },
        { value: 'judgment_for_plaintiff', label: 'Judgment for plaintiff (I lost)' },
        { value: 'judgment_for_me', label: 'Judgment for me (I won)' },
      ],
    },
    {
      id: 'dismissed_info',
      type: 'info',
      prompt:
        "Congratulations! If dismissed with prejudice, they can't refile. If without prejudice, they could try again \u2014 but they often don't.",
      showIf: (answers) => answers.case_outcome === 'dismissed',
    },
    {
      id: 'judgment_amount',
      type: 'single_choice',
      prompt: 'Do you know the judgment amount?',
      options: [
        { value: 'yes', label: 'Yes, I know the amount' },
        { value: 'no', label: "No, I'm not sure of the exact amount" },
      ],
      showIf: (answers) => answers.case_outcome === 'judgment_for_plaintiff',
    },
    {
      id: 'texas_protections',
      type: 'info',
      prompt:
        'Texas protections: Your wages CANNOT be garnished for consumer debt. Your homestead is exempt. You can exempt personal property up to certain limits. Bank accounts may be partially protected.',
      showIf: (answers) => answers.case_outcome === 'judgment_for_plaintiff',
    },
    {
      id: 'considering_appeal',
      type: 'yes_no',
      prompt: 'Are you considering an appeal?',
      showIf: (answers) => answers.case_outcome === 'judgment_for_plaintiff',
    },
    {
      id: 'appeal_info',
      type: 'info',
      prompt:
        'You have 21 days to appeal from JP court (bond required) or 30 days from county/district court. The case starts over in the higher court.',
      showIf: (answers) =>
        answers.case_outcome === 'judgment_for_plaintiff' &&
        answers.considering_appeal === 'yes',
    },
    {
      id: 'asset_protection',
      type: 'info',
      prompt:
        'File your exemption claims promptly if the creditor attempts collection. Consider consulting with a consumer rights attorney \u2014 many offer free consultations.',
      showIf: (answers) => answers.case_outcome === 'judgment_for_plaintiff',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.case_outcome === 'dismissed') {
      items.push({
        status: 'done',
        text: 'Your case was dismissed.',
      })
      items.push({
        status: 'info',
        text: 'Request a copy of the dismissal order for your records. If collectors contact you about this debt, they may be violating the FDCPA.',
      })
    } else if (answers.case_outcome === 'judgment_for_me') {
      items.push({
        status: 'done',
        text: 'Judgment was entered in your favor.',
      })
      items.push({
        status: 'info',
        text: 'Keep a copy of the judgment. The plaintiff may appeal, but you are in a strong position.',
      })
    } else if (answers.case_outcome === 'judgment_for_plaintiff') {
      items.push({
        status: 'info',
        text: 'A judgment was entered against you, but you have rights and protections.',
      })

      if (answers.judgment_amount === 'no') {
        items.push({
          status: 'needed',
          text: 'Find out the exact judgment amount from the court clerk.',
        })
      } else {
        items.push({
          status: 'done',
          text: 'You know the judgment amount.',
        })
      }

      items.push({
        status: 'info',
        text: 'Texas protections: wages cannot be garnished for consumer debt; homestead and personal property are exempt up to certain limits.',
      })

      if (answers.considering_appeal === 'yes') {
        items.push({
          status: 'needed',
          text: 'File your appeal within the deadline: 21 days (JP court) or 30 days (county/district court). A bond may be required.',
        })
      }

      items.push({
        status: 'info',
        text: 'File exemption claims promptly if collection is attempted. Consider consulting a consumer rights attorney.',
      })
    }

    return items
  },
}
