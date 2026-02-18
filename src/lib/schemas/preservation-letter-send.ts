import { z } from 'zod'

export const sendPreservationLetterSchema = z.object({
  document_id: z.string().uuid(),
  to_email: z.string().email(),
})
