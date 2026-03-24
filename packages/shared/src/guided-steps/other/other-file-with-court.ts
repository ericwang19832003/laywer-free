import type { GuidedStepConfig } from '../types'

export const otherFileWithCourtConfig: GuidedStepConfig = {
  title: 'File With the Court',
  reassurance:
    'Filing officially starts your case. The process is straightforward once you have your documents ready.',

  questions: [
    {
      id: 'filing_method',
      type: 'single_choice',
      prompt: 'How do you plan to file your case?',
      options: [
        { value: 'efiling', label: 'E-filing (online)' },
        { value: 'in_person', label: 'In person at the courthouse' },
        { value: 'mail', label: 'By mail' },
        { value: 'unsure', label: 'Not sure yet' },
      ],
    },
    {
      id: 'efiling_info',
      type: 'info',
      prompt:
        'Most courts now accept or require electronic filing. Check if your court uses a system like eFileTexas.gov, Odyssey, or another e-filing portal. Create an account before your filing date.',
      showIf: (answers) => answers.filing_method === 'efiling' || answers.filing_method === 'unsure',
    },
    {
      id: 'in_person_info',
      type: 'info',
      prompt:
        'When filing in person, bring your original documents plus at least two copies. The clerk will stamp your copies as "filed." Check the courthouse hours and whether you need an appointment.',
      showIf: (answers) => answers.filing_method === 'in_person',
    },
    {
      id: 'know_filing_fee',
      type: 'yes_no',
      prompt: 'Do you know the filing fee for your case?',
    },
    {
      id: 'fee_info',
      type: 'info',
      prompt:
        'Filing fees vary by court and case type. Call the court clerk or check the court\'s website for the current fee schedule. If you cannot afford the fee, you can apply for a fee waiver (often called an "affidavit of inability to pay").',
      showIf: (answers) => answers.know_filing_fee === 'no',
    },
    {
      id: 'documents_complete',
      type: 'yes_no',
      prompt: 'Are all your filing documents complete and ready to submit?',
    },
    {
      id: 'documents_checklist',
      type: 'info',
      prompt:
        'Before filing, make sure you have: your petition or complaint, a civil case information sheet (if required), any required cover sheets, and copies for each defendant. Double-check that names, addresses, and case details are accurate.',
      showIf: (answers) => answers.documents_complete === 'no',
    },
    {
      id: 'filing_confirmation',
      type: 'yes_no',
      prompt: 'Have you already filed and received a confirmation or cause number?',
    },
    {
      id: 'post_filing_info',
      type: 'info',
      prompt:
        'After filing, you will receive a cause number (case number). Keep this number for all future filings and communications with the court. Your next step is to serve the other party.',
      showIf: (answers) => answers.filing_confirmation === 'no',
    },
    {
      id: 'filed_success_info',
      type: 'info',
      prompt:
        'Great! Your case is officially on file. Save your confirmation and cause number. The next step is to arrange service on the other party within the required timeframe.',
      showIf: (answers) => answers.filing_confirmation === 'yes',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.filing_method && answers.filing_method !== 'unsure') {
      const labels: Record<string, string> = {
        efiling: 'e-filing',
        in_person: 'in person',
        mail: 'by mail',
      }
      items.push({
        status: 'done',
        text: `Filing method: ${labels[answers.filing_method] ?? answers.filing_method}.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Determine how you will file (e-filing, in person, or by mail). Check your court\'s requirements.',
      })
    }

    if (answers.know_filing_fee === 'yes') {
      items.push({ status: 'done', text: 'Filing fee identified.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Look up the filing fee. Apply for a fee waiver if needed.',
      })
    }

    if (answers.documents_complete === 'yes') {
      items.push({ status: 'done', text: 'Filing documents are ready.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Complete all filing documents: petition, case information sheet, cover sheets, and copies for each defendant.',
      })
    }

    if (answers.filing_confirmation === 'yes') {
      items.push({
        status: 'done',
        text: 'Case filed. Cause number received. Ready to serve the other party.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'File your case and obtain a cause number. Then arrange service on the other party.',
      })
    }

    return items
  },
}
