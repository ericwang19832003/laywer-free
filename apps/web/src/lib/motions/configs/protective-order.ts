import { z } from 'zod'
import { partySchema } from '@lawyer-free/shared/schemas/filing'
import type { FieldConfig, MotionConfig } from '@/lib/motions/types'

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

export const protectiveOrderFactsSchema = z.object({
  your_info: partySchema,
  opposing_parties: z.array(partySchema).min(1),
  court_type: z.literal('district'),
  county: z.string().min(1),
  relationship_to_respondent: z.enum([
    'spouse',
    'ex_spouse',
    'dating',
    'household_member',
    'parent_of_child',
  ]),
  violence_description: z.string().min(20),
  most_recent_incident_date: z.string().min(1),
  ongoing_threat: z.boolean().default(false),
  requested_protections: z.array(
    z.enum([
      'stay_away',
      'no_contact',
      'exclusive_possession',
      'temporary_custody',
      'firearm_surrender',
      'other',
    ])
  ).min(1),
  stay_away_distance: z.number().optional(),
  children_involved: z.boolean().default(false),
  children_details: z.string().optional(),
})

export type ProtectiveOrderFacts = z.infer<typeof protectiveOrderFactsSchema>

// ---------------------------------------------------------------------------
// Prompt builder
// ---------------------------------------------------------------------------

interface Prompt {
  system: string
  user: string
}

export function buildProtectiveOrderPrompt(facts: ProtectiveOrderFacts): Prompt {
  const system = `You are a legal document formatting assistant. You help self-represented (pro se) litigants format their court filings.

DRAFT — NOT LEGAL ADVICE

IMPORTANT RULES:
- You format documents. You do NOT provide legal advice.
- Use only the facts provided. Do not invent or assume additional facts.
- Do not predict outcomes or make strategic recommendations.
- Use plain, clear language appropriate for a pro se filer.
- Use "Petitioner" and "Respondent" terminology (NOT "Plaintiff" and "Defendant").
- Reference Texas Family Code Chapter 85 (Protective Orders) and § 71.004 (family violence definition).

DOCUMENT FORMAT:
Generate an Application for Protective Order containing the following sections:
1. Caption (styled for District Court, family law)
2. Introduction and Standing
3. Relationship Between Parties
4. Description of Family Violence
5. Most Recent Incident
6. Ongoing Threat Assessment
7. Requested Protective Relief (itemized)
8. Duration (up to 2 years per Texas Family Code)
9. Children (if applicable)
10. Prayer for Relief
11. Verification
12. Signature block marked "Pro Se"`

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

  const relationshipLabels: Record<string, string> = {
    spouse: 'Current spouse',
    ex_spouse: 'Former spouse',
    dating: 'Dating relationship',
    household_member: 'Member of the same household',
    parent_of_child: 'Parent of a child in common',
  }

  const protectionLabels: Record<string, string> = {
    stay_away: 'Stay away from Petitioner',
    no_contact: 'No contact (direct or indirect)',
    exclusive_possession: 'Exclusive possession of residence',
    temporary_custody: 'Temporary custody of children',
    firearm_surrender: 'Surrender firearms',
    other: 'Other protections',
  }

  const protections = facts.requested_protections
    .map((p) => `  - ${protectionLabels[p]}`)
    .join('\n')

  const user = [
    '--- PARTIES ---',
    parties,
    '',
    '--- COURT ---',
    `Court: District Court of ${facts.county} County, Texas`,
    `County: ${facts.county}`,
    '',
    '--- RELATIONSHIP ---',
    `Relationship to Respondent: ${relationshipLabels[facts.relationship_to_respondent]}`,
    '',
    '--- VIOLENCE ---',
    `Description of violence: ${facts.violence_description}`,
    `Most recent incident date: ${facts.most_recent_incident_date}`,
    `Ongoing threat: ${facts.ongoing_threat ? 'Yes — Petitioner believes there is a continuing threat of violence.' : 'No ongoing threat specified, but protective order still sought.'}`,
    '',
    '--- REQUESTED PROTECTIONS ---',
    protections,
    facts.stay_away_distance != null
      ? `Stay-away distance: ${facts.stay_away_distance} feet`
      : null,
    '',
    '--- CHILDREN ---',
    `Children involved: ${facts.children_involved ? 'Yes' : 'No'}`,
    facts.children_involved && facts.children_details
      ? `Children details: ${facts.children_details}`
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

  // Section 1: Violence Details
  {
    key: 'relationship_to_respondent',
    type: 'select',
    label: 'Your Relationship to the Respondent',
    required: true,
    section: 1,
    sectionTitle: 'Violence Details',
    options: [
      { label: 'Current Spouse', value: 'spouse' },
      { label: 'Former Spouse', value: 'ex_spouse' },
      { label: 'Dating Relationship', value: 'dating' },
      { label: 'Member of Same Household', value: 'household_member' },
      { label: 'Parent of a Child in Common', value: 'parent_of_child' },
    ],
  },
  {
    key: 'violence_description',
    type: 'textarea',
    label: 'Description of Violence',
    placeholder:
      'Describe the acts of family violence, dating violence, or stalking you have experienced. Include dates, locations, and what happened.',
    helperText:
      'Be as specific as possible. This is the core of your application.',
    required: true,
    section: 1,
  },
  {
    key: 'most_recent_incident_date',
    type: 'date',
    label: 'Date of Most Recent Incident',
    required: true,
    section: 1,
  },
  {
    key: 'ongoing_threat',
    type: 'checkbox',
    label: 'There is an ongoing threat of violence',
    helperText:
      'Check this if you believe the Respondent will continue to be violent or threatening.',
    section: 1,
  },
  {
    key: 'children_involved',
    type: 'checkbox',
    label: 'Children are involved',
    helperText: 'Check if children are affected by the situation.',
    section: 1,
  },
  {
    key: 'children_details',
    type: 'textarea',
    label: 'Children Details',
    placeholder:
      'List the names, ages, and current living situation of any children involved.',
    helperText: 'Only required if children are involved.',
    section: 1,
    showWhen: { field: 'children_involved', value: true },
  },

  // Section 2: Requested Protections
  {
    key: 'requested_protections',
    type: 'checkbox',
    label: 'Requested Protections',
    helperText: 'Select all protections you are requesting from the court.',
    required: true,
    section: 2,
    sectionTitle: 'Requested Protections',
    options: [
      { label: 'Stay away from me', value: 'stay_away' },
      { label: 'No contact (direct or indirect)', value: 'no_contact' },
      { label: 'Exclusive possession of residence', value: 'exclusive_possession' },
      { label: 'Temporary custody of children', value: 'temporary_custody' },
      { label: 'Surrender firearms', value: 'firearm_surrender' },
      { label: 'Other', value: 'other' },
    ],
  },
  {
    key: 'stay_away_distance',
    type: 'number',
    label: 'Stay-Away Distance (feet)',
    placeholder: 'e.g. 200',
    helperText: 'How far must the Respondent stay away? Common distances are 200-500 feet.',
    section: 2,
    showWhen: { field: 'requested_protections', value: 'stay_away' },
  },
]

// ---------------------------------------------------------------------------
// Config export
// ---------------------------------------------------------------------------

export const protectiveOrderConfig: MotionConfig = {
  key: 'protective_order',
  title: 'Application for Protective Order',
  description:
    'Apply for a court order protecting you from family violence, dating violence, or stalking.',
  reassurance:
    'A protective order is a legal tool that tells the other person to stay away and stop the violence. Violating it is a crime. You can request one even if you haven\'t filed for divorce.',
  category: 'family',
  fields,
  schema: protectiveOrderFactsSchema,
  buildPrompt: buildProtectiveOrderPrompt,
  documentType: 'protective_order',
  taskKey: 'protective_order',
}
