import { z } from 'zod'

export const reminderEscalationSchema = z.object({
  id: z.string().min(1),
  case_id: z.string().min(1),
  deadline_id: z.string().min(1),
  escalation_level: z.number().int().min(1).max(3),
  message: z.string().min(1),
  triggered_at: z.string().datetime(),
  due_at: z.string().datetime(),
  deadline_key: z.string().min(1),
})

export type ReminderEscalation = z.infer<typeof reminderEscalationSchema>
