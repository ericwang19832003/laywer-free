import type { GuidedStepConfig } from '../types'

export function createPrepareFilingConfig(_subType: 'divorce' | 'custody' | 'child_support' | 'visitation' | 'spousal_support' | 'protective_order' | 'modification'): GuidedStepConfig {
  return {
    title: 'Prepare Your Filing',
    reassurance: 'We\'ll guide you through preparing your court documents. The filing wizard will create the documents based on your answers.',
    questions: [
      {
        id: 'documents_reviewed',
        type: 'yes_no',
        prompt: 'Have you reviewed all the information from your intake and evidence vault?',
      },
      {
        id: 'review_info',
        type: 'info',
        prompt: 'Go back and review your intake answers and evidence vault before starting the filing preparation.',
        showIf: (a) => a.documents_reviewed === 'no',
      },
      {
        id: 'ready_to_start',
        type: 'info',
        prompt: 'Click "Complete" to launch the filing wizard. It will guide you step by step through creating your court documents.',
      },
    ],
    generateSummary(answers) {
      const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

      if (answers.documents_reviewed === 'yes') {
        items.push({ status: 'done', text: 'Intake and evidence reviewed.' })
      } else {
        items.push({ status: 'needed', text: 'Review your intake answers and evidence vault.' })
      }

      items.push({ status: 'info', text: 'Ready to start the filing wizard.' })
      return items
    },
  }
}
