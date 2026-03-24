import type { GuidedStepConfig } from '../types'

export const bizEmploymentDemandLetterConfig: GuidedStepConfig = {
  title: 'Draft Your Demand Letter',
  reassurance:
    'A demand letter formally notifies your employer of the dispute and your intent to take legal action. Many employment disputes resolve at this stage.',

  questions: [
    {
      id: 'recipient_name',
      type: 'text',
      prompt: 'Who will the demand letter be addressed to?',
      placeholder: 'e.g. Jane Smith, HR Director or Acme Corp',
    },
    {
      id: 'dispute_type',
      type: 'single_choice',
      prompt: 'What type of employment dispute is this?',
      options: [
        { value: 'wrongful_termination', label: 'Wrongful termination' },
        { value: 'wage_overtime', label: 'Wage or overtime dispute' },
        { value: 'non_compete', label: 'Non-compete agreement' },
        { value: 'discrimination', label: 'Discrimination' },
      ],
    },
    {
      id: 'damages_amount',
      type: 'text',
      prompt: 'What dollar amount are you demanding?',
      placeholder: 'e.g. $25,000',
    },
    {
      id: 'include_reinstatement',
      type: 'yes_no',
      prompt: 'Are you seeking reinstatement to your position?',
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
        wrongful_termination: 'Wrongful termination',
        wage_overtime: 'Wage or overtime dispute',
        non_compete: 'Non-compete agreement',
        discrimination: 'Discrimination',
      }
      items.push({
        status: 'done',
        text: `Dispute type: ${labels[answers.dispute_type]}.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Identify the type of employment dispute.',
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

    if (answers.include_reinstatement === 'yes') {
      items.push({
        status: 'done',
        text: 'Seeking reinstatement to position.',
      })
    } else if (answers.include_reinstatement === 'no') {
      items.push({
        status: 'info',
        text: 'Not seeking reinstatement. Demand will focus on monetary damages.',
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

    items.push({
      status: 'info',
      text: 'Send your demand letter by certified mail with return receipt requested. Keep a copy for your records.',
    })

    return items
  },
}
