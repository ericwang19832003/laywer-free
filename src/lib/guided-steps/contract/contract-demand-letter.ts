import type { GuidedStepConfig } from '../types'

export const contractDemandLetterConfig: GuidedStepConfig = {
  title: 'Send a Demand Letter',
  reassurance:
    'A demand letter formally notifies the other party of their breach and gives them one last chance to resolve the dispute before you file a lawsuit.',

  questions: [
    {
      id: 'know_recipient_address',
      type: 'yes_no',
      prompt: 'Do you know the other party\'s mailing address for the demand letter?',
    },
    {
      id: 'address_help',
      type: 'info',
      prompt:
        'If the other party is a business, check the Secretary of State website for their registered agent address. For individuals, you can try public records, social media, or their last known address from the contract.',
      showIf: (answers) => answers.know_recipient_address === 'no',
    },
    {
      id: 'breach_identified',
      type: 'yes_no',
      prompt: 'Can you clearly identify the specific contract terms that were breached?',
    },
    {
      id: 'breach_help',
      type: 'info',
      prompt:
        'Review your contract and list each obligation the other party failed to perform. Reference specific sections, dates, and deliverables. The more specific you are, the stronger your demand.',
      showIf: (answers) => answers.breach_identified === 'no',
    },
    {
      id: 'damages_calculated',
      type: 'yes_no',
      prompt: 'Have you calculated the total amount you are owed?',
    },
    {
      id: 'damages_help',
      type: 'info',
      prompt:
        'Include all damages: the amount paid under the contract, the cost to hire someone else to finish the work, lost profits, and any other out-of-pocket expenses caused by the breach.',
      showIf: (answers) => answers.damages_calculated === 'no',
    },
    {
      id: 'deadline_set',
      type: 'single_choice',
      prompt: 'How much time will you give the other party to respond?',
      options: [
        { value: '10_days', label: '10 days' },
        { value: '14_days', label: '14 days' },
        { value: '30_days', label: '30 days' },
        { value: 'not_sure', label: 'Not sure yet' },
      ],
    },
    {
      id: 'deadline_info',
      type: 'info',
      prompt:
        '10-14 days is typical for demand letters. 30 days is more generous and may be appropriate if the other party is a large company. The deadline should be reasonable but firm.',
      showIf: (answers) => answers.deadline_set === 'not_sure',
    },
    {
      id: 'sending_method',
      type: 'single_choice',
      prompt: 'How will you send the demand letter?',
      options: [
        { value: 'certified_mail', label: 'Certified mail with return receipt' },
        { value: 'email_and_mail', label: 'Both email and certified mail' },
        { value: 'email_only', label: 'Email only' },
        { value: 'not_sure', label: 'Not sure yet' },
      ],
    },
    {
      id: 'sending_info',
      type: 'info',
      prompt:
        'Certified mail with return receipt is the gold standard because it creates proof the other party received your letter. Sending by both email and certified mail is even better.',
      showIf: (answers) => answers.sending_method === 'not_sure' || answers.sending_method === 'email_only',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.know_recipient_address === 'yes') {
      items.push({ status: 'done', text: 'Recipient address known.' })
    } else {
      items.push({ status: 'needed', text: 'Locate the other party\'s mailing address.' })
    }

    if (answers.breach_identified === 'yes') {
      items.push({ status: 'done', text: 'Specific contract breaches identified.' })
    } else {
      items.push({ status: 'needed', text: 'Review the contract and identify the specific terms that were breached.' })
    }

    if (answers.damages_calculated === 'yes') {
      items.push({ status: 'done', text: 'Damages amount calculated.' })
    } else {
      items.push({ status: 'needed', text: 'Calculate the total damages owed (amounts paid, cost to cure, lost profits).' })
    }

    if (answers.deadline_set && answers.deadline_set !== 'not_sure') {
      items.push({ status: 'done', text: `Response deadline: ${answers.deadline_set.replace(/_/g, ' ')}.` })
    } else {
      items.push({ status: 'needed', text: 'Set a response deadline (10-30 days is typical).' })
    }

    if (answers.sending_method && answers.sending_method !== 'not_sure') {
      const labels: Record<string, string> = {
        certified_mail: 'certified mail',
        email_and_mail: 'email and certified mail',
        email_only: 'email only',
      }
      items.push({ status: 'done', text: `Sending method: ${labels[answers.sending_method]}.` })
    } else {
      items.push({ status: 'needed', text: 'Choose a sending method. Certified mail with return receipt is recommended.' })
    }

    return items
  },
}
