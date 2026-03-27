import type { GuidedStepConfig } from '../types'

export const contractDiscoveryConfig: GuidedStepConfig = {
  title: 'Discovery: Gather Evidence',
  reassurance:
    'Discovery is how both sides exchange evidence before trial. In a contract case, documents like emails, invoices, and the contract itself are critical.',

  questions: [
    {
      id: 'discovery_overview',
      type: 'info',
      prompt:
        'In a contract dispute, discovery typically includes: requests for production (documents), interrogatories (written questions), requests for admission (confirm/deny facts), and depositions (sworn testimony). Focus on getting documents that prove the contract, the breach, and your damages.',
    },
    {
      id: 'sent_rfps',
      type: 'single_choice',
      prompt: 'Have you sent requests for production (document requests) to the defendant?',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'not_familiar', label: 'I\'m not familiar with these' },
      ],
    },
    {
      id: 'rfps_info',
      type: 'info',
      prompt:
        'For contract cases, request: the signed contract, all amendments, emails and correspondence between the parties, invoices and payment records, internal communications about the contract, and any documents showing why they claim they did not breach.',
      showIf: (answers) => answers.sent_rfps === 'not_familiar' || answers.sent_rfps === 'no',
    },
    {
      id: 'sent_interrogatories',
      type: 'single_choice',
      prompt: 'Have you sent interrogatories (written questions) to the defendant?',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'not_familiar', label: 'I\'m not familiar with these' },
      ],
    },
    {
      id: 'interrogatories_info',
      type: 'info',
      prompt:
        'Interrogatories are written questions the defendant must answer under oath. For contract cases, ask about: their understanding of the contract terms, why they stopped performing, what they claim you owe them, and who was involved in the decision. Texas limits you to 25 interrogatories (including subparts).',
      showIf: (answers) => answers.sent_interrogatories === 'not_familiar',
    },
    {
      id: 'sent_rfas',
      type: 'single_choice',
      prompt: 'Have you sent requests for admission?',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'not_familiar', label: 'I\'m not familiar with these' },
      ],
    },
    {
      id: 'rfas_info',
      type: 'info',
      prompt:
        'Requests for admission ask the defendant to admit or deny specific facts. In a contract case, these are very powerful: "Admit that you signed the contract dated [date]." "Admit that you received payment of $X on [date]." If they don\'t respond within 30 days, the facts are deemed admitted.',
      showIf: (answers) => answers.sent_rfas === 'not_familiar' || answers.sent_rfas === 'no',
    },
    {
      id: 'planning_depositions',
      type: 'single_choice',
      prompt: 'Are you planning to take any depositions?',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'not_sure', label: 'Not sure yet' },
      ],
    },
    {
      id: 'depositions_info',
      type: 'info',
      prompt:
        'Depositions are live, sworn testimony recorded by a court reporter. In contract cases, you might depose: the person who signed the contract, the person responsible for performance, and anyone who made the decision to breach. Depositions can be expensive but are very effective for locking in testimony.',
      showIf: (answers) => answers.planning_depositions !== 'yes',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.sent_rfps === 'yes') {
      items.push({ status: 'done', text: 'Document requests sent to defendant.' })
    } else {
      items.push({ status: 'needed', text: 'Send requests for production (contract, emails, invoices, payment records).' })
    }

    if (answers.sent_interrogatories === 'yes') {
      items.push({ status: 'done', text: 'Interrogatories sent to defendant.' })
    } else {
      items.push({ status: 'needed', text: 'Consider sending interrogatories (limit: 25 in Texas).' })
    }

    if (answers.sent_rfas === 'yes') {
      items.push({ status: 'done', text: 'Requests for admission sent.' })
    } else {
      items.push({ status: 'needed', text: 'Consider requests for admission to narrow the disputed facts.' })
    }

    if (answers.planning_depositions === 'yes') {
      items.push({ status: 'done', text: 'Depositions are being planned.' })
    } else if (answers.planning_depositions === 'not_sure') {
      items.push({ status: 'info', text: 'Consider whether depositions would strengthen your case.' })
    }

    return items
  },
}
