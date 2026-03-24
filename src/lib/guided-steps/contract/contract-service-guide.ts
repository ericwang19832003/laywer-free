import type { GuidedStepConfig } from '../types'

export const contractServiceGuideConfig: GuidedStepConfig = {
  title: 'How to Serve the Other Party',
  reassurance:
    "Service means officially notifying the other party about the lawsuit. It's required, but straightforward.",

  questions: [
    // Who are you suing?
    {
      id: 'defendant_type',
      type: 'single_choice',
      prompt: 'Who are you suing?',
      options: [
        { value: 'individual', label: 'Individual' },
        { value: 'business', label: 'Business / company' },
        { value: 'out_of_state', label: 'Out-of-state party' },
      ],
    },

    // Conditional service instructions
    {
      id: 'individual_info',
      type: 'info',
      prompt:
        'Process server or sheriff delivers to their home or workplace. You will need the individual\'s full legal name and current address. Check the contract for the name and address they used when signing.',
      showIf: (answers) => answers.defendant_type === 'individual',
    },
    {
      id: 'business_info',
      type: 'info',
      prompt:
        'Serve their registered agent. Find the agent at the TX Secretary of State website: sos.state.tx.us. Search by company name. The registered agent is the person or company legally designated to accept lawsuits on the business\'s behalf.',
      showIf: (answers) => answers.defendant_type === 'business',
    },
    {
      id: 'out_of_state_info',
      type: 'info',
      prompt:
        'You can still sue in Texas if the contract was performed or made in Texas, or if the defendant does business in Texas. Service on an out-of-state defendant can be done by:\n\n1. Hiring a process server in their state\n2. Certified mail with return receipt\n3. Serving the Texas Secretary of State as their agent (Tex. Civ. Prac. & Rem. Code §17.044) — the Secretary then forwards the papers to the defendant\n\nOut-of-state service takes longer. Allow extra time before your court deadlines.',
      showIf: (answers) => answers.defendant_type === 'out_of_state',
    },

    // Service method
    {
      id: 'service_method',
      type: 'single_choice',
      prompt: 'Which service method will you use?',
      options: [
        { value: 'process_server', label: 'Process server' },
        { value: 'sheriff', label: 'Sheriff / constable' },
        { value: 'certified_mail', label: 'Certified mail' },
        { value: 'not_sure', label: 'Not sure yet' },
      ],
    },

    // Method details
    {
      id: 'process_server_info',
      type: 'info',
      prompt:
        'A private process server will deliver the papers to the defendant. Cost: typically $50–150. They are usually faster than the sheriff and offer flexible scheduling. After delivery, they will provide you with an affidavit of service to file with the court.',
      showIf: (answers) => answers.service_method === 'process_server',
    },
    {
      id: 'sheriff_info',
      type: 'info',
      prompt:
        'The sheriff or constable will deliver the papers. Cost: typically $75–100. Request service through the court clerk when you file your petition — they will forward the citation to the sheriff\'s office. The sheriff files the return of service automatically.',
      showIf: (answers) => answers.service_method === 'sheriff',
    },
    {
      id: 'certified_mail_info',
      type: 'info',
      prompt:
        'Certified mail with return receipt requested can be used in some courts (especially JP Court). Cost: under $10. The risk: if the defendant refuses to sign or the mail is unclaimed, service fails and you\'ll need to use another method.',
      showIf: (answers) => answers.service_method === 'certified_mail',
    },
    {
      id: 'not_sure_method_info',
      type: 'info',
      prompt:
        'For most contract cases, a sheriff/constable or process server is the most reliable option. Certified mail is cheaper but can be refused. If you\'re unsure, ask the court clerk what works best for your court.',
      showIf: (answers) => answers.service_method === 'not_sure',
    },

    // Certificate of service
    {
      id: 'certificate_of_service_info',
      type: 'info',
      prompt:
        'After service is completed, a certificate (or return) of service must be filed with the court. This document proves the defendant was properly notified.\n\n• Sheriff/constable: They file it automatically.\n• Process server: They provide an affidavit of service — you may need to file it yourself.\n• Certified mail: The signed return receipt (green card) serves as proof.',
    },

    // Cannot serve yourself
    {
      id: 'self_service_warning',
      type: 'info',
      prompt:
        'You CANNOT serve the papers yourself. Texas requires a third party — the sheriff, a constable, a private process server, or any person authorized by court order who is not a party to the suit.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    // Defendant type
    if (answers.defendant_type) {
      const labels: Record<string, string> = {
        individual: 'an individual',
        business: 'a business / company',
        out_of_state: 'an out-of-state party',
      }
      items.push({
        status: 'done',
        text: `Suing ${labels[answers.defendant_type]}.`,
      })

      if (answers.defendant_type === 'business') {
        items.push({
          status: 'needed',
          text: 'Look up the registered agent at sos.state.tx.us.',
        })
      }

      if (answers.defendant_type === 'out_of_state') {
        items.push({
          status: 'needed',
          text: 'Arrange out-of-state service — consider serving via the Texas Secretary of State (Tex. Civ. Prac. & Rem. Code §17.044).',
        })
      }
    } else {
      items.push({
        status: 'needed',
        text: 'Identify who you are suing.',
      })
    }

    // Service method
    if (answers.service_method && answers.service_method !== 'not_sure') {
      const methodLabels: Record<string, string> = {
        process_server: 'process server',
        sheriff: 'sheriff / constable',
        certified_mail: 'certified mail',
      }
      items.push({
        status: 'done',
        text: `Service method chosen: ${methodLabels[answers.service_method]}.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Choose a service method: process server, sheriff/constable, or certified mail.',
      })
    }

    // Certificate of service
    items.push({
      status: 'needed',
      text: 'After service is completed, ensure the certificate (return) of service is filed with the court.',
    })

    // Self-service warning
    items.push({
      status: 'info',
      text: 'You cannot serve the papers yourself. Texas requires a third party.',
    })

    return items
  },
}
