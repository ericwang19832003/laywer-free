import type { GuidedStepConfig } from '../types'

export const piWaitForAnswerConfig: GuidedStepConfig = {
  title: 'Wait for the Answer',
  reassurance:
    'After the defendant is served, they have a limited time to file an answer with the court. This step helps you track that deadline.',

  questions: [
    {
      id: 'petition_filed_date',
      type: 'single_choice',
      prompt: 'When did you file your petition with the court?',
      options: [
        { value: 'less_than_week', label: 'Less than a week ago' },
        { value: 'one_to_two_weeks', label: '1–2 weeks ago' },
        { value: 'two_to_four_weeks', label: '2–4 weeks ago' },
        { value: 'over_a_month', label: 'Over a month ago' },
      ],
    },
    {
      id: 'defendant_served',
      type: 'yes_no',
      prompt: 'Has the defendant been officially served?',
    },
    {
      id: 'serve_first_info',
      type: 'info',
      prompt:
        'The defendant must be served before the answer deadline starts. Go back to the "Serve the Defendant" step if service has not been completed.',
      showIf: (answers) => answers.defendant_served === 'no',
    },
    {
      id: 'service_date',
      type: 'single_choice',
      prompt: 'Approximately when was the defendant served?',
      showIf: (answers) => answers.defendant_served === 'yes',
      options: [
        { value: 'less_than_week', label: 'Less than a week ago' },
        { value: 'one_to_two_weeks', label: '1–2 weeks ago' },
        { value: 'two_to_three_weeks', label: '2–3 weeks ago' },
        { value: 'over_three_weeks', label: 'Over 3 weeks ago' },
      ],
    },
    {
      id: 'deadline_info',
      type: 'info',
      prompt:
        'In Texas, the defendant generally has until the first Monday after 20 days from the date of service to file an answer. If the 20th day falls on a weekend, the deadline extends to the following Monday.',
      showIf: (answers) => answers.defendant_served === 'yes',
    },
    {
      id: 'answer_received',
      type: 'single_choice',
      prompt: 'Have you received the defendant\'s answer?',
      showIf: (answers) => answers.defendant_served === 'yes',
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
        'You can check if an answer has been filed by looking up your case on the county court\'s online docket, or by calling the clerk\'s office. You may also receive a copy by mail from the defendant\'s attorney.',
      showIf: (answers) => answers.answer_received === 'not_sure',
    },
    {
      id: 'no_answer_info',
      type: 'info',
      prompt:
        'If the defendant does not file an answer by the deadline, you may be eligible to request a default judgment. This means the court could rule in your favor without a trial.',
      showIf: (answers) => answers.answer_received === 'no' && answers.service_date === 'over_three_weeks',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.defendant_served === 'yes') {
      items.push({ status: 'done', text: 'Defendant has been served.' })
    } else {
      items.push({ status: 'needed', text: 'Defendant must be served before the answer deadline begins.' })
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
