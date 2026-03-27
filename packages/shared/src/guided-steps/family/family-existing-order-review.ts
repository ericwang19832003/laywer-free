import type { GuidedStepConfig } from '../types'

export const existingOrderReviewConfig: GuidedStepConfig = {
  title: 'Review Existing Order',
  reassurance: 'Understanding your existing order is essential to identifying what can be modified and what legal standard applies.',
  questions: [
    {
      id: 'order_uploaded',
      type: 'yes_no',
      prompt: 'Have you uploaded your existing court order to the evidence vault?',
    },
    {
      id: 'upload_info',
      type: 'info',
      prompt: 'Upload your existing order to the Evidence Vault. If you don\'t have a copy, request one from the court clerk.',
      showIf: (a) => a.order_uploaded === 'no',
    },
    {
      id: 'provisions_identified',
      type: 'yes_no',
      prompt: 'Have you identified the specific provisions you want to change?',
    },
    {
      id: 'provisions_info',
      type: 'info',
      prompt: 'Review each section: custody/conservatorship, possession schedule, child support, and any other provisions. List exactly what you want changed.',
      showIf: (a) => a.provisions_identified === 'no',
    },
    {
      id: 'change_documented',
      type: 'yes_no',
      prompt: 'Have you documented the material and substantial change in circumstances?',
      helpText: 'Texas requires proof of a "material and substantial change" since the last order.',
    },
    {
      id: 'change_info',
      type: 'info',
      prompt: 'Document what changed: job loss/new job, relocation, children\'s needs changed, safety concerns, or significant time passage.',
      showIf: (a) => a.change_documented === 'no',
    },
  ],
  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.order_uploaded === 'yes') {
      items.push({ status: 'done', text: 'Existing order uploaded to evidence vault.' })
    } else {
      items.push({ status: 'needed', text: 'Upload your existing court order to the Evidence Vault.' })
    }

    if (answers.provisions_identified === 'yes') {
      items.push({ status: 'done', text: 'Provisions to modify identified.' })
    } else {
      items.push({ status: 'needed', text: 'Identify the specific provisions you want to change.' })
    }

    if (answers.change_documented === 'yes') {
      items.push({ status: 'done', text: 'Change in circumstances documented.' })
    } else {
      items.push({ status: 'needed', text: 'Document the material and substantial change in circumstances.' })
    }

    items.push({ status: 'info', text: 'Texas law requires a "material and substantial change" to modify a family court order.' })
    return items
  },
}
