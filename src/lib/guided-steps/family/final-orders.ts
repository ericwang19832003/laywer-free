import type { GuidedStepConfig } from '../types'

export const finalOrdersConfig: GuidedStepConfig = {
  title: 'Final Orders',
  reassurance:
    'The final hearing is the last step. Being prepared helps ensure a fair outcome.',

  questions: [
    {
      id: 'hearing_scheduled',
      type: 'yes_no',
      prompt: 'Is your final hearing scheduled?',
    },
    {
      id: 'proposed_order_prepared',
      type: 'yes_no',
      prompt: 'Have you prepared your proposed final order?',
    },
    {
      id: 'order_info',
      type: 'info',
      prompt:
        'A proposed final order should include: property division, custody schedule, child support amounts, and any other terms. Bring it to the hearing for the judge to review.',
      showIf: (answers) => answers.proposed_order_prepared === 'no',
    },
    {
      id: 'financial_docs_ready',
      type: 'yes_no',
      prompt: 'Do you have all required financial documents?',
    },
    {
      id: 'docs_info',
      type: 'info',
      prompt:
        'Bring: tax returns, pay stubs, bank statements, property valuations, and debt statements.',
      showIf: (answers) => answers.financial_docs_ready === 'no',
    },
    {
      id: 'hearing_procedure',
      type: 'info',
      prompt:
        'At the final hearing, both parties present their case. The judge reviews evidence and issues final orders. These orders are legally binding.',
    },
    {
      id: 'after_order_info',
      type: 'info',
      prompt:
        'After the order: follow it exactly. If circumstances change, you can file a modification \u2014 but only for child-related matters, not property division.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.hearing_scheduled === 'yes') {
      items.push({
        status: 'done',
        text: 'Your final hearing is scheduled.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Schedule your final hearing with the court.',
      })
    }

    if (answers.proposed_order_prepared === 'yes') {
      items.push({
        status: 'done',
        text: 'Your proposed final order is prepared.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Prepare your proposed final order: property division, custody schedule, child support amounts, and any other terms.',
      })
    }

    if (answers.financial_docs_ready === 'yes') {
      items.push({
        status: 'done',
        text: 'All required financial documents are ready.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Gather financial documents: tax returns, pay stubs, bank statements, property valuations, and debt statements.',
      })
    }

    items.push({
      status: 'info',
      text: 'After the final order, follow it exactly. Modifications are only available for child-related matters, not property division.',
    })

    return items
  },
}
