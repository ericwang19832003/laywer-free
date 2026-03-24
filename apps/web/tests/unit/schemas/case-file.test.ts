import { describe, it, expect } from 'vitest'
import {
  createChecklistItemSchema,
  updateChecklistItemSchema,
  createSuggestionSchema,
  dismissSuggestionSchema,
  createEvidenceLinkSchema,
  SUGGESTION_TYPES,
  SUGGESTION_PRIORITIES,
  SUGGESTION_ACTION_TYPES,
} from '@/lib/schemas/case-file'

describe('case-file schemas', () => {
  it('validates a valid checklist item', () => {
    const result = createChecklistItemSchema.safeParse({
      label: 'Original signed contract',
      category: 'contract',
      sort_order: 0,
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty label', () => {
    const result = createChecklistItemSchema.safeParse({
      label: '',
      category: 'contract',
    })
    expect(result.success).toBe(false)
  })

  it('allows partial update of checklist item', () => {
    const result = updateChecklistItemSchema.safeParse({
      checked: true,
    })
    expect(result.success).toBe(true)
  })

  it('allows linking matched evidence', () => {
    const result = updateChecklistItemSchema.safeParse({
      matched_evidence_id: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.success).toBe(true)
  })

  it('validates a valid suggestion', () => {
    const result = createSuggestionSchema.safeParse({
      suggestion_type: 'next_step',
      priority: 'recommended',
      title: 'Add evidence to exhibits',
      description: 'You have 4 unexhibited items.',
      action_type: 'navigate',
      action_payload: { route: '/case/123/case-file?stage=organize' },
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid suggestion_type', () => {
    const result = createSuggestionSchema.safeParse({
      suggestion_type: 'invalid',
      priority: 'recommended',
      title: 'Test',
      description: 'Test',
      action_type: 'navigate',
    })
    expect(result.success).toBe(false)
  })

  it('validates a valid evidence link', () => {
    const result = createEvidenceLinkSchema.safeParse({
      discovery_item_id: '550e8400-e29b-41d4-a716-446655440000',
      evidence_item_id: '550e8400-e29b-41d4-a716-446655440001',
    })
    expect(result.success).toBe(true)
  })

  it('rejects non-uuid evidence link ids', () => {
    const result = createEvidenceLinkSchema.safeParse({
      discovery_item_id: 'not-a-uuid',
      evidence_item_id: '550e8400-e29b-41d4-a716-446655440001',
    })
    expect(result.success).toBe(false)
  })

  it('exports correct suggestion type constants', () => {
    expect(SUGGESTION_TYPES).toEqual(['next_step', 'stage_guide', 'action_result'])
    expect(SUGGESTION_PRIORITIES).toEqual(['urgent', 'recommended', 'nice_to_have'])
    expect(SUGGESTION_ACTION_TYPES).toEqual(['navigate', 'ai_trigger', 'info'])
  })
})
