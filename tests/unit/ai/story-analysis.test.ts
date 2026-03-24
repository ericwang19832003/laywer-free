import { describe, it, expect } from 'vitest'
import { buildAnalysisSystemPrompt, parseAnalysisResult } from '@/lib/ai/story-analysis'

describe('buildAnalysisSystemPrompt', () => {
  it('includes all dispute types', () => {
    const prompt = buildAnalysisSystemPrompt()
    expect(prompt).toContain('small_claims')
    expect(prompt).toContain('landlord_tenant')
    expect(prompt).toContain('personal_injury')
    expect(prompt).toContain('debt_collection')
    expect(prompt).toContain('family')
  })

  it('includes extraction rules', () => {
    const prompt = buildAnalysisSystemPrompt()
    expect(prompt).toContain('plaintiff')
    expect(prompt).toContain('defendant')
    expect(prompt).toContain('JSON')
  })
})

describe('parseAnalysisResult', () => {
  it('parses valid JSON', () => {
    const json = JSON.stringify({
      disputeType: 'landlord_tenant',
      role: 'plaintiff',
      opposingParty: { name: 'John Smith', type: 'person' },
      approximateAmount: 2400,
      state: 'TX',
      summary: 'Security deposit dispute.',
      confidence: 'high',
    })
    const result = parseAnalysisResult(json)
    expect(result).not.toBeNull()
    expect(result!.disputeType).toBe('landlord_tenant')
    expect(result!.approximateAmount).toBe(2400)
  })

  it('handles markdown-wrapped JSON', () => {
    const raw = '```json\n{"disputeType":"small_claims","role":"plaintiff","opposingParty":{"name":"Acme","type":"business"},"approximateAmount":5000,"state":"TX","summary":"Contract breach.","confidence":"medium"}\n```'
    const result = parseAnalysisResult(raw)
    expect(result).not.toBeNull()
    expect(result!.disputeType).toBe('small_claims')
  })

  it('returns null for invalid JSON', () => {
    expect(parseAnalysisResult('not json at all')).toBeNull()
  })

  it('returns null for valid JSON with wrong schema', () => {
    expect(parseAnalysisResult('{"foo":"bar"}')).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(parseAnalysisResult('')).toBeNull()
  })

  it('accepts business entity with full details', () => {
    const json = JSON.stringify({
      disputeType: 'small_claims',
      role: 'plaintiff',
      opposingParty: {
        name: 'Acme LLC',
        type: 'business',
        legalName: 'Acme Properties LLC',
        registeredAgent: { name: 'Agent', address: '123 Main St' },
        entityType: 'LLC',
        entityStatus: 'Active',
      },
      approximateAmount: 5000,
      state: 'CA',
      summary: 'Breach of contract.',
      confidence: 'high',
    })
    const result = parseAnalysisResult(json)
    expect(result).not.toBeNull()
    expect(result!.opposingParty.legalName).toBe('Acme Properties LLC')
  })
})
