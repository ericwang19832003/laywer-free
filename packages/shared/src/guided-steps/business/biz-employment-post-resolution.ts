import type { GuidedStepConfig } from '../types'

export const bizEmploymentPostResolutionConfig: GuidedStepConfig = {
  title: 'Post-Resolution Steps',
  reassurance:
    'Your case has reached a resolution. These final steps help you secure your outcome and move forward.',

  questions: [
    {
      id: 'resolution_type',
      type: 'single_choice',
      prompt: 'How was the case resolved?',
      options: [
        { value: 'judgment', label: 'Court judgment' },
        { value: 'settlement', label: 'Settlement agreement' },
        { value: 'dismissal', label: 'Case dismissed' },
      ],
    },
    {
      id: 'need_enforcement',
      type: 'yes_no',
      prompt:
        'Do you need to enforce the judgment or settlement terms?',
    },
    {
      id: 'need_reference_letter',
      type: 'yes_no',
      prompt:
        'Do you need to negotiate reference letter terms with the employer?',
    },
    {
      id: 'need_unemployment',
      type: 'yes_no',
      prompt: 'Do you need to file for unemployment benefits?',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.resolution_type) {
      const labels: Record<string, string> = {
        judgment: 'Court judgment',
        settlement: 'Settlement agreement',
        dismissal: 'Case dismissed',
      }
      items.push({
        status: 'done',
        text: `Resolution: ${labels[answers.resolution_type]}.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Identify the resolution outcome.',
      })
    }

    if (answers.need_enforcement === 'yes') {
      items.push({
        status: 'needed',
        text: 'Enforce judgment or settlement terms. If the employer does not comply, you may need to file a motion to enforce.',
      })
    } else if (answers.need_enforcement === 'no') {
      items.push({
        status: 'done',
        text: 'No enforcement action needed.',
      })
    }

    if (answers.need_reference_letter === 'yes') {
      items.push({
        status: 'needed',
        text: 'Negotiate reference letter terms with the employer as part of your resolution.',
      })
    } else if (answers.need_reference_letter === 'no') {
      items.push({
        status: 'done',
        text: 'No reference letter negotiation needed.',
      })
    }

    if (answers.need_unemployment === 'yes') {
      items.push({
        status: 'needed',
        text: 'File for unemployment benefits through the Texas Workforce Commission at twc.texas.gov.',
      })
    } else if (answers.need_unemployment === 'no') {
      items.push({
        status: 'done',
        text: 'No unemployment filing needed.',
      })
    }

    items.push({
      status: 'info',
      text: 'Keep copies of all resolution documents (judgment, settlement agreement, or dismissal order) for your records.',
    })

    return items
  },
}
