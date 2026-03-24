import type { GuidedStepConfig } from '../types'

export const ltWaitForResponseConfig: GuidedStepConfig = {
  title: 'Wait for the Response',
  reassurance:
    'After service, the other party has a limited time to respond. This waiting period is a normal part of the process.',

  questions: [
    {
      id: 'service_confirmed',
      type: 'yes_no',
      prompt: 'Has service been confirmed?',
      helpText:
        'You should have a return of service or signed receipt showing the other party was properly served.',
    },
    {
      id: 'service_reminder',
      type: 'info',
      prompt:
        'Make sure service is complete before counting the response deadline. Without proper service, the court cannot proceed.',
      showIf: (answers) => answers.service_confirmed === 'no',
    },
    {
      id: 'answer_deadline_known',
      type: 'yes_no',
      prompt: 'Do you know when the response is due?',
      helpText:
        'In Texas JP court, the defendant has until the trial date (usually 10-21 days after service for evictions). In county/district court, the answer is due by the first Monday after 20 days from service.',
    },
    {
      id: 'deadline_info',
      type: 'info',
      prompt:
        'Eviction cases in JP court: the hearing is typically set 10-21 days after the citation is issued. Other LT cases: the answer deadline is the first Monday after 20 days from service. Mark this date on your calendar.',
      showIf: (answers) => answers.answer_deadline_known === 'no',
    },
    {
      id: 'checked_docket',
      type: 'yes_no',
      prompt: 'Have you checked the court docket for any filings?',
      helpText:
        'The other party may file their answer or other motions. Check the court\'s online docket or call the clerk.',
    },
    {
      id: 'docket_info',
      type: 'info',
      prompt:
        'Check the court docket regularly using your cause number. Look for an answer, motions, or counterclaims. You can also call the clerk\'s office to ask about filings.',
      showIf: (answers) => answers.checked_docket === 'no',
    },
    {
      id: 'response_status',
      type: 'single_choice',
      prompt: 'Has the other party filed a response?',
      options: [
        { value: 'yes', label: 'Yes, they filed a response' },
        { value: 'no', label: 'No, still waiting' },
        { value: 'deadline_passed', label: 'The deadline has passed with no response' },
      ],
    },
    {
      id: 'default_info',
      type: 'info',
      prompt:
        'If the other party did not respond by the deadline, you may be able to request a default judgment. For evictions in JP court, the judge may proceed on the scheduled hearing date even without a formal answer.',
      showIf: (answers) => answers.response_status === 'deadline_passed',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.service_confirmed === 'yes') {
      items.push({ status: 'done', text: 'Service confirmed.' })
    } else {
      items.push({ status: 'needed', text: 'Confirm that service was properly completed.' })
    }

    if (answers.answer_deadline_known === 'yes') {
      items.push({ status: 'done', text: 'Response deadline noted.' })
    } else {
      items.push({ status: 'needed', text: 'Determine and calendar the response deadline.' })
    }

    if (answers.checked_docket === 'yes') {
      items.push({ status: 'done', text: 'Court docket checked for filings.' })
    } else {
      items.push({ status: 'needed', text: 'Check the court docket for any filings from the other party.' })
    }

    if (answers.response_status === 'yes') {
      items.push({ status: 'done', text: 'Response received. Ready to review.' })
    } else if (answers.response_status === 'deadline_passed') {
      items.push({ status: 'info', text: 'Deadline passed with no response. Consider requesting a default judgment.' })
    } else if (answers.response_status === 'no') {
      items.push({ status: 'info', text: 'Still waiting for the response. Continue monitoring the court docket.' })
    }

    return items
  },
}
