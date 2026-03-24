import { describe, it, expect } from 'vitest'
import { calculateDamages, FL_SMALL_CLAIMS_CAP } from '@/lib/small-claims/damages-calculator'

describe('calculateDamages — Florida', () => {
  it('FL_SMALL_CLAIMS_CAP is 8000', () => {
    expect(FL_SMALL_CLAIMS_CAP).toBe(8_000)
  })

  it('uses FL cap when passed as jurisdictionCap', () => {
    const result = calculateDamages({
      items: [{ category: 'Damage', amount: 6_000 }],
      jurisdictionCap: FL_SMALL_CLAIMS_CAP,
    })
    expect(result.capAmount).toBe(8_000)
    expect(result.exceedsCap).toBe(false)
  })

  it('exceeds FL cap at 9000', () => {
    const result = calculateDamages({
      items: [{ category: 'Damage', amount: 9_000 }],
      jurisdictionCap: FL_SMALL_CLAIMS_CAP,
    })
    expect(result.exceedsCap).toBe(true)
    expect(result.overCapBy).toBe(1_000)
  })

  it('nearing FL cap at 7500', () => {
    const result = calculateDamages({
      items: [{ category: 'Damage', amount: 7_500 }],
      jurisdictionCap: FL_SMALL_CLAIMS_CAP,
    })
    expect(result.nearingCap).toBe(true)
  })

  it('not nearing FL cap at 4000', () => {
    const result = calculateDamages({
      items: [{ category: 'Damage', amount: 4_000 }],
      jurisdictionCap: FL_SMALL_CLAIMS_CAP,
    })
    expect(result.nearingCap).toBe(false)
  })

  it('still defaults to TX cap when no jurisdictionCap', () => {
    const result = calculateDamages({
      items: [{ category: 'Damage', amount: 15_000 }],
    })
    expect(result.capAmount).toBe(20_000)
    expect(result.exceedsCap).toBe(false)
  })
})
