import type { GuidedStepConfig } from '../types'

export const bizPartnershipDiscoveryConfig: GuidedStepConfig = {
  title: 'Prepare Your Discovery',
  reassurance:
    'Discovery is how both sides gather evidence. In partnership disputes, financial records are often key.',

  questions: [
    {
      id: 'need_financial_records',
      type: 'yes_no',
      prompt:
        'Do you need to request the business\u2019s financial records?',
    },
    {
      id: 'need_depositions',
      type: 'yes_no',
      prompt:
        'Do you need to depose the other partner(s) or key employees?',
    },
    {
      id: 'need_interrogatories',
      type: 'yes_no',
      prompt:
        'Do you need to send written questions (interrogatories) to the other side?',
    },
    {
      id: 'need_document_requests',
      type: 'yes_no',
      prompt:
        'Do you need to request specific documents (e.g., bank statements, contracts, emails)?',
    },
    {
      id: 'discovery_tip',
      type: 'info',
      prompt:
        'Texas discovery rules allow 25 interrogatories and requests for production. Plan your questions carefully.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.need_financial_records === 'yes') {
      items.push({
        status: 'needed',
        text: 'Request the business\u2019s financial records.',
      })
    } else if (answers.need_financial_records === 'no') {
      items.push({
        status: 'done',
        text: 'Financial records not needed or already obtained.',
      })
    }

    if (answers.need_depositions === 'yes') {
      items.push({
        status: 'needed',
        text: 'Schedule depositions for partner(s) or key employees.',
      })
    } else if (answers.need_depositions === 'no') {
      items.push({
        status: 'done',
        text: 'No depositions needed.',
      })
    }

    if (answers.need_interrogatories === 'yes') {
      items.push({
        status: 'needed',
        text: 'Draft and send interrogatories to the other side.',
      })
    } else if (answers.need_interrogatories === 'no') {
      items.push({
        status: 'done',
        text: 'No interrogatories needed.',
      })
    }

    if (answers.need_document_requests === 'yes') {
      items.push({
        status: 'needed',
        text: 'Draft and send requests for production of documents.',
      })
    } else if (answers.need_document_requests === 'no') {
      items.push({
        status: 'done',
        text: 'No document requests needed.',
      })
    }

    items.push({
      status: 'info',
      text: 'Texas allows 25 interrogatories and requests for production. Plan your questions carefully.',
    })

    return items
  },
}
