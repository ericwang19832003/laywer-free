import type { GuidedStepConfig } from '../types'

export const bizEmploymentWaitForAnswerConfig: GuidedStepConfig = {
  title: 'Wait for the Answer',
  reassurance:
    'After being served, your employer has a set period to respond. Understanding their response helps you plan your next steps.',

  questions: [
    {
      id: 'answer_received',
      type: 'yes_no',
      prompt: 'Has the employer filed an answer or response?',
    },
    {
      id: 'waiting_info',
      type: 'info',
      prompt:
        'The employer has 20 days (state court) or 21 days (federal court) to file an answer after being served. If they don\'t respond, you may be able to request a default judgment.',
      showIf: (answers) => answers.answer_received === 'no',
    },
    {
      id: 'has_counterclaim',
      type: 'yes_no',
      prompt: 'Did the employer file a counterclaim against you?',
      showIf: (answers) => answers.answer_received === 'yes',
    },
    {
      id: 'has_motion_to_dismiss',
      type: 'yes_no',
      prompt: 'Did the employer file a motion to dismiss?',
      showIf: (answers) => answers.answer_received === 'yes',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.answer_received === 'yes') {
      items.push({
        status: 'done',
        text: 'Employer\'s answer received.',
      })
    } else if (answers.answer_received === 'no') {
      items.push({
        status: 'needed',
        text: 'Waiting for employer\'s answer. Monitor the deadline for requesting a default judgment.',
      })
    }

    if (answers.has_counterclaim === 'yes') {
      items.push({
        status: 'needed',
        text: 'Employer filed a counterclaim. You must file a response to the counterclaim.',
      })
    } else if (answers.has_counterclaim === 'no') {
      items.push({
        status: 'done',
        text: 'No counterclaim filed.',
      })
    }

    if (answers.has_motion_to_dismiss === 'yes') {
      items.push({
        status: 'needed',
        text: 'Employer filed a motion to dismiss. You must file a response opposing the motion before the hearing.',
      })
    } else if (answers.has_motion_to_dismiss === 'no') {
      items.push({
        status: 'done',
        text: 'No motion to dismiss filed.',
      })
    }

    return items
  },
}
