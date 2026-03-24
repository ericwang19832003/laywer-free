import { describe, it, expect } from 'vitest'
import { recommendCourt } from '@/lib/rules/court-recommendation'

const BASE_FLAGS = { realProperty: false, outOfState: false, governmentEntity: false, federalLaw: false }

describe('recommendCourt — Pennsylvania', () => {
  it('recommends federal for federal law claims', () => {
    const result = recommendCourt({ state: 'PA', disputeType: 'contract', amount: 'under_12k', circumstances: { ...BASE_FLAGS, federalLaw: true } })
    expect(result.recommended).toBe('federal')
  })

  it('recommends pa_common_pleas for family', () => {
    const result = recommendCourt({ state: 'PA', disputeType: 'family', amount: 'not_money', circumstances: BASE_FLAGS })
    expect(result.recommended).toBe('pa_common_pleas')
  })

  it('recommends pa_magisterial for eviction', () => {
    const result = recommendCourt({ state: 'PA', disputeType: 'landlord_tenant', amount: 'under_12k', circumstances: BASE_FLAGS, subType: 'eviction' })
    expect(result.recommended).toBe('pa_magisterial')
  })

  it('recommends pa_common_pleas for real property', () => {
    const result = recommendCourt({ state: 'PA', disputeType: 'contract', amount: 'under_12k', circumstances: { ...BASE_FLAGS, realProperty: true } })
    expect(result.recommended).toBe('pa_common_pleas')
  })

  it('recommends pa_magisterial for under $12,000', () => {
    const result = recommendCourt({ state: 'PA', disputeType: 'contract', amount: 'under_12k', circumstances: BASE_FLAGS })
    expect(result.recommended).toBe('pa_magisterial')
  })

  it('recommends pa_common_pleas for over $12,000', () => {
    const result = recommendCourt({ state: 'PA', disputeType: 'contract', amount: 'over_12k', circumstances: BASE_FLAGS })
    expect(result.recommended).toBe('pa_common_pleas')
  })

  it('recommends federal for out-of-state + high amount', () => {
    const result = recommendCourt({ state: 'PA', disputeType: 'contract', amount: 'over_12k', circumstances: { ...BASE_FLAGS, outOfState: true } })
    expect(result.recommended).toBe('federal')
    expect(result.alternativeNote).toBeTruthy()
  })

  it('recommends pa_common_pleas for not_money default', () => {
    const result = recommendCourt({ state: 'PA', disputeType: 'other', amount: 'not_money', circumstances: BASE_FLAGS })
    expect(result.recommended).toBe('pa_common_pleas')
  })

  it('PA reasoning mentions Pennsylvania', () => {
    const result = recommendCourt({ state: 'PA', disputeType: 'contract', amount: 'under_12k', circumstances: BASE_FLAGS })
    expect(result.reasoning).toContain('Pennsylvania')
  })

  it('PA small claims mentions 42 Pa.C.S.', () => {
    const result = recommendCourt({ state: 'PA', disputeType: 'contract', amount: 'under_12k', circumstances: BASE_FLAGS })
    expect(result.reasoning).toContain('42 Pa.C.S.')
  })

  it('handles TX amount ranges gracefully in PA context', () => {
    const result = recommendCourt({ state: 'PA', disputeType: 'contract', amount: 'under_20k', circumstances: BASE_FLAGS })
    expect(['pa_magisterial', 'pa_common_pleas']).toContain(result.recommended)
  })

  it('does not affect existing TX tests', () => {
    const result = recommendCourt({ disputeType: 'family', amount: 'not_money', circumstances: BASE_FLAGS })
    expect(result.recommended).toBe('district')
  })
})
