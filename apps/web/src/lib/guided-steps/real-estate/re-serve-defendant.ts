import type { GuidedStepConfig } from '../types'

export const reServeDefendantConfig: GuidedStepConfig = {
  title: 'Serve the Defendant',
  reassurance:
    'Proper service is required for the court to have jurisdiction over the defendant.',

  questions: [
    {
      id: 'know_address',
      type: 'yes_no',
      prompt: "Do you know the defendant's current address?",
    },
    {
      id: 'address_info',
      type: 'info',
      prompt:
        "Check property records, the purchase agreement, or the defendant's agent records for their address. If you cannot locate them, consider using a skip trace service or hiring a process server who offers locate services.",
      showIf: (answers) => answers.know_address === 'no',
    },
    {
      id: 'service_method',
      type: 'single_choice',
      prompt: 'How will you serve the defendant?',
      options: [
        { value: 'process_server', label: 'Private process server' },
        { value: 'constable', label: 'Constable or sheriff' },
        { value: 'certified_mail', label: 'Certified mail (if allowed by your court)' },
        { value: 'not_sure', label: 'Not sure yet' },
      ],
    },
    {
      id: 'service_info',
      type: 'info',
      prompt:
        'A private process server is typically the fastest option. A constable or sheriff is the cheapest and most widely accepted. Certified mail with return receipt requested may be allowed in some courts but is less reliable. Whichever method you choose, the server must complete and file a return of service.',
    },
    {
      id: 'served',
      type: 'yes_no',
      prompt: 'Has the defendant been served?',
    },
    {
      id: 'after_service_info',
      type: 'info',
      prompt:
        'File the return of service with the court as soon as possible. The defendant has 20 days (plus the next Monday if the 20th day falls on a weekend) to file an answer. If they do not answer, you may be able to request a default judgment.',
      showIf: (answers) => answers.served === 'yes',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.know_address === 'yes') {
      items.push({ status: 'done', text: "Defendant's address is known." })
    } else {
      items.push({
        status: 'needed',
        text: "Locate the defendant's current address before attempting service.",
      })
    }

    if (answers.service_method === 'process_server') {
      items.push({ status: 'done', text: 'Service method: private process server.' })
    } else if (answers.service_method === 'constable') {
      items.push({ status: 'done', text: 'Service method: constable or sheriff.' })
    } else if (answers.service_method === 'certified_mail') {
      items.push({ status: 'done', text: 'Service method: certified mail.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Choose a service method. Process server is fastest; constable is cheapest.',
      })
    }

    if (answers.served === 'yes') {
      items.push({ status: 'done', text: 'Defendant has been served.' })
      items.push({
        status: 'info',
        text: 'File the return of service with the court. The defendant has 20 days to file an answer.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Serve the defendant and file proof of service with the court.',
      })
    }

    return items
  },
}
