import type { GuidedStepConfig } from '../types'

export const bizPartnershipFileWithCourtConfig: GuidedStepConfig = {
  title: 'File With the Court',
  reassurance:
    'Filing your lawsuit officially starts the legal process.',

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
        'File in the district court of the county where the business operates or where the defendant resides.',
    },
    {
      id: 'have_filing_fee',
      type: 'yes_no',
      prompt:
        'Do you have the filing fee ready? (typically $250\u2013$350 in Texas)',
    },
    {
      id: 'filing_method',
      type: 'single_choice',
      prompt: 'How will you file?',
      options: [
        { value: 'in_person', label: 'In person' },
        { value: 'online', label: 'Online (eFileTexas)' },
        { value: 'mail', label: 'By mail' },
      ],
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.know_court === 'yes') {
      items.push({ status: 'done', text: 'Filing court identified.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Determine which district court to file in.',
      })
    }

    if (answers.have_filing_fee === 'yes') {
      items.push({ status: 'done', text: 'Filing fee ready.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Prepare the filing fee ($250\u2013$350 in Texas).',
      })
    }

    if (answers.filing_method) {
      const labels: Record<string, string> = {
        in_person: 'In person',
        online: 'Online (eFileTexas)',
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

    return items
  },
}
