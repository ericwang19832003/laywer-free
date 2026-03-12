import type { GuidedStepConfig } from '../types'

export const contractWaitForAnswerConfig: GuidedStepConfig = {
  title: 'Wait for the Answer',
  reassurance:
    'After the defendant is served with your contract lawsuit, they have a limited time to file an answer with the court. This step helps you track that deadline.',

  questions: [
    {
      id: 'service_date',
      type: 'single_choice',
      prompt: 'When was the defendant served?',
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
        'In Texas, the defendant generally has until the first Monday after 20 days from the date of service to file an answer. If the 20th day falls on a weekend, the deadline extends to the following Monday.',
    },
    {
      id: 'monitoring_docket',
      type: 'yes_no',
      prompt: 'Have you been checking the court docket for filings?',
    },
    {
      id: 'docket_info',
      type: 'info',
      prompt:
        'You can check for filings on your county court\'s online docket system, or by calling the clerk\'s office. Look for an "Answer," "General Denial," or any motions filed by the defendant.',
      showIf: (answers) => answers.monitoring_docket === 'no',
    },
    {
      id: 'answer_received',
      type: 'single_choice',
      prompt: 'Have you received the defendant\'s answer?',
      options: [
        { value: 'yes', label: 'Yes, I have their answer' },
        { value: 'no', label: 'No, still waiting' },
        { value: 'not_sure', label: 'I\'m not sure how to check' },
      ],
    },
    {
      id: 'check_answer_info',
      type: 'info',
      prompt:
        'Look up your case on the county court\'s online docket, or call the clerk\'s office. You may also receive a copy by mail from the defendant\'s attorney.',
      showIf: (answers) => answers.answer_received === 'not_sure',
    },
    {
      id: 'default_judgment_info',
      type: 'info',
      prompt:
        'If the defendant does not file an answer by the deadline, you may request a default judgment. This means the court could rule in your favor on the contract claim without a trial. You will still need to prove your damages.',
      showIf: (answers) => answers.answer_received === 'no' && answers.service_date === 'over_three_weeks',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.service_date) {
      items.push({ status: 'done', text: `Defendant was served (${answers.service_date.replace(/_/g, ' ')}).` })
    }

    if (answers.monitoring_docket === 'yes') {
      items.push({ status: 'done', text: 'Monitoring the court docket for filings.' })
    } else {
      items.push({ status: 'needed', text: 'Check the court docket regularly for the defendant\'s answer.' })
    }

    if (answers.answer_received === 'yes') {
      items.push({ status: 'done', text: 'Answer received from defendant. Ready to review.' })
    } else if (answers.answer_received === 'no') {
      if (answers.service_date === 'over_three_weeks') {
        items.push({ status: 'info', text: 'Deadline may have passed. Consider requesting a default judgment if no answer was filed.' })
      } else {
        items.push({ status: 'needed', text: 'Still waiting for the defendant\'s answer. Monitor the court docket.' })
      }
    } else if (answers.answer_received === 'not_sure') {
      items.push({ status: 'needed', text: 'Check the court docket or call the clerk to see if an answer was filed.' })
    }

    items.push({
      status: 'info',
      text: 'In Texas, the defendant has until the first Monday after 20 days from service to file an answer.',
    })

    return items
  },
}
