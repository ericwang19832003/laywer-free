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
        'Start with the partnership agreement: it may require a specific county, court, arbitration, or pre-suit notice. If no clause controls, file in a court connected to the business, the defendant, or the events. Partnership disputes often need district court if they involve injunctions, accounting, receivership, or ownership rights.',
    },
    {
      id: 'have_filing_fee',
      type: 'yes_no',
      prompt:
        'Do you have the filing fee ready? (typically $250\u2013$350 in Texas)',
    },
    {
      id: 'fee_info',
      type: 'info',
      prompt:
        'If you cannot afford filing costs, ask whether a Statement of Inability to Afford Payment of Court Costs is available. Business-related fee waivers may require extra explanation about personal and business resources.',
      showIf: (answers) => answers.have_filing_fee === 'no',
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
    {
      id: 'efile_info',
      type: 'info',
      prompt:
        'Online filing checklist:\n1. Go to eFileTexas.gov and choose a service provider\n2. Create an account or sign in\n3. Select the correct court and civil case type\n4. Upload the petition, civil cover sheet, and exhibits as PDFs\n5. Pay the filing fee or submit any fee-waiver request\n6. Save the envelope number, filing receipt, and clerk acceptance email',
      showIf: (answers) => answers.filing_method === 'online',
    },
    {
      id: 'documents_ready',
      type: 'yes_no',
      prompt: 'Do you have your partnership filing packet ready?',
      helpText:
        'Prepare: petition, civil cover sheet, partnership agreement, ownership records, accounting records, bank records, tax records, communications, demand letter, business registration information, any injunction/receivership request, and copies for service.',
    },
    {
      id: 'service_packet_info',
      type: 'info',
      prompt:
        'After filing, each defendant must be served. Confirm whether you are serving an individual partner, a company, or a registered agent, then prepare copies for service.',
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
        text: 'Prepare the filing fee or ask the clerk about any available fee waiver.',
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

    if (answers.documents_ready === 'yes') {
      items.push({ status: 'done', text: 'Partnership filing packet is ready.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Prepare the petition, civil cover sheet, partnership agreement, ownership records, accounting records, demand letter, any injunction/receivership request, and copies for service.',
      })
    }

    items.push({
      status: 'info',
      text: 'Save the e-filing envelope number or clerk receipt, then arrange service on each defendant partner, entity, or registered agent.',
    })

    return items
  },
}
