import type { GuidedStepConfig } from '../types'

export const ltDiscoveryConfig: GuidedStepConfig = {
  title: 'Discovery',
  reassurance:
    'Discovery lets you formally request evidence from the other side. This is most common in district court cases, but understanding your options is always helpful.',

  questions: [
    {
      id: 'court_type',
      type: 'single_choice',
      prompt: 'What type of court is your case in?',
      helpText:
        'JP court cases typically do not involve formal discovery. County and district court cases often do.',
      options: [
        { value: 'jp', label: 'Justice of the Peace (JP) Court' },
        { value: 'county', label: 'County Court' },
        { value: 'district', label: 'District Court' },
      ],
    },
    {
      id: 'jp_info',
      type: 'info',
      prompt:
        'JP court cases generally do not have a formal discovery phase. However, you should still gather all evidence you can on your own: photos, receipts, communications, and witness statements. You can move on to hearing preparation.',
      showIf: (answers) => answers.court_type === 'jp',
    },
    {
      id: 'documents_to_request',
      type: 'yes_no',
      prompt: 'Are there documents you need from the other party?',
      helpText:
        'Common document requests in landlord-tenant cases: repair records, inspection reports, rent ledgers, communication logs, contractor invoices.',
      showIf: (answers) => answers.court_type !== 'jp',
    },
    {
      id: 'document_request_info',
      type: 'info',
      prompt:
        'Send a Request for Production of Documents listing each specific document or category you need. The other party typically has 30 days to respond. Be specific about what you want.',
      showIf: (answers) => answers.documents_to_request === 'yes',
    },
    {
      id: 'interrogatories_needed',
      type: 'yes_no',
      prompt: 'Do you have written questions for the other party?',
      helpText:
        'Interrogatories are formal written questions the other party must answer under oath. Useful for understanding their position on key facts.',
      showIf: (answers) => answers.court_type !== 'jp',
    },
    {
      id: 'interrogatory_info',
      type: 'info',
      prompt:
        'Texas allows up to 25 interrogatories (including sub-parts). Focus on key facts: dates, amounts, witnesses, and the basis for their claims or defenses. The other party has 30 days to respond.',
      showIf: (answers) => answers.interrogatories_needed === 'yes',
    },
    {
      id: 'depositions_needed',
      type: 'yes_no',
      prompt: 'Do you need to depose any witnesses?',
      helpText:
        'Depositions are live, recorded interviews under oath. They are expensive but can be very effective for complex cases.',
      showIf: (answers) => answers.court_type === 'district',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.court_type === 'jp') {
      items.push({ status: 'info', text: 'JP court — no formal discovery phase. Focus on gathering your own evidence.' })
      return items
    }

    if (answers.court_type) {
      const label = answers.court_type === 'county' ? 'County Court' : 'District Court'
      items.push({ status: 'done', text: `Case is in ${label} — discovery is available.` })
    }

    if (answers.documents_to_request === 'yes') {
      items.push({ status: 'needed', text: 'Send Requests for Production of Documents to the other party.' })
    } else if (answers.documents_to_request === 'no') {
      items.push({ status: 'done', text: 'No document requests needed.' })
    }

    if (answers.interrogatories_needed === 'yes') {
      items.push({ status: 'needed', text: 'Prepare and send interrogatories (up to 25 questions).' })
    } else if (answers.interrogatories_needed === 'no') {
      items.push({ status: 'done', text: 'No interrogatories needed.' })
    }

    if (answers.depositions_needed === 'yes') {
      items.push({ status: 'needed', text: 'Schedule depositions for key witnesses.' })
    } else if (answers.depositions_needed === 'no') {
      items.push({ status: 'done', text: 'No depositions needed.' })
    }

    return items
  },
}
