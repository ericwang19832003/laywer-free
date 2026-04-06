import { z } from 'zod'
import { updateTaskSchema } from '../schemas/task'

// Re-export the Zod-inferred input type for convenience
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>

export type TaskStatus = 'locked' | 'todo' | 'in_progress' | 'needs_review' | 'completed' | 'skipped'

/** Row shape returned by Supabase for the tasks table */
export interface TaskRow {
  id: string
  case_id: string
  step_key: string
  status: TaskStatus
  metadata?: Record<string, unknown> | null
  created_at: string
  updated_at: string
}
