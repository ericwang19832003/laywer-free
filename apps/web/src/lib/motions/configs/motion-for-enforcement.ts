import { z } from 'zod'
import { partySchema } from '@lawyer-free/shared/schemas/filing'
import type { FieldConfig, MotionConfig } from '@/lib/motions/types'

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

export const motionForEnforcementFactsSchema = z.object({
  your_info: partySchema,
  opposing_parties: z.array(partySchema).min(1),
  court_type: z.literal('district'),
  county: z.string().min(1),
  order_being_violated: z.string().min(1),
  order_date: z.string().min(1),
  specific_violations: z.string().min(20),
  dates_of_violations: z.string().min(1),
  relief_requested: z.array(
    z.enum(['contempt', 'make_up_time', 'attorney_fees', 'jail_time', 'fine'])
  ).min(1),
  additional_details: z.string().optional(),
})

export type MotionForEnforcementFacts = z.infer<typeof motionForEnforcementFactsSchema>

// ---------------------------------------------------------------------------
// Prompt builder
// ---------------------------------------------------------------------------

interface Prompt {
  system: string
  user: string
}

export function buildMotionForEnforcementPrompt(facts: MotionForEnforcementFacts): Prompt {
  const system = `You are a legal document formatting assistant. You help self-represented (pro se) litigants format their court filings.

DRAFT — NOT LEGAL ADVICE

IMPORTANT RULES:
- You format documents. You do NOT provide legal advice.
- Use only the facts provided. Do not invent or assume additional facts.
- Do not predict outcomes or make strategic recommendations.
- Use plain, clear language appropriate for a pro se filer.
- Use "Petitioner" and "Respondent" terminology (NOT "Plaintiff" and "Defendant").
- Reference Texas Family Code Chapter 157 (Enforcement of Court Orders).

DOCUMENT FORMAT:
Generate a Motion for Enforcement containing the following sections:
1. Caption (styled for District Court, family law)
2. Introduction
3. Existing Order Details
4. Specific Violations (each violation listed with dates)
5. Respondent's Ability to Comply
6. Requested Relief (itemized)
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

  const reliefLabels: Record<string, string> = {
    contempt: 'Finding of contempt',
    make_up_time: 'Make-up possession/visitation time',
    attorney_fees: 'Attorney fees and court costs',
    jail_time: 'Confinement (jail time)',
    fine: 'Fine',
  }

  const reliefList = facts.relief_requested
    .map((r) => `  - ${reliefLabels[r]}`)
    .join('\n')

  const user = [
    '--- PARTIES ---',
    parties,
    '',
    '--- COURT ---',
    `Court: District Court of ${facts.county} County, Texas`,
    `County: ${facts.county}`,
    '',
    '--- ORDER BEING VIOLATED ---',
    `Order: ${facts.order_being_violated}`,
    `Order date: ${facts.order_date}`,
    '',
    '--- VIOLATIONS ---',
    `Specific violations: ${facts.specific_violations}`,
    `Dates of violations: ${facts.dates_of_violations}`,
    '',
    '--- RELIEF REQUESTED ---',
    reliefList,
    '',
    facts.additional_details ? '--- ADDITIONAL DETAILS ---' : null,
    facts.additional_details
      ? `Additional details: ${facts.additional_details}`
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

  // Section 1: Order Details
  {
    key: 'order_being_violated',
    type: 'text',
    label: 'Description of the Order Being Violated',
    placeholder: 'e.g. Final Decree of Divorce, Cause No. 2024-FA-56789',
    helperText: 'Identify the specific court order that is being violated.',
    required: true,
    section: 1,
    sectionTitle: 'Order Details',
  },
  {
    key: 'order_date',
    type: 'date',
    label: 'Date of the Order',
    required: true,
    section: 1,
  },

  // Section 2: Violations & Relief
  {
    key: 'specific_violations',
    type: 'textarea',
    label: 'Specific Violations',
    placeholder:
      'Describe each violation in detail. For example: "Respondent failed to return the children on Sunday at 6:00 PM as ordered" or "Respondent has not paid child support since January 2026."',
    helperText:
      'List each separate violation. Be specific about what the order required and how the Respondent failed to comply.',
    required: true,
    section: 2,
    sectionTitle: 'Violations & Relief',
  },
  {
    key: 'dates_of_violations',
    type: 'textarea',
    label: 'Dates of Each Violation',
    placeholder:
      'e.g. January 5, 2026 — failed to return children; February 1, 2026 — missed child support payment',
    helperText:
      'List the specific date(s) of each violation. Texas law requires you to identify each instance.',
    required: true,
    section: 2,
  },
  {
    key: 'relief_requested',
    type: 'checkbox',
    label: 'Relief Requested',
    helperText: 'Select all remedies you are asking the court to impose.',
    required: true,
    section: 2,
    options: [
      { label: 'Finding of Contempt', value: 'contempt' },
      { label: 'Make-Up Possession / Visitation Time', value: 'make_up_time' },
      { label: 'Attorney Fees and Court Costs', value: 'attorney_fees' },
      { label: 'Jail Time (Confinement)', value: 'jail_time' },
      { label: 'Fine', value: 'fine' },
    ],
  },
  {
    key: 'additional_details',
    type: 'textarea',
    label: 'Additional Details (optional)',
    placeholder:
      'Any other information the court should know, such as previous enforcement actions or the impact of violations on the children.',
    section: 2,
  },
]

// ---------------------------------------------------------------------------
// Config export
// ---------------------------------------------------------------------------

export const motionForEnforcementConfig: MotionConfig = {
  key: 'motion_for_enforcement',
  title: 'Motion for Enforcement',
  description:
    'Ask the court to enforce an existing order that the other party is violating.',
  reassurance:
    "If the other side isn't following the court order, the court can hold them in contempt and impose penalties. You have the right to enforce your order.",
  category: 'family',
  fields,
  schema: motionForEnforcementFactsSchema,
  buildPrompt: buildMotionForEnforcementPrompt,
  documentType: 'motion_for_enforcement',
  taskKey: 'motion_for_enforcement',
}
