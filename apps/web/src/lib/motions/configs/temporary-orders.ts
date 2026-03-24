import { z } from 'zod'
import { partySchema } from '@/lib/schemas/filing'
import type { FieldConfig, MotionConfig } from '@/lib/motions/types'

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

export const temporaryOrdersFactsSchema = z.object({
  your_info: partySchema,
  opposing_parties: z.array(partySchema).min(1),
  court_type: z.literal('district'),
  county: z.string().min(1),
  cause_number: z.string().optional(),
  children: z.array(
    z.object({
      name: z.string().min(1),
      dob: z.string().min(1),
    })
  ).min(1),
  requested_custody: z.enum(['joint_managing', 'sole_managing', 'possessory']),
  requested_child_support: z.number().optional(),
  requested_property_restraints: z.string().optional(),
  temporary_injunction_needed: z.boolean().default(false),
  reasons: z.string().min(10),
})

export type TemporaryOrdersFacts = z.infer<typeof temporaryOrdersFactsSchema>

// ---------------------------------------------------------------------------
// Prompt builder
// ---------------------------------------------------------------------------

interface Prompt {
  system: string
  user: string
}

export function buildTemporaryOrdersPrompt(facts: TemporaryOrdersFacts): Prompt {
  const system = `You are a legal document formatting assistant. You help self-represented (pro se) litigants format their court filings.

DRAFT — NOT LEGAL ADVICE

IMPORTANT RULES:
- You format documents. You do NOT provide legal advice.
- Use only the facts provided. Do not invent or assume additional facts.
- Do not predict outcomes or make strategic recommendations.
- Use plain, clear language appropriate for a pro se filer.
- Use "Petitioner" and "Respondent" terminology (NOT "Plaintiff" and "Defendant").
- Reference Texas Family Code § 105.001 (Temporary Orders).

DOCUMENT FORMAT:
Generate a Motion for Temporary Orders containing the following sections:
1. Caption (styled for District Court, family law)
2. Introduction
3. Temporary Custody (managing conservatorship request and reasoning)
4. Temporary Child Support (if requested)
5. Property Restraints (if requested)
6. Temporary Injunction (if requested)
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

  const childrenList = facts.children
    .map((c, i) => `  ${i + 1}. ${c.name} (DOB: ${c.dob})`)
    .join('\n')

  const custodyLabel: Record<string, string> = {
    joint_managing: 'Joint Managing Conservators',
    sole_managing: 'Sole Managing Conservator (Petitioner)',
    possessory: 'Possessory Conservator',
  }

  const user = [
    '--- PARTIES ---',
    parties,
    '',
    '--- COURT ---',
    `Court: District Court of ${facts.county} County, Texas`,
    `County: ${facts.county}`,
    facts.cause_number ? `Cause number: ${facts.cause_number}` : null,
    '',
    '--- CHILDREN ---',
    childrenList,
    '',
    '--- CUSTODY ---',
    `Requested custody arrangement: ${custodyLabel[facts.requested_custody]}`,
    '',
    '--- SUPPORT ---',
    facts.requested_child_support != null
      ? `Requested temporary child support: $${facts.requested_child_support}/month`
      : 'No temporary child support requested.',
    '',
    '--- PROPERTY ---',
    facts.requested_property_restraints
      ? `Requested property restraints: ${facts.requested_property_restraints}`
      : 'No specific property restraints requested.',
    '',
    '--- TEMPORARY INJUNCTION ---',
    `Temporary injunction needed: ${facts.temporary_injunction_needed ? 'Yes' : 'No'}`,
    '',
    '--- REASONS ---',
    `Reasons for temporary orders: ${facts.reasons}`,
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
  {
    key: 'cause_number',
    type: 'text',
    label: 'Cause Number',
    placeholder: 'e.g. 2026-FA-01234',
    helperText: 'Leave blank if not yet assigned.',
    section: 0,
  },

  // Section 1: Children & Custody
  {
    key: 'children',
    type: 'dynamic-list',
    label: 'Children',
    helperText: 'Add each child involved in this case.',
    required: true,
    section: 1,
    sectionTitle: 'Children & Custody',
    listItemFields: [
      {
        key: 'name',
        type: 'text',
        label: 'Child Name',
        placeholder: 'e.g. Jane Doe',
        required: true,
        section: 1,
      },
      {
        key: 'dob',
        type: 'date',
        label: 'Date of Birth',
        required: true,
        section: 1,
      },
    ],
  },
  {
    key: 'requested_custody',
    type: 'select',
    label: 'Requested Custody Arrangement',
    required: true,
    section: 1,
    options: [
      { label: 'Joint Managing Conservators', value: 'joint_managing' },
      { label: 'Sole Managing Conservator (me)', value: 'sole_managing' },
      { label: 'Possessory Conservator', value: 'possessory' },
    ],
  },
  {
    key: 'reasons',
    type: 'textarea',
    label: 'Reasons for Temporary Orders',
    placeholder:
      'Explain why temporary orders are needed while the case is pending. Include any safety concerns, urgency, or changes in circumstances.',
    helperText:
      'Be specific about why the court should act now rather than waiting for the final hearing.',
    required: true,
    section: 1,
  },

  // Section 2: Support & Property
  {
    key: 'requested_child_support',
    type: 'number',
    label: 'Requested Monthly Child Support ($)',
    placeholder: 'e.g. 1500',
    helperText: 'Leave blank if not requesting temporary child support.',
    section: 2,
    sectionTitle: 'Support & Property',
  },
  {
    key: 'requested_property_restraints',
    type: 'textarea',
    label: 'Property Restraints',
    placeholder:
      'e.g. Neither party shall sell, transfer, or dispose of community property. Neither party shall cancel insurance policies.',
    helperText: 'Describe any restrictions on property you want the court to impose.',
    section: 2,
  },
  {
    key: 'temporary_injunction_needed',
    type: 'checkbox',
    label: 'Request a temporary injunction?',
    helperText:
      'A temporary injunction prevents specific harmful actions (e.g., hiding assets, harassing the other party) while the case is pending.',
    section: 2,
  },
]

// ---------------------------------------------------------------------------
// Config export
// ---------------------------------------------------------------------------

export const temporaryOrdersConfig: MotionConfig = {
  key: 'temporary_orders',
  title: 'Motion for Temporary Orders',
  description:
    'Request temporary custody, support, or property restraints while your case is pending.',
  reassurance:
    'Temporary orders protect you and your children while the case is being decided. They are common in family cases and last until the final order.',
  category: 'family',
  fields,
  schema: temporaryOrdersFactsSchema,
  buildPrompt: buildTemporaryOrdersPrompt,
  documentType: 'temporary_orders',
  taskKey: 'temporary_orders',
}
