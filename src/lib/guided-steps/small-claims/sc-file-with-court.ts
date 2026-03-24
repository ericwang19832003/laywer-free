import type { GuidedStepConfig } from '../types'

export const scFileWithCourtConfig: GuidedStepConfig = {
  title: 'File With the Court',
  reassurance:
    'Small claims court has simplified filing, but filing correctly is essential for your case to proceed.',

  questions: [
    {
      id: 'know_court',
      type: 'yes_no',
      prompt: 'Do you know which court to file in?',
    },
    {
      id: 'court_info',
      type: 'info',
      prompt:
        'File in the Justice of the Peace (JP) court where the defendant lives or where the issue occurred. Small claims covers disputes up to $20,000.',
      showIf: (answers) => answers.know_court === 'no',
    },
    {
      id: 'have_filing_fee',
      type: 'yes_no',
      prompt: 'Do you have the filing fee ready? (typically $35-$100)',
    },
    {
      id: 'fee_waiver_info',
      type: 'info',
      prompt:
        'If you can\'t afford the fee, you can apply for a fee waiver (Statement of Inability to Afford Payment of Court Costs).',
      showIf: (answers) => answers.have_filing_fee === 'no',
    },
    {
      id: 'filing_method',
      type: 'single_choice',
      prompt: 'How will you file?',
      options: [
        { value: 'in_person', label: 'In person at the courthouse' },
        { value: 'online', label: 'Online (e-filing)' },
        { value: 'mail', label: 'By mail' },
        { value: 'not_sure', label: 'Not sure yet' },
      ],
    },
    {
      id: 'efiling_info',
      type: 'info',
      prompt:
        'Check if your county supports e-filing at efiletexas.gov. It\'s often the fastest way to file.',
      showIf: (answers) => answers.filing_method === 'online',
    },
    {
      id: 'in_person_info',
      type: 'info',
      prompt:
        'Bring your completed petition, copies, and payment to the JP court clerk. They can answer procedural questions.',
      showIf: (answers) => answers.filing_method === 'in_person',
    },
    {
      id: 'documents_ready',
      type: 'yes_no',
      prompt: 'Do you have all your filing documents ready?',
    },
    {
      id: 'documents_info',
      type: 'info',
      prompt:
        'You need your completed small claims petition with the defendant\'s full name, address, the amount claimed, and a brief description of your dispute.',
      showIf: (answers) => answers.documents_ready === 'no',
    },
    {
      id: 'filed_case',
      type: 'yes_no',
      prompt: 'Have you filed your case?',
    },
    {
      id: 'after_filing_info',
      type: 'info',
      prompt:
        'After filing, you\'ll receive a cause number and a hearing date. You must then serve the defendant before the hearing.',
      showIf: (answers) => answers.filed_case === 'no',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.know_court === 'yes') {
      items.push({ status: 'done', text: 'Filing court identified.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Identify the correct JP court: where the defendant lives or where the issue occurred.',
      })
    }

    if (answers.have_filing_fee === 'yes') {
      items.push({ status: 'done', text: 'Filing fee ready.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Prepare the filing fee ($35-$100) or apply for a fee waiver.',
      })
    }

    if (
      answers.filing_method &&
      answers.filing_method !== 'not_sure'
    ) {
      const labels: Record<string, string> = {
        in_person: 'in person',
        online: 'online (e-filing)',
        mail: 'by mail',
      }
      items.push({
        status: 'done',
        text: `Filing method chosen: ${labels[answers.filing_method]}.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Choose a filing method: in person, online, or by mail.',
      })
    }

    if (answers.documents_ready === 'yes') {
      items.push({ status: 'done', text: 'Filing documents are ready.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Prepare your small claims petition with all required information.',
      })
    }

    if (answers.filed_case === 'yes') {
      items.push({ status: 'done', text: 'Case filed with the court.' })
    } else {
      items.push({
        status: 'needed',
        text: 'File your case and obtain a cause number and hearing date.',
      })
    }

    return items
  },
}
