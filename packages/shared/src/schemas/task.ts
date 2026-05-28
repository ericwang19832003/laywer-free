import { z } from 'zod'

export const updateTaskSchema = z.object({
  status: z.enum(['todo', 'in_progress', 'needs_review', 'completed', 'skipped']).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>

// Valid status transitions
export const VALID_TRANSITIONS: Record<string, string[]> = {
  locked: [],
  todo: ['in_progress', 'completed', 'skipped'],
  in_progress: ['in_progress', 'needs_review', 'completed', 'skipped'],
  needs_review: ['completed', 'in_progress'],
  completed: ['completed', 'in_progress'],
  skipped: ['todo', 'in_progress', 'completed'],
}
