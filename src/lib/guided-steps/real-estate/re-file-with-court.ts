import type { GuidedStepConfig } from '../types'

export const reFileWithCourtConfig: GuidedStepConfig = {
  title: 'File With the Court',
  reassurance:
    'Filing officially starts your lawsuit. The court clerk can answer procedural questions.',

  questions: [
    {
      id: 'have_petition',
      type: 'yes_no',
      prompt: 'Do you have your completed petition ready?',
      helpText:
        'The petition is the document that formally starts your lawsuit.',
    },
    {
      id: 'petition_info',
      type: 'info',
      prompt:
        'Your petition should include: the property address, legal description of the property, names of all parties, the facts of the dispute, the legal basis for your claim, and the specific relief you are seeking.',
      showIf: (answers) => answers.have_petition === 'no',
    },
    {
      id: 'have_filing_fee',
      type: 'yes_no',
      prompt: 'Do you have the filing fee ready?',
    },
    {
      id: 'fee_info',
      type: 'info',
      prompt:
        'Filing fees vary by county, typically $250\u2013$350 for district court. If you cannot afford the fee, you can apply for a fee waiver by filing a Statement of Inability to Afford Payment of Court Costs.',
      showIf: (answers) => answers.have_filing_fee === 'no',
    },
    {
      id: 'filing_method',
      type: 'single_choice',
      prompt: 'How will you file?',
      options: [
        { value: 'in_person', label: 'In person at the courthouse' },
        { value: 'online', label: 'Online (e-filing)' },
        { value: 'not_sure', label: 'Not sure yet' },
      ],
    },
    {
      id: 'efiling_info',
      type: 'info',
      prompt:
        'Texas requires e-filing in most courts. Visit efiletexas.gov to create an account, select your court, upload your petition and supporting documents, and pay the filing fee online.',
      showIf: (answers) =>
        answers.filing_method === 'online' || answers.filing_method === 'not_sure',
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
        'After filing, you will receive a cause number. This is your case identifier for all future filings and communications with the court. Keep copies of everything you file. Your next step is to serve the defendant.',
      showIf: (answers) => answers.filed_case === 'yes',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.have_petition === 'yes') {
      items.push({ status: 'done', text: 'Petition is ready to file.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Prepare your petition with property address, legal description, parties, facts, and relief sought.',
      })
    }

    if (answers.have_filing_fee === 'yes') {
      items.push({ status: 'done', text: 'Filing fee is ready.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Obtain the filing fee ($250\u2013$350 for district court) or apply for a fee waiver.',
      })
    }

    if (answers.filing_method === 'in_person') {
      items.push({ status: 'done', text: 'Filing method: in person at the courthouse.' })
    } else if (answers.filing_method === 'online') {
      items.push({ status: 'done', text: 'Filing method: e-filing via efiletexas.gov.' })
    } else {
      items.push({ status: 'needed', text: 'Choose a filing method. Most Texas courts require e-filing.' })
    }

    if (answers.filed_case === 'yes') {
      items.push({ status: 'done', text: 'Case filed with the court.' })
    } else {
      items.push({ status: 'needed', text: 'File your case and obtain your cause number.' })
    }

    items.push({
      status: 'info',
      text: 'After filing, serve the defendant as soon as possible to keep your case on track.',
    })

    return items
  },
}
