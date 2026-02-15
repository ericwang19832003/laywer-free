import { z } from 'zod'

export const createCaseSchema = z.object({
  role: z.enum(['plaintiff', 'defendant']),
  county: z.string().optional(),
  court_type: z.enum(['jp', 'county', 'district', 'unknown']).optional().default('unknown'),
  dispute_type: z.string().optional(),
})

export type CreateCaseInput = z.infer<typeof createCaseSchema>
