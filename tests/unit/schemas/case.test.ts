import { describe, it, expect } from 'vitest'
import { createCaseSchema } from '@/lib/schemas/case'

describe('createCaseSchema', () => {
  it('accepts valid plaintiff case', () => {
    const result = createCaseSchema.safeParse({ role: 'plaintiff' })
    expect(result.success).toBe(true)
  })

  it('accepts full case data', () => {
    const result = createCaseSchema.safeParse({
      role: 'defendant',
      county: 'Travis',
      court_type: 'district',
      dispute_type: 'landlord_tenant',
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing role', () => {
    const result = createCaseSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('rejects invalid role', () => {
    const result = createCaseSchema.safeParse({ role: 'judge' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid court_type', () => {
    const result = createCaseSchema.safeParse({ role: 'plaintiff', court_type: 'supreme' })
    expect(result.success).toBe(false)
  })

  it('defaults court_type to unknown', () => {
    const result = createCaseSchema.safeParse({ role: 'plaintiff' })
    if (result.success) {
      expect(result.data.court_type).toBe('unknown')
    }
  })

  it('accepts federal as court_type', () => {
    const result = createCaseSchema.safeParse({ role: 'plaintiff', court_type: 'federal' })
    expect(result.success).toBe(true)
  })

  it('accepts known dispute_type values', () => {
    for (const dt of ['debt_collection', 'landlord_tenant', 'personal_injury', 'contract', 'property', 'family', 'other']) {
      const result = createCaseSchema.safeParse({ role: 'plaintiff', dispute_type: dt })
      expect(result.success).toBe(true)
    }
  })

  it('rejects unknown dispute_type values', () => {
    const result = createCaseSchema.safeParse({ role: 'plaintiff', dispute_type: 'invalid_type' })
    expect(result.success).toBe(false)
  })
})
