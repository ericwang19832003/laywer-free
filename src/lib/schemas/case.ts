import { z } from 'zod'

export const DISPUTE_TYPES = [
  'debt_collection',
  'landlord_tenant',
  'personal_injury',
  'contract',
  'property',
  'real_estate',
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

export const PI_SUB_TYPES = [
  'auto_accident',
  'pedestrian_cyclist',
  'rideshare',
  'uninsured_motorist',
  'slip_and_fall',
  'dog_bite',
  'product_liability',
  'other_injury',
  'vehicle_damage',
  'property_damage_negligence',
  'vandalism',
  'other_property_damage',
] as const

export type PiSubType = (typeof PI_SUB_TYPES)[number]

export const CONTRACT_SUB_TYPES = [
  'breach_of_contract',
  'non_payment',
  'fraud_misrepresentation',
  'warranty',
  'employment',
  'construction',
  'other_contract',
] as const

export type ContractSubType = (typeof CONTRACT_SUB_TYPES)[number]

export const PROPERTY_DISPUTE_SUB_TYPES = [
  'boundary_dispute',
  'easement',
  'title_defect',
  'trespass',
  'nuisance',
  'hoa_dispute',
  'real_estate_transaction',
  'other_property',
] as const

export type PropertyDisputeSubType = (typeof PROPERTY_DISPUTE_SUB_TYPES)[number]

export const REAL_ESTATE_SUB_TYPES = [
  'failed_closing',
  'seller_disclosure',
  'buyer_breach',
  'title_defect',
  'earnest_money',
  'real_estate_fraud',
  'construction_defect',
  'other_real_estate',
] as const

export type RealEstateSubType = (typeof REAL_ESTATE_SUB_TYPES)[number]

export const OTHER_SUB_TYPES = [
  'consumer_protection',
  'civil_rights',
  'defamation',
  'harassment',
  'insurance_dispute',
  'government_action',
  'general_civil',
] as const

export type OtherSubType = (typeof OTHER_SUB_TYPES)[number]

export const STATES = ['TX', 'CA', 'NY', 'FL', 'PA'] as const
export type State = (typeof STATES)[number]

export const ALL_COURT_TYPES = [
  'jp', 'county', 'district',
  'small_claims', 'limited_civil', 'unlimited_civil',
  'ny_small_claims', 'ny_civil', 'ny_supreme',
  'fl_small_claims', 'fl_county', 'fl_circuit',
  'pa_magisterial', 'pa_common_pleas',
  'federal', 'unknown',
] as const

export const createCaseSchema = z.object({
  state: z.enum(STATES).optional().default('TX'),
  role: z.enum(['plaintiff', 'defendant']),
  county: z.string().optional(),
  court_type: z.enum(ALL_COURT_TYPES).optional().default('unknown'),
  dispute_type: z.enum(DISPUTE_TYPES).optional(),
  family_sub_type: z.enum(FAMILY_SUB_TYPES).optional(),
  small_claims_sub_type: z.enum(SMALL_CLAIMS_SUB_TYPES).optional(),
  landlord_tenant_sub_type: z.enum(LANDLORD_TENANT_SUB_TYPES).optional(),
  debt_sub_type: z.enum(DEBT_SUB_TYPES).optional(),
  pi_sub_type: z.enum(PI_SUB_TYPES).optional(),
  contract_sub_type: z.enum(CONTRACT_SUB_TYPES).optional(),
  property_sub_type: z.enum(PROPERTY_DISPUTE_SUB_TYPES).optional(),
  re_sub_type: z.enum(REAL_ESTATE_SUB_TYPES).optional(),
  other_sub_type: z.enum(OTHER_SUB_TYPES).optional(),
})

export type CreateCaseInput = z.infer<typeof createCaseSchema>
