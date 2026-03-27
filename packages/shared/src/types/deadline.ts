import { z } from 'zod'
import { createDeadlineSchema, confirmAnswerDeadlineSchema } from '../schemas/deadline'

// Re-export Zod-inferred input types for convenience
export type CreateDeadlineInput = z.infer<typeof createDeadlineSchema>
export type ConfirmAnswerDeadlineInput = z.infer<typeof confirmAnswerDeadlineSchema>

/** Row shape returned by Supabase for the deadlines table */
export interface DeadlineRow {
  id: string
  case_id: string
  key: string
  due_at: string
  source: 'system' | 'user_confirmed' | 'court_notice'
  rationale?: string | null
  label?: string | null
  consequence?: string | null
  auto_generated: boolean
  created_at: string
}
