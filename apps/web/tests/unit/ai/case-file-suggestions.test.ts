import { describe, it, expect } from 'vitest'
import {
  generateStaticSuggestions,
  suggestionResponseSchema,
  buildSuggestionPrompt,
  CASE_FILE_SUGGESTION_SYSTEM_PROMPT,
  type PipelineState,
} from '@/lib/ai/case-file-suggestions'

function makeState(overrides: Partial<PipelineState> = {}): PipelineState {
  return {
    dispute_type: 'small_claims',
    evidence_count: 0,
    exhibited_count: 0,
    unexhibited_count: 0,
    discovery_pack_count: 0,
    discovery_packs_complete: false,
    binder_count: 0,
    latest_binder_at: null,
    evidence_changed_since_binder: false,
    flagged_objections: 0,
    approaching_deadlines: 0,
    ...overrides,
  }
}

describe('case-file-suggestions', () => {
  it('suggests uploading evidence for empty case', () => {
    const suggestions = generateStaticSuggestions(makeState())
    const upload = suggestions.find((s) => s.title.toLowerCase().includes('upload'))
    expect(upload).toBeDefined()
    expect(upload!.priority).toBe('recommended')
    expect(upload!.action_type).toBe('navigate')
  })

  it('suggests exhibiting when evidence exists but no exhibits', () => {
    const suggestions = generateStaticSuggestions(
      makeState({ evidence_count: 5, unexhibited_count: 5 })
    )
    const exhibit = suggestions.find((s) => s.title.toLowerCase().includes('exhibited'))
    expect(exhibit).toBeDefined()
    expect(exhibit!.title).toContain('5')
  })

  it('suggests discovery when exhibits exist but no packs', () => {
    const suggestions = generateStaticSuggestions(
      makeState({
        evidence_count: 5,
        exhibited_count: 5,
        unexhibited_count: 0,
        discovery_pack_count: 0,
      })
    )
    const discovery = suggestions.find((s) => s.title.toLowerCase().includes('discovery'))
    expect(discovery).toBeDefined()
    expect(discovery!.priority).toBe('recommended')
  })

  it('suggests binder when case is trial-ready', () => {
    const suggestions = generateStaticSuggestions(
      makeState({
        evidence_count: 10,
        exhibited_count: 10,
        unexhibited_count: 0,
        discovery_pack_count: 2,
        discovery_packs_complete: true,
        binder_count: 0,
      })
    )
    const binder = suggestions.find((s) => s.title.toLowerCase().includes('trial binder'))
    expect(binder).toBeDefined()
    expect(binder!.priority).toBe('recommended')
    expect(binder!.action_type).toBe('ai_trigger')
  })

  it('suggests regeneration when binder is stale', () => {
    const suggestions = generateStaticSuggestions(
      makeState({
        evidence_count: 10,
        exhibited_count: 10,
        unexhibited_count: 0,
        discovery_pack_count: 2,
        discovery_packs_complete: true,
        binder_count: 1,
        latest_binder_at: '2025-01-01T00:00:00Z',
        evidence_changed_since_binder: true,
      })
    )
    const regen = suggestions.find((s) => s.title.toLowerCase().includes('regenerate'))
    expect(regen).toBeDefined()
    expect(regen!.priority).toBe('recommended')
  })

  it('suggests addressing flagged objections as urgent', () => {
    const suggestions = generateStaticSuggestions(
      makeState({ flagged_objections: 3 })
    )
    const objection = suggestions.find((s) => s.title.toLowerCase().includes('objection'))
    expect(objection).toBeDefined()
    expect(objection!.priority).toBe('urgent')
    expect(objection!.title).toContain('3')
  })

  it('marks approaching deadlines as urgent', () => {
    const suggestions = generateStaticSuggestions(
      makeState({ approaching_deadlines: 2 })
    )
    const deadline = suggestions.find((s) => s.title.toLowerCase().includes('deadline'))
    expect(deadline).toBeDefined()
    expect(deadline!.priority).toBe('urgent')
    expect(deadline!.title).toContain('2')
  })

  it('returns at most 5 suggestions', () => {
    const suggestions = generateStaticSuggestions(
      makeState({
        approaching_deadlines: 1,
        flagged_objections: 1,
        evidence_count: 10,
        exhibited_count: 5,
        unexhibited_count: 5,
        discovery_pack_count: 0,
        discovery_packs_complete: false,
        binder_count: 1,
        evidence_changed_since_binder: true,
      })
    )
    expect(suggestions.length).toBeLessThanOrEqual(5)
  })

  it('validates AI response schema', () => {
    const valid = {
      suggestions: [
        {
          title: 'Upload evidence',
          description: 'Start building your case.',
          priority: 'recommended',
          action_type: 'navigate',
          action_payload: { route: 'evidence' },
        },
      ],
    }
    const result = suggestionResponseSchema.safeParse(valid)
    expect(result.success).toBe(true)

    const invalid = {
      suggestions: [
        {
          title: 'Bad',
          description: 'Missing fields',
          priority: 'invalid_priority',
          action_type: 'navigate',
        },
      ],
    }
    const result2 = suggestionResponseSchema.safeParse(invalid)
    expect(result2.success).toBe(false)
  })

  it('exports system prompt containing "suggestion"', () => {
    expect(CASE_FILE_SUGGESTION_SYSTEM_PROMPT.toLowerCase()).toContain('suggestion')
  })
})
