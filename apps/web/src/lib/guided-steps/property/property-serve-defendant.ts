import type { GuidedStepConfig } from '../types'

export const propertyServeDefendantConfig: GuidedStepConfig = {
  title: 'Serve the Other Party',
  reassurance:
    'Proper service gives the other party official notice of your property dispute and allows the case to proceed.',

  questions: [
    {
      id: 'know_address',
      type: 'yes_no',
      prompt: "Do you know the other party's current address?",
    },
    {
      id: 'address_help',
      type: 'info',
      prompt:
        'Check county property records (the appraisal district website), the deed, or the HOA directory to find the other party\'s address. If they are a neighbor, you may already know where they live.',
      showIf: (answers) => answers.know_address === 'no',
    },
    {
      id: 'service_method',
      type: 'single_choice',
      prompt: 'Which service method will you use?',
      options: [
        { value: 'certified_mail', label: 'Certified mail' },
        { value: 'constable', label: 'Constable' },
        { value: 'process_server', label: 'Process server' },
        { value: 'not_sure', label: 'Not sure yet' },
      ],
    },
    {
      id: 'method_info',
      type: 'info',
      prompt:
        'For property disputes, a constable or process server is generally more reliable than certified mail, which can be refused. The constable is often the most cost-effective option in Texas.',
      showIf: (answers) => answers.service_method === 'not_sure',
    },
    {
      id: 'service_completed',
      type: 'yes_no',
      prompt: 'Have you completed service on the other party?',
    },
    {
      id: 'proof_filed',
      type: 'yes_no',
      prompt: 'Have you filed proof of service (return of service) with the court?',
      showIf: (answers) => answers.service_completed === 'yes',
    },
    {
      id: 'proof_info',
      type: 'info',
      prompt:
        'The return of service document proves the other party was properly notified. Without it, the court cannot proceed with your case. If you used a constable, they will file it automatically. For process servers, you may need to file the affidavit of service yourself.',
      showIf: (answers) => answers.service_completed === 'yes' && answers.proof_filed === 'no',
    },
    {
      id: 'alternative_service_info',
      type: 'info',
      prompt:
        'If the other party cannot be found after diligent effort, you can ask the court for alternative service by posting or publication. This is common in property disputes where an owner is absent or unknown.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.know_address === 'yes') {
      items.push({ status: 'done', text: "You know the other party's address." })
    } else {
      items.push({
        status: 'needed',
        text: "Locate the other party's address using county property records, deed records, or the HOA directory.",
      })
    }

    if (
      answers.service_method &&
      answers.service_method !== 'not_sure'
    ) {
      const labels: Record<string, string> = {
        certified_mail: 'certified mail',
        constable: 'constable',
        process_server: 'process server',
      }
      items.push({
        status: 'done',
        text: `Service method chosen: ${labels[answers.service_method]}.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Choose a service method: certified mail, constable, or process server.',
      })
    }

    if (answers.service_completed === 'yes') {
      items.push({ status: 'done', text: 'Service has been completed.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Complete service on the other party.',
      })
    }

    if (answers.proof_filed === 'yes') {
      items.push({
        status: 'done',
        text: 'Proof of service filed with the court.',
      })
    } else if (answers.service_completed === 'yes') {
      items.push({
        status: 'needed',
        text: 'File proof of service (return of service) with the court.',
      })
    }

    items.push({
      status: 'info',
      text: "If the other party can't be found, ask the court about alternative service by posting or publication.",
    })

    return items
  },
}
