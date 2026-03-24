import type { GuidedStepConfig } from '../types'

export const otherDemandLetterConfig: GuidedStepConfig = {
  title: 'Send a Demand Letter',
  reassurance:
    'A demand letter puts the other side on notice and often resolves disputes without going to court.',

  questions: [
    {
      id: 'know_recipient_address',
      type: 'yes_no',
      prompt: 'Do you have a mailing address for the person or organization you are sending this to?',
    },
    {
      id: 'address_info',
      type: 'info',
      prompt:
        'You will need a valid mailing address to send a demand letter. For businesses, check their website, state business filings, or the address on any contracts or invoices.',
      showIf: (answers) => answers.know_recipient_address === 'no',
    },
    {
      id: 'described_complaint',
      type: 'yes_no',
      prompt: 'Can you clearly describe what happened and why you believe the other side is responsible?',
    },
    {
      id: 'complaint_tip',
      type: 'info',
      prompt:
        'Write down the key facts: what happened, when it happened, and how it affected you. Stick to facts, not emotions. A clear timeline makes your letter stronger.',
      showIf: (answers) => answers.described_complaint === 'no',
    },
    {
      id: 'know_what_you_want',
      type: 'yes_no',
      prompt: 'Do you know exactly what you are asking for (money, action, or both)?',
    },
    {
      id: 'remedy_tip',
      type: 'info',
      prompt:
        'Be specific. Instead of "I want compensation," say "I am requesting $2,500 to cover repair costs." Clear requests are more likely to get a response.',
      showIf: (answers) => answers.know_what_you_want === 'no',
    },
    {
      id: 'set_deadline',
      type: 'single_choice',
      prompt: 'How much time will you give them to respond?',
      options: [
        { value: '14_days', label: '14 days (standard)' },
        { value: '21_days', label: '21 days' },
        { value: '30_days', label: '30 days' },
        { value: 'unsure', label: 'Not sure yet' },
      ],
    },
    {
      id: 'deadline_tip',
      type: 'info',
      prompt:
        '14 days is the most common deadline for a demand letter. It shows urgency without being unreasonable. You can always extend it later if negotiations begin.',
      showIf: (answers) => answers.set_deadline === 'unsure',
    },
    {
      id: 'sending_method',
      type: 'single_choice',
      prompt: 'How do you plan to send the letter?',
      options: [
        { value: 'certified_mail', label: 'Certified mail (recommended)' },
        { value: 'regular_mail', label: 'Regular mail' },
        { value: 'email', label: 'Email only' },
        { value: 'unsure', label: 'Not sure' },
      ],
    },
    {
      id: 'certified_mail_info',
      type: 'info',
      prompt:
        'Certified mail with return receipt is recommended because it creates proof that the other side received your letter. This can be important if you later go to court.',
      showIf: (answers) => answers.sending_method !== 'certified_mail',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.know_recipient_address === 'yes') {
      items.push({ status: 'done', text: 'Recipient address identified.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Locate a valid mailing address for the recipient.',
      })
    }

    if (answers.described_complaint === 'yes') {
      items.push({ status: 'done', text: 'Complaint clearly described.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Write down the key facts: what happened, when, and how it affected you.',
      })
    }

    if (answers.know_what_you_want === 'yes') {
      items.push({ status: 'done', text: 'Specific remedy identified.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Determine exactly what you are requesting (specific dollar amount, action, or both).',
      })
    }

    if (answers.set_deadline && answers.set_deadline !== 'unsure') {
      items.push({
        status: 'done',
        text: `Response deadline set: ${answers.set_deadline.replace('_', ' ')}.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Choose a response deadline (14 days is standard).',
      })
    }

    if (answers.sending_method === 'certified_mail') {
      items.push({ status: 'done', text: 'Sending via certified mail for proof of delivery.' })
    } else if (answers.sending_method && answers.sending_method !== 'unsure') {
      items.push({
        status: 'info',
        text: 'Consider certified mail for proof of delivery if your case may go to court.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Decide how you will send the letter. Certified mail is recommended.',
      })
    }

    return items
  },
}
