import type { GuidedStepConfig } from '../types'

export const reDemandLetterConfig: GuidedStepConfig = {
  title: 'Draft Your Demand Letter',
  reassurance:
    'A demand letter formally notifies the other party and gives them a chance to resolve the dispute before you file suit. Many real estate disputes settle at this stage.',

  questions: [
    {
      id: 'recipient_name',
      type: 'text',
      prompt: 'Who will the demand letter be addressed to?',
      placeholder: 'e.g. Jane Doe or ABC Realty LLC',
    },
    {
      id: 'dispute_type',
      type: 'single_choice',
      prompt: 'What is the core issue?',
      options: [
        { value: 'failed_closing', label: 'Failed closing' },
        { value: 'seller_disclosure', label: 'Seller disclosure violation' },
        { value: 'buyer_breach', label: 'Buyer breach of contract' },
        { value: 'title_defect', label: 'Title defect' },
        { value: 'earnest_money', label: 'Earnest money dispute' },
        { value: 'fraud', label: 'Fraud or misrepresentation' },
        { value: 'construction_defect', label: 'Construction defect' },
        { value: 'other', label: 'Other' },
      ],
    },
    {
      id: 'disclosure_info',
      type: 'info',
      prompt:
        'Texas sellers must provide a Seller\'s Disclosure Notice under Section 5.008 of the Texas Property Code. If the seller failed to disclose known defects, you may have a claim for deceptive trade practices as well.',
      showIf: (answers) => answers.dispute_type === 'seller_disclosure',
    },
    {
      id: 'title_info',
      type: 'info',
      prompt:
        'For title defects, reference your title policy and any title commitment documents. Your title insurance company may have an obligation to resolve the defect or compensate you.',
      showIf: (answers) => answers.dispute_type === 'title_defect',
    },
    {
      id: 'damages_amount',
      type: 'text',
      prompt: 'What is the dollar amount of damages?',
      placeholder: 'e.g. $15,000',
    },
    {
      id: 'what_you_want',
      type: 'single_choice',
      prompt: 'What are you requesting?',
      options: [
        { value: 'monetary_compensation', label: 'Monetary compensation' },
        { value: 'complete_transaction', label: 'Complete the transaction' },
        { value: 'return_earnest_money', label: 'Return of earnest money' },
        { value: 'repair_defects', label: 'Repair defects' },
        { value: 'clear_title', label: 'Clear the title' },
        { value: 'multiple', label: 'Multiple remedies' },
      ],
    },
    {
      id: 'deadline_days',
      type: 'single_choice',
      prompt: 'How many days will you give the other party to respond?',
      options: [
        { value: '14', label: '14 days' },
        { value: '30', label: '30 days' },
        { value: '60', label: '60 days' },
      ],
    },
    {
      id: 'prior_communication',
      type: 'yes_no',
      prompt: 'Have you already tried to resolve this informally?',
    },
    {
      id: 'prior_communication_info',
      type: 'info',
      prompt:
        'Documenting prior attempts to resolve the dispute strengthens your demand letter and demonstrates good faith. Reference specific dates, conversations, and any promises made.',
      showIf: (answers) => answers.prior_communication === 'yes',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.recipient_name) {
      items.push({ status: 'done', text: `Demand letter addressed to: ${answers.recipient_name}.` })
    } else {
      items.push({ status: 'needed', text: 'Identify the recipient for your demand letter.' })
    }

    if (answers.dispute_type) {
      const labels: Record<string, string> = {
        failed_closing: 'Failed closing',
        seller_disclosure: 'Seller disclosure violation',
        buyer_breach: 'Buyer breach of contract',
        title_defect: 'Title defect',
        earnest_money: 'Earnest money dispute',
        fraud: 'Fraud or misrepresentation',
        construction_defect: 'Construction defect',
        other: 'Other dispute',
      }
      items.push({ status: 'done', text: `Dispute type: ${labels[answers.dispute_type]}.` })
    } else {
      items.push({ status: 'needed', text: 'Identify the core dispute type.' })
    }

    if (answers.damages_amount) {
      items.push({ status: 'done', text: `Damages claimed: ${answers.damages_amount}.` })
    } else {
      items.push({ status: 'needed', text: 'Calculate your damages amount.' })
    }

    if (answers.what_you_want) {
      const labels: Record<string, string> = {
        monetary_compensation: 'Monetary compensation',
        complete_transaction: 'Complete the transaction',
        return_earnest_money: 'Return of earnest money',
        repair_defects: 'Repair defects',
        clear_title: 'Clear the title',
        multiple: 'Multiple remedies',
      }
      items.push({ status: 'done', text: `Requested relief: ${labels[answers.what_you_want]}.` })
    } else {
      items.push({ status: 'needed', text: 'Determine what you are requesting from the other party.' })
    }

    if (answers.deadline_days) {
      items.push({ status: 'done', text: `Response deadline: ${answers.deadline_days} days.` })
    } else {
      items.push({ status: 'needed', text: 'Set a response deadline.' })
    }

    if (answers.prior_communication === 'yes') {
      items.push({ status: 'done', text: 'Prior informal resolution attempts documented.' })
    } else if (answers.prior_communication === 'no') {
      items.push({ status: 'info', text: 'No prior informal attempts. The demand letter will serve as your first formal contact.' })
    }

    items.push({
      status: 'info',
      text: 'Send your demand letter by certified mail with return receipt requested. Keep a copy for your records.',
    })

    return items
  },
}
