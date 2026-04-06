import type { GuidedStepConfig } from '../types'

export const bizEmploymentFileWithCourtConfig: GuidedStepConfig = {
  title: 'File With the Court',
  reassurance:
    'Filing your petition with the court officially starts your lawsuit. This step walks you through what you need to know.',

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
        'Most employment cases are filed in state district court. Discrimination claims with a right-to-sue letter can be filed in federal court. If your employer is a government entity, different rules may apply.',
      showIf: (answers) => answers.know_court === 'no',
    },
    {
      id: 'have_filing_fee',
      type: 'yes_no',
      prompt: 'Are you prepared to pay the filing fee?',
    },
    {
      id: 'filing_fee_info',
      type: 'info',
      prompt:
        'If you cannot afford the filing fee, you can file a Statement of Inability to Afford Payment of Court Costs (formerly "pauper\'s affidavit") to request a fee waiver.',
      showIf: (answers) => answers.have_filing_fee === 'no',
    },
    {
      id: 'has_right_to_sue_letter',
      type: 'yes_no',
      prompt:
        'Do you have a right-to-sue letter? (Required for discrimination claims.)',
    },
    {
      id: 'right_to_sue_info',
      type: 'info',
      prompt:
        'If your claim involves discrimination, harassment, or retaliation, you must have a right-to-sue letter from the EEOC or TWC before filing. Complete the EEOC step first.',
      showIf: (answers) => answers.has_right_to_sue_letter === 'no',
    },
    {
      id: 'filing_method',
      type: 'single_choice',
      prompt: 'How will you file?',
      options: [
        { value: 'in_person', label: 'In person at the courthouse' },
        { value: 'online', label: 'Online (e-filing)' },
        { value: 'mail', label: 'By mail' },
      ],
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.know_court === 'yes') {
      items.push({ status: 'done', text: 'Court identified for filing.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Determine the correct court (state district court or federal court).',
      })
    }

    if (answers.have_filing_fee === 'yes') {
      items.push({ status: 'done', text: 'Filing fee accounted for.' })
    } else if (answers.have_filing_fee === 'no') {
      items.push({
        status: 'needed',
        text: 'Prepare a Statement of Inability to Afford Payment of Court Costs for a fee waiver.',
      })
    }

    if (answers.has_right_to_sue_letter === 'yes') {
      items.push({
        status: 'done',
        text: 'Right-to-sue letter obtained for discrimination claims.',
      })
    } else if (answers.has_right_to_sue_letter === 'no') {
      items.push({
        status: 'needed',
        text: 'Obtain a right-to-sue letter if your claim involves discrimination, harassment, or retaliation.',
      })
    }

    if (answers.filing_method) {
      const labels: Record<string, string> = {
        in_person: 'In person at the courthouse',
        online: 'Online (e-filing)',
        mail: 'By mail',
      }
      items.push({
        status: 'done',
        text: `Filing method: ${labels[answers.filing_method]}.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Choose a filing method.',
      })
    }

    items.push({
      status: 'info',
      text: 'Keep copies of all filed documents and your receipt or confirmation number.',
    })

    return items
  },
}
