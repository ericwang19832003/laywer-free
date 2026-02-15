import { z } from 'zod'

export const createEventSchema = z.object({
  kind: z.string().min(1),
  payload: z.record(z.string(), z.unknown()).optional().default({}),
  task_id: z.string().uuid().optional(),
})

export type CreateEventInput = z.infer<typeof createEventSchema>
