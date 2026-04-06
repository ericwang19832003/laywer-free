import { z } from 'zod'

export const SUGGESTION_TYPES = ['next_step', 'stage_guide', 'action_result'] as const
export type SuggestionType = (typeof SUGGESTION_TYPES)[number]

export const SUGGESTION_PRIORITIES = ['urgent', 'recommended', 'nice_to_have'] as const
export type SuggestionPriority = (typeof SUGGESTION_PRIORITIES)[number]

export const SUGGESTION_ACTION_TYPES = ['navigate', 'ai_trigger', 'info'] as const
export type SuggestionActionType = (typeof SUGGESTION_ACTION_TYPES)[number]

export const PIPELINE_STAGES = ['collect', 'organize', 'discover', 'prepare'] as const
export type PipelineStage = (typeof PIPELINE_STAGES)[number]

export const createChecklistItemSchema = z.object({
  label: z.string().min(1).max(500),
  category: z.string().max(100).optional(),
  sort_order: z.number().int().min(0).optional(),
})
export type CreateChecklistItemInput = z.infer<typeof createChecklistItemSchema>

export const updateChecklistItemSchema = z.object({
  checked: z.boolean().optional(),
  matched_evidence_id: z.string().uuid().nullable().optional(),
  label: z.string().min(1).max(500).optional(),
})
export type UpdateChecklistItemInput = z.infer<typeof updateChecklistItemSchema>

export const createSuggestionSchema = z.object({
  suggestion_type: z.enum(SUGGESTION_TYPES),
  priority: z.enum(SUGGESTION_PRIORITIES),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  action_type: z.enum(SUGGESTION_ACTION_TYPES),
  action_payload: z.record(z.string(), z.unknown()).optional().default({}),
  expires_at: z.string().datetime().optional(),
})
export type CreateSuggestionInput = z.infer<typeof createSuggestionSchema>

export const dismissSuggestionSchema = z.object({
  suggestion_id: z.string().uuid(),
})
export type DismissSuggestionInput = z.infer<typeof dismissSuggestionSchema>

export const createEvidenceLinkSchema = z.object({
  discovery_item_id: z.string().uuid(),
  evidence_item_id: z.string().uuid(),
})
export type CreateEvidenceLinkInput = z.infer<typeof createEvidenceLinkSchema>

export const pipelineStageSchema = z.enum(PIPELINE_STAGES)
