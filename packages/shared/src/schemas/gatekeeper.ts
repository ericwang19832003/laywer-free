import { z } from 'zod'

export const runGatekeeperSchema = z.object({
  now: z.string().datetime().optional(),
})
