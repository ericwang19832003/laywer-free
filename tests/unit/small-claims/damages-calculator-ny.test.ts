import { describe, it, expect } from 'vitest'
import { calculateDamages, NY_SMALL_CLAIMS_CAP } from '@/lib/small-claims/damages-calculator'

describe('calculateDamages — New York', () => {
  it('NY_SMALL_CLAIMS_CAP is 10000', () => {
    expect(NY_SMALL_CLAIMS_CAP).toBe(10_000)
  })

  it('uses NY cap when passed as jurisdictionCap', () => {
    const result = calculateDamages({
      items: [{ category: 'Damage', amount: 8_000 }],
      jurisdictionCap: NY_SMALL_CLAIMS_CAP,
    })
    expect(result.capAmount).toBe(10_000)
    expect(result.exceedsCap).toBe(false)
  })

  it('exceeds NY cap at 11000', () => {
    const result = calculateDamages({
      items: [{ category: 'Damage', amount: 11_000 }],
      jurisdictionCap: NY_SMALL_CLAIMS_CAP,
    })
    expect(result.exceedsCap).toBe(true)
    expect(result.overCapBy).toBe(1_000)
  })

  it('nearing NY cap at 9500', () => {
    const result = calculateDamages({
      items: [{ category: 'Damage', amount: 9_500 }],
      jurisdictionCap: NY_SMALL_CLAIMS_CAP,
    })
    expect(result.nearingCap).toBe(true)
  })

  it('not nearing NY cap at 5000', () => {
    const result = calculateDamages({
      items: [{ category: 'Damage', amount: 5_000 }],
      jurisdictionCap: NY_SMALL_CLAIMS_CAP,
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
