import type { GuidedStepConfig, QuestionDef } from '../types'

type EvidenceSubType = 'divorce' | 'custody' | 'child_support' | 'visitation' | 'spousal_support' | 'modification'

const EVIDENCE_QUESTIONS: Record<EvidenceSubType, QuestionDef[]> = {
  divorce: [
    { id: 'financial_docs', type: 'yes_no', prompt: 'Have you gathered financial documents (tax returns, bank statements, pay stubs)?' },
    { id: 'property_docs', type: 'yes_no', prompt: 'Do you have property records (deeds, titles, mortgage statements)?' },
    { id: 'debt_docs', type: 'yes_no', prompt: 'Have you documented debts and liabilities?' },
  ],
  custody: [
    { id: 'school_records', type: 'yes_no', prompt: 'Do you have the children\'s school records?' },
    { id: 'medical_records', type: 'yes_no', prompt: 'Do you have the children\'s medical records?' },
    { id: 'involvement_evidence', type: 'yes_no', prompt: 'Do you have evidence of your parenting involvement (photos, activity records)?' },
  ],
  child_support: [
    { id: 'income_docs', type: 'yes_no', prompt: 'Have you gathered income documentation (pay stubs, tax returns)?' },
    { id: 'expense_docs', type: 'yes_no', prompt: 'Have you documented the children\'s expenses (childcare, medical, activities)?' },
    { id: 'other_income', type: 'yes_no', prompt: 'Have you documented any other income sources for either parent?' },
  ],
  visitation: [
    { id: 'relationship_evidence', type: 'yes_no', prompt: 'Do you have photos or records showing your relationship with the children?' },
    { id: 'communication_records', type: 'yes_no', prompt: 'Do you have records of communication about visitation?' },
  ],
  spousal_support: [
    { id: 'income_docs', type: 'yes_no', prompt: 'Have you gathered income documentation for both spouses?' },
    { id: 'expense_docs', type: 'yes_no', prompt: 'Have you documented monthly living expenses?' },
    { id: 'employment_history', type: 'yes_no', prompt: 'Do you have education and employment history documentation?' },
  ],
  modification: [
    { id: 'existing_order', type: 'yes_no', prompt: 'Do you have a copy of the existing court order?' },
    { id: 'change_evidence', type: 'yes_no', prompt: 'Have you gathered evidence of the changed circumstances?' },
    { id: 'updated_financials', type: 'yes_no', prompt: 'Do you have updated financial information (if modifying support)?' },
  ],
}

export function createEvidenceVaultConfig(subType: EvidenceSubType): GuidedStepConfig {
  const subTypeQuestions = EVIDENCE_QUESTIONS[subType]

  return {
    title: 'Organize Your Evidence',
    reassurance: 'Well-organized evidence strengthens your case at every stage. Upload what you have now — you can always add more later.',
    questions: [
      { id: 'general_docs', type: 'yes_no', prompt: 'Do you have any written communications with the other party (texts, emails)?' },
      ...subTypeQuestions,
    ],
    generateSummary(answers) {
      const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

      if (answers.general_docs === 'yes') {
        items.push({ status: 'done', text: 'Written communications gathered.' })
      } else if (answers.general_docs === 'no') {
        items.push({ status: 'needed', text: 'Gather written communications with the other party.' })
      }

      for (const q of subTypeQuestions) {
        if (answers[q.id] === 'yes') {
          items.push({ status: 'done', text: `${q.prompt.replace(/\?$/, '')} — done.` })
        } else if (answers[q.id] === 'no') {
          items.push({ status: 'needed', text: `${q.prompt.replace(/\?$/, '')} — still needed.` })
        }
      }

      items.push({ status: 'info', text: 'You can upload additional evidence at any time from the Evidence Vault.' })
      return items
    },
  }
}
