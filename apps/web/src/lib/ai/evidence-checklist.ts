import { z } from 'zod'

const BLOCKED_PHRASES = Object.freeze([
  'you must', 'you should', 'file immediately', 'urgent',
  'sanctions', 'legal advice', 'guaranteed', 'this guarantees',
])

export const checklistSchema = z.object({
  items: z.array(z.object({
    label: z.string(),
    category: z.enum([
      'contract', 'photos', 'emails', 'text_messages',
      'financial_records', 'medical_records', 'other',
    ]),
  })).min(1),
})

export type ChecklistResponse = z.infer<typeof checklistSchema>

export function isChecklistSafe(text: string): boolean {
  const lower = text.toLowerCase()
  return !BLOCKED_PHRASES.some((phrase) => lower.includes(phrase))
}

export function buildChecklistPrompt(input: {
  dispute_type: string
  state: string
  role: string
  existing_categories?: string[]
}): string {
  const lines = [
    `Dispute type: ${input.dispute_type}`,
    `State: ${input.state}`,
    `Role: ${input.role}`,
  ]
  if (input.existing_categories && input.existing_categories.length > 0) {
    lines.push(`Already collected categories: ${input.existing_categories.join(', ')}`)
  }
  return lines.join('\n')
}

type ChecklistItem = { label: string; category: ChecklistResponse['items'][number]['category'] }

export function buildStaticChecklist(input: {
  dispute_type: string
}): ChecklistResponse {
  const type = input.dispute_type.toLowerCase()

  const checklists: Record<string, ChecklistItem[]> = {
    debt: [
      { label: 'Original contract or agreement', category: 'contract' },
      { label: 'Payment history and records', category: 'financial_records' },
      { label: 'Collection letters received', category: 'emails' },
      { label: 'Communication with creditor', category: 'emails' },
      { label: 'Credit report showing the debt', category: 'financial_records' },
      { label: 'Dispute letters sent', category: 'emails' },
    ],
    small_claims: [
      { label: 'Contract or written agreement', category: 'contract' },
      { label: 'Receipts and proof of payment', category: 'financial_records' },
      { label: 'Photos of damage or issue', category: 'photos' },
      { label: 'Text messages or emails with other party', category: 'text_messages' },
      { label: 'Repair estimates or invoices', category: 'financial_records' },
    ],
    personal_injury: [
      { label: 'Medical records and bills', category: 'medical_records' },
      { label: 'Photos of injuries', category: 'photos' },
      { label: 'Police report', category: 'other' },
      { label: 'Insurance correspondence', category: 'emails' },
      { label: 'Pay stubs showing lost wages', category: 'financial_records' },
      { label: 'Witness contact information', category: 'other' },
      { label: 'Prescriptions and pharmacy records', category: 'medical_records' },
    ],
    family: [
      { label: 'Marriage certificate', category: 'contract' },
      { label: 'Financial statements and bank records', category: 'financial_records' },
      { label: 'Tax returns', category: 'financial_records' },
      { label: 'Pay stubs and income verification', category: 'financial_records' },
      { label: 'Property deeds and titles', category: 'contract' },
      { label: 'Communication regarding children', category: 'text_messages' },
    ],
    landlord_tenant: [
      { label: 'Lease agreement', category: 'contract' },
      { label: 'Rent payment receipts', category: 'financial_records' },
      { label: 'Photos of property condition', category: 'photos' },
      { label: 'Communication with landlord', category: 'emails' },
      { label: 'Repair requests submitted', category: 'emails' },
      { label: 'Security deposit documentation', category: 'financial_records' },
    ],
  }

  const items = checklists[type] ?? [
    { label: 'Relevant contracts or agreements', category: 'contract' as const },
    { label: 'Communication records', category: 'emails' as const },
    { label: 'Financial documents', category: 'financial_records' as const },
    { label: 'Photos or other supporting evidence', category: 'photos' as const },
  ]

  return { items }
}

export const EVIDENCE_CHECKLIST_SYSTEM_PROMPT = `You generate an evidence collection checklist for a pro se litigant preparing their case.

Given a dispute type, state, and the litigant's role, suggest a prioritized list of evidence items they should try to gather.

Each item should have a short label and a category from: contract, photos, emails, text_messages, financial_records, medical_records, other.

RULES:
- Never give legal advice
- Never use directive language ("you must", "you should")
- Focus on commonly relevant evidence for the dispute type
- Keep labels concise and clear
- Suggest 4-8 items

Respond with JSON only: { "items": [{ "label": "...", "category": "..." }] }`
