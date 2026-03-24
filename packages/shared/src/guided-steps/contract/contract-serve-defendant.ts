import type { GuidedStepConfig } from '../types'

export const contractServeDefendantConfig: GuidedStepConfig = {
  title: 'Serve the Defendant',
  reassurance:
    'The defendant must be formally notified of your contract lawsuit before the case can proceed.',

  questions: [
    {
      id: 'know_address',
      type: 'yes_no',
      prompt: 'Do you know the defendant\'s current address?',
    },
    {
      id: 'address_help',
      type: 'info',
      prompt:
        'You can search public records, business registrations, or the Secretary of State website to find addresses. If the defendant is a business, serve their registered agent.',
      showIf: (a) => a.know_address === 'no',
    },
    {
      id: 'defendant_type',
      type: 'single_choice',
      prompt: 'Is the defendant an individual or a business?',
      options: [
        { value: 'individual', label: 'Individual' },
        { value: 'business', label: 'Business / LLC / Corporation' },
      ],
    },
    {
      id: 'business_service_info',
      type: 'info',
      prompt:
        'For businesses, you must serve the registered agent listed with the Secretary of State. You can look this up on the Texas Secretary of State website (SOSDirect). If no registered agent is listed, serve an officer, director, or manager.',
      showIf: (a) => a.defendant_type === 'business',
    },
    {
      id: 'service_method',
      type: 'single_choice',
      prompt: 'Which service method will you use?',
      options: [
        { value: 'certified_mail', label: 'Certified mail (cheapest)' },
        { value: 'process_server', label: 'Process server' },
        { value: 'constable', label: 'Constable' },
        { value: 'not_sure', label: 'Not sure yet' },
      ],
    },
    {
      id: 'method_info',
      type: 'info',
      prompt:
        'Certified mail is cheapest but can be refused. A constable or process server is more reliable and creates a sworn return of service. For contract cases, process servers are a popular middle ground.',
      showIf: (a) => a.service_method === 'not_sure',
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
      showIf: (a) => a.service_completed === 'yes',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.know_address === 'yes') {
      items.push({ status: 'done', text: 'Defendant address known.' })
    } else {
      items.push({ status: 'needed', text: 'Need to locate defendant address.' })
    }

    if (answers.defendant_type === 'business') {
      items.push({ status: 'info', text: 'Serve the registered agent listed with the Secretary of State.' })
    }

    if (answers.service_method && answers.service_method !== 'not_sure') {
      items.push({ status: 'done', text: `Service method: ${answers.service_method.replace(/_/g, ' ')}.` })
    } else {
      items.push({ status: 'needed', text: 'Choose a service method.' })
    }

    if (answers.service_completed === 'yes') {
      items.push({ status: 'done', text: 'Service completed.' })
    } else {
      items.push({ status: 'needed', text: 'Complete service on defendant.' })
    }

    if (answers.proof_filed === 'yes') {
      items.push({ status: 'done', text: 'Proof of service filed.' })
    } else if (answers.service_completed === 'yes') {
      items.push({ status: 'needed', text: 'File proof of service with court.' })
    }

    return items
  },
}
