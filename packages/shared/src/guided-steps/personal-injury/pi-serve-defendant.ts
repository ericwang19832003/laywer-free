import type { GuidedStepConfig } from '../types'

export const piServeDefendantConfig: GuidedStepConfig = {
  title: 'Serve the Defendant',
  reassurance:
    'Proper service is required for the court to have jurisdiction over the defendant.',

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
        "You may need to use a skip tracing service or check public records to find the defendant's address.",
      showIf: (answers) => answers.know_defendant_address === 'no',
    },
    {
      id: 'service_method',
      type: 'single_choice',
      prompt: 'Which service method will you use?',
      options: [
        { value: 'constable', label: 'County constable' },
        { value: 'process_server', label: 'Private process server' },
        { value: 'certified_mail', label: 'Certified mail' },
        { value: 'not_sure', label: "I'm not sure" },
      ],
    },
    {
      id: 'method_recommendation',
      type: 'info',
      prompt:
        'A constable or private process server is most reliable. Certified mail is cheaper but the defendant can refuse to sign.',
      showIf: (answers) => answers.service_method === 'not_sure',
    },
    {
      id: 'service_completed',
      type: 'yes_no',
      prompt: 'Have you completed service on the defendant?',
    },
    {
      id: 'proof_of_service_filed',
      type: 'yes_no',
      prompt:
        'Have you filed proof of service (return of service) with the court?',
      showIf: (answers) => answers.service_completed === 'yes',
    },
    {
      id: 'service_deadline_info',
      type: 'info',
      prompt:
        'Service must be completed within 120 days of filing your petition, or the court may dismiss your case.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.know_defendant_address === 'yes') {
      items.push({
        status: 'done',
        text: "Defendant's address is known.",
      })
    } else {
      items.push({
        status: 'needed',
        text: "Find the defendant's current address using skip tracing or public records.",
      })
    }

    if (answers.service_method === 'constable') {
      items.push({
        status: 'done',
        text: 'Service method chosen: county constable.',
      })
    } else if (answers.service_method === 'process_server') {
      items.push({
        status: 'done',
        text: 'Service method chosen: private process server.',
      })
    } else if (answers.service_method === 'certified_mail') {
      items.push({
        status: 'done',
        text: 'Service method chosen: certified mail. Note that the defendant can refuse to sign.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Choose a service method. A constable or process server is the most reliable option.',
      })
    }

    if (answers.service_completed === 'yes') {
      items.push({
        status: 'done',
        text: 'Service on the defendant has been completed.',
      })

      if (answers.proof_of_service_filed === 'yes') {
        items.push({
          status: 'done',
          text: 'Proof of service (return of service) filed with the court.',
        })
      } else {
        items.push({
          status: 'needed',
          text: 'File proof of service (return of service) with the court.',
        })
      }
    } else {
      items.push({
        status: 'needed',
        text: 'Complete service on the defendant.',
      })
    }

    items.push({
      status: 'info',
      text: 'Service must be completed within 120 days of filing your petition, or the court may dismiss your case.',
    })

    return items
  },
}
