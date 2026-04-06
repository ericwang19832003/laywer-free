import { z } from 'zod'
import { partySchema } from './filing'
import { damageItemSchema } from './small-claims-filing'

export const landlordTenantFilingFactsSchema = z.object({
  party_role: z.enum(['landlord', 'tenant']),
  your_info: partySchema,
  other_party: partySchema,
  court_type: z.enum(['jp', 'county', 'district']),
  county: z.string().min(1),
  cause_number: z.string().optional(),
  landlord_tenant_sub_type: z.enum([
    'eviction', 'nonpayment', 'security_deposit', 'property_damage',
    'repair_maintenance', 'lease_termination', 'habitability', 'other',
  ]),
  property_address: z.string().min(5),
  lease_start_date: z.string().optional(),
  lease_end_date: z.string().optional(),
  lease_type: z.string().optional(),
  monthly_rent: z.number().optional(),
  deposit_amount: z.number().optional(),
  claim_amount: z.number().positive(),
  damages_breakdown: z.array(damageItemSchema).min(1),
  description: z.string().min(10),
  eviction_notice_date: z.string().optional(),
  eviction_notice_type: z.string().optional(),
  eviction_reason: z.string().optional(),
  repair_requests: z.array(z.object({
    date: z.string(),
    issue: z.string(),
    response: z.string().optional(),
    status: z.string().optional(),
  })).optional(),
  deposit_deductions: z.array(z.object({
    amount: z.number(),
    reason: z.string(),
  })).optional(),
  habitability_issues: z.string().optional(),
  demand_letter_sent: z.boolean(),
  demand_letter_date: z.string().optional(),
})

export type LandlordTenantFilingFacts = z.infer<typeof landlordTenantFilingFactsSchema>
