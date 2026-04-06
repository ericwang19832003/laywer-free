import { z } from 'zod'

// ---- Create objection review ----

export const createObjectionReviewSchema = z.object({
  pack_id: z.string().uuid(),
})

export type CreateObjectionReviewInput = z.infer<typeof createObjectionReviewSchema>
