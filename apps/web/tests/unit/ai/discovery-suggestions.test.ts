import { describe, it, expect } from 'vitest'
import {
  buildStaticDiscoveryPack,
  buildDiscoverySuggestionPrompt,
  discoverySuggestionSchema,
  DISCOVERY_SUGGESTION_SYSTEM_PROMPT,
} from '@/lib/ai/discovery-suggestions'

describe('discovery-suggestions', () => {
  it('returns debt defense discovery items with title containing "Interrogatories", >= 3 items, both rfp and rog types', () => {
    const result = buildStaticDiscoveryPack({ dispute_type: 'debt' })
    expect(result.title).toContain('Interrogatories')
    expect(result.items.length).toBeGreaterThanOrEqual(3)
    const types = result.items.map((item) => item.item_type)
    expect(types).toContain('rfp')
    expect(types).toContain('rog')
  })

  it('returns landlord tenant items with >= 3 items', () => {
    const result = buildStaticDiscoveryPack({ dispute_type: 'landlord_tenant' })
    expect(result.items.length).toBeGreaterThanOrEqual(3)
  })

  it('returns generic items for unknown type', () => {
    const result = buildStaticDiscoveryPack({ dispute_type: 'unknown_type' })
    expect(result.items.length).toBeGreaterThanOrEqual(1)
    expect(result.title).toBeTruthy()
  })

  it('builds prompt with context (dispute_type, role, evidence categories)', () => {
    const prompt = buildDiscoverySuggestionPrompt({
      dispute_type: 'debt',
      state: 'California',
      role: 'defendant',
      evidence_categories: ['Financial Records', 'Emails'],
    })
    expect(prompt).toContain('debt')
    expect(prompt).toContain('California')
    expect(prompt).toContain('defendant')
    expect(prompt).toContain('Financial Records')
    expect(prompt).toContain('Emails')
  })

  it('validates schema with valid data', () => {
    const valid = {
      title: 'Debt Defense Discovery Pack',
      items: [
        { item_type: 'rfp', prompt_text: 'Produce all contracts related to the alleged debt.' },
        { item_type: 'rog', prompt_text: 'Identify the original creditor.' },
      ],
    }
    const result = discoverySuggestionSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  it('exports system prompt containing "discovery"', () => {
    expect(DISCOVERY_SUGGESTION_SYSTEM_PROMPT.toLowerCase()).toContain('discovery')
  })
})
