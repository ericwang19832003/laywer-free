import type { GuidedStepConfig } from '../types'

export const reWaitForAnswerConfig: GuidedStepConfig = {
  title: 'Wait for the Defendant\'s Answer',
  reassurance:
    'After service, the defendant has a set period to respond. Use this time to review your evidence and prepare.',

  questions: [
    {
      id: 'service_date_known',
      type: 'yes_no',
      prompt: 'Do you know the date the defendant was served?',
    },
    {
      id: 'deadline_info',
      type: 'info',
      prompt:
        'In Texas, the defendant has until the Monday after 20 days from service to file an answer. If the 20th day falls on a weekend or holiday, the deadline extends to the following Monday.',
    },
    {
      id: 'monitoring_docket',
      type: 'yes_no',
      prompt: 'Are you checking the court docket for filings?',
    },
    {
      id: 'docket_info',
      type: 'info',
      prompt:
        'Check the court\'s online docket regularly. You can also call the clerk\'s office with your cause number to ask if any filings have been made by the defendant.',
      showIf: (answers) => answers.monitoring_docket === 'no',
    },
    {
      id: 'answer_received',
      type: 'yes_no',
      prompt: 'Has the defendant filed an answer?',
    },
    {
      id: 'no_answer_info',
      type: 'info',
      prompt:
        'If the defendant misses the deadline, you may request a default judgment. This means the court could rule in your favor on the real estate claim without a trial. You will still need to prove your damages.',
      showIf: (answers) => answers.answer_received === 'no',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.service_date_known === 'yes') {
      items.push({ status: 'done', text: 'Service date is known. Deadline can be calculated.' })
    } else {
      items.push({ status: 'needed', text: 'Determine the date the defendant was served to calculate the answer deadline.' })
    }

    if (answers.monitoring_docket === 'yes') {
      items.push({ status: 'done', text: 'Monitoring the court docket for filings.' })
    } else {
      items.push({ status: 'needed', text: 'Check the court docket regularly for the defendant\'s answer.' })
    }

    if (answers.answer_received === 'yes') {
      items.push({ status: 'done', text: 'Answer received from defendant. Ready to review.' })
    } else if (answers.answer_received === 'no') {
      items.push({ status: 'info', text: 'No answer filed yet. If the deadline has passed, consider requesting a default judgment.' })
    }

    items.push({
      status: 'info',
      text: 'In Texas, the defendant has until the Monday after 20 days from service to file an answer.',
    })

    return items
  },
}
