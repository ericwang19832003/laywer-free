import { describe, it, expect } from 'vitest'
import { recommendCourt } from '@lawyer-free/shared/rules/court-recommendation'

const BASE_FLAGS = { realProperty: false, outOfState: false, governmentEntity: false, federalLaw: false }

describe('recommendCourt — New York', () => {
  it('recommends federal for federal law claims', () => {
    const result = recommendCourt({ state: 'NY', disputeType: 'contract', amount: 'under_10k', circumstances: { ...BASE_FLAGS, federalLaw: true } })
    expect(result.recommended).toBe('federal')
  })

  it('recommends ny_supreme for family', () => {
    const result = recommendCourt({ state: 'NY', disputeType: 'family', amount: 'not_money', circumstances: BASE_FLAGS })
    expect(result.recommended).toBe('ny_supreme')
  })

  it('recommends ny_civil for eviction', () => {
    const result = recommendCourt({ state: 'NY', disputeType: 'landlord_tenant', amount: 'under_10k', circumstances: BASE_FLAGS, subType: 'eviction' })
    expect(result.recommended).toBe('ny_civil')
  })

  it('recommends ny_supreme for real property', () => {
    const result = recommendCourt({ state: 'NY', disputeType: 'contract', amount: 'under_10k', circumstances: { ...BASE_FLAGS, realProperty: true } })
    expect(result.recommended).toBe('ny_supreme')
  })

  it('recommends ny_small_claims for under $10,000', () => {
    const result = recommendCourt({ state: 'NY', disputeType: 'contract', amount: 'under_10k', circumstances: BASE_FLAGS })
    expect(result.recommended).toBe('ny_small_claims')
  })

  it('recommends ny_civil for $10,000-$25,000', () => {
    const result = recommendCourt({ state: 'NY', disputeType: 'contract', amount: '10k_25k', circumstances: BASE_FLAGS })
    expect(result.recommended).toBe('ny_civil')
  })

  it('recommends ny_supreme for over $25,000', () => {
    const result = recommendCourt({ state: 'NY', disputeType: 'contract', amount: 'over_25k', circumstances: BASE_FLAGS })
    expect(result.recommended).toBe('ny_supreme')
  })

  it('recommends federal for out-of-state + high amount', () => {
    const result = recommendCourt({ state: 'NY', disputeType: 'contract', amount: 'over_25k', circumstances: { ...BASE_FLAGS, outOfState: true } })
    expect(result.recommended).toBe('federal')
    expect(result.alternativeNote).toBeTruthy()
  })

  it('recommends ny_supreme for not_money default', () => {
    const result = recommendCourt({ state: 'NY', disputeType: 'other', amount: 'not_money', circumstances: BASE_FLAGS })
    expect(result.recommended).toBe('ny_supreme')
  })

  it('NY reasoning mentions New York', () => {
    const result = recommendCourt({ state: 'NY', disputeType: 'contract', amount: 'under_10k', circumstances: BASE_FLAGS })
    expect(result.reasoning).toContain('New York')
  })

  it('NY small claims mentions UCCA', () => {
    const result = recommendCourt({ state: 'NY', disputeType: 'contract', amount: 'under_10k', circumstances: BASE_FLAGS })
    expect(result.reasoning).toContain('UCCA')
  })

  it('NY eviction mentions Housing Court', () => {
    const result = recommendCourt({ state: 'NY', disputeType: 'landlord_tenant', amount: 'under_10k', circumstances: BASE_FLAGS, subType: 'eviction' })
    expect(result.reasoning).toContain('Housing Court')
  })

  it('handles TX amount ranges gracefully in NY context', () => {
    const result = recommendCourt({ state: 'NY', disputeType: 'contract', amount: 'under_20k', circumstances: BASE_FLAGS })
    expect(['ny_small_claims', 'ny_civil']).toContain(result.recommended)
  })

  it('does not affect existing TX tests', () => {
    const result = recommendCourt({ disputeType: 'family', amount: 'not_money', circumstances: BASE_FLAGS })
    expect(result.recommended).toBe('district')
  })
})
