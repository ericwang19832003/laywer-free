import type { GuidedStepConfig } from '../types'

export const bizPartnershipEvidenceConfig: GuidedStepConfig = {
  title: 'Organize Your Partnership Evidence',
  reassurance:
    'Strong evidence is the foundation of any partnership dispute. Let\u2019s see what you have.',

  questions: [
    {
      id: 'has_agreement',
      type: 'yes_no',
      prompt: 'Do you have a written partnership or operating agreement?',
    },
    {
      id: 'agreement_tip',
      type: 'info',
      prompt:
        'Great \u2014 your agreement likely contains provisions about dispute resolution, profit sharing, and dissolution procedures. Keep it handy.',
      showIf: (answers) => answers.has_agreement === 'yes',
    },
    {
      id: 'has_financial_records',
      type: 'yes_no',
      prompt:
        'Do you have financial statements or tax returns for the business?',
    },
    {
      id: 'has_communications',
      type: 'yes_no',
      prompt:
        'Do you have emails, texts, or letters with the other partner(s) about the dispute?',
    },
    {
      id: 'has_bank_records',
      type: 'yes_no',
      prompt: 'Do you have bank statements showing disputed transactions?',
    },
    {
      id: 'has_meeting_minutes',
      type: 'yes_no',
      prompt: 'Do you have meeting minutes or written business decisions?',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.has_agreement === 'yes') {
      items.push({
        status: 'done',
        text: 'Partnership or operating agreement collected.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Locate the written partnership or operating agreement.',
      })
    }

    if (answers.has_financial_records === 'yes') {
      items.push({
        status: 'done',
        text: 'Financial statements or tax returns collected.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Gather financial statements or tax returns for the business.',
      })
    }

    if (answers.has_communications === 'yes') {
      items.push({
        status: 'done',
        text: 'Communications with other partner(s) collected.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Save all emails, texts, and letters with the other partner(s) about the dispute.',
      })
    }

    if (answers.has_bank_records === 'yes') {
      items.push({
        status: 'done',
        text: 'Bank statements showing disputed transactions collected.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Obtain bank statements showing disputed transactions.',
      })
    }

    if (answers.has_meeting_minutes === 'yes') {
      items.push({
        status: 'done',
        text: 'Meeting minutes or written business decisions collected.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Locate meeting minutes or written business decisions.',
      })
    }

    return items
  },
}
