import { describe, it, expect } from 'vitest'
import { recommendCourt } from '@lawyer-free/shared/rules/court-recommendation'

const BASE_FLAGS = { realProperty: false, outOfState: false, governmentEntity: false, federalLaw: false }

describe('recommendCourt — California', () => {
  it('recommends federal for federal law claims', () => {
    const result = recommendCourt({ state: 'CA', disputeType: 'contract', amount: 'under_12500', circumstances: { ...BASE_FLAGS, federalLaw: true } })
    expect(result.recommended).toBe('federal')
  })

  it('recommends unlimited_civil for family', () => {
    const result = recommendCourt({ state: 'CA', disputeType: 'family', amount: 'not_money', circumstances: BASE_FLAGS })
    expect(result.recommended).toBe('unlimited_civil')
  })

  it('recommends unlimited_civil for eviction', () => {
    const result = recommendCourt({ state: 'CA', disputeType: 'landlord_tenant', amount: 'under_12500', circumstances: BASE_FLAGS, subType: 'eviction' })
    expect(result.recommended).toBe('unlimited_civil')
  })

  it('recommends unlimited_civil for real property', () => {
    const result = recommendCourt({ state: 'CA', disputeType: 'contract', amount: 'under_12500', circumstances: { ...BASE_FLAGS, realProperty: true } })
    expect(result.recommended).toBe('unlimited_civil')
  })

  it('recommends small_claims for under $12,500', () => {
    const result = recommendCourt({ state: 'CA', disputeType: 'contract', amount: 'under_12500', circumstances: BASE_FLAGS })
    expect(result.recommended).toBe('small_claims')
  })

  it('recommends limited_civil for $12,500-$35,000', () => {
    const result = recommendCourt({ state: 'CA', disputeType: 'contract', amount: '12500_35k', circumstances: BASE_FLAGS })
    expect(result.recommended).toBe('limited_civil')
  })

  it('recommends unlimited_civil for over $35,000', () => {
    const result = recommendCourt({ state: 'CA', disputeType: 'contract', amount: 'over_35k', circumstances: BASE_FLAGS })
    expect(result.recommended).toBe('unlimited_civil')
  })

  it('recommends federal for out-of-state + high amount', () => {
    const result = recommendCourt({ state: 'CA', disputeType: 'contract', amount: 'over_35k', circumstances: { ...BASE_FLAGS, outOfState: true } })
    expect(result.recommended).toBe('federal')
    expect(result.alternativeNote).toBeTruthy()
  })

  it('recommends unlimited_civil for not_money default', () => {
    const result = recommendCourt({ state: 'CA', disputeType: 'other', amount: 'not_money', circumstances: BASE_FLAGS })
    expect(result.recommended).toBe('unlimited_civil')
  })

  it('defaults to TX when state is omitted', () => {
    const result = recommendCourt({ disputeType: 'contract', amount: 'under_20k', circumstances: BASE_FLAGS })
    expect(result.recommended).toBe('jp')
  })

  it('CA reasoning mentions California', () => {
    const result = recommendCourt({ state: 'CA', disputeType: 'contract', amount: 'under_12500', circumstances: BASE_FLAGS })
    expect(result.reasoning).toContain('California')
  })

  it('CA small claims mentions Code Civ. Proc.', () => {
    const result = recommendCourt({ state: 'CA', disputeType: 'contract', amount: 'under_12500', circumstances: BASE_FLAGS })
    expect(result.reasoning).toContain('Code Civ. Proc.')
  })

  it('handles TX amount ranges gracefully in CA context', () => {
    const result = recommendCourt({ state: 'CA', disputeType: 'contract', amount: 'under_20k', circumstances: BASE_FLAGS })
    expect(['small_claims', 'limited_civil']).toContain(result.recommended)
  })

  it('does not affect existing TX tests', () => {
    const result = recommendCourt({ disputeType: 'family', amount: 'not_money', circumstances: BASE_FLAGS })
    expect(result.recommended).toBe('district')
  })
})
