import { describe, it, expect } from 'vitest'
import { expandQueryWithContext, mergeHybridResults } from '@/lib/courtlistener/search'

describe('expandQueryWithContext', () => {
  it('returns trimmed query without appending context (context applied via filters)', () => {
    const query = 'summary judgment standard'
    const expanded = expandQueryWithContext(query, {
      dispute_type: 'personal injury',
      jurisdiction: 'Texas',
      role: 'defendant',
    })

    expect(expanded).toBe(query)
  })

  it('trims whitespace from query', () => {
    const query = '  service of process  '
    const expanded = expandQueryWithContext(query, {
      dispute_type: null,
      jurisdiction: null,
      role: 'plaintiff',
    })

    expect(expanded).toBe('service of process')
    expect(expanded).not.toContain('null')
  })
})

describe('mergeHybridResults', () => {
  it('dedupes by chunk id and keeps highest score', () => {
    const vector = [
      { id: 'a', score: 0.8, source: 'vector' as const },
      { id: 'b', score: 0.7, source: 'vector' as const },
    ]
    const keyword = [
      { id: 'b', score: 0.9, source: 'keyword' as const },
      { id: 'c', score: 0.6, source: 'keyword' as const },
    ]

    const merged = mergeHybridResults(vector, keyword, { limit: 3 })

    expect(merged).toHaveLength(3)
    expect(merged[0].id).toBe('b')
    expect(merged.find((r) => r.id === 'b')?.score).toBe(0.9)
  })

  it('respects the limit and sorts by score', () => {
    const vector = [
      { id: 'a', score: 0.2, source: 'vector' as const },
      { id: 'b', score: 0.9, source: 'vector' as const },
    ]
    const keyword = [
      { id: 'c', score: 0.8, source: 'keyword' as const },
      { id: 'd', score: 0.1, source: 'keyword' as const },
    ]

    const merged = mergeHybridResults(vector, keyword, { limit: 2 })

    expect(merged).toHaveLength(2)
    expect(merged[0].id).toBe('b')
    expect(merged[1].id).toBe('c')
  })
})
