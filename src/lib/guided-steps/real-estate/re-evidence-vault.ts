import type { GuidedStepConfig } from '../types'

export const reEvidenceVaultConfig: GuidedStepConfig = {
  title: 'Organize Your Evidence',
  reassurance:
    'Real estate disputes are won with documents. Organizing your evidence now makes every future step easier.',

  questions: [
    {
      id: 'has_purchase_agreement',
      type: 'yes_no',
      prompt: 'Do you have the purchase agreement or contract?',
    },
    {
      id: 'agreement_info',
      type: 'info',
      prompt:
        'The purchase agreement is the most important document. Check your email, realtor\'s records, or title company files.',
      showIf: (answers) => answers.has_purchase_agreement === 'no',
    },
    {
      id: 'has_title_report',
      type: 'yes_no',
      prompt: 'Do you have a title report or title insurance policy?',
    },
    {
      id: 'title_info',
      type: 'info',
      prompt:
        'Contact your title company or closing attorney to obtain a copy.',
      showIf: (answers) => answers.has_title_report === 'no',
    },
    {
      id: 'has_inspection_report',
      type: 'yes_no',
      prompt: 'Do you have a property inspection report?',
    },
    {
      id: 'has_closing_docs',
      type: 'yes_no',
      prompt: 'Do you have closing documents (HUD-1 or settlement statement)?',
    },
    {
      id: 'has_appraisal',
      type: 'yes_no',
      prompt: 'Do you have a property appraisal?',
    },
    {
      id: 'has_communications',
      type: 'yes_no',
      prompt:
        'Do you have emails, texts, or letters with the other party or their agent?',
    },
    {
      id: 'has_photos',
      type: 'yes_no',
      prompt: 'Do you have photos or videos of the property or defects?',
    },
    {
      id: 'has_financial_records',
      type: 'yes_no',
      prompt:
        'Do you have financial records (mortgage docs, payment receipts, earnest money receipt)?',
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
        'Create folders for: Purchase Agreement, Title Documents, Inspection Reports, Closing Documents, Communications, Photos/Videos, Financial Records. Label files clearly with dates.',
      showIf: (answers) => answers.evidence_organized === 'no',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.has_purchase_agreement === 'yes') {
      items.push({ status: 'done', text: 'Purchase agreement collected.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Locate the purchase agreement or contract.',
      })
    }

    if (answers.has_title_report === 'yes') {
      items.push({ status: 'done', text: 'Title report or title insurance policy collected.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Obtain title report or title insurance policy from your title company.',
      })
    }

    if (answers.has_inspection_report === 'yes') {
      items.push({ status: 'done', text: 'Property inspection report collected.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Locate the property inspection report.',
      })
    }

    if (answers.has_closing_docs === 'yes') {
      items.push({ status: 'done', text: 'Closing documents collected.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Obtain closing documents (HUD-1 or settlement statement).',
      })
    }

    if (answers.has_appraisal === 'yes') {
      items.push({ status: 'done', text: 'Property appraisal collected.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Obtain a property appraisal if available.',
      })
    }

    if (answers.has_communications === 'yes') {
      items.push({ status: 'done', text: 'Communications with other party collected.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Save all emails, texts, and letters with the other party or their agent.',
      })
    }

    if (answers.has_photos === 'yes') {
      items.push({ status: 'done', text: 'Photos and videos collected.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Gather photos or videos of the property or defects.',
      })
    }

    if (answers.has_financial_records === 'yes') {
      items.push({ status: 'done', text: 'Financial records collected.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Gather mortgage documents, payment receipts, and earnest money records.',
      })
    }

    if (answers.evidence_organized === 'yes') {
      items.push({ status: 'done', text: 'Evidence organized into categories.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Organize evidence into folders: Purchase Agreement, Title Documents, Inspection Reports, Closing Documents, Communications, Photos/Videos, Financial Records.',
      })
    }

    return items
  },
}
