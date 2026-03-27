import type { GuidedStepConfig } from '../types'

export const otherServeDefendantConfig: GuidedStepConfig = {
  title: 'Serve the Other Party',
  reassurance:
    'Proper service ensures the other party is officially notified of your case. Courts require proof that service was completed correctly.',

  questions: [
    {
      id: 'know_defendant_address',
      type: 'yes_no',
      prompt: 'Do you have a current address for the person or organization you need to serve?',
    },
    {
      id: 'address_tips',
      type: 'info',
      prompt:
        'If you do not have an address, try checking public records, social media, or the address on any contracts or correspondence. For businesses, search your state\'s business entity database.',
      showIf: (answers) => answers.know_defendant_address === 'no',
    },
    {
      id: 'service_method',
      type: 'single_choice',
      prompt: 'How do you plan to serve the other party?',
      options: [
        { value: 'process_server', label: 'Hire a process server' },
        { value: 'sheriff', label: 'Have the sheriff or constable serve them' },
        { value: 'certified_mail', label: 'Certified mail (if allowed by your court)' },
        { value: 'unsure', label: 'Not sure yet' },
      ],
    },
    {
      id: 'method_info',
      type: 'info',
      prompt:
        'The most common methods are personal service (process server or sheriff) and certified mail. Check your court\'s rules to see which methods are allowed. You generally cannot serve the papers yourself.',
      showIf: (answers) => answers.service_method === 'unsure',
    },
    {
      id: 'service_completed',
      type: 'yes_no',
      prompt: 'Has service already been completed?',
    },
    {
      id: 'have_proof_of_service',
      type: 'yes_no',
      prompt: 'Do you have a signed proof of service (return of service) document?',
      showIf: (answers) => answers.service_completed === 'yes',
    },
    {
      id: 'proof_info',
      type: 'info',
      prompt:
        'You need a signed return of service (or affidavit of service) to prove the other party was properly served. The process server, sheriff, or mail receipt serves as this proof. File it with the court.',
      showIf: (answers) =>
        answers.service_completed === 'yes' && answers.have_proof_of_service === 'no',
    },
    {
      id: 'service_deadline_aware',
      type: 'yes_no',
      prompt: 'Do you know the deadline for completing service?',
      showIf: (answers) => answers.service_completed === 'no',
    },
    {
      id: 'deadline_info',
      type: 'info',
      prompt:
        'Most courts require service within a specific time after filing (often 90-120 days in state court, 90 days in federal court). Check your court\'s rules to avoid having your case dismissed.',
      showIf: (answers) =>
        answers.service_completed === 'no' && answers.service_deadline_aware === 'no',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.know_defendant_address === 'yes') {
      items.push({ status: 'done', text: 'Address for the other party identified.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Locate a current address for the person or organization you need to serve.',
      })
    }

    if (answers.service_method && answers.service_method !== 'unsure') {
      const labels: Record<string, string> = {
        process_server: 'process server',
        sheriff: 'sheriff or constable',
        certified_mail: 'certified mail',
      }
      items.push({
        status: 'done',
        text: `Service method selected: ${labels[answers.service_method] ?? answers.service_method}.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Choose a service method. Check your court\'s rules for allowed methods.',
      })
    }

    if (answers.service_completed === 'yes') {
      if (answers.have_proof_of_service === 'yes') {
        items.push({ status: 'done', text: 'Service completed with proof of service obtained.' })
      } else {
        items.push({
          status: 'needed',
          text: 'Obtain a signed return of service document and file it with the court.',
        })
      }
    } else {
      items.push({
        status: 'needed',
        text: 'Complete service on the other party within the court\'s deadline.',
      })
    }

    if (answers.service_completed === 'no' && answers.service_deadline_aware === 'no') {
      items.push({
        status: 'needed',
        text: 'Check your court\'s deadline for completing service to avoid dismissal.',
      })
    }

    return items
  },
}
