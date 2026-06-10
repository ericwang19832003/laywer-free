import { describe, it, expect } from 'vitest'
import {
  buildChronologyPrompt,
  parseChronologyResponse,
} from '@/lib/ai/litigation-legal/chronology'

describe('buildChronologyPrompt', () => {
  it('includes case facts and perspective in prompt', () => {
    const { systemPrompt, userPrompt } = buildChronologyPrompt({
      caseName: 'Smith v. Jones',
      perspective: 'plaintiff',
      caseContext: '## Case Context\nState: TX',
      rawFacts: ['2024-01-15: Signed contract', '2024-02-01: Sent invoice'],
    })
    expect(systemPrompt).toContain('plaintiff')
    expect(userPrompt).toContain('Signed contract')
    expect(userPrompt).toContain('Sent invoice')
  })
})

describe('parseChronologyResponse', () => {
  it('parses valid JSON chronology response', () => {
    const raw = JSON.stringify([
      { date: '2024-01-15', description: 'Contract signed', significance: 'high', source: 'manual' },
      { date: '2024-02-01', description: 'Invoice sent', significance: 'medium', source: 'manual' },
    ])
    const entries = parseChronologyResponse(raw, 'plaintiff')
    expect(entries).toHaveLength(2)
    expect(entries[0].entry_date).toBe('2024-01-15')
    expect(entries[0].significance).toBe('high')
    expect(entries[0].perspective).toBe('plaintiff')
  })

  it('returns empty array on malformed JSON', () => {
    const entries = parseChronologyResponse('not json', 'plaintiff')
    expect(entries).toEqual([])
  })

  it('filters entries missing required date or description', () => {
    const raw = JSON.stringify([
      { description: 'No date entry', significance: 'high' },
      { date: '2024-01-01', description: 'Valid entry', significance: 'background' },
    ])
    const entries = parseChronologyResponse(raw, 'defendant')
    expect(entries).toHaveLength(1)
    expect(entries[0].entry_date).toBe('2024-01-01')
  })
})
