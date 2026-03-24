import { z } from 'zod'
import { partySchema } from './filing'

export const damageItemSchema = z.object({
  category: z.string().min(1),
  amount: z.number().positive(),
  description: z.string().optional(),
})

export const smallClaimsFilingFactsSchema = z.object({
  plaintiff: partySchema,
  defendant: partySchema,
  court_type: z.literal('jp'),
  county: z.string().min(1),
  precinct: z.string().optional(),
  cause_number: z.string().optional(),
  claim_sub_type: z.enum([
    'security_deposit',
    'breach_of_contract',
    'consumer_refund',
    'property_damage',
    'car_accident',
    'neighbor_dispute',
    'unpaid_loan',
    'other',
  ]),
  claim_amount: z.number().positive().max(20000),
  damages_breakdown: z.array(damageItemSchema).min(1),
  incident_date: z.string().min(1),
  description: z.string().min(10),
  demand_letter_sent: z.boolean(),
  demand_letter_date: z.string().optional(),
  lease_dates: z.string().optional(),
  deposit_amount: z.number().optional(),
  contract_date: z.string().optional(),
  loan_amount: z.number().optional(),
  loan_date: z.string().optional(),
  accident_date: z.string().optional(),
  defendant_is_business: z.boolean().default(false),
})

export type SmallClaimsFilingFacts = z.infer<typeof smallClaimsFilingFactsSchema>
