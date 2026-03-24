import type { GuidedStepConfig } from '../types'

export const bizB2bWaitForAnswerConfig: GuidedStepConfig = {
  title: 'Wait for the Answer',
  reassurance:
    'After service, the other business has a limited time to respond. Knowing what to expect helps you prepare.',

  questions: [
    {
      id: 'answer_received',
      type: 'yes_no',
      prompt: 'Have you received the other business\'s answer?',
    },
    {
      id: 'waiting_info',
      type: 'info',
      prompt:
        'The other business generally has 20 days after being served to file an answer. If they fail to respond, you may be able to request a default judgment.',
      showIf: (answers) => answers.answer_received === 'no',
    },
    {
      id: 'has_counterclaim',
      type: 'yes_no',
      prompt: 'Did the other business file a counterclaim against you?',
      showIf: (answers) => answers.answer_received === 'yes',
    },
    {
      id: 'counterclaim_info',
      type: 'info',
      prompt:
        'You will need to file a response to the counterclaim, typically within 20 days. Treat this as seriously as you would a new lawsuit — gather evidence and prepare your defense.',
      showIf: (answers) => answers.has_counterclaim === 'yes',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.answer_received === 'yes') {
      items.push({ status: 'done', text: 'Answer received from the other business.' })
    } else {
      items.push({
        status: 'info',
        text: 'Waiting for the answer — the other business has 20 days to respond.',
      })
    }

    if (answers.has_counterclaim === 'yes') {
      items.push({
        status: 'needed',
        text: 'Counterclaim filed — you must respond within 20 days.',
      })
    } else if (answers.answer_received === 'yes') {
      items.push({ status: 'done', text: 'No counterclaim filed.' })
    }

    return items
  },
}
