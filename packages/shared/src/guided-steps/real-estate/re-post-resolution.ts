import type { GuidedStepConfig } from '../types'

export const rePostResolutionConfig: GuidedStepConfig = {
  title: 'Post-Resolution Steps',
  reassurance:
    'After your case resolves, there may be important follow-up steps to enforce the judgment or finalize property matters.',

  questions: [
    {
      id: 'resolution_type',
      type: 'single_choice',
      prompt: 'How was your case resolved?',
      options: [
        { value: 'judgment_for_you', label: 'Judgment in your favor' },
        { value: 'settlement', label: 'Settlement agreement' },
        { value: 'judgment_against', label: 'Judgment against you' },
        { value: 'dismissed', label: 'Case was dismissed' },
        { value: 'pending', label: 'Still pending' },
      ],
    },
    {
      id: 'judgment_info',
      type: 'info',
      prompt:
        'The defendant has 30 days to pay the judgment or file an appeal. If they do not pay, you can pursue collection through wage garnishment, bank account levy, or property lien. Keep a copy of the signed judgment for your records.',
      showIf: (answers) => answers.resolution_type === 'judgment_for_you',
    },
    {
      id: 'settlement_info',
      type: 'info',
      prompt:
        'Your settlement agreement must be in writing and signed by both parties. If the settlement affects property title or ownership, record the agreement with the county clerk\'s office to provide public notice and bind future owners.',
      showIf: (answers) => answers.resolution_type === 'settlement',
    },
    {
      id: 'title_update_needed',
      type: 'yes_no',
      prompt: 'Does the outcome require updating title or property records?',
    },
    {
      id: 'title_update_info',
      type: 'info',
      prompt:
        'Record the judgment or settlement with the county clerk\'s office. If boundaries changed or title was quieted, you may also need to file an amended deed or plat. This protects your rights if the property is sold or refinanced in the future.',
      showIf: (answers) => answers.title_update_needed === 'yes',
    },
    {
      id: 'payment_received',
      type: 'yes_no',
      prompt: 'Have you received any payment owed to you?',
    },
    {
      id: 'collection_info',
      type: 'info',
      prompt:
        'If the defendant has not paid, you can file an abstract of judgment with the county clerk to create a lien on their property. Other enforcement options include wage garnishment, bank account levy, or a writ of execution. Start by sending a post-judgment demand letter with a final deadline.',
      showIf: (answers) => answers.payment_received === 'no' && answers.resolution_type === 'judgment_for_you',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []
    const resolution = answers.resolution_type

    if (resolution === 'judgment_for_you') {
      items.push({ status: 'done', text: 'Judgment entered in your favor.' })
    } else if (resolution === 'settlement') {
      items.push({ status: 'done', text: 'Case resolved by settlement agreement.' })
    } else if (resolution === 'judgment_against') {
      items.push({ status: 'info', text: 'Judgment entered against you. Consider whether to appeal within 30 days.' })
    } else if (resolution === 'dismissed') {
      items.push({ status: 'info', text: 'Case was dismissed. Check whether it was with or without prejudice.' })
    } else if (resolution === 'pending') {
      items.push({ status: 'info', text: 'Case is still pending. Return to this step once a resolution is reached.' })
    }

    if (answers.title_update_needed === 'yes') {
      items.push({ status: 'needed', text: 'Record the judgment or settlement with the county clerk and update property records.' })
    } else if (answers.title_update_needed === 'no') {
      items.push({ status: 'done', text: 'No property record updates needed.' })
    }

    if (answers.payment_received === 'yes') {
      items.push({ status: 'done', text: 'Payment received.' })
    } else if (answers.payment_received === 'no') {
      if (resolution === 'judgment_for_you') {
        items.push({ status: 'needed', text: 'No payment received. File an abstract of judgment to create a lien, or pursue garnishment.' })
      } else if (resolution === 'settlement') {
        items.push({ status: 'needed', text: 'No payment received. Enforce the settlement agreement terms.' })
      }
    }

    return items
  },
}
