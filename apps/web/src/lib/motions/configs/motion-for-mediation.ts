import { z } from 'zod'
import { partySchema } from '@lawyer-free/shared/schemas/filing'
import type { FieldConfig, MotionConfig } from '@/lib/motions/types'

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

export const motionForMediationFactsSchema = z.object({
  your_info: partySchema,
  opposing_parties: z.array(partySchema).min(1),
  court_type: z.literal('district'),
  county: z.string().min(1),
  cause_number: z.string().optional(),
  issues_for_mediation: z.array(
    z.enum([
      'custody',
      'visitation',
      'child_support',
      'spousal_support',
      'property_division',
    ])
  ).min(1),
  preferred_mediator: z.string().optional(),
  reason_for_mediation: z.string().min(10),
  both_parties_agree: z.boolean().default(false),
})

export type MotionForMediationFacts = z.infer<typeof motionForMediationFactsSchema>

// ---------------------------------------------------------------------------
// Prompt builder
// ---------------------------------------------------------------------------

interface Prompt {
  system: string
  user: string
}

export function buildMotionForMediationPrompt(facts: MotionForMediationFacts): Prompt {
  const system = `You are a legal document formatting assistant. You help self-represented (pro se) litigants format their court filings.

DRAFT — NOT LEGAL ADVICE

IMPORTANT RULES:
- You format documents. You do NOT provide legal advice.
- Use only the facts provided. Do not invent or assume additional facts.
- Do not predict outcomes or make strategic recommendations.
- Use plain, clear language appropriate for a pro se filer.
- Use "Petitioner" and "Respondent" terminology (NOT "Plaintiff" and "Defendant").
- Reference Texas Family Code § 153.0071 (Mediation).

DOCUMENT FORMAT:
Generate a Motion to Refer to Mediation containing the following sections:
1. Caption (styled for District Court, family law)
2. Introduction
3. Issues for Mediation (itemized)
4. Reasons Mediation Is Appropriate
5. Mediator Preference (if any)
6. Both Parties' Position
7. Prayer for Relief
8. Signature block marked "Pro Se"`

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

  const issueLabels: Record<string, string> = {
    custody: 'Custody / Conservatorship',
    visitation: 'Visitation / Possession Schedule',
    child_support: 'Child Support',
    spousal_support: 'Spousal Support / Maintenance',
    property_division: 'Property Division',
  }

  const issuesList = facts.issues_for_mediation
    .map((i) => `  - ${issueLabels[i]}`)
    .join('\n')

  const user = [
    '--- PARTIES ---',
    parties,
    '',
    '--- COURT ---',
    `Court: District Court of ${facts.county} County, Texas`,
    `County: ${facts.county}`,
    facts.cause_number ? `Cause number: ${facts.cause_number}` : null,
    '',
    '--- ISSUES FOR MEDIATION ---',
    issuesList,
    '',
    '--- REASON ---',
    `Reason for mediation: ${facts.reason_for_mediation}`,
    '',
    '--- MEDIATOR ---',
    facts.preferred_mediator
      ? `Preferred mediator: ${facts.preferred_mediator}`
      : 'No specific mediator preference.',
    '',
    '--- AGREEMENT ---',
    `Both parties agree to mediation: ${facts.both_parties_agree ? 'Yes' : 'No — Petitioner is requesting the court order mediation.'}`,
  ]
    .filter((s) => s !== null)
    .join('\n')

  return { system, user }
}

// ---------------------------------------------------------------------------
// Field configuration (2 sections)
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
  {
    key: 'cause_number',
    type: 'text',
    label: 'Cause Number',
    placeholder: 'e.g. 2026-FA-01234',
    helperText: 'Leave blank if not yet assigned.',
    section: 0,
  },

  // Section 1: Mediation Details
  {
    key: 'issues_for_mediation',
    type: 'checkbox',
    label: 'Issues for Mediation',
    helperText: 'Select all issues you want the mediator to help resolve.',
    required: true,
    section: 1,
    sectionTitle: 'Mediation Details',
    options: [
      { label: 'Custody / Conservatorship', value: 'custody' },
      { label: 'Visitation / Possession Schedule', value: 'visitation' },
      { label: 'Child Support', value: 'child_support' },
      { label: 'Spousal Support / Maintenance', value: 'spousal_support' },
      { label: 'Property Division', value: 'property_division' },
    ],
  },
  {
    key: 'reason_for_mediation',
    type: 'textarea',
    label: 'Why Is Mediation Appropriate?',
    placeholder:
      'Explain why mediation would be beneficial. For example: both parties are willing to negotiate, the issues are not too contentious, or mediation would save time and money.',
    helperText:
      'Texas courts encourage mediation in family cases. Explain why it would help resolve your dispute.',
    required: true,
    section: 1,
  },
  {
    key: 'preferred_mediator',
    type: 'text',
    label: 'Preferred Mediator (optional)',
    placeholder: 'e.g. John Smith, Certified Mediator',
    helperText: 'If you have a mediator in mind, provide their name. Otherwise leave blank and the court may appoint one.',
    section: 1,
  },
  {
    key: 'both_parties_agree',
    type: 'checkbox',
    label: 'Both parties agree to mediation',
    helperText:
      'Check this if the other party has agreed to mediation. If not, the court can still order it.',
    section: 1,
  },
]

// ---------------------------------------------------------------------------
// Config export
// ---------------------------------------------------------------------------

export const motionForMediationConfig: MotionConfig = {
  key: 'motion_for_mediation',
  title: 'Motion to Refer to Mediation',
  description:
    'Ask the court to order mediation to resolve disputes outside of court.',
  reassurance:
    'Mediation is a less stressful way to reach agreements. A neutral mediator helps both sides negotiate. Most Texas family courts encourage or require it.',
  category: 'family',
  fields,
  schema: motionForMediationFactsSchema,
  buildPrompt: buildMotionForMediationPrompt,
  documentType: 'motion_for_mediation',
  taskKey: 'motion_for_mediation',
}
