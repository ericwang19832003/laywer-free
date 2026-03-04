import { z } from 'zod'

export const DISPUTE_TYPES = [
  'debt_collection',
  'landlord_tenant',
  'personal_injury',
  'contract',
  'property',
  'family',
  'small_claims',
  'other',
] as const

export const FAMILY_SUB_TYPES = [
  'divorce',
  'custody',
  'child_support',
  'visitation',
  'spousal_support',
  'protective_order',
  'modification',
] as const

export const SMALL_CLAIMS_SUB_TYPES = [
  'security_deposit',
  'breach_of_contract',
  'consumer_refund',
  'property_damage',
  'car_accident',
  'neighbor_dispute',
  'unpaid_loan',
  'other',
] as const

export type SmallClaimsSubType = (typeof SMALL_CLAIMS_SUB_TYPES)[number]

export const LANDLORD_TENANT_SUB_TYPES = [
  'eviction',
  'nonpayment',
  'security_deposit',
  'property_damage',
  'repair_maintenance',
  'lease_termination',
  'habitability',
  'other',
] as const

export type LandlordTenantSubType = (typeof LANDLORD_TENANT_SUB_TYPES)[number]

export const DEBT_SUB_TYPES = [
  'credit_card',
  'medical_bills',
  'personal_loan',
  'auto_loan',
  'payday_loan',
  'debt_buyer',
  'other',
] as const

export type DebtSubType = (typeof DEBT_SUB_TYPES)[number]

export const createCaseSchema = z.object({
  role: z.enum(['plaintiff', 'defendant']),
  county: z.string().optional(),
  court_type: z.enum(['jp', 'county', 'district', 'federal', 'unknown']).optional().default('unknown'),
  dispute_type: z.enum(DISPUTE_TYPES).optional(),
  family_sub_type: z.enum(FAMILY_SUB_TYPES).optional(),
  small_claims_sub_type: z.enum(SMALL_CLAIMS_SUB_TYPES).optional(),
  landlord_tenant_sub_type: z.enum(LANDLORD_TENANT_SUB_TYPES).optional(),
  debt_sub_type: z.enum(DEBT_SUB_TYPES).optional(),
})

export type CreateCaseInput = z.infer<typeof createCaseSchema>
