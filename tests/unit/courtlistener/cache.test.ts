import { describe, it, expect } from 'vitest'
import { buildQueryHash } from '@/lib/courtlistener/cache'

describe('buildQueryHash', () => {
  it('changes when caseId changes', () => {
    const a = buildQueryHash('question', 'case-1')
    const b = buildQueryHash('question', 'case-2')
    expect(a).not.toBe(b)
  })

  it('is stable for the same inputs', () => {
    const a = buildQueryHash('question', 'case-1')
    const b = buildQueryHash('question', 'case-1')
    expect(a).toBe(b)
  })

  it('changes when question and caseId swap', () => {
    const a = buildQueryHash('question', 'case-1')
    const b = buildQueryHash('case-1', 'question')
    expect(a).not.toBe(b)
  })
})
