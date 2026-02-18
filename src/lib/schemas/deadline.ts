import { z } from 'zod'

export const createDeadlineSchema = z.object({
  key: z.string().min(1),
  due_at: z.string().datetime(),
  source: z.enum(['system', 'user_confirmed', 'court_notice']).optional().default('user_confirmed'),
  rationale: z.string().optional(),
})

export type CreateDeadlineInput = z.infer<typeof createDeadlineSchema>

export const confirmAnswerDeadlineSchema = z.object({
  confirmed_due_at: z.string().datetime(),
})

export type ConfirmAnswerDeadlineInput = z.infer<typeof confirmAnswerDeadlineSchema>
