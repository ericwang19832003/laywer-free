import { z } from 'zod'
import { partySchema } from '@/lib/schemas/filing'
import type { FieldConfig, MotionConfig } from '@/lib/motions/types'

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

export const noticeOfAppealFactsSchema = z.object({
  your_info: partySchema,
  opposing_parties: z.array(partySchema).min(1),
  court_type: z.enum(['jp', 'county', 'district', 'federal']),
  county: z.string().min(1),
  cause_number: z.string().optional(),
  judgment_date: z.string().min(1),
  judgment_description: z.string().min(10),
  appeal_grounds: z
    .array(
      z.enum([
        'legal_error',
        'insufficient_evidence',
        'procedural_error',
        'abuse_of_discretion',
        'constitutional_violation',
        'other',
      ])
    )
    .min(1),
  appellate_court: z.string().min(1),
})

export type NoticeOfAppealFacts = z.infer<typeof noticeOfAppealFactsSchema>

// ---------------------------------------------------------------------------
// Prompt builder
// ---------------------------------------------------------------------------

interface Prompt {
  system: string
  user: string
}

function courtLabel(
  courtType: NoticeOfAppealFacts['court_type'],
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

export function buildNoticeOfAppealPrompt(facts: NoticeOfAppealFacts): Prompt {
  const system = `You are a legal document formatting assistant. You help self-represented (pro se) litigants format their court filings.

DRAFT — NOT LEGAL ADVICE

IMPORTANT RULES:
- You format documents. You do NOT provide legal advice.
- Use only the facts provided. Do not invent or assume additional facts.
- Do not predict outcomes or make strategic recommendations.
- Use plain, clear language appropriate for a pro se filer.

DOCUMENT FORMAT:
Generate a Notice of Appeal containing the following sections:
1. Caption (trial court)
2. Notice paragraph (appellant gives notice of appeal to the appellate court)
3. Judgment Appealed (date and description)
4. Grounds for Appeal
5. Signature block marked "Pro Se"

This is a SHORT document — typically 1-2 pages.`

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
    '--- TRIAL COURT ---',
    `Court: ${courtLabel(facts.court_type, facts.county)}`,
    `County: ${facts.county}`,
    facts.cause_number ? `Cause number: ${facts.cause_number}` : null,
    '',
    '--- JUDGMENT ---',
    `Judgment date: ${facts.judgment_date}`,
    `Judgment description: ${facts.judgment_description}`,
    '',
    '--- APPEAL ---',
    `Appellate court: ${facts.appellate_court}`,
    `Grounds for appeal: ${facts.appeal_grounds.join(', ')}`,
  ]
    .filter((s) => s !== null)
    .join('\n')

  return { system, user }
}

// ---------------------------------------------------------------------------
// Field configuration (3 sections)
// ---------------------------------------------------------------------------

const fields: FieldConfig[] = [
  // Section 0: Trial Court
  {
    key: 'court_type',
    type: 'select',
    label: 'Court Type',
    required: true,
    section: 0,
    sectionTitle: 'Trial Court',
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

  // Section 1: Judgment
  {
    key: 'judgment_date',
    type: 'date',
    label: 'Judgment Date',
    required: true,
    section: 1,
    sectionTitle: 'Judgment',
  },
  {
    key: 'judgment_description',
    type: 'textarea',
    label: 'Judgment Description',
    placeholder:
      'Describe the judgment or order you are appealing.',
    required: true,
    section: 1,
  },

  // Section 2: Appeal
  {
    key: 'appeal_grounds',
    type: 'select',
    label: 'Grounds for Appeal',
    required: true,
    section: 2,
    sectionTitle: 'Appeal',
    options: [
      { label: 'Legal Error', value: 'legal_error' },
      { label: 'Insufficient Evidence', value: 'insufficient_evidence' },
      { label: 'Procedural Error', value: 'procedural_error' },
      { label: 'Abuse of Discretion', value: 'abuse_of_discretion' },
      { label: 'Constitutional Violation', value: 'constitutional_violation' },
      { label: 'Other', value: 'other' },
    ],
  },
  {
    key: 'appellate_court',
    type: 'text',
    label: 'Appellate Court',
    placeholder: 'e.g. Fifth Circuit Court of Appeals',
    helperText:
      'e.g., Fifth Circuit Court of Appeals, Third Court of Appeals',
    required: true,
    section: 2,
  },
]

// ---------------------------------------------------------------------------
// Config export
// ---------------------------------------------------------------------------

export const noticeOfAppealConfig: MotionConfig = {
  key: 'notice_of_appeal',
  title: 'Notice of Appeal',
  description:
    'File a formal notice with the trial court that you intend to appeal the judgment to a higher court.',
  reassurance:
    "Filing a notice of appeal is a procedural step that preserves your right to have a higher court review the trial court's decision. It's time-sensitive — most jurisdictions require it within 30 days of the judgment.",
  category: 'post_trial',
  fields,
  schema: noticeOfAppealFactsSchema,
  buildPrompt: buildNoticeOfAppealPrompt,
  documentType: 'notice_of_appeal',
}
