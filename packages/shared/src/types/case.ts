import { z } from 'zod'
import { createCaseSchema } from '../schemas/case'

// Re-export the Zod-inferred input type for convenience
export type CreateCaseInput = z.infer<typeof createCaseSchema>

/** Row shape returned by Supabase for the cases table */
export interface CaseRow {
  id: string
  user_id: string
  state: string
  role: 'plaintiff' | 'defendant'
  county?: string | null
  court_type?: string | null
  dispute_type?: string | null
  status: string
  created_at: string
  updated_at: string
}
