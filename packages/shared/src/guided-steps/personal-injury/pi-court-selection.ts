import type { GuidedStepConfig, SummaryItem } from '../types'

export function createPiCourtSelectionConfig(piSubType?: string): GuidedStepConfig {
  const claimLabel = piSubType ? piSubType.replace(/_/g, ' ') : 'personal injury'

  return {
    title: 'Choose a Court for Your PI Case',
    reassurance:
      'This step helps you collect court-selection facts so you can verify venue and filing requirements before using any draft in court.',
    questions: [
      {
        id: 'accident_county',
        type: 'text',
        prompt: 'What county did the incident happen in?',
        placeholder: 'Example: Harris County',
      },
      {
        id: 'defendant_county',
        type: 'text',
        prompt: 'What county does the defendant live or do business in?',
        placeholder: 'Example: Travis County',
      },
      {
        id: 'estimated_damages_range',
        type: 'single_choice',
        prompt: 'What is your current estimate of damages?',
        options: [
          { value: 'under_20000', label: 'Under $20,000' },
          { value: '20000_to_250000', label: '$20,000 to $250,000' },
          { value: 'over_250000', label: 'Over $250,000' },
          { value: 'not_sure', label: 'Not sure yet' },
        ],
      },
      {
        id: 'court_info',
        type: 'info',
        prompt:
          `For a ${claimLabel} matter, verify the proper court with the clerk before filing. Texas venue often looks at where the incident happened or where the defendant resides, and court jurisdiction can depend on the amount claimed.`,
      },
      {
        id: 'verified_with_clerk',
        type: 'yes_no',
        prompt: 'Have you verified filing requirements with the court clerk or court website?',
      },
    ],
    generateSummary(answers) {
      const items: SummaryItem[] = [
        {
          status: 'info',
          text: 'Verify venue, jurisdiction, filing fees, and local forms before filing any petition.',
        },
      ]

      if (answers.accident_county) {
        items.push({
          status: 'info',
          text: `Incident county noted: ${answers.accident_county}.`,
        })
      }

      if (answers.defendant_county) {
        items.push({
          status: 'info',
          text: `Defendant county noted: ${answers.defendant_county}.`,
        })
      }

      if (answers.verified_with_clerk === 'yes') {
        items.push({
          status: 'done',
          text: 'Court filing requirements marked as verified.',
        })
      } else {
        items.push({
          status: 'needed',
          text: 'Check the court website or clerk instructions before filing.',
        })
      }

      return items
    },
  }
}
