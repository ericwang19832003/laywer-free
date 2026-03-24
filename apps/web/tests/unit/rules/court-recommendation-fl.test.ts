import { describe, it, expect } from 'vitest'
import { recommendCourt } from '@/lib/rules/court-recommendation'

const BASE_FLAGS = { realProperty: false, outOfState: false, governmentEntity: false, federalLaw: false }

describe('recommendCourt — Florida', () => {
  it('recommends federal for federal law claims', () => {
    const result = recommendCourt({ state: 'FL', disputeType: 'contract', amount: 'under_8k', circumstances: { ...BASE_FLAGS, federalLaw: true } })
    expect(result.recommended).toBe('federal')
  })

  it('recommends fl_circuit for family', () => {
    const result = recommendCourt({ state: 'FL', disputeType: 'family', amount: 'not_money', circumstances: BASE_FLAGS })
    expect(result.recommended).toBe('fl_circuit')
  })

  it('recommends fl_county for eviction', () => {
    const result = recommendCourt({ state: 'FL', disputeType: 'landlord_tenant', amount: 'under_8k', circumstances: BASE_FLAGS, subType: 'eviction' })
    expect(result.recommended).toBe('fl_county')
  })

  it('recommends fl_circuit for real property', () => {
    const result = recommendCourt({ state: 'FL', disputeType: 'contract', amount: 'under_8k', circumstances: { ...BASE_FLAGS, realProperty: true } })
    expect(result.recommended).toBe('fl_circuit')
  })

  it('recommends fl_small_claims for under $8,000', () => {
    const result = recommendCourt({ state: 'FL', disputeType: 'contract', amount: 'under_8k', circumstances: BASE_FLAGS })
    expect(result.recommended).toBe('fl_small_claims')
  })

  it('recommends fl_county for $8,000-$50,000', () => {
    const result = recommendCourt({ state: 'FL', disputeType: 'contract', amount: '8k_50k', circumstances: BASE_FLAGS })
    expect(result.recommended).toBe('fl_county')
  })

  it('recommends fl_circuit for over $50,000', () => {
    const result = recommendCourt({ state: 'FL', disputeType: 'contract', amount: 'over_50k', circumstances: BASE_FLAGS })
    expect(result.recommended).toBe('fl_circuit')
  })

  it('recommends federal for out-of-state + high amount', () => {
    const result = recommendCourt({ state: 'FL', disputeType: 'contract', amount: 'over_50k', circumstances: { ...BASE_FLAGS, outOfState: true } })
    expect(result.recommended).toBe('federal')
    expect(result.alternativeNote).toBeTruthy()
  })

  it('recommends fl_circuit for not_money default', () => {
    const result = recommendCourt({ state: 'FL', disputeType: 'other', amount: 'not_money', circumstances: BASE_FLAGS })
    expect(result.recommended).toBe('fl_circuit')
  })

  it('FL reasoning mentions Florida', () => {
    const result = recommendCourt({ state: 'FL', disputeType: 'contract', amount: 'under_8k', circumstances: BASE_FLAGS })
    expect(result.reasoning).toContain('Florida')
  })

  it('FL small claims mentions Fla. Stat.', () => {
    const result = recommendCourt({ state: 'FL', disputeType: 'contract', amount: 'under_8k', circumstances: BASE_FLAGS })
    expect(result.reasoning).toContain('Fla. Stat.')
  })

  it('FL eviction mentions Fla. Stat.', () => {
    const result = recommendCourt({ state: 'FL', disputeType: 'landlord_tenant', amount: 'under_8k', circumstances: BASE_FLAGS, subType: 'eviction' })
    expect(result.reasoning).toContain('Fla. Stat.')
  })

  it('handles TX amount ranges gracefully in FL context', () => {
    const result = recommendCourt({ state: 'FL', disputeType: 'contract', amount: 'under_20k', circumstances: BASE_FLAGS })
    expect(['fl_small_claims', 'fl_county']).toContain(result.recommended)
  })

  it('does not affect existing TX tests', () => {
    const result = recommendCourt({ disputeType: 'family', amount: 'not_money', circumstances: BASE_FLAGS })
    expect(result.recommended).toBe('district')
  })
})
