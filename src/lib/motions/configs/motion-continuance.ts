import { z } from 'zod'
import { partySchema } from '@/lib/schemas/filing'
import type { FieldConfig, MotionConfig } from '@/lib/motions/types'

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

export const continuanceFactsSchema = z.object({
  your_info: partySchema,
  opposing_parties: z.array(partySchema).min(1),
  court_type: z.enum(['jp', 'county', 'district', 'federal']),
  county: z.string().min(1),
  cause_number: z.string().optional(),
  hearing_or_trial_date: z.string().min(1),
  event_type: z.enum(['hearing', 'trial']),
  reason: z.enum([
    'medical',
    'scheduling_conflict',
    'need_more_time',
    'witness_unavailable',
    'settlement_negotiations',
    'attorney_withdrawal',
    'other',
  ]),
  explanation: z.string().min(10),
  proposed_new_date: z.string().optional(),
  opposing_position: z.enum(['agrees', 'opposes', 'unknown']),
  previous_continuances: z.number().int().min(0).default(0),
})

export type ContinuanceFacts = z.infer<typeof continuanceFactsSchema>

// ---------------------------------------------------------------------------
// Prompt builder
// ---------------------------------------------------------------------------

interface Prompt {
  system: string
  user: string
}

function courtLabel(
  courtType: ContinuanceFacts['court_type'],
  county: string
): string {
  switch (courtType) {
    case 'jp':
      return 'Justice Court'
    case 'county':
      return 'County Court'
    case 'district':
      return `District Court of ${county} County, Texas`
    case 'federal':
      return 'United States District Court'
  }
}

export function buildContinuancePrompt(facts: ContinuanceFacts): Prompt {
  const system = `You are a legal document formatting assistant. You help self-represented (pro se) litigants format their court filings.

DRAFT — NOT LEGAL ADVICE

IMPORTANT RULES:
- You format documents. You do NOT provide legal advice.
- Use only the facts provided. Do not invent or assume additional facts.
- Do not predict outcomes or make strategic recommendations.
- Use plain, clear language appropriate for a pro se filer.

DOCUMENT FORMAT:
Generate a Motion for Continuance containing the following sections:
1. Caption
2. Introduction
3. Background
4. Grounds for Continuance
5. No Prejudice to Opposing Party
6. Proposed New Date
7. Opposing Party's Position
8. Signature block marked "Pro Se"`

  const parties = [
    `Filing party: ${facts.your_info.full_name}`,
    facts.your_info.address
      ? `Address: ${facts.your_info.address}, ${facts.your_info.city ?? ''}, ${facts.your_info.state ?? ''} ${facts.your_info.zip ?? ''}`
      : null,
    ...facts.opposing_parties.map(
      (p, i) =>
        `Opposing party ${i + 1}: ${p.full_name}${p.address ? `, ${p.address}` : ''}`
    ),
  ]
    .filter(Boolean)
    .join('\n')

  const user = [
    '--- PARTIES ---',
    parties,
    '',
    '--- COURT ---',
    `Court: ${courtLabel(facts.court_type, facts.county)}`,
    `County: ${facts.county}`,
    facts.cause_number ? `Cause number: ${facts.cause_number}` : null,
    '',
    '--- EVENT ---',
    `Event type: ${facts.event_type}`,
    `Current date: ${facts.hearing_or_trial_date}`,
    '',
    '--- REASON ---',
    `Reason: ${facts.reason}`,
    `Explanation: ${facts.explanation}`,
    '',
    facts.proposed_new_date ? `Proposed new date: ${facts.proposed_new_date}` : null,
    facts.proposed_new_date ? '' : null,
    '--- CONTEXT ---',
    `Opposing party position: ${facts.opposing_position}`,
    `Previous continuances: ${facts.previous_continuances}`,
  ]
    .filter((s) => s !== null)
    .join('\n')

  return { system, user }
}

// ---------------------------------------------------------------------------
// Field configuration (3 sections)
// ---------------------------------------------------------------------------

const fields: FieldConfig[] = [
  // Section 0: Court & Event
  {
    key: 'court_type',
    type: 'select',
    label: 'Court Type',
    required: true,
    section: 0,
    sectionTitle: 'Court & Event',
    options: [
      { label: 'Justice Court', value: 'jp' },
      { label: 'County Court', value: 'county' },
      { label: 'District Court', value: 'district' },
      { label: 'Federal Court', value: 'federal' },
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
  {
    key: 'cause_number',
    type: 'text',
    label: 'Cause Number',
    placeholder: 'e.g. 2026-CI-01234',
    helperText: 'Leave blank if not yet assigned.',
    section: 0,
  },
  {
    key: 'hearing_or_trial_date',
    type: 'date',
    label: 'Current Hearing/Trial Date',
    required: true,
    section: 0,
  },
  {
    key: 'event_type',
    type: 'select',
    label: 'Event Type',
    required: true,
    section: 0,
    options: [
      { label: 'Hearing', value: 'hearing' },
      { label: 'Trial', value: 'trial' },
    ],
  },

  // Section 1: Reason
  {
    key: 'reason',
    type: 'select',
    label: 'Reason for Continuance',
    required: true,
    section: 1,
    sectionTitle: 'Reason',
    options: [
      { label: 'Medical Issue', value: 'medical' },
      { label: 'Scheduling Conflict', value: 'scheduling_conflict' },
      { label: 'Need More Preparation Time', value: 'need_more_time' },
      { label: 'Witness Unavailable', value: 'witness_unavailable' },
      { label: 'Settlement Negotiations', value: 'settlement_negotiations' },
      { label: 'Attorney Withdrawal', value: 'attorney_withdrawal' },
      { label: 'Other', value: 'other' },
    ],
  },
  {
    key: 'explanation',
    type: 'textarea',
    label: 'Explanation',
    placeholder:
      'Provide details about why you need a continuance.',
    helperText:
      'Be specific about the circumstances and why the current date does not work.',
    required: true,
    section: 1,
  },
  {
    key: 'proposed_new_date',
    type: 'date',
    label: 'Proposed New Date (optional)',
    helperText:
      'Suggest a new date if you have one in mind. Leave blank if flexible.',
    section: 1,
  },

  // Section 2: Context
  {
    key: 'opposing_position',
    type: 'select',
    label: "Opposing Party's Position",
    required: true,
    section: 2,
    sectionTitle: 'Context',
    options: [
      { label: 'Agrees to Continuance', value: 'agrees' },
      { label: 'Opposes Continuance', value: 'opposes' },
      { label: 'Unknown / Not Yet Asked', value: 'unknown' },
    ],
  },
  {
    key: 'previous_continuances',
    type: 'number',
    label: 'Previous Continuances',
    placeholder: '0',
    helperText:
      'How many times has this hearing/trial already been continued?',
    section: 2,
  },
]

// ---------------------------------------------------------------------------
// Config export
// ---------------------------------------------------------------------------

export const continuanceConfig: MotionConfig = {
  key: 'motion_continuance',
  title: 'Motion for Continuance',
  description:
    'Request to postpone a scheduled hearing or trial date due to valid circumstances such as scheduling conflicts, medical issues, or the need for additional preparation time.',
  reassurance:
    'Courts regularly grant continuances for good cause. This is a normal part of litigation, not a sign of weakness.',
  category: 'pretrial',
  fields,
  schema: continuanceFactsSchema,
  buildPrompt: buildContinuancePrompt,
  documentType: 'motion_continuance',
  taskKey: 'motion_continuance',
}
