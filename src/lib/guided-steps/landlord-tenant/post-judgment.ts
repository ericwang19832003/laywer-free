import type { GuidedStepConfig } from '../types'

export const postJudgmentConfig: GuidedStepConfig = {
  title: 'After the Ruling',
  reassurance:
    'Understanding your options after the ruling helps you take the right next steps.',

  questions: [
    {
      id: 'case_outcome',
      type: 'single_choice',
      prompt: 'What was the outcome?',
      helpText:
        'Select the result so we can show you the most relevant next steps.',
      options: [
        { value: 'won', label: 'I won (judgment in my favor)' },
        { value: 'lost', label: 'I lost (judgment against me)' },
        { value: 'settled', label: 'We reached a settlement' },
      ],
    },
    {
      id: 'other_party_complied',
      type: 'yes_no',
      prompt: 'Has the other party complied with the judgment?',
      helpText:
        'This means they have done what the judge ordered (paid money owed, moved out, etc.).',
      showIf: (answers) => answers.case_outcome === 'won',
    },
    {
      id: 'enforcement_info',
      type: 'info',
      prompt:
        "If they haven't complied, you can pursue enforcement: writ of possession (eviction), wage garnishment, bank levy, or property lien.",
      helpText:
        'A judgment is only as good as your ability to collect. The court can help you enforce it.',
      showIf: (answers) =>
        answers.case_outcome === 'won' &&
        answers.other_party_complied === 'no',
    },
    {
      id: 'considering_appeal',
      type: 'yes_no',
      prompt: 'Are you considering an appeal?',
      helpText:
        'You have a limited time to file an appeal, so consider this carefully.',
      showIf: (answers) => answers.case_outcome === 'lost',
    },
    {
      id: 'appeal_info',
      type: 'info',
      prompt:
        'Appeals must be filed within 21 days in JP court. You\'ll need to post an appeal bond. The case starts fresh in county court.',
      helpText:
        'For eviction cases, the appeal deadline is only 5 days (TRCP 510.9). Don\'t miss this window.',
      showIf: (answers) =>
        answers.case_outcome === 'lost' &&
        answers.considering_appeal === 'yes',
    },
    {
      id: 'next_steps_info',
      type: 'info',
      prompt:
        'Keep copies of all court documents. If money is owed, keep records of any payments received.',
      helpText:
        'You may need these documents for enforcement, appeals, or tax purposes.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.case_outcome === 'won') {
      items.push({ status: 'done', text: 'Judgment was in your favor.' })

      if (answers.other_party_complied === 'yes') {
        items.push({ status: 'done', text: 'The other party has complied with the judgment.' })
      } else {
        items.push({
          status: 'needed',
          text: 'Pursue enforcement: writ of possession, wage garnishment, bank levy, or property lien.',
        })
      }
    } else if (answers.case_outcome === 'lost') {
      items.push({
        status: 'info',
        text: 'The judgment was against you.',
      })

      if (answers.considering_appeal === 'yes') {
        items.push({
          status: 'needed',
          text: 'File your appeal within 21 days (5 days for eviction). Post an appeal bond.',
        })
      } else {
        items.push({
          status: 'info',
          text: 'If you change your mind, remember: appeals must be filed within 21 days (5 days for eviction).',
        })
      }
    } else if (answers.case_outcome === 'settled') {
      items.push({ status: 'done', text: 'Case resolved by settlement.' })
      items.push({
        status: 'info',
        text: 'Make sure the settlement terms are documented in writing and filed with the court.',
      })
    }

    items.push({
      status: 'info',
      text: 'Keep copies of all court documents and records of any payments received.',
    })

    return items
  },
}
