import type { GuidedStepConfig } from '../types'

export const serveDefendantConfig: GuidedStepConfig = {
  title: 'Serve the Defendant',
  reassurance:
    'Proper service notifies the defendant and lets the case proceed.',

  questions: [
    {
      id: 'know_defendant_address',
      type: 'yes_no',
      prompt: "Do you know the defendant's current address?",
    },
    {
      id: 'address_help',
      type: 'info',
      prompt:
        'Check public records, social media, or use a skip tracing service.',
      showIf: (answers) => answers.know_defendant_address === 'no',
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
        'Certified mail is cheapest but can be refused. A constable or process server is more reliable.',
      showIf: (answers) => answers.service_method === 'not_sure',
    },
    {
      id: 'service_completed',
      type: 'yes_no',
      prompt: 'Have you completed service?',
    },
    {
      id: 'proof_filed',
      type: 'yes_no',
      prompt: 'Have you filed proof of service with the court?',
      showIf: (answers) => answers.service_completed === 'yes',
    },
    {
      id: 'cant_find_info',
      type: 'info',
      prompt:
        "If the defendant can't be found after diligent effort, ask the court about alternative service (posting on the courthouse door or publication).",
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.know_defendant_address === 'yes') {
      items.push({ status: 'done', text: "You know the defendant's address." })
    } else {
      items.push({
        status: 'needed',
        text: "Locate the defendant's current address using public records, social media, or a skip tracing service.",
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
        text: 'Complete service on the defendant.',
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
        text: 'File proof of service with the court.',
      })
    }

    items.push({
      status: 'info',
      text: "If the defendant can't be found, ask the court about alternative service options.",
    })

    return items
  },
}
