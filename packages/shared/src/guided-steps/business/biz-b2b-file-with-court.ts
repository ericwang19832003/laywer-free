import type { GuidedStepConfig } from '../types'

export const bizB2bFileWithCourtConfig: GuidedStepConfig = {
  title: 'File With the Court',
  reassurance:
    'Filing your commercial lawsuit is a straightforward process once you have the right court identified.',

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
        'Check your contract for a forum selection clause — it may specify where disputes must be filed. For interstate disputes, consider whether federal diversity jurisdiction applies (disputes over $75,000 between businesses in different states).',
      showIf: (answers) => answers.know_court === 'no',
    },
    {
      id: 'have_filing_fee',
      type: 'yes_no',
      prompt: 'Do you have the filing fee ready?',
    },
    {
      id: 'filing_method',
      type: 'single_choice',
      prompt: 'How will you file your lawsuit?',
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
        text: 'Identify the correct court — check contract for forum clause or consider federal diversity jurisdiction.',
      })
    }

    if (answers.have_filing_fee === 'yes') {
      items.push({ status: 'done', text: 'Filing fee ready.' })
    } else {
      items.push({ status: 'needed', text: 'Prepare the filing fee.' })
    }

    if (answers.filing_method) {
      const methods: Record<string, string> = {
        in_person: 'in person',
        online: 'online (e-filing)',
        mail: 'by mail',
      }
      items.push({ status: 'done', text: `Will file ${methods[answers.filing_method] ?? answers.filing_method}.` })
    } else {
      items.push({ status: 'needed', text: 'Choose a filing method.' })
    }

    return items
  },
}
