import { z } from 'zod'
import { partySchema } from '@lawyer-free/shared/schemas/filing'
import type { FieldConfig, MotionConfig } from '../types'

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

export const mtdResponseFactsSchema = z.object({
  your_info: partySchema,
  opposing_parties: z.array(partySchema).min(1),
  court_type: z.enum(['jp', 'county', 'district', 'federal']),
  county: z.string().min(1),
  cause_number: z.string().optional(),
  mtd_filing_date: z.string().min(1),
  dismissal_grounds: z
    .array(
      z.enum([
        'failure_to_state_claim',
        'lack_of_jurisdiction',
        'improper_venue',
        'insufficient_service',
        'statute_of_limitations',
        'res_judicata',
        'failure_to_join_party',
        'other',
      ])
    )
    .min(1),
  factual_response: z.string().min(10),
  legal_arguments: z.string().min(10),
  additional_authority: z.string().optional(),
})

export type MtdResponseFacts = z.infer<typeof mtdResponseFactsSchema>

// ---------------------------------------------------------------------------
// Prompt builder
// ---------------------------------------------------------------------------

interface Prompt {
  system: string
  user: string
}

function courtLabel(
  courtType: MtdResponseFacts['court_type'],
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

export function buildMtdResponsePrompt(facts: MtdResponseFacts): Prompt {
  const system = `You are a legal document formatting assistant. You help self-represented (pro se) litigants format their court filings.

DRAFT — NOT LEGAL ADVICE

IMPORTANT RULES:
- You format documents. You do NOT provide legal advice.
- Use only the facts provided. Do not invent or assume additional facts.
- Do not predict outcomes or make strategic recommendations.
- Use plain, clear language appropriate for a pro se filer.

DOCUMENT FORMAT:
Generate a Plaintiff's Response to Motion to Dismiss containing the following sections:
1. Caption
2. Introduction
3. Factual Background
4. Standard of Review (accept all well-pleaded facts as true)
5. Argument (address each ground for dismissal raised)
6. Conclusion
7. Signature block marked "Pro Se"`

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

  const groundsList = facts.dismissal_grounds.join(', ')

  const user = [
    '--- PARTIES ---',
    parties,
    '',
    '--- COURT ---',
    `Court: ${courtLabel(facts.court_type, facts.county)}`,
    `County: ${facts.county}`,
    facts.cause_number ? `Cause number: ${facts.cause_number}` : null,
    '',
    '--- MOTION TO DISMISS ---',
    `MTD filing date: ${facts.mtd_filing_date}`,
    `Dismissal grounds raised: ${groundsList}`,
    '',
    '--- RESPONSE ---',
    `Factual response: ${facts.factual_response}`,
    '',
    '--- LEGAL ARGUMENTS ---',
    `Legal arguments: ${facts.legal_arguments}`,
    '',
    facts.additional_authority ? '--- ADDITIONAL AUTHORITY ---' : null,
    facts.additional_authority
      ? `Additional authority: ${facts.additional_authority}`
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
  // Section 0: Court & MTD Info
  {
    key: 'court_type',
    type: 'select',
    label: 'Court Type',
    required: true,
    section: 0,
    sectionTitle: 'Court & MTD Info',
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
    key: 'mtd_filing_date',
    type: 'date',
    label: 'MTD Filing Date',
    helperText: 'When was the Motion to Dismiss filed?',
    required: true,
    section: 0,
  },

  // Section 1: Dismissal Grounds
  {
    key: 'dismissal_grounds',
    type: 'checkbox',
    label: 'Grounds for Dismissal Raised',
    helperText: 'Select all grounds the opposing party raised in their MTD.',
    required: true,
    section: 1,
    sectionTitle: 'Dismissal Grounds',
    options: [
      { label: 'Failure to State a Claim', value: 'failure_to_state_claim' },
      { label: 'Lack of Jurisdiction', value: 'lack_of_jurisdiction' },
      { label: 'Improper Venue', value: 'improper_venue' },
      { label: 'Insufficient Service of Process', value: 'insufficient_service' },
      { label: 'Statute of Limitations', value: 'statute_of_limitations' },
      { label: 'Res Judicata', value: 'res_judicata' },
      { label: 'Failure to Join a Required Party', value: 'failure_to_join_party' },
      { label: 'Other', value: 'other' },
    ],
  },
  {
    key: 'factual_response',
    type: 'textarea',
    label: 'Factual Response',
    placeholder:
      'Explain the facts that counter the grounds for dismissal.',
    helperText:
      'Describe why each ground the opposing party raised is incorrect based on the facts of your case.',
    required: true,
    section: 1,
  },

  // Section 2: Arguments
  {
    key: 'legal_arguments',
    type: 'textarea',
    label: 'Legal Arguments',
    placeholder:
      'Explain the legal reasons why the motion to dismiss should be denied.',
    helperText:
      'Cite applicable rules, statutes, or case law that support your position.',
    required: true,
    section: 2,
    sectionTitle: 'Arguments',
  },
  {
    key: 'additional_authority',
    type: 'textarea',
    label: 'Additional Legal Authority (optional)',
    placeholder:
      'Cite any additional cases, statutes, or legal authorities supporting your response.',
    helperText:
      'Include case citations, statutory references, or secondary sources.',
    section: 2,
  },
]

// ---------------------------------------------------------------------------
// Config export
// ---------------------------------------------------------------------------

export const mtdResponseConfig: MotionConfig = {
  key: 'mtd_response',
  title: 'Response to Motion to Dismiss',
  description:
    "File a formal response opposing the defendant's motion to dismiss your case, arguing why the court should allow your claims to proceed.",
  reassurance:
    "If the other side has filed a motion to dismiss, don't panic. Many MTDs are denied. This response lets you explain to the court why your case has merit.",
  category: 'pretrial',
  fields,
  schema: mtdResponseFactsSchema,
  buildPrompt: buildMtdResponsePrompt,
  documentType: 'mtd_response',
  taskKey: 'mtd_response',
}
