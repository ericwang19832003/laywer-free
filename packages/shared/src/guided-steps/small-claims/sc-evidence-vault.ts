import type { GuidedStepConfig } from '../types'

export const scEvidenceVaultConfig: GuidedStepConfig = {
  title: 'Organize Your Evidence',
  reassurance:
    'Organized evidence is the foundation of a strong small claims case.',

  questions: [
    {
      id: 'has_receipts',
      type: 'yes_no',
      prompt: 'Do you have receipts or invoices showing the amount owed?',
    },
    {
      id: 'has_contract',
      type: 'yes_no',
      prompt: 'Do you have a written contract or agreement?',
    },
    {
      id: 'has_photos',
      type: 'yes_no',
      prompt: 'Do you have photos or videos of damage?',
    },
    {
      id: 'has_communications',
      type: 'yes_no',
      prompt:
        'Do you have text messages, emails, or letters with the other party?',
    },
    {
      id: 'has_witnesses',
      type: 'yes_no',
      prompt: 'Do you have witnesses who can support your claim?',
    },
    {
      id: 'witness_info',
      type: 'info',
      prompt:
        'Write down each witness\'s name and phone number. Ask if they\'re willing to come to court or provide a written statement.',
      showIf: (answers) => answers.has_witnesses === 'yes',
    },
    {
      id: 'evidence_organized',
      type: 'yes_no',
      prompt: 'Have you organized your evidence into categories?',
    },
    {
      id: 'organize_info',
      type: 'info',
      prompt:
        'Create folders for: Receipts/Invoices, Contracts, Photos/Videos, Communications, and Witness Statements. Label files clearly with dates.',
      showIf: (answers) => answers.evidence_organized === 'no',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.has_receipts === 'yes') {
      items.push({ status: 'done', text: 'Receipts and invoices collected.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Locate any receipts or invoices showing the amount owed.',
      })
    }

    if (answers.has_contract === 'yes') {
      items.push({ status: 'done', text: 'Written contract or agreement collected.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Locate any written contracts or agreements related to your claim.',
      })
    }

    if (answers.has_photos === 'yes') {
      items.push({ status: 'done', text: 'Photos or videos of damage collected.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Take photos or videos of any damage related to your claim.',
      })
    }

    if (answers.has_communications === 'yes') {
      items.push({ status: 'done', text: 'Communications collected.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Save relevant text messages, emails, and letters with the other party.',
      })
    }

    if (answers.has_witnesses === 'yes') {
      items.push({
        status: 'done',
        text: 'Witnesses identified.',
      })
    } else {
      items.push({
        status: 'info',
        text: 'Consider whether anyone witnessed the events relevant to your claim.',
      })
    }

    if (answers.evidence_organized === 'yes') {
      items.push({ status: 'done', text: 'Evidence organized into categories.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Organize evidence into folders: Receipts, Contracts, Photos, Communications, Witnesses.',
      })
    }

    return items
  },
}
