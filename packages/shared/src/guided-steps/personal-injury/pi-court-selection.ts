import type { GuidedStepConfig, SummaryItem } from '../types'
import {
  damageRangeToCourtLevel,
  getTexasCourtFeeInfo,
  getTexasCourtContactInfo,
} from '../../courts/texas-filing-requirements'
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
        acknowledgeLabel: "I understand the venue and jurisdiction rules",
      },
      {
        id: 'court_confirm',
        type: 'info',
        prompt: '',
        promptFn: (answers) => {
          const county = answers.accident_county || answers.defendant_county || ''
          const level = damageRangeToCourtLevel(answers.estimated_damages_range)
          const data = county ? getTexasCourtFeeInfo(county, level) : null
          if (data) {
            return (
              `YOUR COURT\n\n` +
              `${data.countyName} County — ${data.courtLabel}\n\n` +
              `FILING FEE: ${data.fee}\n` +
              `Fee waiver available if you cannot afford filing costs\n` +
              `(Statement of Inability to Afford Payment)`
            )
          }
          return (
            `YOUR COURT\n\n` +
            `Verify the correct court and filing fee with the clerk before filing.\n\n` +
            `Fee waivers are available if you cannot afford the filing cost\n` +
            `(Statement of Inability to Afford Payment — OCA form).`
          )
        },
        acknowledgeLabel: "That's the right court →",
        showIf: (answers) =>
          !!(answers.accident_county || answers.defendant_county) &&
          !!answers.estimated_damages_range,
      },
      {
        id: 'court_documents',
        type: 'multi_select',
        prompt: 'Which required documents have you prepared so far?',
        options: [
          { value: 'petition', label: 'Original Petition (3 copies)' },
          { value: 'photo_id', label: 'Photo ID (for in-person filing)' },
          { value: 'fee_payment', label: 'Filing fee payment or fee waiver' },
          { value: 'case_info_sheet', label: 'Civil Case Information Sheet (Texas OCA form)' },
        ],
        noneLabel: "Haven't prepared any yet",
        showIf: (answers) =>
          !!(answers.accident_county || answers.defendant_county) &&
          !!answers.estimated_damages_range,
      },
      {
        id: 'court_formatting',
        type: 'multi_select',
        prompt: 'Does your document meet these formatting requirements?',
        options: [
          { value: 'pdf', label: 'Text-searchable PDF (not a scanned image)' },
          { value: 'redacted', label: 'SSN, DOB, and account numbers redacted' },
          { value: 'font', label: 'Legible font, 12pt or larger' },
          { value: 'margins', label: '1-inch margins on all sides' },
        ],
        noneLabel: "Haven't checked these yet",
        showIf: (answers) =>
          !!(answers.accident_county || answers.defendant_county) &&
          !!answers.estimated_damages_range,
      },
      {
        id: 'court_contact',
        type: 'info',
        prompt: '',
        promptFn: (answers) => {
          const county = answers.accident_county || answers.defendant_county || ''
          const level = damageRangeToCourtLevel(answers.estimated_damages_range)
          const data = county ? getTexasCourtContactInfo(county, level) : null
          if (data) {
            return (
              `WHERE TO FILE\n\n` +
              `E-FILING: ${data.eFilingUrl}\n` +
              `CLERK WEBSITE: ${data.clerkWebsite}\n` +
              `CLERK PHONE: ${data.clerkPhone}\n\n` +
              `Last verified: ${data.lastVerified} — confirm with the clerk before filing.`
            )
          }
          return (
            `WHERE TO FILE\n\n` +
            `E-FILING: https://efiletexas.gov\n\n` +
            `All Texas courts use efiletexas.gov for online filing.\n` +
            `Call the clerk's office to confirm your specific court's contact info.`
          )
        },
        acknowledgeLabel: "I have these saved →",
        showIf: (answers) =>
          !!(answers.accident_county || answers.defendant_county) &&
          !!answers.estimated_damages_range,
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

      if (answers.court_confirm === 'acknowledged') {
        items.push({ status: 'done', text: 'Court and filing fee confirmed.' })
      } else {
        items.push({ status: 'needed', text: 'Confirm the correct court and filing fee.' })
      }

      const preparedDocs = answers.court_documents
        ? answers.court_documents.split(',').filter(Boolean)
        : []
      if (preparedDocs.length > 0 && preparedDocs[0] !== 'none') {
        items.push({ status: 'done', text: `${preparedDocs.length} required document(s) prepared.` })
      } else if (answers.court_documents) {
        items.push({ status: 'needed', text: 'Prepare the required filing documents.' })
      }

      if (answers.court_contact === 'acknowledged') {
        items.push({ status: 'done', text: 'Clerk contact information saved.' })
      }

      return items
    },
  }
}
