import type { GuidedStepConfig } from '../types'

export const bizB2bDiscoveryConfig: GuidedStepConfig = {
  title: 'Prepare Your Discovery',
  reassurance:
    'Discovery lets you obtain key documents and information from the other side to strengthen your case.',

  questions: [
    {
      id: 'need_contracts',
      type: 'yes_no',
      prompt: 'Do you need to request all contracts and amendments from the other side?',
    },
    {
      id: 'need_financial_records',
      type: 'yes_no',
      prompt: 'Do you need to request financial records from the other side?',
    },
    {
      id: 'need_communications',
      type: 'yes_no',
      prompt: 'Do you need to request internal communications from the other side?',
    },
    {
      id: 'need_depositions',
      type: 'yes_no',
      prompt: 'Do you need to take depositions of key witnesses?',
    },
    {
      id: 'need_forensic',
      type: 'yes_no',
      prompt: 'Do you need forensic imaging for IP or trade secret cases?',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.need_contracts === 'yes') {
      items.push({ status: 'needed', text: 'Request all contracts and amendments from the other side.' })
    } else {
      items.push({ status: 'done', text: 'No contract discovery needed.' })
    }

    if (answers.need_financial_records === 'yes') {
      items.push({ status: 'needed', text: 'Request financial records from the other side.' })
    } else {
      items.push({ status: 'done', text: 'No financial records discovery needed.' })
    }

    if (answers.need_communications === 'yes') {
      items.push({ status: 'needed', text: 'Request internal communications from the other side.' })
    } else {
      items.push({ status: 'done', text: 'No communications discovery needed.' })
    }

    if (answers.need_depositions === 'yes') {
      items.push({ status: 'needed', text: 'Schedule depositions of key witnesses.' })
    } else {
      items.push({ status: 'done', text: 'No depositions needed.' })
    }

    if (answers.need_forensic === 'yes') {
      items.push({ status: 'needed', text: 'Arrange forensic imaging for IP or trade secret evidence.' })
    } else {
      items.push({ status: 'done', text: 'No forensic imaging needed.' })
    }

    return items
  },
}
