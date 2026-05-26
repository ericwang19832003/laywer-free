import type { GuidedStepConfig, SummaryItem } from '../types'
import { STATE_FILING_INFO } from './state-filing-info'

interface DamageOption {
  value: string
  label: string
}

function getDamageOptions(state?: string): DamageOption[] {
  switch (state) {
    case 'CA':
      return [
        { value: 'under_12500', label: 'Under $12,500' },
        { value: '12500_to_35000', label: '$12,500 to $35,000' },
        { value: 'over_35000', label: 'Over $35,000' },
        { value: 'not_sure', label: 'Not sure yet' },
      ]
    case 'FL':
      return [
        { value: 'under_8000', label: 'Under $8,000' },
        { value: '8000_to_50000', label: '$8,000 to $50,000' },
        { value: 'over_50000', label: 'Over $50,000' },
        { value: 'not_sure', label: 'Not sure yet' },
      ]
    case 'NY':
      return [
        { value: 'under_10000', label: 'Under $10,000' },
        { value: '10000_to_50000', label: '$10,000 to $50,000' },
        { value: 'over_50000', label: 'Over $50,000' },
        { value: 'not_sure', label: 'Not sure yet' },
      ]
    case 'PA':
      return [
        { value: 'under_12000', label: 'Under $12,000' },
        { value: 'over_12000', label: 'Over $12,000' },
        { value: 'not_sure', label: 'Not sure yet' },
      ]
    default:
      // TX and all other states
      return [
        { value: 'under_20000', label: 'Under $20,000' },
        { value: '20000_to_325000', label: '$20,000 to $325,000' },
        { value: 'over_325000', label: 'Over $325,000' },
        { value: 'not_sure', label: 'Not sure yet' },
      ]
  }
}

export function createPiCourtSelectionConfig(piSubType?: string, state?: string): GuidedStepConfig {
  const claimLabel = piSubType ? piSubType.replace(/_/g, ' ') : 'personal injury'
  const stateInfo = state ? STATE_FILING_INFO[state] : undefined
  const courtGuide = stateInfo?.courtSelectionGuide
    ?? 'Verify the proper court with the clerk before filing. Venue typically depends on where the incident occurred or where the defendant resides, and court jurisdiction depends on the amount claimed.'

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
        options: getDamageOptions(state),
      },
      {
        id: 'court_info',
        type: 'info',
        prompt: `For a ${claimLabel} matter: ${courtGuide}`,
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
