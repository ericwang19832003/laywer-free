import { z } from 'zod'

export const OBJECTION_LABELS = [
  'relevance',
  'overbroad',
  'vague_ambiguous',
  'undue_burden',
  'privilege',
  'confidentiality',
  'not_in_possession',
  'already_produced',
  'premature',
  'general_objection',
  'non_responsive',
  'incomplete',
  'other',
] as const

export type ObjectionLabel = (typeof OBJECTION_LABELS)[number]

export const ITEM_TYPES = ['rfp', 'rog', 'rfa', 'unknown'] as const

export const classificationItemSchema = z.object({
  item_type: z.enum(ITEM_TYPES),
  item_no: z.number().int().positive().nullable(),
  labels: z.array(z.enum(OBJECTION_LABELS)).min(1),
  neutral_summary: z.string().min(1),
  follow_up_flag: z.boolean(),
  confidence: z.number().min(0).max(1),
})

export type ClassificationItem = z.infer<typeof classificationItemSchema>

export const classificationOutputSchema = z.object({
  items: z.array(classificationItemSchema),
})

export type ClassificationOutput = z.infer<typeof classificationOutputSchema>

// ── Confirm review schemas ───────────────────────

export const confirmItemSchema = z.object({
  id: z.string().uuid(),
  labels: z.array(z.enum(OBJECTION_LABELS)).min(1),
  neutral_summary: z.string().min(1),
  follow_up_flag: z.boolean(),
})

export type ConfirmItem = z.infer<typeof confirmItemSchema>

export const confirmReviewSchema = z.object({
  items: z.array(confirmItemSchema).min(1),
})

export type ConfirmReviewInput = z.infer<typeof confirmReviewSchema>
