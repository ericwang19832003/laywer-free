import type { GuidedStepConfig } from '../types'

export const bizB2bNegotiationConfig: GuidedStepConfig = {
  title: 'Settlement Negotiation',
  reassurance:
    'B2B disputes often resolve through negotiation, saving both sides the cost of litigation.',

  questions: [
    {
      id: 'settlement_goal',
      type: 'single_choice',
      prompt: 'What is your primary goal?',
      options: [
        { value: 'full_payment', label: 'Full payment of damages' },
        { value: 'partial_payment', label: 'Partial payment (compromise)' },
        { value: 'performance', label: 'Specific performance (make them do what was agreed)' },
        { value: 'relationship', label: 'Preserve the business relationship' },
      ],
    },
    {
      id: 'min_acceptable',
      type: 'text',
      prompt: 'What is the minimum you would accept to settle?',
      placeholder: 'e.g., $25,000',
    },
    {
      id: 'has_proposal',
      type: 'yes_no',
      prompt: 'Have you prepared a settlement proposal?',
    },
    {
      id: 'ongoing_relationship',
      type: 'yes_no',
      prompt: 'Do you want to continue doing business with this company?',
    },
    {
      id: 'relationship_tip',
      type: 'info',
      prompt:
        'When preserving the relationship matters, frame demands as corrections rather than accusations. Focus on how to move forward.',
      showIf: (answers) => answers.ongoing_relationship === 'yes',
    },
    {
      id: 'documented_negotiations',
      type: 'yes_no',
      prompt: 'Have you documented all negotiation communications in writing?',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.settlement_goal) {
      const goals: Record<string, string> = {
        full_payment: 'Full payment of damages',
        partial_payment: 'Partial payment (compromise)',
        performance: 'Specific performance',
        relationship: 'Preserve the business relationship',
      }
      items.push({ status: 'info', text: `Settlement goal: ${goals[answers.settlement_goal] ?? answers.settlement_goal}.` })
    }

    if (answers.min_acceptable) {
      items.push({ status: 'done', text: `Minimum acceptable settlement: ${answers.min_acceptable}.` })
    } else {
      items.push({ status: 'needed', text: 'Determine your minimum acceptable settlement amount.' })
    }

    if (answers.has_proposal === 'yes') {
      items.push({ status: 'done', text: 'Settlement proposal prepared.' })
    } else {
      items.push({ status: 'needed', text: 'Prepare a written settlement proposal.' })
    }

    if (answers.ongoing_relationship === 'yes') {
      items.push({ status: 'info', text: 'Wants to preserve the business relationship — use collaborative tone.' })
    }

    if (answers.documented_negotiations === 'yes') {
      items.push({ status: 'done', text: 'Negotiation communications documented in writing.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Document all negotiation communications in writing going forward.',
      })
    }

    return items
  },
}
