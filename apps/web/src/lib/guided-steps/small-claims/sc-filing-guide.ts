import type { GuidedStepConfig } from '../types'

export const scFilingGuideConfig: GuidedStepConfig = {
  title: 'How to File Your Small Claims Case',
  reassurance:
    'Filing in JP Court is simpler and cheaper than any other court. Many clerks will help you fill out the forms.',

  questions: [
    {
      id: 'know_filing_fee',
      type: 'yes_no',
      prompt: 'Do you know what the filing fee is for your county?',
    },
    {
      id: 'filing_fee_info',
      type: 'info',
      prompt:
        'Filing fees in Texas JP Courts typically range from $35-$75 depending on your county. Call the clerk\'s office or check your county\'s JP Court website for the exact amount.',
      showIf: (answers) => answers.know_filing_fee === 'no',
    },
    {
      id: 'can_afford_fee',
      type: 'yes_no',
      prompt: 'Can you afford the filing fee?',
    },
    {
      id: 'fee_waiver_info',
      type: 'info',
      prompt:
        'If you can\'t afford the filing fee, you can file a "Statement of Inability to Afford Payment of Court Costs." The clerk can provide this form. If approved, your filing fee and service fees are waived.',
      showIf: (answers) => answers.can_afford_fee === 'no',
    },
    {
      id: 'know_venue',
      type: 'yes_no',
      prompt: 'Do you know which JP Court to file in?',
    },
    {
      id: 'venue_info',
      type: 'info',
      prompt:
        'File in the JP Court in the county where the defendant lives, OR where the transaction or event occurred. If those are different counties, you can choose either one.',
      showIf: (answers) => answers.know_venue === 'no',
    },
    {
      id: 'have_petition',
      type: 'yes_no',
      prompt: 'Do you have your petition form ready?',
    },
    {
      id: 'petition_info',
      type: 'info',
      prompt:
        'Many JP Courts have simplified fill-in-the-blank petition forms available at the clerk\'s office or on the court\'s website. You can also find forms on texaslawhelp.org. You\'ll need: your name and address, the defendant\'s full name and address, the amount you\'re claiming, and a brief description of your dispute.',
      showIf: (answers) => answers.have_petition === 'no',
    },
    {
      id: 'filing_method',
      type: 'single_choice',
      prompt: 'How do you plan to file?',
      options: [
        { value: 'in_person', label: 'In person at the clerk\'s office' },
        { value: 'efiling', label: 'Online at eFileTexas.gov' },
        { value: 'not_sure', label: 'Not sure yet' },
      ],
    },
    {
      id: 'efiling_info',
      type: 'info',
      prompt:
        'You can e-file at eFileTexas.gov. Create a free account, select your JP Court, and upload your petition. There may be a small e-filing service fee on top of the court filing fee.',
      showIf: (answers) => answers.filing_method === 'efiling',
    },
    {
      id: 'in_person_info',
      type: 'info',
      prompt:
        'Bring your completed petition, the filing fee (check if they accept cash, check, or card), and the defendant\'s address. The clerk can help you with questions about the form. Some courts will let you fill out the form on the spot.',
      showIf: (answers) => answers.filing_method === 'in_person',
    },
    {
      id: 'not_sure_info',
      type: 'info',
      prompt:
        'If you\'re not sure how to file, going in person is the easiest option. The clerk\'s office can provide forms and answer procedural questions. You can also e-file at eFileTexas.gov if you prefer to do it from home.',
      showIf: (answers) => answers.filing_method === 'not_sure',
    },
    {
      id: 'have_defendant_address',
      type: 'yes_no',
      prompt: 'Do you have the defendant\'s current address?',
    },
    {
      id: 'defendant_address_info',
      type: 'info',
      prompt:
        'You\'ll need the defendant\'s physical address for both the petition and for service of process. If you don\'t have it, try checking the original contract, business registration records (Texas Secretary of State website), or property records.',
      showIf: (answers) => answers.have_defendant_address === 'no',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.know_filing_fee === 'yes') {
      items.push({ status: 'done', text: 'Filing fee amount identified.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Confirm filing fee with your county\'s JP Court ($35-$75 typical).',
      })
    }

    if (answers.can_afford_fee === 'no') {
      items.push({
        status: 'needed',
        text: 'Request a Statement of Inability to Afford Payment of Court Costs from the clerk.',
      })
    } else if (answers.can_afford_fee === 'yes') {
      items.push({ status: 'done', text: 'Filing fee is affordable.' })
    }

    if (answers.know_venue === 'yes') {
      items.push({ status: 'done', text: 'Correct JP Court identified.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Identify the correct JP Court: where the defendant lives or where the transaction occurred.',
      })
    }

    if (answers.have_petition === 'yes') {
      items.push({ status: 'done', text: 'Petition form is ready.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Get the petition form from the clerk\'s office, court website, or texaslawhelp.org.',
      })
    }

    if (answers.filing_method && answers.filing_method !== 'not_sure') {
      const labels: Record<string, string> = {
        in_person: 'in person at the clerk\'s office',
        efiling: 'online at eFileTexas.gov',
      }
      items.push({
        status: 'done',
        text: `Filing method chosen: ${labels[answers.filing_method]}.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Choose a filing method: in person or online at eFileTexas.gov.',
      })
    }

    if (answers.have_defendant_address === 'yes') {
      items.push({ status: 'done', text: 'Defendant\'s address confirmed.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Locate the defendant\'s current address for the petition and service.',
      })
    }

    return items
  },
}
