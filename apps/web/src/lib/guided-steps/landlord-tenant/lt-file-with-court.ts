import type { GuidedStepConfig } from '../types'

export const ltFileWithCourtConfig: GuidedStepConfig = {
  title: 'File Your Landlord-Tenant Case',
  reassurance:
    'Filing your case with the court officially starts the legal process. We\'ll guide you through each step.',

  questions: [
    {
      id: 'court_type',
      type: 'single_choice',
      prompt: 'Which court are you filing in?',
      helpText:
        'Justice of the Peace (JP) courts handle most landlord-tenant cases, especially evictions and claims up to $20,000.',
      options: [
        { value: 'jp', label: 'Justice of the Peace (JP) Court' },
        { value: 'county', label: 'County Court' },
        { value: 'district', label: 'District Court' },
        { value: 'not_sure', label: 'Not sure' },
      ],
    },
    {
      id: 'court_selection_info',
      type: 'info',
      prompt:
        'Most landlord-tenant cases, including evictions, are filed in JP Court. If your claim exceeds $20,000, you will need county or district court. Check your petition for the court designation.',
      showIf: (answers) => answers.court_type === 'not_sure',
    },
    {
      id: 'filing_method',
      type: 'single_choice',
      prompt: 'How will you file?',
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
        'Most Texas courts require e-filing through eFileTexas.gov. Create an account, select your court, upload your petition, and pay the filing fee online. JP courts may still accept in-person filings.',
      showIf: (answers) => answers.filing_method === 'efiling' || answers.filing_method === 'not_sure',
    },
    {
      id: 'in_person_info',
      type: 'info',
      prompt:
        'Bring your original petition plus copies, your lease agreement, and be prepared to pay the filing fee by cash, check, or money order. The clerk will stamp your copies and assign a cause number.',
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
        'Filing fees vary: JP Court ~$50-75 for eviction, ~$75-100 for repair cases. County Court ~$200-300. You can apply for a fee waiver (Statement of Inability to Afford Payment of Court Costs) if you cannot afford the fee.',
      showIf: (answers) => answers.fee_paid === 'no' || answers.fee_paid === 'need_waiver',
    },
    {
      id: 'lease_attached',
      type: 'yes_no',
      prompt: 'Did you attach a copy of the lease to your filing?',
      helpText:
        'The lease is critical evidence. Attach it to your petition if the court rules allow it, or bring copies to present at the hearing.',
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
        'After filing, you will receive a cause number. Save this — you need it for all future filings. For e-filing, confirmation usually arrives within 1-2 business days. Your next step is to serve the other party.',
      showIf: (answers) => answers.confirmation_received === 'no',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.court_type && answers.court_type !== 'not_sure') {
      const labels: Record<string, string> = { jp: 'JP Court', county: 'County Court', district: 'District Court' }
      items.push({ status: 'done', text: `Filing in ${labels[answers.court_type]}.` })
    } else {
      items.push({ status: 'needed', text: 'Determine which court to file in.' })
    }

    if (answers.filing_method === 'efiling') {
      items.push({ status: 'done', text: 'Filing method: e-filing via eFileTexas.gov.' })
    } else if (answers.filing_method === 'in_person') {
      items.push({ status: 'done', text: 'Filing method: in person at the courthouse.' })
    } else {
      items.push({ status: 'needed', text: 'Choose a filing method.' })
    }

    if (answers.fee_paid === 'yes') {
      items.push({ status: 'done', text: 'Filing fee paid.' })
    } else if (answers.fee_paid === 'need_waiver') {
      items.push({ status: 'needed', text: 'Submit a fee waiver application.' })
    } else {
      items.push({ status: 'needed', text: 'Pay the filing fee.' })
    }

    if (answers.lease_attached === 'yes') {
      items.push({ status: 'done', text: 'Lease attached to filing.' })
    } else {
      items.push({ status: 'needed', text: 'Attach the lease agreement to your filing or bring copies to the hearing.' })
    }

    if (answers.confirmation_received === 'yes') {
      items.push({ status: 'done', text: 'Filing confirmed — cause number received.' })
    } else {
      items.push({ status: 'needed', text: 'Obtain your cause number after the filing is accepted.' })
    }

    items.push({ status: 'info', text: 'After filing, serve the other party as soon as possible.' })

    return items
  },
}
