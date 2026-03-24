import type { GuidedStepConfig } from '../types'

export const bizPartnershipWaitForAnswerConfig: GuidedStepConfig = {
  title: 'Wait for the Answer',
  reassurance:
    'The defendant has a deadline to respond. Here\u2019s what to watch for.',

  questions: [
    {
      id: 'answer_received',
      type: 'yes_no',
      prompt: 'Has the defendant filed an answer?',
    },
    {
      id: 'waiting_info',
      type: 'info',
      prompt:
        'In Texas, the defendant has 20 days after service (plus next Monday) to file an answer. Monitor the court\u2019s online docket.',
      showIf: (answers) => answers.answer_received === 'no',
    },
    {
      id: 'has_counterclaim',
      type: 'yes_no',
      prompt: 'Did the answer include a counterclaim against you?',
      showIf: (answers) => answers.answer_received === 'yes',
    },
    {
      id: 'counterclaim_info',
      type: 'info',
      prompt:
        'A counterclaim means the other side is suing you back. You\u2019ll need to file an answer to the counterclaim.',
      showIf: (answers) => answers.has_counterclaim === 'yes',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.answer_received === 'yes') {
      items.push({ status: 'done', text: 'Defendant has filed an answer.' })
    } else if (answers.answer_received === 'no') {
      items.push({
        status: 'needed',
        text: 'Waiting for defendant\u2019s answer. Monitor the court docket.',
      })
    }

    if (answers.has_counterclaim === 'yes') {
      items.push({
        status: 'needed',
        text: 'Counterclaim received. File an answer to the counterclaim.',
      })
    } else if (answers.has_counterclaim === 'no') {
      items.push({
        status: 'done',
        text: 'No counterclaim filed.',
      })
    }

    if (answers.answer_received === 'no') {
      items.push({
        status: 'info',
        text: 'If no answer is filed by the deadline, you may request a default judgment.',
      })
    }

    return items
  },
}
