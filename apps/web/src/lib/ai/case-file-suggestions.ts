import { z } from 'zod'
import {
  SUGGESTION_PRIORITIES,
  SUGGESTION_ACTION_TYPES,
  type SuggestionPriority,
  type SuggestionActionType,
} from '@lawyer-free/shared/schemas/case-file'

export interface PipelineState {
  dispute_type: string
  evidence_count: number
  exhibited_count: number
  unexhibited_count: number
  discovery_pack_count: number
  discovery_packs_complete: boolean
  binder_count: number
  latest_binder_at: string | null
  evidence_changed_since_binder: boolean
  flagged_objections: number
  approaching_deadlines: number
}

export interface Suggestion {
  title: string
  description: string
  priority: SuggestionPriority
  action_type: SuggestionActionType
  action_payload: Record<string, unknown>
}

export const suggestionResponseSchema = z.object({
  suggestions: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      priority: z.enum(SUGGESTION_PRIORITIES),
      action_type: z.enum(SUGGESTION_ACTION_TYPES),
      action_payload: z.record(z.string(), z.unknown()).optional().default({}),
    })
  ),
})

export type SuggestionResponse = z.infer<typeof suggestionResponseSchema>

export function generateStaticSuggestions(state: PipelineState): Suggestion[] {
  const suggestions: Suggestion[] = []

  // 1. Approaching deadlines — urgent
  if (state.approaching_deadlines > 0) {
    const n = state.approaching_deadlines
    suggestions.push({
      title: `${n} deadline${n > 1 ? 's' : ''} approaching`,
      description: `You have ${n} deadline${n > 1 ? 's' : ''} coming up soon. Review and prepare your filings before they pass.`,
      priority: 'urgent',
      action_type: 'navigate',
      action_payload: { route: 'deadlines' },
    })
  }

  // 2. Flagged objections — urgent
  if (state.flagged_objections > 0) {
    const n = state.flagged_objections
    suggestions.push({
      title: `${n} objection${n > 1 ? 's' : ''} need attention`,
      description: `${n} objection${n > 1 ? 's have' : ' has'} been flagged for your review. Address them to strengthen your case.`,
      priority: 'urgent',
      action_type: 'navigate',
      action_payload: { route: 'objections' },
    })
  }

  // 3. No evidence at all — recommended
  if (state.evidence_count === 0) {
    suggestions.push({
      title: 'Upload your key evidence',
      description: 'Start building your case by uploading documents, photos, and communications to the evidence vault.',
      priority: 'recommended',
      action_type: 'navigate',
      action_payload: { route: 'evidence' },
    })
  }

  // 4. Unexhibited evidence
  if (state.unexhibited_count > 0) {
    const n = state.unexhibited_count
    const priority: SuggestionPriority =
      state.exhibited_count === 0 ? 'recommended' : 'nice_to_have'
    suggestions.push({
      title: `${n} evidence item${n > 1 ? 's' : ''} not yet exhibited`,
      description: `You have ${n} piece${n > 1 ? 's' : ''} of evidence that haven't been added to an exhibit list. Exhibiting evidence makes it easier to reference in court.`,
      priority,
      action_type: 'navigate',
      action_payload: { route: 'exhibits' },
    })
  }

  // 5. Exhibits exist but no discovery packs
  if (state.exhibited_count > 0 && state.discovery_pack_count === 0) {
    suggestions.push({
      title: 'Start a discovery pack',
      description: 'You have exhibited evidence ready. Organize it into a discovery pack to prepare for the discovery phase.',
      priority: 'recommended',
      action_type: 'navigate',
      action_payload: { route: 'discovery' },
    })
  }

  // 6. Exhibits ready, all discovery complete, no binder
  if (
    state.exhibited_count > 0 &&
    state.discovery_packs_complete &&
    state.binder_count === 0
  ) {
    suggestions.push({
      title: 'Generate your trial binder',
      description: 'Your evidence is exhibited and discovery is complete. Generate a trial binder to organize everything for court.',
      priority: 'recommended',
      action_type: 'ai_trigger',
      action_payload: { action: 'generate_binder' },
    })
  }

  // 7. Binder exists but evidence has changed
  if (state.binder_count > 0 && state.evidence_changed_since_binder) {
    suggestions.push({
      title: 'Regenerate your trial binder',
      description: 'Your evidence has changed since the last trial binder was generated. Regenerate it to include the latest materials.',
      priority: 'recommended',
      action_type: 'ai_trigger',
      action_payload: { action: 'regenerate_binder' },
    })
  }

  // Return at most 5 suggestions
  return suggestions.slice(0, 5)
}

export const CASE_FILE_SUGGESTION_SYSTEM_PROMPT = `You generate next-step suggestion cards for a pro se litigant's case-file pipeline.

Given the current pipeline state, produce 1-5 prioritized suggestions to help the user advance their case.

Each suggestion must have:
- title: short, actionable (max 80 chars)
- description: 1-2 sentence explanation (max 300 chars)
- priority: "urgent" | "recommended" | "nice_to_have"
- action_type: "navigate" | "ai_trigger" | "info"
- action_payload: object with route or action details

RULES:
- Never give legal advice
- Never use directive language ("you must", "you should file")
- Focus on pipeline workflow steps, not legal strategy
- Prioritize urgent items (deadlines, objections) first
- Suggest at most 5 items

Respond with JSON only:
{
  "suggestions": [
    { "title": "...", "description": "...", "priority": "...", "action_type": "...", "action_payload": {} }
  ]
}`

export function buildSuggestionPrompt(state: PipelineState): {
  system: string
  user: string
} {
  const userLines = [
    '--- PIPELINE STATE ---',
    `Dispute type: ${state.dispute_type}`,
    `Evidence count: ${state.evidence_count}`,
    `Exhibited: ${state.exhibited_count}`,
    `Unexhibited: ${state.unexhibited_count}`,
    `Discovery packs: ${state.discovery_pack_count}`,
    `Discovery complete: ${state.discovery_packs_complete ? 'yes' : 'no'}`,
    `Binders: ${state.binder_count}`,
    `Latest binder at: ${state.latest_binder_at ?? 'none'}`,
    `Evidence changed since binder: ${state.evidence_changed_since_binder ? 'yes' : 'no'}`,
    `Flagged objections: ${state.flagged_objections}`,
    `Approaching deadlines: ${state.approaching_deadlines}`,
  ]

  return {
    system: CASE_FILE_SUGGESTION_SYSTEM_PROMPT,
    user: userLines.join('\n'),
  }
}
