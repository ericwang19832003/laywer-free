import { describe, it, expect } from 'vitest'
import { storyInputSchema, analysisResultSchema, sendLetterSchema } from '@/lib/schemas/quick-resolve'

describe('storyInputSchema', () => {
  it('accepts valid input', () => {
    const result = storyInputSchema.safeParse({ story: 'My landlord kept my deposit of $2400 after I moved out in good condition.' })
    expect(result.success).toBe(true)
  })

  it('rejects story under 50 chars', () => {
    const result = storyInputSchema.safeParse({ story: 'Too short.' })
    expect(result.success).toBe(false)
  })

  it('rejects story over 5000 chars', () => {
    const result = storyInputSchema.safeParse({ story: 'a'.repeat(5001) })
    expect(result.success).toBe(false)
  })
})

describe('analysisResultSchema', () => {
  it('accepts valid analysis', () => {
    const result = analysisResultSchema.safeParse({
      disputeType: 'landlord_tenant',
      role: 'plaintiff',
      opposingParty: { name: 'John Smith', type: 'person' },
      approximateAmount: 2400,
      state: 'TX',
      summary: 'Security deposit dispute.',
      confidence: 'high',
    })
    expect(result.success).toBe(true)
  })

  it('accepts business opposing party with entity details', () => {
    const result = analysisResultSchema.safeParse({
      disputeType: 'small_claims',
      role: 'plaintiff',
      opposingParty: {
        name: 'Acme LLC',
        type: 'business',
        legalName: 'Acme Properties LLC',
        registeredAgent: { name: 'John Doe', address: '123 Main St, Houston TX' },
        entityType: 'LLC',
        entityStatus: 'Active',
      },
      approximateAmount: 5000,
      state: 'TX',
      summary: 'Contract breach.',
      confidence: 'medium',
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing required fields', () => {
    const result = analysisResultSchema.safeParse({ disputeType: 'small_claims' })
    expect(result.success).toBe(false)
  })
})

describe('sendLetterSchema', () => {
  it('accepts valid send request', () => {
    const result = sendLetterSchema.safeParse({
      caseId: '123e4567-e89b-12d3-a456-426614174000',
      recipientName: 'John Smith',
      recipientAddress: { line1: '123 Main St', city: 'Houston', state: 'TX', zip: '77001' },
      senderAddress: { line1: '456 Oak Ave', city: 'Austin', state: 'TX', zip: '78701' },
      letterHtml: '<p>Dear John Smith,</p><p>I am writing to demand...</p>',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid zip code', () => {
    const result = sendLetterSchema.safeParse({
      caseId: '123e4567-e89b-12d3-a456-426614174000',
      recipientName: 'John',
      recipientAddress: { line1: '123 Main', city: 'Houston', state: 'TX', zip: 'abc' },
      senderAddress: { line1: '456 Oak', city: 'Austin', state: 'TX', zip: '78701' },
      letterHtml: '<p>Dear John</p>',
    })
    expect(result.success).toBe(false)
  })
})
