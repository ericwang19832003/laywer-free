import { z } from 'zod'

// ── Request schema (client → server) ────────────────────
// NOTE: opponent_email is intentionally excluded — never sent to AI

export const aiPreservationLetterRequestSchema = z.object({
  summary: z.string().min(1, 'Summary is required'),
  incident_date: z.string().optional(),
  evidence_categories: z.array(z.string()).default([]),
  tone: z.enum(['polite', 'neutral', 'firm']),
  opponent_name: z.string().optional(),
})

export type AiPreservationLetterRequest = z.infer<typeof aiPreservationLetterRequestSchema>

// ── Response schema (AI output validation) ──────────────

export const aiPreservationLetterResponseSchema = z.object({
  subject: z.string().min(1),
  body: z.string().min(1),
  evidenceBullets: z.array(z.string()),
  disclaimers: z.array(z.string()),
})

export type AiPreservationLetterResponse = z.infer<typeof aiPreservationLetterResponseSchema>
