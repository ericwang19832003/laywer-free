import { z } from 'zod'
import { partySchema } from '@lawyer-free/shared/schemas/filing'
import type { FieldConfig, MotionConfig } from '../types'

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

export const motionToCompelFactsSchema = z.object({
  your_info: partySchema,
  opposing_parties: z.array(partySchema).min(1),
  court_type: z.enum(['jp', 'county', 'district', 'federal']),
  county: z.string().min(1),
  cause_number: z.string().optional(),
  discovery_type: z.enum([
    'interrogatories',
    'requests_for_production',
    'requests_for_admission',
    'deposition',
    'combined',
  ]),
  date_served: z.string().min(1),
  response_deadline: z.string().min(1),
  deficiency_description: z.string().min(10),
  good_faith_conference_date: z.string().min(1),
  good_faith_outcome: z.string().min(10),
  specific_requests_at_issue: z.string().min(10),
  relief_requested: z.string().optional(),
})

export type MotionToCompelFacts = z.infer<typeof motionToCompelFactsSchema>

// ---------------------------------------------------------------------------
// Prompt builder
// ---------------------------------------------------------------------------

interface Prompt {
  system: string
  user: string
}

function courtLabel(
  courtType: MotionToCompelFacts['court_type'],
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

export function buildMotionToCompelPrompt(facts: MotionToCompelFacts): Prompt {
  const system = `You are a legal document formatting assistant. You help self-represented (pro se) litigants format their court filings.

DRAFT — NOT LEGAL ADVICE

IMPORTANT RULES:
- You format documents. You do NOT provide legal advice.
- Use only the facts provided. Do not invent or assume additional facts.
- Do not predict outcomes or make strategic recommendations.
- Use plain, clear language appropriate for a pro se filer.

DOCUMENT FORMAT:
Generate a Motion to Compel Discovery containing the following sections:
1. Caption
2. Introduction
3. Background (discovery served, deficient or missing response)
4. Good Faith Conference
5. Argument (relevance and proportionality of requested discovery)
6. Prayer for Relief
7. Certificate of Conference
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
    '--- DISCOVERY ---',
    `Discovery type: ${facts.discovery_type}`,
    `Date served: ${facts.date_served}`,
    `Response deadline: ${facts.response_deadline}`,
    `Deficiency: ${facts.deficiency_description}`,
    `Specific requests at issue: ${facts.specific_requests_at_issue}`,
    '',
    '--- GOOD FAITH CONFERENCE ---',
    `Conference date: ${facts.good_faith_conference_date}`,
    `Outcome: ${facts.good_faith_outcome}`,
    '',
    facts.relief_requested ? '--- RELIEF ---' : null,
    facts.relief_requested
      ? `Additional relief: ${facts.relief_requested}`
      : null,
  ]
    .filter((s) => s !== null)
    .join('\n')

  return { system, user }
}

// ---------------------------------------------------------------------------
// Field configuration (4 sections)
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

  // Section 1: Discovery Details
  {
    key: 'discovery_type',
    type: 'select',
    label: 'Type of Discovery',
    required: true,
    section: 1,
    sectionTitle: 'Discovery Details',
    options: [
      { label: 'Interrogatories', value: 'interrogatories' },
      { label: 'Requests for Production', value: 'requests_for_production' },
      { label: 'Requests for Admission', value: 'requests_for_admission' },
      { label: 'Deposition', value: 'deposition' },
      { label: 'Combined', value: 'combined' },
    ],
  },
  {
    key: 'date_served',
    type: 'date',
    label: 'Date Discovery Was Served',
    required: true,
    section: 1,
  },
  {
    key: 'response_deadline',
    type: 'date',
    label: 'Response Deadline',
    required: true,
    section: 1,
  },
  {
    key: 'deficiency_description',
    type: 'textarea',
    label: 'What went wrong with their response?',
    placeholder:
      'Describe how the opposing party failed to respond or provided an inadequate response.',
    helperText: 'Be specific about what was missing or deficient.',
    required: true,
    section: 1,
  },
  {
    key: 'specific_requests_at_issue',
    type: 'textarea',
    label: 'Which specific requests are at issue?',
    placeholder:
      'e.g. Interrogatories 1 through 15 regarding contract terms and performance history.',
    required: true,
    section: 1,
  },

  // Section 2: Good Faith Conference
  {
    key: 'good_faith_conference_date',
    type: 'date',
    label: 'Conference Date',
    helperText:
      'Texas rules require you to try to resolve the dispute before filing. When did you confer (or attempt to confer) with the opposing party?',
    required: true,
    section: 2,
    sectionTitle: 'Good Faith Conference',
  },
  {
    key: 'good_faith_outcome',
    type: 'textarea',
    label: 'What happened?',
    placeholder:
      'Describe the outcome of your good faith conference or attempt to confer.',
    required: true,
    section: 2,
  },

  // Section 3: Relief Requested
  {
    key: 'relief_requested',
    type: 'textarea',
    label: 'Additional Relief (optional)',
    placeholder:
      'e.g. Request sanctions for discovery abuse, request attorney fees, etc.',
    helperText:
      'The motion will automatically request that the court compel responses. Use this field for any additional relief.',
    section: 3,
    sectionTitle: 'Relief Requested',
  },
]

// ---------------------------------------------------------------------------
// Config export
// ---------------------------------------------------------------------------

export const motionToCompelConfig: MotionConfig = {
  key: 'motion_to_compel',
  title: 'Motion to Compel Discovery',
  description:
    'Force the opposing party to respond to your discovery requests when they have failed to respond or provided inadequate responses.',
  reassurance:
    "Discovery is how you gather evidence. If the other side isn't cooperating, this motion asks the court to order them to respond. It's a standard procedural tool.",
  category: 'discovery',
  fields,
  schema: motionToCompelFactsSchema,
  buildPrompt: buildMotionToCompelPrompt,
  documentType: 'motion_to_compel',
  taskKey: 'motion_to_compel',
}
