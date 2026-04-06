import type { GuidedStepConfig } from '../types'

export const propertyWaitForAnswerConfig: GuidedStepConfig = {
  title: 'Wait for the Other Party\'s Answer',
  reassurance:
    'After the other party is served, they have a limited time to file an answer. This step helps you track that deadline and monitor your case docket.',

  questions: [
    {
      id: 'service_date',
      type: 'single_choice',
      prompt: 'When was the other party served?',
      options: [
        { value: 'less_than_week', label: 'Less than a week ago' },
        { value: 'one_to_two_weeks', label: '1-2 weeks ago' },
        { value: 'two_to_three_weeks', label: '2-3 weeks ago' },
        { value: 'over_three_weeks', label: 'Over 3 weeks ago' },
      ],
    },
    {
      id: 'deadline_info',
      type: 'info',
      prompt:
        'In Texas, the other party generally has until the first Monday after 20 days from the date of service to file an answer. If the 20th day falls on a weekend or holiday, the deadline extends to the following Monday.',
    },
    {
      id: 'checked_docket',
      type: 'yes_no',
      prompt: 'Have you checked the court docket recently?',
    },
    {
      id: 'docket_check_info',
      type: 'info',
      prompt:
        'Check the court\'s online docket regularly for filings by the other party. You can also call the clerk\'s office to ask if an answer has been filed. In property disputes, the other party may also file a counterclaim related to the same property.',
      showIf: (answers) => answers.checked_docket === 'no',
    },
    {
      id: 'time_elapsed',
      type: 'single_choice',
      prompt: 'How long has it been since service?',
      options: [
        { value: 'within_deadline', label: 'Still within the 20-day answer period' },
        { value: 'deadline_passed', label: 'The 20-day deadline has passed' },
        { value: 'not_sure', label: 'I\'m not sure' },
      ],
    },
    {
      id: 'default_info',
      type: 'info',
      prompt:
        'If the other party does not file an answer by the deadline, you may request a default judgment. In property disputes, a default judgment can grant you the specific relief you requested (removal of encroachment, quiet title, etc.) in addition to monetary damages.',
      showIf: (answers) => answers.time_elapsed === 'deadline_passed',
    },
    {
      id: 'answer_filed',
      type: 'single_choice',
      prompt: 'Has the other party filed an answer?',
      options: [
        { value: 'yes', label: 'Yes, an answer has been filed' },
        { value: 'no', label: 'No answer yet' },
        { value: 'not_sure', label: 'I\'m not sure how to check' },
      ],
    },
    {
      id: 'check_info',
      type: 'info',
      prompt:
        'Look up your case on the county court\'s online docket system, or call the clerk\'s office with your cause number. The clerk can tell you if any filings have been made.',
      showIf: (answers) => answers.answer_filed === 'not_sure',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.service_date) {
      items.push({
        status: 'done',
        text: 'Other party has been served.',
      })
    }

    if (answers.checked_docket === 'yes') {
      items.push({
        status: 'done',
        text: 'Court docket has been checked.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Check the court docket for any filings by the other party.',
      })
    }

    if (answers.answer_filed === 'yes') {
      items.push({
        status: 'done',
        text: 'Answer received from the other party. Ready to review.',
      })
    } else if (answers.answer_filed === 'no') {
      if (answers.time_elapsed === 'deadline_passed') {
        items.push({
          status: 'info',
          text: 'Answer deadline may have passed. Consider requesting a default judgment.',
        })
      } else {
        items.push({
          status: 'needed',
          text: 'Still waiting for the other party\'s answer. Continue monitoring the docket.',
        })
      }
    } else if (answers.answer_filed === 'not_sure') {
      items.push({
        status: 'needed',
        text: 'Check the court docket or call the clerk to see if an answer was filed.',
      })
    }

    items.push({
      status: 'info',
      text: 'In Texas, the other party has until the first Monday after 20 days from service to file an answer.',
    })

    return items
  },
}
