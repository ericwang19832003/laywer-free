import type { GuidedStepConfig } from '../types'

export const piWaitForAnswerConfig: GuidedStepConfig = {
  title: 'Await the Defendant Answer',
  reassurance:
    'Now that your petition is filed, this step turns the case into a deadline tracker. We confirm filing and service facts, then watch for the defendant answer or a possible default.',

  questions: [
    {
      id: 'file_stamp_confirmed',
      type: 'yes_no',
      prompt: 'Do you have a file-stamped petition from the court?',
    },
    {
      id: 'file_stamp_info',
      type: 'info',
      prompt:
        'The litigation file should not start until the court has accepted the petition. Look for the court stamp, filing date, and case or cause number on the first page.',
      acknowledgeLabel: 'I\'ll get the file-stamped copy →',
      showIf: (answers) => answers.file_stamp_confirmed === 'no',
    },
    {
      id: 'case_number_recorded',
      type: 'yes_no',
      prompt: 'Have you recorded the court case number?',
      showIf: (answers) => answers.file_stamp_confirmed === 'yes',
    },
    {
      id: 'petition_filed_date',
      type: 'single_choice',
      prompt: 'When did you file your petition with the court?',
      showIf: (answers) => answers.file_stamp_confirmed === 'yes',
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
      showIf: (answers) => answers.file_stamp_confirmed === 'yes',
    },
    {
      id: 'serve_first_info',
      type: 'info',
      prompt:
        'The defendant must be served before the answer deadline starts. Go back to the "Serve the Defendant" step and record the service completion date, service method, and who was served.',
      acknowledgeLabel: 'I\'ll complete service first →',
      showIf: (answers) => answers.defendant_served === 'no',
    },
    {
      id: 'service_method_recorded',
      type: 'yes_no',
      prompt: 'Do you know the service method and the exact person or entity served?',
      showIf: (answers) => answers.defendant_served === 'yes',
    },
    {
      id: 'service_date',
      type: 'single_choice',
      prompt: 'What is the service completion date shown on the return of service?',
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
        'In Texas state court, the defendant generally has until 10:00 a.m. on the first Monday after 20 days from service to file an answer. Federal court is different: Rule 12(a) is usually 21 days after service. Use the court type before relying on a deadline.',
      acknowledgeLabel: 'I\'ve noted the answer deadline →',
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
      acknowledgeLabel: 'I\'ll check the docket →',
      showIf: (answers) => answers.answer_received === 'not_sure',
    },
    {
      id: 'no_answer_info',
      type: 'info',
      prompt:
        'If the defendant does not file an answer by the deadline, you may be eligible to request a default judgment. This means the court could rule in your favor without a trial.',
      acknowledgeLabel: 'I\'ll consider requesting default →',
      showIf: (answers) => answers.answer_received === 'no' && answers.service_date === 'over_three_weeks',
    },
    {
      id: 'case_removed',
      type: 'single_choice',
      prompt: 'Was your case removed to federal court by the defendant?',
      showIf: (answers) => answers.defendant_served === 'yes',
      options: [
        { value: 'yes', label: 'Yes, my case was removed to federal court' },
        { value: 'no', label: 'No' },
        { value: 'not_sure', label: 'I\'m not sure' },
      ],
    },
    {
      id: 'removal_check_info',
      type: 'info',
      prompt:
        'Check your court docket or look for a "Notice of Removal" from the defendant\'s attorney. If the case was removed, it will be transferred to the federal district court. You can also call the county clerk\'s office to confirm.',
      acknowledgeLabel: 'I\'ll check for a removal notice →',
      showIf: (answers) => answers.case_removed === 'not_sure',
    },
    {
      id: 'removal_detected_info',
      type: 'info',
      prompt:
        'When a case is removed to federal court, you have 30 days from the date of removal to file a motion to remand (send it back to state court). After completing this step, we\'ll guide you through your options: filing a motion to remand, preparing an amended complaint for federal court, or both.',
      acknowledgeLabel: 'I understand my 30-day remand window →',
      showIf: (answers) => answers.case_removed === 'yes',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.file_stamp_confirmed === 'yes') {
      items.push({ status: 'done', text: 'File-stamped petition confirmed.' })
    } else {
      items.push({ status: 'needed', text: 'Confirm the court accepted the petition before tracking litigation deadlines.' })
    }

    if (answers.case_number_recorded === 'yes') {
      items.push({ status: 'done', text: 'Court case number recorded.' })
    } else if (answers.file_stamp_confirmed === 'yes') {
      items.push({ status: 'needed', text: 'Record the case or cause number from the filed petition.' })
    }

    if (answers.defendant_served === 'yes') {
      items.push({ status: 'done', text: 'Defendant has been served.' })
      if (answers.service_method_recorded === 'yes') {
        items.push({ status: 'done', text: 'Service method and served party are recorded.' })
      } else {
        items.push({ status: 'needed', text: 'Record the service method and exact person or entity served.' })
      }
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

    if (answers.case_removed === 'yes') {
      items.push({
        status: 'needed',
        text: 'Case removed to federal court. You have 30 days to file a motion to remand.',
      })
    }

    items.push({
      status: 'info',
      text: 'Use the court type to calculate the answer deadline: Texas state court uses the Monday-after-20-days rule; federal court usually uses 21 days after service.',
    })

    return items
  },
}
