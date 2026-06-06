import type { GuidedStepConfig } from '../types'

export const piDiscoveryResponsesConfig: GuidedStepConfig = {
  title: 'Review Discovery Responses',
  reassurance:
    'Use this step after the defendant responds to your discovery. We review each response for evasive answers, boilerplate objections, missing documents, privilege-log problems, and admissions that narrow the case.',

  questions: [
    {
      id: 'received_responses',
      type: 'single_choice',
      prompt: 'Has the defendant served responses to your discovery requests?',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'not_due_yet', label: 'Not yet, the deadline has not passed' },
        { value: 'overdue', label: 'No, and the deadline passed' },
      ],
    },
    {
      id: 'response_set',
      type: 'single_choice',
      prompt: 'Which response set are you reviewing?',
      showIf: (answers) => answers.received_responses === 'yes',
      options: [
        { value: 'interrogatories', label: 'Interrogatories' },
        { value: 'rfps', label: 'Requests for production' },
        { value: 'rfas', label: 'Requests for admission' },
        { value: 'mixed', label: 'A mixed set' },
      ],
    },
    {
      id: 'bare_denials',
      type: 'yes_no',
      prompt: 'Did any interrogatory response give only a bare denial instead of stating facts?',
      showIf: (answers) => answers.received_responses === 'yes',
    },
    {
      id: 'bare_denial_info',
      type: 'info',
      prompt:
        'Flag this for a motion to compel. A party that denies fault or damages usually must state the facts supporting that position, not just repeat the denial.',
      acknowledgeLabel: 'I\'ll flag this for the motion →',
      showIf: (answers) => answers.bare_denials === 'yes',
    },
    {
      id: 'boilerplate_objections',
      type: 'single_choice',
      prompt: 'Did they use objections like "vague," "overly broad," or "calls for expert opinion" without a real explanation?',
      showIf: (answers) => answers.received_responses === 'yes',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'not_sure', label: 'I\'m not sure' },
      ],
    },
    {
      id: 'objection_info',
      type: 'info',
      prompt:
        'Boilerplate objections often are not enough. If they disputed repair costs or fault, they should usually explain the factual basis and produce responsive non-privileged documents.',
      acknowledgeLabel: 'I\'ll demand a proper response →',
      showIf: (answers) => answers.boilerplate_objections === 'yes' || answers.boilerplate_objections === 'not_sure',
    },
    {
      id: 'missing_documents',
      type: 'yes_no',
      prompt: 'Did they withhold documents you requested, such as estimates, photos, appraisals, invoices, or insurer communications?',
      showIf: (answers) => answers.received_responses === 'yes',
    },
    {
      id: 'privilege_log',
      type: 'single_choice',
      prompt: 'If they claimed privilege, did they provide a privilege log?',
      showIf: (answers) => answers.missing_documents === 'yes',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'no_privilege_claimed', label: 'No privilege claim' },
        { value: 'not_sure', label: 'Not sure' },
      ],
    },
    {
      id: 'meet_and_confer_info',
      type: 'info',
      prompt:
        'Before filing a motion to compel, most courts require a good-faith meet-and-confer. Keep the letter, email, call notes, date, and what the defendant refused to fix.',
      acknowledgeLabel: 'I\'ll document the meet-and-confer →',
      showIf: (answers) => answers.received_responses === 'yes' || answers.received_responses === 'overdue',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.received_responses === 'yes') {
      items.push({ status: 'done', text: `Reviewing discovery responses: ${answers.response_set?.replace(/_/g, ' ') ?? 'set noted'}.` })

      if (answers.bare_denials === 'yes') {
        items.push({ status: 'needed', text: 'Include bare denials in the meet-and-confer letter and possible motion to compel.' })
      }

      if (answers.boilerplate_objections === 'yes' || answers.boilerplate_objections === 'not_sure') {
        items.push({ status: 'needed', text: 'Review boilerplate objections and demand a clearer response where the objection lacks support.' })
      }

      if (answers.missing_documents === 'yes') {
        items.push({ status: 'needed', text: 'List each missing document category and ask for production or a valid privilege log.' })
      }
    } else if (answers.received_responses === 'overdue') {
      items.push({ status: 'needed', text: 'Responses appear overdue. Send a meet-and-confer letter before asking the court to compel responses.' })
    } else if (answers.received_responses === 'not_due_yet') {
      items.push({ status: 'info', text: 'Keep monitoring the response deadline.' })
    } else {
      items.push({ status: 'info', text: 'No defendant discovery responses received yet.' })
    }

    if (answers.privilege_log === 'no') {
      items.push({ status: 'needed', text: 'Privilege was claimed without a log. Flag this as a motion-to-compel issue.' })
    }

    return items
  },
}
