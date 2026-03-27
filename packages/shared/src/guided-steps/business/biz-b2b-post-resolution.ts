import type { GuidedStepConfig } from '../types'

export const bizB2bPostResolutionConfig: GuidedStepConfig = {
  title: 'Post-Resolution Steps',
  reassurance:
    'Wrapping up properly after resolution protects your interests and helps prevent future disputes.',

  questions: [
    {
      id: 'resolution_type',
      type: 'single_choice',
      prompt: 'How was the dispute resolved?',
      options: [
        { value: 'judgment', label: 'Court judgment' },
        { value: 'settlement', label: 'Settlement agreement' },
        { value: 'dismissal', label: 'Dismissal' },
      ],
    },
    {
      id: 'need_enforcement',
      type: 'yes_no',
      prompt: 'Do you need to enforce the judgment or settlement?',
    },
    {
      id: 'need_collection',
      type: 'yes_no',
      prompt: 'Do you need help with judgment collection?',
      showIf: (answers) => answers.resolution_type === 'judgment',
    },
    {
      id: 'continue_relationship',
      type: 'yes_no',
      prompt: 'Do you plan to continue doing business with this company?',
    },
    {
      id: 'update_contracts',
      type: 'yes_no',
      prompt: 'Do you need to update your contracts and processes to prevent future disputes?',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.resolution_type) {
      const types: Record<string, string> = {
        judgment: 'Court judgment',
        settlement: 'Settlement agreement',
        dismissal: 'Dismissal',
      }
      items.push({ status: 'done', text: `Resolved via: ${types[answers.resolution_type] ?? answers.resolution_type}.` })
    }

    if (answers.need_enforcement === 'yes') {
      items.push({ status: 'needed', text: 'Enforce the judgment or settlement terms.' })
    } else if (answers.need_enforcement === 'no') {
      items.push({ status: 'done', text: 'No enforcement action needed.' })
    }

    if (answers.need_collection === 'yes') {
      items.push({ status: 'needed', text: 'Begin judgment collection process.' })
    }

    if (answers.continue_relationship === 'yes') {
      items.push({ status: 'info', text: 'Plans to continue the business relationship — consider updated terms.' })
    }

    if (answers.update_contracts === 'yes') {
      items.push({ status: 'needed', text: 'Update contracts and internal processes to prevent future disputes.' })
    } else if (answers.update_contracts === 'no') {
      items.push({ status: 'done', text: 'No contract updates needed.' })
    }

    return items
  },
}
