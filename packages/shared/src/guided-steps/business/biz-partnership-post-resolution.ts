import type { GuidedStepConfig } from '../types'

export const bizPartnershipPostResolutionConfig: GuidedStepConfig = {
  title: 'Post-Resolution Steps',
  reassurance:
    'Your case is resolved \u2014 but there are important steps to protect the outcome.',

  questions: [
    {
      id: 'resolution_type',
      type: 'single_choice',
      prompt: 'How was your case resolved?',
      options: [
        { value: 'judgment', label: 'Court judgment' },
        { value: 'settlement', label: 'Settlement agreement' },
        { value: 'dismissal', label: 'Voluntary dismissal' },
      ],
    },
    {
      id: 'need_enforcement',
      type: 'yes_no',
      prompt:
        'Does the other side need to pay or take action as a result?',
      showIf: (answers) =>
        answers.resolution_type === 'judgment' ||
        answers.resolution_type === 'settlement',
    },
    {
      id: 'enforcement_info',
      type: 'info',
      prompt:
        'If the other side doesn\u2019t comply voluntarily, you may need to file a motion to enforce the judgment or settlement.',
      showIf: (answers) => answers.need_enforcement === 'yes',
    },
    {
      id: 'need_dissolution',
      type: 'yes_no',
      prompt:
        'Does the business need to be dissolved as part of the resolution?',
    },
    {
      id: 'dissolution_info',
      type: 'info',
      prompt:
        'File a certificate of termination with the Texas Secretary of State. Settle all debts and distribute remaining assets per your agreement.',
      showIf: (answers) => answers.need_dissolution === 'yes',
    },
    {
      id: 'need_business_updates',
      type: 'yes_no',
      prompt:
        'Do any business registrations or filings need to be updated?',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.resolution_type) {
      const labels: Record<string, string> = {
        judgment: 'Court judgment',
        settlement: 'Settlement agreement',
        dismissal: 'Voluntary dismissal',
      }
      items.push({
        status: 'done',
        text: `Case resolved by: ${labels[answers.resolution_type]}.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Determine how the case was resolved.',
      })
    }

    if (answers.need_enforcement === 'yes') {
      items.push({
        status: 'needed',
        text: 'Enforce the judgment or settlement if the other side does not comply.',
      })
    } else if (answers.need_enforcement === 'no') {
      items.push({
        status: 'done',
        text: 'No enforcement action needed.',
      })
    }

    if (answers.need_dissolution === 'yes') {
      items.push({
        status: 'needed',
        text: 'File a certificate of termination and distribute remaining assets.',
      })
    } else if (answers.need_dissolution === 'no') {
      items.push({
        status: 'done',
        text: 'No business dissolution needed.',
      })
    }

    if (answers.need_business_updates === 'yes') {
      items.push({
        status: 'needed',
        text: 'Update business registrations and filings.',
      })
    } else if (answers.need_business_updates === 'no') {
      items.push({
        status: 'done',
        text: 'No business registration updates needed.',
      })
    }

    return items
  },
}
