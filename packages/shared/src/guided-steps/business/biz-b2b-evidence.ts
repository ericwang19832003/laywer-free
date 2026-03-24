import type { GuidedStepConfig } from '../types'

export const bizB2bEvidenceConfig: GuidedStepConfig = {
  title: 'Organize Your Commercial Evidence',
  reassurance:
    'Commercial disputes are won with documentation.',

  questions: [
    {
      id: 'has_contract',
      type: 'yes_no',
      prompt: 'Do you have a written contract with the other business?',
    },
    {
      id: 'has_invoices',
      type: 'yes_no',
      prompt: 'Do you have invoices or payment records?',
    },
    {
      id: 'has_communications',
      type: 'yes_no',
      prompt: 'Do you have emails and correspondence with the other party?',
    },
    {
      id: 'has_deliverables',
      type: 'yes_no',
      prompt: 'Do you have work product or deliverables related to the dispute?',
    },
    {
      id: 'has_witnesses',
      type: 'yes_no',
      prompt: 'Do you have witnesses who can support your case?',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.has_contract === 'yes') {
      items.push({ status: 'done', text: 'Written contract collected.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Locate the written contract or any agreement documentation.',
      })
    }

    if (answers.has_invoices === 'yes') {
      items.push({ status: 'done', text: 'Invoices and payment records collected.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Gather all invoices, receipts, and payment records.',
      })
    }

    if (answers.has_communications === 'yes') {
      items.push({ status: 'done', text: 'Emails and correspondence collected.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Save all emails, messages, and written correspondence with the other party.',
      })
    }

    if (answers.has_deliverables === 'yes') {
      items.push({ status: 'done', text: 'Work product and deliverables documented.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Gather any work product, deliverables, or proof of performance.',
      })
    }

    if (answers.has_witnesses === 'yes') {
      items.push({ status: 'done', text: 'Witnesses identified.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Identify potential witnesses who can support your claims.',
      })
    }

    return items
  },
}
