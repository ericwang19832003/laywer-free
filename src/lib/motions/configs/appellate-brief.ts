import { z } from 'zod'
import { partySchema } from '@/lib/schemas/filing'
import type { FieldConfig, MotionConfig } from '@/lib/motions/types'

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

export const appellateBriefFactsSchema = z.object({
  your_info: partySchema,
  opposing_parties: z.array(partySchema).min(1),
  appellate_court: z.string().min(1),
  trial_court: z.string().min(1),
  cause_number: z.string().optional(),
  appellate_case_number: z.string().optional(),
  statement_of_case: z.string().min(20),
  issues_presented: z.array(z.string().min(10)).min(1),
  standard_of_review: z.enum([
    'de_novo',
    'abuse_of_discretion',
    'clearly_erroneous',
    'substantial_evidence',
  ]),
  argument_sections: z
    .array(
      z.object({
        heading: z.string().min(1),
        argument: z.string().min(20),
      })
    )
    .min(1),
  prayer: z.string().min(10),
})

export type AppellateBriefFacts = z.infer<typeof appellateBriefFactsSchema>

// ---------------------------------------------------------------------------
// Prompt builder
// ---------------------------------------------------------------------------

interface Prompt {
  system: string
  user: string
}

export function buildAppellateBriefPrompt(facts: AppellateBriefFacts): Prompt {
  const system = `You are a legal document formatting assistant. You help self-represented (pro se) litigants format their court filings.

DRAFT — NOT LEGAL ADVICE

IMPORTANT RULES:
- You format documents. You do NOT provide legal advice.
- Use only the facts provided. Do not invent or assume additional facts.
- Do not predict outcomes or make strategic recommendations.
- Use plain, clear language appropriate for a pro se filer.

DOCUMENT FORMAT:
Generate an Appellant's Brief containing the following sections:
1. Cover Page
2. Table of Contents
3. Table of Authorities (placeholder — to be completed by filer)
4. Statement of the Case
5. Issues Presented (numbered)
6. Standard of Review
7. Summary of the Argument
8. Argument (one section per heading provided)
9. Prayer for Relief
10. Appendix (placeholder — to be completed by filer)
11. Signature block marked "Pro Se"`

  const parties = [
    `Filing party (Appellant): ${facts.your_info.full_name}`,
    facts.your_info.address
      ? `Address: ${facts.your_info.address}, ${facts.your_info.city ?? ''}, ${facts.your_info.state ?? ''} ${facts.your_info.zip ?? ''}`
      : null,
    ...facts.opposing_parties.map(
      (p, i) =>
        `Opposing party (Appellee) ${i + 1}: ${p.full_name}${p.address ? `, ${p.address}` : ''}`
    ),
  ]
    .filter(Boolean)
    .join('\n')

  const numberedIssues = facts.issues_presented
    .map((issue, i) => `${i + 1}. ${issue}`)
    .join('\n')

  const argumentSections = facts.argument_sections
    .map(
      (section, i) =>
        `--- ARGUMENT SECTION ${i + 1} ---\nHeading: ${section.heading}\nArgument: ${section.argument}`
    )
    .join('\n\n')

  const user = [
    '--- PARTIES ---',
    parties,
    '',
    '--- COURTS ---',
    `Appellate court: ${facts.appellate_court}`,
    `Trial court: ${facts.trial_court}`,
    facts.cause_number ? `Trial cause number: ${facts.cause_number}` : null,
    facts.appellate_case_number
      ? `Appellate case number: ${facts.appellate_case_number}`
      : null,
    '',
    '--- STATEMENT OF THE CASE ---',
    facts.statement_of_case,
    '',
    '--- ISSUES PRESENTED ---',
    numberedIssues,
    '',
    '--- STANDARD OF REVIEW ---',
    `Standard: ${facts.standard_of_review}`,
    '',
    '--- ARGUMENTS ---',
    argumentSections,
    '',
    '--- PRAYER FOR RELIEF ---',
    facts.prayer,
  ]
    .filter((s) => s !== null)
    .join('\n')

  return { system, user }
}

// ---------------------------------------------------------------------------
// Field configuration (5 sections)
// ---------------------------------------------------------------------------

const fields: FieldConfig[] = [
  // Section 0: Courts
  {
    key: 'appellate_court',
    type: 'text',
    label: 'Appellate Court',
    placeholder: 'e.g. Third Court of Appeals',
    required: true,
    section: 0,
    sectionTitle: 'Courts',
  },
  {
    key: 'trial_court',
    type: 'text',
    label: 'Trial Court',
    placeholder: 'e.g. District Court of Harris County, Texas',
    required: true,
    section: 0,
  },
  {
    key: 'cause_number',
    type: 'text',
    label: 'Trial Cause Number',
    placeholder: 'e.g. 2026-CI-01234',
    helperText: 'Leave blank if not yet assigned.',
    section: 0,
  },
  {
    key: 'appellate_case_number',
    type: 'text',
    label: 'Appellate Case Number',
    placeholder: 'e.g. 03-26-00123-CV',
    helperText: 'Leave blank if not yet assigned.',
    section: 0,
  },

  // Section 1: Statement of Case
  {
    key: 'statement_of_case',
    type: 'textarea',
    label: 'Statement of the Case',
    placeholder:
      'Provide a concise summary of the case, including the nature of the dispute and what the trial court decided.',
    required: true,
    section: 1,
    sectionTitle: 'Statement of Case',
  },

  // Section 2: Issues
  {
    key: 'issues_presented',
    type: 'dynamic-list',
    label: 'Issues Presented for Review',
    required: true,
    section: 2,
    sectionTitle: 'Issues',
    listItemFields: [
      {
        key: 'issue',
        type: 'text',
        label: 'Issue',
        placeholder: 'e.g. Whether the trial court erred in granting summary judgment.',
        required: true,
        section: 2,
      },
    ],
  },

  // Section 3: Arguments
  {
    key: 'standard_of_review',
    type: 'select',
    label: 'Standard of Review',
    required: true,
    section: 3,
    sectionTitle: 'Arguments',
    options: [
      { label: 'De Novo', value: 'de_novo' },
      { label: 'Abuse of Discretion', value: 'abuse_of_discretion' },
      { label: 'Clearly Erroneous', value: 'clearly_erroneous' },
      { label: 'Substantial Evidence', value: 'substantial_evidence' },
    ],
  },
  {
    key: 'argument_sections',
    type: 'dynamic-list',
    label: 'Argument Sections',
    required: true,
    section: 3,
    listItemFields: [
      {
        key: 'heading',
        type: 'text',
        label: 'Section Heading',
        placeholder: 'e.g. The Trial Court Erred in Granting Summary Judgment',
        required: true,
        section: 3,
      },
      {
        key: 'argument',
        type: 'textarea',
        label: 'Argument',
        placeholder: 'Present your legal argument for this issue.',
        required: true,
        section: 3,
      },
    ],
  },

  // Section 4: Prayer
  {
    key: 'prayer',
    type: 'textarea',
    label: 'Prayer for Relief',
    placeholder:
      'State what relief you are asking the appellate court to grant.',
    helperText:
      'State what relief you are asking the appellate court to grant.',
    required: true,
    section: 4,
    sectionTitle: 'Prayer',
  },
]

// ---------------------------------------------------------------------------
// Config export
// ---------------------------------------------------------------------------

export const appellateBriefConfig: MotionConfig = {
  key: 'appellate_brief',
  title: 'Appellate Brief',
  description:
    "Prepare a comprehensive appellate brief presenting your legal arguments to the appellate court for why the trial court's decision should be reversed.",
  reassurance:
    'An appellate brief is your opportunity to make your case to the reviewing court. Focus on legal errors, not re-arguing facts. Appellate courts reverse trial courts regularly when errors are clearly shown.',
  category: 'post_trial',
  fields,
  schema: appellateBriefFactsSchema,
  buildPrompt: buildAppellateBriefPrompt,
  documentType: 'appellate_brief',
  taskKey: 'appellate_brief',
}
