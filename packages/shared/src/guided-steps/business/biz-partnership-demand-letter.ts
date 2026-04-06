import type { GuidedStepConfig } from '../types'

export const bizPartnershipDemandLetterConfig: GuidedStepConfig = {
  title: 'Draft Your Demand Letter',
  reassurance:
    'A demand letter formally notifies your partner of the dispute and your intent to seek resolution.',

  questions: [
    {
      id: 'recipient_name',
      type: 'text',
      prompt: 'Who will the demand letter be addressed to?',
      placeholder: 'e.g. John Smith or Smith Holdings LLC',
    },
    {
      id: 'dispute_type',
      type: 'single_choice',
      prompt: 'What is the core issue?',
      options: [
        { value: 'breach_fiduciary', label: 'Breach of fiduciary duty' },
        { value: 'profit_loss', label: 'Profit or loss dispute' },
        { value: 'dissolution', label: 'Dissolution or buyout' },
        { value: 'deadlock', label: 'Management deadlock' },
      ],
    },
    {
      id: 'damages_amount',
      type: 'text',
      prompt: 'What dollar amount are you demanding?',
      placeholder: 'e.g. $50,000',
    },
    {
      id: 'deadline_days',
      type: 'single_choice',
      prompt: 'How many days will you give for a response?',
      options: [
        { value: '15', label: '15 days' },
        { value: '30', label: '30 days (standard)' },
        { value: '60', label: '60 days' },
      ],
    },
    {
      id: 'has_agreement_reference',
      type: 'yes_no',
      prompt:
        'Can you reference specific agreement sections that were violated?',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.recipient_name) {
      items.push({
        status: 'done',
        text: `Demand letter addressed to: ${answers.recipient_name}.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Identify the recipient for your demand letter.',
      })
    }

    if (answers.dispute_type) {
      const labels: Record<string, string> = {
        breach_fiduciary: 'Breach of fiduciary duty',
        profit_loss: 'Profit or loss dispute',
        dissolution: 'Dissolution or buyout',
        deadlock: 'Management deadlock',
      }
      items.push({
        status: 'done',
        text: `Core issue: ${labels[answers.dispute_type]}.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Identify the core dispute type.',
      })
    }

    if (answers.damages_amount) {
      items.push({
        status: 'done',
        text: `Amount demanded: ${answers.damages_amount}.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Determine the dollar amount you are demanding.',
      })
    }

    if (answers.deadline_days) {
      items.push({
        status: 'done',
        text: `Response deadline: ${answers.deadline_days} days.`,
      })
    } else {
      items.push({ status: 'needed', text: 'Set a response deadline.' })
    }

    if (answers.has_agreement_reference === 'yes') {
      items.push({
        status: 'done',
        text: 'Specific agreement sections identified for reference.',
      })
    } else if (answers.has_agreement_reference === 'no') {
      items.push({
        status: 'info',
        text: 'No specific agreement sections to reference. Focus on the factual basis for your claims.',
      })
    }

    items.push({
      status: 'info',
      text: 'Send your demand letter by certified mail with return receipt requested. Keep a copy for your records.',
    })

    return items
  },
}
