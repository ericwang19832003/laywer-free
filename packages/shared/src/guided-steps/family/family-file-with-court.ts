import type { GuidedStepConfig } from '../types'

type FilingSubType = 'divorce' | 'custody' | 'child_support' | 'visitation' | 'spousal_support' | 'protective_order' | 'modification'

export function createFileWithCourtConfig(subType: FilingSubType): GuidedStepConfig {
  const isPO = subType === 'protective_order'
  const isMod = subType === 'modification'

  return {
    title: 'File With the Court',
    reassurance: isPO
      ? 'There is no filing fee for protective orders in Texas. The court may grant an emergency ex parte order the same day.'
      : 'Filing officially starts your case. This step guides you through the process.',
    questions: [
      {
        id: 'filing_method',
        type: 'single_choice',
        prompt: 'How will you file?',
        options: [
          { value: 'in_person', label: 'In person at the courthouse' },
          { value: 'efiling', label: 'E-filing online' },
          { value: 'not_sure', label: 'Not sure yet' },
        ],
      },
      {
        id: 'efiling_info',
        type: 'info',
        prompt: 'Texas requires e-filing in most counties. Check eFileTexas.gov for your county\'s requirements.',
        showIf: (a) => a.filing_method === 'not_sure',
      },
      ...(isPO ? [{
        id: 'po_fee_info',
        type: 'info' as const,
        prompt: 'There is no filing fee for protective orders in Texas (TX Family Code §81.002). The court will handle service to the respondent.',
      }] : [{
        id: 'filing_fee_ready',
        type: 'yes_no' as const,
        prompt: 'Do you have the filing fee ready?',
        helpText: 'Filing fees vary by county. If you cannot afford the fee, you can apply for a fee waiver.',
      }]),
      ...(isMod ? [{
        id: 'original_court_info',
        type: 'info' as const,
        prompt: 'Modifications should be filed in the court that issued the original order, unless the case has been transferred.',
      }] : []),
      {
        id: 'documents_ready',
        type: 'yes_no',
        prompt: 'Are all your filing documents prepared and ready to submit?',
      },
    ],
    generateSummary(answers) {
      const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

      if (answers.filing_method && answers.filing_method !== 'not_sure') {
        items.push({ status: 'done', text: `Filing method: ${answers.filing_method === 'efiling' ? 'E-filing' : 'In person'}` })
      } else {
        items.push({ status: 'needed', text: 'Choose a filing method.' })
      }

      if (!isPO) {
        if (answers.filing_fee_ready === 'yes') {
          items.push({ status: 'done', text: 'Filing fee ready.' })
        } else if (answers.filing_fee_ready === 'no') {
          items.push({ status: 'needed', text: 'Prepare filing fee or apply for a fee waiver.' })
        }
      } else {
        items.push({ status: 'info', text: 'No filing fee required for protective orders.' })
      }

      if (answers.documents_ready === 'yes') {
        items.push({ status: 'done', text: 'Filing documents are ready.' })
      } else {
        items.push({ status: 'needed', text: 'Prepare your filing documents.' })
      }

      return items
    },
  }
}
