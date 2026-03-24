import { z } from 'zod'
import { partySchema } from '@lawyer-free/shared/schemas/filing'
import type { FieldConfig, MotionConfig } from '../types'

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

export const motionToModifyFactsSchema = z.object({
  your_info: partySchema,
  opposing_parties: z.array(partySchema).min(1),
  court_type: z.literal('district'),
  county: z.string().min(1),
  existing_order_court: z.string().min(1),
  existing_order_cause_number: z.string().min(1),
  existing_order_date: z.string().min(1),
  what_to_modify: z.array(
    z.enum(['custody', 'visitation', 'child_support', 'spousal_support'])
  ).min(1),
  material_change_description: z.string().min(20),
  proposed_changes: z.string().min(10),
  best_interest_reasoning: z.string().optional(),
})

export type MotionToModifyFacts = z.infer<typeof motionToModifyFactsSchema>

// ---------------------------------------------------------------------------
// Prompt builder
// ---------------------------------------------------------------------------

interface Prompt {
  system: string
  user: string
}

export function buildMotionToModifyPrompt(facts: MotionToModifyFacts): Prompt {
  const system = `You are a legal document formatting assistant. You help self-represented (pro se) litigants format their court filings.

DRAFT — NOT LEGAL ADVICE

IMPORTANT RULES:
- You format documents. You do NOT provide legal advice.
- Use only the facts provided. Do not invent or assume additional facts.
- Do not predict outcomes or make strategic recommendations.
- Use plain, clear language appropriate for a pro se filer.
- Use "Petitioner" and "Respondent" terminology (NOT "Plaintiff" and "Defendant").
- Reference Texas Family Code Chapter 156 (Modification of Existing Orders).

DOCUMENT FORMAT:
Generate a Petition to Modify Existing Order containing the following sections:
1. Caption (styled for District Court, family law)
2. Introduction
3. Existing Order Details (court, cause number, date)
4. Material and Substantial Change in Circumstances
5. Proposed Modifications (itemized by type)
6. Best Interest of the Child (if applicable)
7. Prayer for Relief
8. Verification
9. Signature block marked "Pro Se"`

  const parties = [
    `Petitioner: ${facts.your_info.full_name}`,
    facts.your_info.address
      ? `Address: ${facts.your_info.address}, ${facts.your_info.city ?? ''}, ${facts.your_info.state ?? ''} ${facts.your_info.zip ?? ''}`
      : null,
    ...facts.opposing_parties.map(
      (p, i) =>
        `Respondent ${facts.opposing_parties.length > 1 ? i + 1 : ''}: ${p.full_name}${p.address ? `, ${p.address}` : ''}`
    ),
  ]
    .filter(Boolean)
    .join('\n')

  const modifyLabels: Record<string, string> = {
    custody: 'Custody / Conservatorship',
    visitation: 'Visitation / Possession Schedule',
    child_support: 'Child Support',
    spousal_support: 'Spousal Support / Maintenance',
  }

  const modificationsRequested = facts.what_to_modify
    .map((m) => `  - ${modifyLabels[m]}`)
    .join('\n')

  const user = [
    '--- PARTIES ---',
    parties,
    '',
    '--- COURT ---',
    `Court: District Court of ${facts.county} County, Texas`,
    `County: ${facts.county}`,
    '',
    '--- EXISTING ORDER ---',
    `Court that issued existing order: ${facts.existing_order_court}`,
    `Cause number: ${facts.existing_order_cause_number}`,
    `Date of existing order: ${facts.existing_order_date}`,
    '',
    '--- WHAT TO MODIFY ---',
    modificationsRequested,
    '',
    '--- MATERIAL CHANGE ---',
    `Description of material and substantial change: ${facts.material_change_description}`,
    '',
    '--- PROPOSED CHANGES ---',
    `Proposed changes: ${facts.proposed_changes}`,
    '',
    facts.best_interest_reasoning
      ? '--- BEST INTEREST ---'
      : null,
    facts.best_interest_reasoning
      ? `Best interest reasoning: ${facts.best_interest_reasoning}`
      : null,
  ]
    .filter((s) => s !== null)
    .join('\n')

  return { system, user }
}

// ---------------------------------------------------------------------------
// Field configuration (3 sections)
// ---------------------------------------------------------------------------

const fields: FieldConfig[] = [
  // Section 0: Court Info
  {
    key: 'court_type',
    type: 'select',
    label: 'Court Type',
    required: true,
    section: 0,
    sectionTitle: 'Court Info',
    options: [
      { label: 'District Court', value: 'district' },
    ],
  },
  {
    key: 'county',
    type: 'text',
    label: 'County',
    placeholder: 'e.g. Harris',
    required: true,
    section: 0,
  },

  // Section 1: Existing Order
  {
    key: 'existing_order_court',
    type: 'text',
    label: 'Court That Issued the Existing Order',
    placeholder: 'e.g. 310th District Court of Harris County',
    required: true,
    section: 1,
    sectionTitle: 'Existing Order',
  },
  {
    key: 'existing_order_cause_number',
    type: 'text',
    label: 'Existing Order Cause Number',
    placeholder: 'e.g. 2024-FA-56789',
    required: true,
    section: 1,
  },
  {
    key: 'existing_order_date',
    type: 'date',
    label: 'Date of Existing Order',
    required: true,
    section: 1,
  },
  {
    key: 'what_to_modify',
    type: 'checkbox',
    label: 'What Do You Want to Modify?',
    helperText: 'Select all areas of the existing order you want to change.',
    required: true,
    section: 1,
    options: [
      { label: 'Custody / Conservatorship', value: 'custody' },
      { label: 'Visitation / Possession Schedule', value: 'visitation' },
      { label: 'Child Support', value: 'child_support' },
      { label: 'Spousal Support / Maintenance', value: 'spousal_support' },
    ],
  },

  // Section 2: Requested Changes
  {
    key: 'material_change_description',
    type: 'textarea',
    label: 'Material and Substantial Change in Circumstances',
    placeholder:
      'Describe what has changed since the existing order was entered. Examples: job loss, relocation, change in child\'s needs, remarriage, safety concerns.',
    helperText:
      'Texas law requires you to show a material and substantial change since the last order. Be specific about what changed and when.',
    required: true,
    section: 2,
    sectionTitle: 'Requested Changes',
  },
  {
    key: 'proposed_changes',
    type: 'textarea',
    label: 'Proposed Changes',
    placeholder:
      'Describe specifically what you want the court to change. For example: "Change primary custody to Petitioner" or "Reduce child support from $1,500 to $1,000/month."',
    required: true,
    section: 2,
  },
  {
    key: 'best_interest_reasoning',
    type: 'textarea',
    label: 'Best Interest of the Child (optional)',
    placeholder:
      'Explain why the proposed changes are in the best interest of the child. Consider the child\'s emotional and physical needs, stability, and safety.',
    helperText:
      'For custody and visitation modifications, courts consider the best interest of the child as the primary factor.',
    section: 2,
  },
]

// ---------------------------------------------------------------------------
// Config export
// ---------------------------------------------------------------------------

export const motionToModifyConfig: MotionConfig = {
  key: 'motion_to_modify',
  title: 'Petition to Modify Existing Order',
  description:
    'Change an existing court order for custody, visitation, child support, or spousal support.',
  reassurance:
    "Life changes, and court orders can be updated. You'll need to show a significant change in circumstances since the last order.",
  category: 'family',
  fields,
  schema: motionToModifyFactsSchema,
  buildPrompt: buildMotionToModifyPrompt,
  documentType: 'motion_to_modify',
  taskKey: 'motion_to_modify',
}
