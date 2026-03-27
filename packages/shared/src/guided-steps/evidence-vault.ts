import type { GuidedStepConfig } from './types'

export const evidenceVaultConfig: GuidedStepConfig = {
  title: 'Evidence Vault',
  reassurance:
    'Organized evidence is the foundation of a strong case.',

  questions: [
    {
      id: 'has_contracts',
      type: 'yes_no',
      prompt:
        'Do you have contracts or written agreements related to your dispute?',
    },
    {
      id: 'has_photos',
      type: 'yes_no',
      prompt: 'Do you have photos or videos as evidence?',
    },
    {
      id: 'has_communications',
      type: 'yes_no',
      prompt:
        'Do you have relevant text messages, emails, or letters?',
    },
    {
      id: 'has_financial_records',
      type: 'yes_no',
      prompt:
        'Do you have financial records (invoices, receipts, bank statements)?',
    },
    {
      id: 'has_witnesses',
      type: 'yes_no',
      prompt: 'Do you have witnesses who can support your case?',
    },
    {
      id: 'witness_statements',
      type: 'yes_no',
      prompt:
        'Have you collected written statements from your witnesses?',
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
        'Create folders for: Contracts, Communications, Financial Records, Photos/Videos, and Witness Statements. Name files clearly with dates.',
      showIf: (answers) => answers.evidence_organized === 'no',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.has_contracts === 'yes') {
      items.push({ status: 'done', text: 'Contracts and written agreements collected.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Locate any contracts or written agreements related to your dispute.',
      })
    }

    if (answers.has_photos === 'yes') {
      items.push({ status: 'done', text: 'Photos and videos collected.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Gather any photos or videos that serve as evidence.',
      })
    }

    if (answers.has_communications === 'yes') {
      items.push({ status: 'done', text: 'Communications collected.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Save relevant text messages, emails, and letters.',
      })
    }

    if (answers.has_financial_records === 'yes') {
      items.push({ status: 'done', text: 'Financial records collected.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Gather invoices, receipts, and bank statements.',
      })
    }

    if (answers.has_witnesses === 'yes') {
      if (answers.witness_statements === 'yes') {
        items.push({
          status: 'done',
          text: 'Witness statements collected.',
        })
      } else {
        items.push({
          status: 'needed',
          text: 'Collect written statements from your witnesses.',
        })
      }
    } else {
      items.push({
        status: 'info',
        text: 'Consider whether anyone witnessed the events relevant to your case.',
      })
    }

    if (answers.evidence_organized === 'yes') {
      items.push({ status: 'done', text: 'Evidence organized into categories.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Organize evidence into folders: Contracts, Communications, Financial Records, Photos/Videos, Witness Statements.',
      })
    }

    return items
  },
}
