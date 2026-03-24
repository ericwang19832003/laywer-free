import { z } from 'zod'
import { partySchema } from '@lawyer-free/shared/schemas/filing'
import type { FieldConfig, MotionConfig } from '../types'

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

export const settlementDemandFactsSchema = z.object({
  your_info: partySchema,
  opposing_parties: z.array(partySchema).min(1),
  opposing_attorney: z
    .object({
      name: z.string().min(1),
      firm: z.string().optional(),
      address: z.string().optional(),
    })
    .optional(),
  incident_summary: z.string().min(10),
  liability_basis: z.string().min(10),
  damages_breakdown: z
    .array(
      z.object({
        category: z.string().min(1),
        amount: z.number().positive(),
        description: z.string().optional(),
      })
    )
    .min(1),
  demand_amount: z.number().positive(),
  response_deadline_days: z.number().int().positive().default(30),
})

export type SettlementDemandFacts = z.infer<typeof settlementDemandFactsSchema>

// ---------------------------------------------------------------------------
// Prompt builder
// ---------------------------------------------------------------------------

interface Prompt {
  system: string
  user: string
}

export function buildSettlementDemandPrompt(
  facts: SettlementDemandFacts
): Prompt {
  const system = `You are a legal document formatting assistant. You help self-represented (pro se) litigants format their correspondence.

DRAFT — NOT LEGAL ADVICE

IMPORTANT RULES:
- You format documents. You do NOT provide legal advice.
- Use only the facts provided. Do not invent or assume additional facts.
- Do not predict outcomes or make strategic recommendations.
- Use plain, clear language appropriate for a pro se filer.

DOCUMENT FORMAT:
Generate a Settlement Demand LETTER (NOT a court filing) containing the following sections:
1. Date
2. Addressee
3. RE line (case/matter reference)
4. Introduction
5. Statement of Facts
6. Liability Analysis
7. Damages (itemized)
8. Demand
9. Response Deadline
10. Closing`

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

  const damagesLines = facts.damages_breakdown
    .map((d) => {
      const line = `- ${d.category}: $${d.amount}`
      return d.description ? `${line} (${d.description})` : line
    })
    .join('\n')

  const user = [
    '--- PARTIES ---',
    parties,
    '',
    facts.opposing_attorney ? '--- OPPOSING ATTORNEY ---' : null,
    facts.opposing_attorney
      ? `Name: ${facts.opposing_attorney.name}`
      : null,
    facts.opposing_attorney?.firm
      ? `Firm: ${facts.opposing_attorney.firm}`
      : null,
    facts.opposing_attorney?.address
      ? `Address: ${facts.opposing_attorney.address}`
      : null,
    facts.opposing_attorney ? '' : null,
    '--- INCIDENT ---',
    `Incident summary: ${facts.incident_summary}`,
    `Liability basis: ${facts.liability_basis}`,
    '',
    '--- DAMAGES ---',
    damagesLines,
    '',
    `Total demand amount: ${facts.demand_amount}`,
    '',
    '--- TERMS ---',
    `Response deadline: ${facts.response_deadline_days} days`,
  ]
    .filter((s) => s !== null)
    .join('\n')

  return { system, user }
}

// ---------------------------------------------------------------------------
// Field configuration (4 sections)
// ---------------------------------------------------------------------------

const fields: FieldConfig[] = [
  // Section 0: Recipient
  {
    key: 'opposing_attorney.name',
    type: 'text',
    label: 'Opposing Attorney Name',
    placeholder: 'e.g. John Smith',
    helperText: 'Leave blank if sending directly to the opposing party.',
    section: 0,
    sectionTitle: 'Recipient',
  },
  {
    key: 'opposing_attorney.firm',
    type: 'text',
    label: 'Law Firm',
    placeholder: 'e.g. Smith & Associates',
    section: 0,
  },
  {
    key: 'opposing_attorney.address',
    type: 'textarea',
    label: 'Attorney Address',
    placeholder: 'e.g. 123 Legal Blvd, Houston, TX 77002',
    section: 0,
  },

  // Section 1: Incident
  {
    key: 'incident_summary',
    type: 'textarea',
    label: 'Incident Summary',
    placeholder: 'Describe what happened and how you were harmed.',
    required: true,
    section: 1,
    sectionTitle: 'Incident',
  },
  {
    key: 'liability_basis',
    type: 'textarea',
    label: 'Liability Basis',
    placeholder:
      'Explain why the opposing party is legally responsible.',
    required: true,
    section: 1,
  },

  // Section 2: Damages
  {
    key: 'damages_breakdown',
    type: 'dynamic-list',
    label: 'Damages Breakdown',
    helperText: 'Itemize each category of damages with the amount.',
    required: true,
    section: 2,
    sectionTitle: 'Damages',
    listItemFields: [
      {
        key: 'category',
        type: 'text',
        label: 'Category',
        placeholder: 'e.g. Medical Expenses',
        required: true,
        section: 2,
      },
      {
        key: 'amount',
        type: 'number',
        label: 'Amount',
        placeholder: 'e.g. 5000',
        required: true,
        section: 2,
      },
      {
        key: 'description',
        type: 'text',
        label: 'Description (optional)',
        placeholder: 'Brief description of this damage category.',
        section: 2,
      },
    ],
  },
  {
    key: 'demand_amount',
    type: 'number',
    label: 'Total Demand Amount',
    placeholder: 'e.g. 25000',
    helperText: 'The total amount you are demanding in settlement.',
    required: true,
    section: 2,
  },

  // Section 3: Terms
  {
    key: 'response_deadline_days',
    type: 'number',
    label: 'Response Deadline (days)',
    placeholder: '30',
    helperText:
      'Number of days the opposing party has to respond. Default is 30.',
    section: 3,
    sectionTitle: 'Terms',
  },
]

// ---------------------------------------------------------------------------
// Config export
// ---------------------------------------------------------------------------

export const settlementDemandConfig: MotionConfig = {
  key: 'settlement_demand',
  title: 'Settlement Demand Letter',
  description:
    'Send a formal settlement demand to the opposing party or their attorney, outlining your case and the compensation you seek.',
  reassurance:
    "Most civil cases settle before trial. A well-crafted demand letter shows you're serious and can often lead to a resolution without the expense and stress of trial.",
  category: 'pretrial',
  fields,
  schema: settlementDemandFactsSchema,
  buildPrompt: buildSettlementDemandPrompt,
  documentType: 'settlement_demand',
  taskKey: 'settlement_demand',
}
