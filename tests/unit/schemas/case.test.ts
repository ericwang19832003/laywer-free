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

  it('accepts debt_sub_type for debt_collection cases', () => {
    const result = createCaseSchema.safeParse({
      role: 'defendant',
      dispute_type: 'debt_collection',
      debt_sub_type: 'credit_card',
    })
    expect(result.success).toBe(true)
  })

  it('accepts all valid debt_sub_type values', () => {
    for (const dt of ['credit_card', 'medical_bills', 'personal_loan', 'auto_loan', 'payday_loan', 'debt_buyer', 'other']) {
      const result = createCaseSchema.safeParse({ role: 'defendant', debt_sub_type: dt })
      expect(result.success).toBe(true)
    }
  })

  it('rejects invalid debt_sub_type', () => {
    const result = createCaseSchema.safeParse({ role: 'defendant', debt_sub_type: 'invalid_type' })
    expect(result.success).toBe(false)
  })

  it('accepts pi_sub_type for personal_injury cases', () => {
    const result = createCaseSchema.safeParse({
      role: 'plaintiff',
      dispute_type: 'personal_injury',
      pi_sub_type: 'auto_accident',
    })
    expect(result.success).toBe(true)
  })

  it('accepts all valid pi_sub_type values', () => {
    for (const st of ['auto_accident', 'pedestrian_cyclist', 'rideshare', 'uninsured_motorist', 'slip_and_fall', 'dog_bite', 'product_liability', 'other_injury', 'vehicle_damage', 'property_damage_negligence', 'vandalism', 'other_property_damage']) {
      const result = createCaseSchema.safeParse({ role: 'plaintiff', pi_sub_type: st })
      expect(result.success).toBe(true)
    }
  })

  it('rejects invalid pi_sub_type', () => {
    const result = createCaseSchema.safeParse({ role: 'plaintiff', pi_sub_type: 'invalid_type' })
    expect(result.success).toBe(false)
  })

  it('defaults state to TX', () => {
    const result = createCaseSchema.safeParse({ role: 'plaintiff' })
    if (result.success) {
      expect(result.data.state).toBe('TX')
    }
  })

  it('accepts CA as state', () => {
    const result = createCaseSchema.safeParse({ role: 'plaintiff', state: 'CA' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.state).toBe('CA')
    }
  })

  it('rejects invalid state', () => {
    const result = createCaseSchema.safeParse({ role: 'plaintiff', state: 'OH' })
    expect(result.success).toBe(false)
  })

  it('accepts NY as state', () => {
    const result = createCaseSchema.safeParse({ role: 'plaintiff', state: 'NY' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.state).toBe('NY')
    }
  })

  it('accepts NY court types', () => {
    for (const ct of ['ny_small_claims', 'ny_civil', 'ny_supreme']) {
      const result = createCaseSchema.safeParse({ role: 'plaintiff', court_type: ct })
      expect(result.success).toBe(true)
    }
  })

  it('accepts NY state with NY court type', () => {
    const result = createCaseSchema.safeParse({
      role: 'plaintiff',
      state: 'NY',
      court_type: 'ny_small_claims',
      dispute_type: 'small_claims',
    })
    expect(result.success).toBe(true)
  })

  it('accepts CA court types', () => {
    for (const ct of ['small_claims', 'limited_civil', 'unlimited_civil']) {
      const result = createCaseSchema.safeParse({ role: 'plaintiff', court_type: ct })
      expect(result.success).toBe(true)
    }
  })

  it('accepts CA state with CA court type', () => {
    const result = createCaseSchema.safeParse({
      role: 'plaintiff',
      state: 'CA',
      court_type: 'small_claims',
      dispute_type: 'small_claims',
    })
    expect(result.success).toBe(true)
  })

  it('accepts FL as state', () => {
    const result = createCaseSchema.safeParse({ role: 'plaintiff', state: 'FL' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.state).toBe('FL')
    }
  })

  it('accepts FL court types', () => {
    for (const ct of ['fl_small_claims', 'fl_county', 'fl_circuit']) {
      const result = createCaseSchema.safeParse({ role: 'plaintiff', court_type: ct })
      expect(result.success).toBe(true)
    }
  })

  it('accepts FL state with FL court type', () => {
    const result = createCaseSchema.safeParse({
      role: 'plaintiff',
      state: 'FL',
      court_type: 'fl_small_claims',
      dispute_type: 'small_claims',
    })
    expect(result.success).toBe(true)
  })

  it('accepts PA as state', () => {
    const result = createCaseSchema.safeParse({ role: 'plaintiff', state: 'PA' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.state).toBe('PA')
    }
  })

  it('accepts PA court types', () => {
    for (const ct of ['pa_magisterial', 'pa_common_pleas']) {
      const result = createCaseSchema.safeParse({ role: 'plaintiff', court_type: ct })
      expect(result.success).toBe(true)
    }
  })

  it('accepts PA state with PA court type', () => {
    const result = createCaseSchema.safeParse({
      role: 'plaintiff',
      state: 'PA',
      court_type: 'pa_magisterial',
      dispute_type: 'small_claims',
    })
    expect(result.success).toBe(true)
  })
})
