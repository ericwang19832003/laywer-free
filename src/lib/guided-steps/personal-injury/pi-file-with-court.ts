import type { GuidedStepConfig } from '../types'

export const piFileWithCourtConfig: GuidedStepConfig = {
  title: 'File With the Court',
  reassurance:
    'Filing your petition starts the formal legal process.',

  questions: [
    {
      id: 'know_which_court',
      type: 'single_choice',
      prompt: 'Do you know which court to file in?',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'not_sure', label: "I'm not sure" },
      ],
    },
    {
      id: 'court_info',
      type: 'info',
      prompt:
        'File in the county where the accident occurred or where the defendant lives. For claims over $200,000, file in district court. Under that, county court.',
      showIf: (answers) => answers.know_which_court === 'not_sure',
    },
    {
      id: 'efile_info',
      type: 'info',
      prompt:
        'Texas uses eFileTexas.gov for electronic filing. Create an account, select your court, upload your petition, and pay the filing fee online.',
    },
    {
      id: 'know_filing_fee',
      type: 'yes_no',
      prompt: 'Do you know the filing fee for your court?',
    },
    {
      id: 'fee_info',
      type: 'info',
      prompt:
        "Filing fees vary by court. District court: ~$300. County court: ~$200. You can apply for a fee waiver if you can't afford it.",
      showIf: (answers) => answers.know_filing_fee === 'no',
    },
    {
      id: 'know_sol_deadline',
      type: 'yes_no',
      prompt: 'Do you know your statute of limitations deadline?',
    },
    {
      id: 'sol_critical',
      type: 'info',
      prompt:
        'Critical: Personal injury claims in Texas must be filed within 2 years of the injury date. Missing this deadline means losing your right to sue.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.know_which_court === 'yes') {
      items.push({ status: 'done', text: 'You know which court to file in.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Determine the correct court based on where the accident occurred and the amount of your claim.',
      })
    }

    items.push({
      status: 'info',
      text: 'Use eFileTexas.gov to file electronically. Create an account, select your court, upload your petition, and pay the filing fee.',
    })

    if (answers.know_filing_fee === 'yes') {
      items.push({ status: 'done', text: 'You know the filing fee for your court.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Look up the filing fee for your court. District court: ~$300. County court: ~$200. Apply for a fee waiver if needed.',
      })
    }

    if (answers.know_sol_deadline === 'yes') {
      items.push({ status: 'done', text: 'You know your statute of limitations deadline.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Determine your statute of limitations deadline. You have 2 years from the date of injury to file.',
      })
    }

    items.push({
      status: 'info',
      text: 'The 2-year statute of limitations is a hard deadline. File well before it to account for processing delays.',
    })

    return items
  },
}
