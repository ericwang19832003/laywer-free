import type { GuidedStepConfig } from '../types'

export const contractFileWithCourtConfig: GuidedStepConfig = {
  title: 'File Your Contract Lawsuit',
  reassurance:
    'Filing your contract petition with the court officially starts your lawsuit. We\'ll walk you through the process step by step.',

  questions: [
    {
      id: 'first_time_filing',
      type: 'yes_no',
      prompt: 'Is this your first time filing with a court?',
    },
    {
      id: 'first_time_info',
      type: 'info',
      prompt:
        'You don\'t need a lawyer to file a contract lawsuit. The court clerk\'s office can help with procedural questions, though they cannot give legal advice.',
      showIf: (answers) => answers.first_time_filing === 'yes',
    },
    {
      id: 'filing_method',
      type: 'single_choice',
      prompt: 'How will you file your petition?',
      options: [
        { value: 'efiling', label: 'E-filing (online)' },
        { value: 'in_person', label: 'In person at the courthouse' },
        { value: 'not_sure', label: 'Not sure yet' },
      ],
    },
    {
      id: 'efiling_info',
      type: 'info',
      prompt:
        'Most Texas courts require e-filing through eFileTexas.gov. Create an account, select your court, upload your petition and civil case information sheet, and pay the filing fee online. You\'ll receive a confirmation number when accepted.',
      showIf: (answers) => answers.filing_method === 'efiling' || answers.filing_method === 'not_sure',
    },
    {
      id: 'in_person_info',
      type: 'info',
      prompt:
        'Some courts, especially Justice of the Peace courts, still accept in-person filings. Bring your original petition plus copies, your civil case information sheet, and be prepared to pay the filing fee by cash, check, or money order.',
      showIf: (answers) => answers.filing_method === 'in_person',
    },
    {
      id: 'fee_paid',
      type: 'single_choice',
      prompt: 'Have you paid the filing fee?',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'need_waiver', label: 'I need a fee waiver' },
      ],
    },
    {
      id: 'fee_info',
      type: 'info',
      prompt:
        'Filing fees vary by court type. Justice of the Peace: ~$50-75. County Court: ~$200-300. District Court: ~$300-400. You can apply for a fee waiver (Statement of Inability to Afford Payment of Court Costs) if you cannot afford the fee.',
      showIf: (answers) => answers.fee_paid === 'no' || answers.fee_paid === 'need_waiver',
    },
    {
      id: 'confirmation_received',
      type: 'yes_no',
      prompt: 'Have you received a filing confirmation or cause number?',
    },
    {
      id: 'confirmation_info',
      type: 'info',
      prompt:
        'After filing, you will receive a cause number (case number). Save this number \u2014 you will need it for all future filings and correspondence. If e-filing, the confirmation usually arrives within 1-2 business days.',
      showIf: (answers) => answers.confirmation_received === 'no',
    },
    {
      id: 'next_steps_info',
      type: 'info',
      prompt:
        'After filing, your next step is to serve the defendant. You must serve them within the time required by your court. The defendant then has until the first Monday after 20 days to file an answer.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.first_time_filing === 'yes') {
      items.push({ status: 'info', text: 'First-time filer: the court clerk can help with procedural questions.' })
    }

    if (answers.filing_method === 'efiling') {
      items.push({ status: 'done', text: 'Filing method: e-filing via eFileTexas.gov.' })
    } else if (answers.filing_method === 'in_person') {
      items.push({ status: 'done', text: 'Filing method: in person at the courthouse.' })
    } else {
      items.push({ status: 'needed', text: 'Choose a filing method (most Texas courts require e-filing).' })
    }

    if (answers.fee_paid === 'yes') {
      items.push({ status: 'done', text: 'Filing fee paid.' })
    } else if (answers.fee_paid === 'need_waiver') {
      items.push({ status: 'needed', text: 'Submit a Statement of Inability to Afford Payment of Court Costs for a fee waiver.' })
    } else {
      items.push({ status: 'needed', text: 'Pay the filing fee.' })
    }

    if (answers.confirmation_received === 'yes') {
      items.push({ status: 'done', text: 'Filing confirmation and cause number received.' })
    } else {
      items.push({ status: 'needed', text: 'Obtain your cause number after the filing is accepted.' })
    }

    items.push({ status: 'info', text: 'After filing, serve the defendant and then wait for their answer.' })

    return items
  },
}
