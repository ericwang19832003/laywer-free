import { z } from 'zod'

export const DISPUTE_TYPES = [
  'debt_collection',
  'landlord_tenant',
  'personal_injury',
  'contract',
  'property',
  'real_estate',
  'business',
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

export const BUSINESS_SUB_TYPES = [
  'partnership',
  'employment',
  'b2b_commercial',
] as const

export type BusinessSubType = (typeof BUSINESS_SUB_TYPES)[number]

export const BUSINESS_PARTNERSHIP_TYPES = [
  'breach_fiduciary',
  'profit_loss',
  'dissolution_buyout',
  'management_deadlock',
] as const

export const BUSINESS_EMPLOYMENT_TYPES = [
  'wrongful_termination',
  'wage_overtime',
  'non_compete_nda',
  'discrimination_harassment',
] as const

export const BUSINESS_B2B_TYPES = [
  'vendor_service',
  'ip_trade_secret',
  'unfair_competition',
  'breach_of_contract',
] as const

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

export const STATES = [
  'TX', 'CA', 'NY', 'FL', 'PA',
  'IL', 'OH', 'GA', 'NC', 'MI',
  'NJ', 'VA', 'WA', 'AZ', 'CO',
  'TN', 'IN', 'MO', 'MD', 'WI',
  'MN', 'SC', 'AL', 'LA', 'KY',
  'OR', 'NV', 'CT', 'MA', 'OK',
  'AR', 'MS', 'UT', 'NM', 'WV',
  'DE', 'RI', 'NH', 'VT', 'ME',
  'IA', 'KS', 'NE', 'SD', 'ND',
  'MT', 'WY', 'ID', 'HI', 'AK',
] as const
export type State = (typeof STATES)[number]

export const ALL_COURT_TYPES = [
  'jp', 'county', 'district',
  'small_claims', 'limited_civil', 'unlimited_civil',
  'ny_small_claims', 'ny_civil', 'ny_supreme', 'ny_family_court',
  'fl_small_claims', 'fl_county', 'fl_circuit',
  'pa_magisterial', 'pa_common_pleas',
  'il_small_claims', 'il_circuit',
  'oh_small_claims', 'oh_municipal', 'oh_common_pleas',
  'ga_magistrate', 'ga_state_court', 'ga_superior',
  'nc_small_claims', 'nc_district', 'nc_superior',
  'mi_small_claims', 'mi_district', 'mi_circuit',
  'nj_small_claims', 'nj_special_civil', 'nj_civil', 'nj_family',
  'va_small_claims', 'va_general_district', 'va_circuit', 'va_jdr',
  'wa_small_claims', 'wa_district', 'wa_superior',
  'az_small_claims', 'az_justice', 'az_superior',
  'co_small_claims', 'co_county', 'co_district',
  'tn_general_sessions', 'tn_circuit',
  'in_small_claims', 'in_circuit',
  'mo_small_claims', 'mo_associate_circuit', 'mo_circuit',
  'md_district', 'md_circuit',
  'wi_small_claims', 'wi_circuit',
  'mn_conciliation', 'mn_district',
  'sc_magistrate', 'sc_circuit',
  'al_small_claims', 'al_district', 'al_circuit',
  'la_small_claims', 'la_district',
  'ky_small_claims', 'ky_district', 'ky_circuit',
  'or_small_claims', 'or_circuit',
  'nv_small_claims', 'nv_district',
  'ct_small_claims', 'ct_superior',
  'ma_small_claims', 'ma_district',
  'ok_small_claims', 'ok_district',
  'ar_small_claims', 'ar_circuit',
  'ms_justice', 'ms_county', 'ms_circuit',
  'ut_small_claims', 'ut_district',
  'nm_magistrate', 'nm_district',
  'wv_magistrate', 'wv_circuit',
  'de_jp', 'de_common_pleas', 'de_superior',
  'ri_small_claims', 'ri_district', 'ri_superior',
  'nh_small_claims', 'nh_superior',
  'vt_small_claims', 'vt_superior',
  'me_small_claims', 'me_superior',
  'ia_small_claims', 'ia_district',
  'ks_small_claims', 'ks_district',
  'ne_small_claims', 'ne_county', 'ne_district',
  'sd_small_claims', 'sd_circuit',
  'nd_small_claims', 'nd_district',
  'mt_justice', 'mt_district',
  'wy_small_claims', 'wy_district',
  'id_small_claims', 'id_magistrate', 'id_district',
  'hi_small_claims', 'hi_district', 'hi_circuit',
  'ak_small_claims', 'ak_district',
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
  business_sub_type: z.enum(BUSINESS_SUB_TYPES).optional(),
  other_sub_type: z.enum(OTHER_SUB_TYPES).optional(),
  secondary_dispute_types: z.array(z.enum(DISPUTE_TYPES)).optional(),
  description: z.string().max(80).optional(),
  situation_description: z.string().max(2000).optional(),
})

export type CreateCaseInput = z.infer<typeof createCaseSchema>
