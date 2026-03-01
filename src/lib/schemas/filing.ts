import { z } from 'zod'

export const partySchema = z.object({
  full_name: z.string().min(1),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
})

export const filingFactsSchema = z.object({
  // Parties
  your_info: partySchema,
  opposing_parties: z.array(partySchema).min(1),

  // Court info (read from case, included for AI context)
  court_type: z.string(),
  county: z.string().optional(),
  cause_number: z.string().optional(),

  // Facts
  description: z.string().min(10),
  incident_date: z.string().optional(),
  incident_location: z.string().optional(),

  // Claims (flexible — adapts by dispute type)
  claim_details: z.string().optional(),
  amount_sought: z.number().optional(),
  other_relief: z.string().optional(),
  request_attorney_fees: z.boolean().default(false),
  request_court_costs: z.boolean().default(true),

  // Defendant-only
  is_general_denial: z.boolean().optional(),
  specific_defenses: z.string().optional(),
  has_counterclaim: z.boolean().optional(),
  counterclaim_details: z.string().optional(),

  // Context
  role: z.enum(['plaintiff', 'defendant']),
  dispute_type: z.string().optional(),
})

export type FilingFacts = z.infer<typeof filingFactsSchema>

export const generateFilingRequestSchema = z.object({
  facts: filingFactsSchema,
})

export const filingChecklistSchema = z.object({
  account_created: z.boolean().default(false),
  court_selected: z.boolean().default(false),
  filing_type_chosen: z.boolean().default(false),
  document_uploaded: z.boolean().default(false),
  fee_paid: z.boolean().default(false),
  submitted: z.boolean().default(false),
  confirmation_number: z.string().optional(),
})

export type FilingChecklist = z.infer<typeof filingChecklistSchema>
