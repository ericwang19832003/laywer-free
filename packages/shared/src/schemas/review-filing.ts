import { z } from 'zod'
import { SUPPORTED_STATES } from '../jurisdiction-rules/schema'

export const reviewFilingRequestSchema = z.object({
  petitionDraft: z.string().min(1),
  state: z.enum(SUPPORTED_STATES),
  disputeType: z.string().min(1),
  subType: z.string().optional(),
})

export type ReviewFilingRequest = z.infer<typeof reviewFilingRequestSchema>
