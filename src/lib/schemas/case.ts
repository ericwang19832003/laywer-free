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

export const createCaseSchema = z.object({
  role: z.enum(['plaintiff', 'defendant']),
  county: z.string().optional(),
  court_type: z.enum(['jp', 'county', 'district', 'federal', 'unknown']).optional().default('unknown'),
  dispute_type: z.enum(DISPUTE_TYPES).optional(),
})

export type CreateCaseInput = z.infer<typeof createCaseSchema>
