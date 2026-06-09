import { describe, it, expect } from 'vitest'
import {
  buildDiscoverySuggestionPrompt,
  discoverySuggestionSchema,
  DISCOVERY_SUGGESTION_SYSTEM_PROMPT,
  buildStaticDiscoveryPack,
} from '@/lib/ai/discovery-suggestions'

describe('Discovery Pack Generator — prompt and schema', () => {
  it('prompt contains dispute_type, state, and role', () => {
    const prompt = buildDiscoverySuggestionPrompt({
      dispute_type: 'debt',
      state: 'TX',
      role: 'defendant',
    })
    expect(prompt).toContain('debt')
    expect(prompt).toContain('TX')
    expect(prompt).toContain('defendant')
  })

  it('prompt includes evidence_categories when provided', () => {
    const prompt = buildDiscoverySuggestionPrompt({
      dispute_type: 'debt',
      state: 'TX',
      role: 'defendant',
      evidence_categories: ['Photos', 'Contracts'],
    })
    expect(prompt).toContain('Photos')
    expect(prompt).toContain('Contracts')
  })

  it('schema validates a proper AI response', () => {
    const valid = {
      title: 'Debt Defense Discovery Pack',
      items: [
        { item_type: 'rfp', prompt_text: 'Produce the original signed agreement.' },
        { item_type: 'rog', prompt_text: 'Identify all prior owners of the alleged debt.' },
      ],
    }
    expect(discoverySuggestionSchema.safeParse(valid).success).toBe(true)
  })

  it('schema rejects response with empty items', () => {
    expect(discoverySuggestionSchema.safeParse({ title: 'Pack', items: [] }).success).toBe(false)
  })

  it('system prompt does not contain legal advice phrases', () => {
    const lower = DISCOVERY_SUGGESTION_SYSTEM_PROMPT.toLowerCase()
    // The system prompt explicitly prohibits these — verify it doesn't use them as directives
    expect(lower).not.toContain('as your attorney')
    expect(lower).not.toContain('i recommend')
  })

  it('static pack for unknown type returns at least one item', () => {
    const pack = buildStaticDiscoveryPack({ dispute_type: 'bizarre_type' })
    expect(pack.items.length).toBeGreaterThanOrEqual(1)
    expect(pack.title).toBeTruthy()
  })
})

describe('Discovery item numbering helper', () => {
  it('numbers items by type independently', () => {
    const items = [
      { item_type: 'rfp' as const, prompt_text: 'RFP 1' },
      { item_type: 'rog' as const, prompt_text: 'ROG 1' },
      { item_type: 'rfp' as const, prompt_text: 'RFP 2' },
      { item_type: 'rfa' as const, prompt_text: 'RFA 1' },
      { item_type: 'rog' as const, prompt_text: 'ROG 2' },
    ]
    const counters: Record<string, number> = {}
    const numbered = items.map((item) => {
      counters[item.item_type] = (counters[item.item_type] ?? 0) + 1
      return { ...item, item_no: counters[item.item_type] }
    })
    expect(numbered[0].item_no).toBe(1) // RFP-1
    expect(numbered[1].item_no).toBe(1) // ROG-1
    expect(numbered[2].item_no).toBe(2) // RFP-2
    expect(numbered[3].item_no).toBe(1) // RFA-1
    expect(numbered[4].item_no).toBe(2) // ROG-2
  })
})
