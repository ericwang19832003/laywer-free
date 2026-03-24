import type { GuidedStepConfig } from '../types'

export const bizB2bDemandLetterConfig: GuidedStepConfig = {
  title: 'Draft Your Demand Letter',
  reassurance:
    'A formal demand letter puts the other business on notice.',

  questions: [
    {
      id: 'recipient_name',
      type: 'text',
      prompt: 'What is the other business name?',
      placeholder: 'e.g., Acme Corp LLC',
    },
    {
      id: 'dispute_type',
      type: 'single_choice',
      prompt: 'What type of commercial dispute is this?',
      options: [
        { value: 'vendor_service', label: 'Vendor or service dispute' },
        { value: 'ip_trade_secret', label: 'IP or trade secret dispute' },
        { value: 'unfair_competition', label: 'Unfair competition' },
        { value: 'breach_of_contract', label: 'Breach of contract' },
      ],
    },
    {
      id: 'damages_amount',
      type: 'text',
      prompt: 'What is the total amount of damages you are claiming?',
      placeholder: 'e.g., $50,000',
    },
    {
      id: 'deadline_days',
      type: 'single_choice',
      prompt: 'How many days will you give them to respond?',
      options: [
        { value: '15', label: '15 days' },
        { value: '30', label: '30 days' },
        { value: '60', label: '60 days' },
      ],
    },
    {
      id: 'send_method',
      type: 'single_choice',
      prompt: 'How will you send the demand letter?',
      options: [
        { value: 'certified_mail', label: 'Certified mail' },
        { value: 'email', label: 'Email' },
        { value: 'both', label: 'Both certified mail and email' },
      ],
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.recipient_name) {
      items.push({ status: 'done', text: `Demand letter addressed to ${answers.recipient_name}.` })
    } else {
      items.push({ status: 'needed', text: 'Identify the recipient business name.' })
    }

    if (answers.dispute_type) {
      const labels: Record<string, string> = {
        vendor_service: 'Vendor or service dispute',
        ip_trade_secret: 'IP or trade secret dispute',
        unfair_competition: 'Unfair competition',
        breach_of_contract: 'Breach of contract',
      }
      items.push({ status: 'info', text: `Dispute type: ${labels[answers.dispute_type] ?? answers.dispute_type}.` })
    }

    if (answers.damages_amount) {
      items.push({ status: 'done', text: `Damages claimed: ${answers.damages_amount}.` })
    } else {
      items.push({ status: 'needed', text: 'Calculate the total damages amount.' })
    }

    if (answers.deadline_days) {
      items.push({ status: 'info', text: `Response deadline: ${answers.deadline_days} days.` })
    }

    if (answers.send_method) {
      const methods: Record<string, string> = {
        certified_mail: 'certified mail',
        email: 'email',
        both: 'both certified mail and email',
      }
      items.push({ status: 'done', text: `Will send via ${methods[answers.send_method] ?? answers.send_method}.` })
    } else {
      items.push({ status: 'needed', text: 'Choose a method to send the demand letter.' })
    }

    return items
  },
}
