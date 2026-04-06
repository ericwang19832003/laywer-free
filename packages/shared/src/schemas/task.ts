import { z } from 'zod'

export const updateTaskSchema = z.object({
  status: z.enum(['todo', 'in_progress', 'needs_review', 'completed', 'skipped']),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>

// Valid status transitions
export const VALID_TRANSITIONS: Record<string, string[]> = {
  locked: [],
  todo: ['in_progress', 'skipped'],
  in_progress: ['needs_review', 'completed', 'skipped'],
  needs_review: ['completed', 'in_progress'],
  completed: [],
  skipped: ['todo'],
}
