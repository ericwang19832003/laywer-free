import type { GuidedStepConfig } from '../types'

export const piDiscoveryResponsesConfig: GuidedStepConfig = {
  title: 'Respond to Opposing Discovery',
  reassurance:
    'The defendant will likely send you discovery requests too. We\'ll help you understand what\'s required and how to respond properly.',

  questions: [
    {
      id: 'received_discovery',
      type: 'single_choice',
      prompt: 'Has opposing counsel sent you discovery requests?',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'not_yet', label: 'Not yet, but I expect them' },
      ],
    },
    {
      id: 'discovery_type',
      type: 'single_choice',
      prompt: 'What type of discovery requests did you receive? (select primary type)',
      showIf: (answers) => answers.received_discovery === 'yes',
      options: [
        { value: 'interrogatories', label: 'Interrogatories (written questions)' },
        { value: 'rfps', label: 'Requests for production (documents)' },
        { value: 'rfas', label: 'Requests for admission (confirm/deny)' },
        { value: 'deposition', label: 'Deposition notice' },
      ],
    },
    {
      id: 'know_deadline',
      type: 'yes_no',
      prompt: 'Do you know your response deadline?',
      showIf: (answers) => answers.received_discovery === 'yes',
    },
    {
      id: 'deadline_info',
      type: 'info',
      prompt:
        'In Texas, you generally have 30 days from the date you receive discovery requests to respond. For requests for admission, if you don\'t respond within 30 days, they are automatically deemed admitted — this can be devastating to your case.',
      showIf: (answers) => answers.know_deadline === 'no',
    },
    {
      id: 'objectionable_questions',
      type: 'single_choice',
      prompt: 'Are there any questions or requests that seem objectionable or overly broad?',
      showIf: (answers) => answers.received_discovery === 'yes',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'not_sure', label: 'I\'m not sure what\'s objectionable' },
      ],
    },
    {
      id: 'objections_info',
      type: 'info',
      prompt:
        'Common objections include: overly broad (asks for too much), not relevant to the case, privileged (attorney-client or medical), unduly burdensome, or vague. You can object to specific requests while still answering the rest.',
      showIf: (answers) => answers.objectionable_questions === 'yes' || answers.objectionable_questions === 'not_sure',
    },
    {
      id: 'ime_requested',
      type: 'yes_no',
      prompt: 'Has the defendant requested an independent medical examination (IME)?',
      showIf: (answers) => answers.received_discovery === 'yes',
    },
    {
      id: 'ime_info',
      type: 'info',
      prompt:
        'An IME is an examination by a doctor chosen by the defendant. You have the right to: know the doctor\'s name and specialty in advance, have the exam recorded, receive a copy of the report, and object if the exam is unreasonable. The exam should be limited to the injuries in your case.',
      showIf: (answers) => answers.ime_requested === 'yes',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.received_discovery === 'yes') {
      items.push({ status: 'info', text: `Received discovery requests: ${answers.discovery_type?.replace(/_/g, ' ') ?? 'type noted'}.` })

      if (answers.know_deadline === 'no') {
        items.push({ status: 'needed', text: 'Determine your 30-day response deadline. Missing it can have serious consequences.' })
      } else {
        items.push({ status: 'done', text: 'Response deadline is known.' })
      }

      if (answers.objectionable_questions === 'yes') {
        items.push({ status: 'info', text: 'Some requests may be objectionable. Prepare written objections for those specific items.' })
      }
    } else if (answers.received_discovery === 'not_yet') {
      items.push({ status: 'info', text: 'Expect to receive discovery requests from opposing counsel. You\'ll have 30 days to respond.' })
    } else {
      items.push({ status: 'info', text: 'No discovery requests received yet.' })
    }

    if (answers.ime_requested === 'yes') {
      items.push({ status: 'needed', text: 'Prepare for the independent medical examination. You may request it be recorded.' })
    }

    return items
  },
}
