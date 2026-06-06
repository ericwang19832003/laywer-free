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
        'Check your contract for a forum selection clause - it may specify where disputes must be filed. Also confirm the defendant business name, entity status, and registered agent before filing. For interstate disputes, consider whether federal diversity jurisdiction applies (disputes over $75,000 between businesses in different states).',
      acknowledgeLabel: "I'll check the contract for a forum clause and verify the defendant's registered agent",
      showIf: (answers) => answers.know_court === 'no',
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
        'If your business cannot afford filing costs, ask whether a Statement of Inability to Afford Payment of Court Costs is available. Some courts scrutinize business fee-waiver requests more closely than individual requests.',
      acknowledgeLabel: "I'll ask the clerk about a fee waiver and be prepared for additional scrutiny",
      showIf: (answers) => answers.have_filing_fee === 'no',
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
    {
      id: 'efile_info',
      type: 'info',
      prompt:
        'Online filing checklist:\n1. Go to eFileTexas.gov and choose a service provider\n2. Create an account or sign in\n3. Select the correct court and case type\n4. Upload the petition, civil cover sheet, and exhibits as PDFs\n5. Pay the filing fee or submit any fee-waiver request\n6. Save the envelope number, filing receipt, and clerk acceptance email',
      acknowledgeLabel: "I'll follow this checklist and save the envelope number and clerk receipt",
      showIf: (answers) => answers.filing_method === 'online',
    },
    {
      id: 'documents_ready',
      type: 'yes_no',
      prompt: 'Do you have your filing packet ready?',
      helpText:
        'For a B2B contract or invoice dispute, prepare: petition, civil cover sheet, contract, invoices, purchase orders, account statement, demand letter, key emails/texts, business registration information, defendant registered agent information, and copies for service.',
    },
    {
      id: 'service_packet_info',
      type: 'info',
      prompt:
        'After filing, you must serve each defendant. Prepare copies for service, confirm the defendant business legal name, and use the registered agent or other authorized recipient required by law.',
      acknowledgeLabel: "I'll confirm the defendant's legal name and registered agent before serving",
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
      items.push({ status: 'needed', text: 'Prepare the filing fee or ask the clerk about any available fee waiver.' })
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

    if (answers.documents_ready === 'yes') {
      items.push({ status: 'done', text: 'Filing packet and exhibits are ready.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Prepare the petition, civil cover sheet, contract, invoices, purchase orders, demand letter, registered agent information, and copies for service.',
      })
    }

    items.push({
      status: 'info',
      text: 'Save the e-filing envelope number or clerk receipt, then arrange service on the defendant business through its registered agent or authorized recipient.',
    })

    return items
  },
}
