import type { GuidedStepConfig } from './types'

export const fileWithCourtConfig: GuidedStepConfig = {
  title: 'File With the Court',
  reassurance:
    'Filing your case with the court starts the legal process.',

  questions: [
    {
      id: 'first_time_filing',
      type: 'yes_no',
      prompt: 'Is this your first time filing with a court?',
    },
    {
      id: 'first_time_info',
      type: 'info',
      prompt:
        "You don't need a lawyer to file. The court clerk's office can help with procedural questions, though they can't give legal advice.",
      showIf: (answers) => answers.first_time_filing === 'yes',
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
        "Fees vary by court type. You can apply for a fee waiver if you can't afford it.",
      showIf: (answers) => answers.know_filing_fee === 'no',
    },
    {
      id: 'documents_ready',
      type: 'yes_no',
      prompt: 'Do you have all your filing documents ready?',
    },
    {
      id: 'understand_efile',
      type: 'yes_no',
      prompt: 'Do you know how to use e-filing?',
    },
    {
      id: 'efile_info',
      type: 'info',
      prompt:
        'Most Texas courts use eFileTexas.gov. Create an account, select your court, upload documents, and pay fees online.',
      showIf: (answers) => answers.understand_efile === 'no',
    },
    {
      id: 'know_what_happens_after',
      type: 'yes_no',
      prompt: 'Do you know what happens after you file?',
    },
    {
      id: 'after_filing_info',
      type: 'info',
      prompt:
        "After filing, you'll receive a cause number. You must then serve the other party within the required timeframe.",
      showIf: (answers) => answers.know_what_happens_after === 'no',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.first_time_filing === 'yes') {
      items.push({
        status: 'info',
        text: "First-time filer: the court clerk's office can help with procedural questions.",
      })
    }

    if (answers.know_filing_fee === 'yes') {
      items.push({ status: 'done', text: 'Filing fee identified.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Look up the filing fee for your court. Apply for a fee waiver if needed.',
      })
    }

    if (answers.documents_ready === 'yes') {
      items.push({ status: 'done', text: 'Filing documents are ready.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Prepare all required filing documents before proceeding.',
      })
    }

    if (answers.understand_efile === 'yes') {
      items.push({ status: 'done', text: 'Familiar with e-filing process.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Set up an account on eFileTexas.gov (or your court\'s e-filing system).',
      })
    }

    if (answers.know_what_happens_after === 'yes') {
      items.push({
        status: 'done',
        text: 'Understands post-filing process.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'After filing, serve the other party within the required timeframe.',
      })
    }

    return items
  },
}
