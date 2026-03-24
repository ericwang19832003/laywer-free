import type { GuidedStepConfig } from '../types'

export const reDiscoveryConfig: GuidedStepConfig = {
  title: 'Discovery — Exchange Evidence',
  reassurance:
    'Discovery lets you formally obtain documents and information from the other party. In real estate cases, this often includes transaction records, inspection reports, and communications.',

  questions: [
    {
      id: 'documents_needed',
      type: 'yes_no',
      prompt: 'Do you know what documents you need from the other party?',
    },
    {
      id: 'documents_info',
      type: 'info',
      prompt:
        'Common document requests in real estate cases include: the purchase agreement, closing documents, inspection reports, disclosure notices, communications with agents or brokers, repair estimates, appraisals, title documents, HOA records, and any amendments or addenda to the contract.',
      showIf: (answers) => answers.documents_needed === 'no',
    },
    {
      id: 'sent_discovery',
      type: 'yes_no',
      prompt: 'Have you sent your discovery requests to the other party?',
    },
    {
      id: 'received_discovery',
      type: 'yes_no',
      prompt: 'Has the other party sent you discovery requests?',
    },
    {
      id: 'response_info',
      type: 'info',
      prompt:
        'You typically have 30 days to respond to discovery requests. Respond honestly and completely — failure to respond can result in court sanctions or the court assuming the facts are true. Gather the requested documents and answer any interrogatories under oath.',
      showIf: (answers) => answers.received_discovery === 'yes',
    },
    {
      id: 'discovery_complete',
      type: 'yes_no',
      prompt: 'Is the discovery exchange complete?',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.documents_needed === 'yes') {
      items.push({ status: 'done', text: 'Documents needed from the other party have been identified.' })
    } else {
      items.push({ status: 'needed', text: 'Identify which documents you need (purchase agreement, inspections, disclosures, communications, etc.).' })
    }

    if (answers.sent_discovery === 'yes') {
      items.push({ status: 'done', text: 'Discovery requests sent to the other party.' })
    } else {
      items.push({ status: 'needed', text: 'Send discovery requests to the other party.' })
    }

    if (answers.received_discovery === 'yes') {
      items.push({ status: 'info', text: 'Discovery requests received from the other party. Respond within 30 days.' })
    }

    if (answers.discovery_complete === 'yes') {
      items.push({ status: 'done', text: 'Discovery exchange is complete. Ready to proceed.' })
    } else if (answers.discovery_complete === 'no') {
      items.push({ status: 'needed', text: 'Complete the discovery exchange before moving forward.' })
    }

    return items
  },
}
