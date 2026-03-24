import { z } from 'zod'
import { partySchema } from '@lawyer-free/shared/schemas/filing'
import type { FieldConfig, MotionConfig } from '../types'

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

export const summaryJudgmentFactsSchema = z.object({
  your_info: partySchema,
  opposing_parties: z.array(partySchema).min(1),
  court_type: z.enum(['jp', 'county', 'district', 'federal']),
  county: z.string().min(1),
  cause_number: z.string().optional(),
  undisputed_facts: z
    .array(
      z.object({
        fact: z.string().min(1),
        evidence_reference: z.string().optional(),
      })
    )
    .min(1),
  legal_grounds: z.string().min(10),
  evidence_summary: z.string().min(10),
  damages_amount: z.number().positive().optional(),
})

export type SummaryJudgmentFacts = z.infer<typeof summaryJudgmentFactsSchema>

// ---------------------------------------------------------------------------
// Prompt builder
// ---------------------------------------------------------------------------

interface Prompt {
  system: string
  user: string
}

function courtLabel(
  courtType: SummaryJudgmentFacts['court_type'],
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

export function buildSummaryJudgmentPrompt(
  facts: SummaryJudgmentFacts
): Prompt {
  const system = `You are a legal document formatting assistant. You help self-represented (pro se) litigants format their court filings.

DRAFT — NOT LEGAL ADVICE

IMPORTANT RULES:
- You format documents. You do NOT provide legal advice.
- Use only the facts provided. Do not invent or assume additional facts.
- Do not predict outcomes or make strategic recommendations.
- Use plain, clear language appropriate for a pro se filer.

DOCUMENT FORMAT:
Generate a Motion for Summary Judgment containing the following sections:
1. Caption
2. Introduction
3. Statement of Undisputed Facts (numbered)
4. Standard of Review
5. Argument
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

  const numberedFacts = facts.undisputed_facts
    .map((uf, i) => {
      const line = `${i + 1}. ${uf.fact}`
      return uf.evidence_reference
        ? `${line} [Evidence: ${uf.evidence_reference}]`
        : line
    })
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
    '--- UNDISPUTED FACTS ---',
    numberedFacts,
    '',
    '--- LEGAL GROUNDS ---',
    `Legal grounds: ${facts.legal_grounds}`,
    '',
    '--- EVIDENCE ---',
    `Evidence summary: ${facts.evidence_summary}`,
    '',
    facts.damages_amount != null ? '--- DAMAGES ---' : null,
    facts.damages_amount != null
      ? `Damages amount: ${facts.damages_amount}`
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

  // Section 1: Undisputed Facts
  {
    key: 'undisputed_facts',
    type: 'dynamic-list',
    label: 'Undisputed Material Facts',
    helperText:
      'List each fact that is not in dispute. Reference supporting evidence for each fact.',
    required: true,
    section: 1,
    sectionTitle: 'Undisputed Facts',
    listItemFields: [
      {
        key: 'fact',
        type: 'text',
        label: 'Fact',
        placeholder: 'e.g. Defendant signed the contract on January 1, 2025.',
        required: true,
        section: 1,
      },
      {
        key: 'evidence_reference',
        type: 'text',
        label: 'Evidence Reference',
        placeholder: 'e.g. Exhibit A - Signed Contract',
        section: 1,
      },
    ],
  },

  // Section 2: Legal Grounds
  {
    key: 'legal_grounds',
    type: 'textarea',
    label: 'Legal Grounds',
    placeholder:
      'Explain why you are entitled to judgment as a matter of law.',
    helperText:
      'Cite the legal basis for your motion (e.g., breach of contract, negligence).',
    required: true,
    section: 2,
    sectionTitle: 'Legal Grounds',
  },
  {
    key: 'evidence_summary',
    type: 'textarea',
    label: 'Evidence Summary',
    placeholder: 'Summarize the evidence supporting your motion.',
    helperText:
      'Describe the exhibits, affidavits, or other evidence you are attaching.',
    required: true,
    section: 2,
  },

  // Section 3: Damages
  {
    key: 'damages_amount',
    type: 'number',
    label: 'Damages Amount (optional)',
    placeholder: 'e.g. 15000',
    helperText: 'Total amount of damages you are seeking, if applicable.',
    section: 3,
    sectionTitle: 'Damages',
  },
]

// ---------------------------------------------------------------------------
// Config export
// ---------------------------------------------------------------------------

export const summaryJudgmentConfig: MotionConfig = {
  key: 'motion_summary_judgment',
  title: 'Motion for Summary Judgment',
  description:
    'Request the court to decide the case without trial when the material facts are undisputed and you are entitled to judgment as a matter of law.',
  reassurance:
    'Summary judgment is a tool to resolve cases efficiently when both sides agree on the facts but disagree on the law. Courts grant these regularly.',
  category: 'pretrial',
  fields,
  schema: summaryJudgmentFactsSchema,
  buildPrompt: buildSummaryJudgmentPrompt,
  documentType: 'motion_summary_judgment',
  taskKey: 'motion_summary_judgment',
}
