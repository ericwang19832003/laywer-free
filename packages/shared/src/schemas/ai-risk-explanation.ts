import { z } from 'zod'

// ── AI output schema ─────────────────────────────────────

export const aiRiskExplanationSchema = z.object({
  summary: z.string().min(1),
  focus_areas: z.array(z.string().min(1)).min(1).max(3),
  tone: z.literal('calm'),
})

export type AiRiskExplanation = z.infer<typeof aiRiskExplanationSchema>
