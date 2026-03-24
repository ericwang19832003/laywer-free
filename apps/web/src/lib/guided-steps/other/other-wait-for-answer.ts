import type { GuidedStepConfig } from '../types'

export const otherWaitForAnswerConfig: GuidedStepConfig = {
  title: 'Wait for the Other Party\'s Answer',
  reassurance:
    'After service, the other party has a set number of days to respond. This waiting period is normal and required by law.',

  questions: [
    {
      id: 'know_answer_deadline',
      type: 'yes_no',
      prompt: 'Do you know the deadline for the other party to file their answer?',
    },
    {
      id: 'deadline_info',
      type: 'info',
      prompt:
        'In most state courts, the defendant has 20-30 days after service to file an answer. In federal court, it is typically 21 days. Check the rules for your specific court.',
      showIf: (answers) => answers.know_answer_deadline === 'no',
    },
    {
      id: 'monitoring_docket',
      type: 'yes_no',
      prompt: 'Are you checking the court docket regularly for filings?',
    },
    {
      id: 'docket_info',
      type: 'info',
      prompt:
        'Most courts have online docket systems where you can check for new filings. Set a reminder to check weekly. You will also usually receive copies of anything filed by the other side.',
      showIf: (answers) => answers.monitoring_docket === 'no',
    },
    {
      id: 'deadline_passed',
      type: 'single_choice',
      prompt: 'Has the answer deadline already passed?',
      options: [
        { value: 'no', label: 'No, still waiting' },
        { value: 'yes_answered', label: 'Yes, and they filed an answer' },
        { value: 'yes_no_answer', label: 'Yes, and they did NOT file an answer' },
      ],
    },
    {
      id: 'default_info',
      type: 'info',
      prompt:
        'If the other party missed their deadline, you may be able to request a default judgment. This means you could win your case without a trial because they failed to respond. Contact the court clerk about filing a motion for default.',
      showIf: (answers) => answers.deadline_passed === 'yes_no_answer',
    },
    {
      id: 'answer_received_info',
      type: 'info',
      prompt:
        'Now that the other party has answered, the next phase typically involves discovery (exchanging information) and possibly mediation or a trial date. Review their answer carefully for any counterclaims.',
      showIf: (answers) => answers.deadline_passed === 'yes_answered',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.know_answer_deadline === 'yes') {
      items.push({ status: 'done', text: 'Answer deadline identified.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Determine the answer deadline based on your court\'s rules.',
      })
    }

    if (answers.monitoring_docket === 'yes') {
      items.push({ status: 'done', text: 'Monitoring the court docket for filings.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Set up regular docket checks (at least weekly) to monitor for new filings.',
      })
    }

    if (answers.deadline_passed === 'yes_answered') {
      items.push({
        status: 'done',
        text: 'Answer received. Review it for counterclaims and prepare for the next phase.',
      })
    } else if (answers.deadline_passed === 'yes_no_answer') {
      items.push({
        status: 'needed',
        text: 'The deadline has passed with no answer. Consider filing a motion for default judgment.',
      })
    } else {
      items.push({
        status: 'info',
        text: 'Still within the answer period. Continue monitoring the docket.',
      })
    }

    return items
  },
}
