import { z } from 'zod'

export const DISPUTE_TYPES = [
  'debt_collection',
  'landlord_tenant',
  'personal_injury',
  'contract',
  'property',
  'family',
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

export const createCaseSchema = z.object({
  role: z.enum(['plaintiff', 'defendant']),
  county: z.string().optional(),
  court_type: z.enum(['jp', 'county', 'district', 'federal', 'unknown']).optional().default('unknown'),
  dispute_type: z.enum(DISPUTE_TYPES).optional(),
  family_sub_type: z.enum(FAMILY_SUB_TYPES).optional(),
})

export type CreateCaseInput = z.infer<typeof createCaseSchema>
