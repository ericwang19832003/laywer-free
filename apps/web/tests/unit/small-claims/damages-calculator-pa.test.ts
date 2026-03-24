import { describe, it, expect } from 'vitest'
import { calculateDamages, PA_SMALL_CLAIMS_CAP } from '@/lib/small-claims/damages-calculator'

describe('calculateDamages — Pennsylvania', () => {
  it('PA_SMALL_CLAIMS_CAP is 12000', () => {
    expect(PA_SMALL_CLAIMS_CAP).toBe(12_000)
  })

  it('uses PA cap when passed as jurisdictionCap', () => {
    const result = calculateDamages({
      items: [{ category: 'Damage', amount: 10_000 }],
      jurisdictionCap: PA_SMALL_CLAIMS_CAP,
    })
    expect(result.capAmount).toBe(12_000)
    expect(result.exceedsCap).toBe(false)
  })

  it('exceeds PA cap at 13000', () => {
    const result = calculateDamages({
      items: [{ category: 'Damage', amount: 13_000 }],
      jurisdictionCap: PA_SMALL_CLAIMS_CAP,
    })
    expect(result.exceedsCap).toBe(true)
    expect(result.overCapBy).toBe(1_000)
  })

  it('nearing PA cap at 11000', () => {
    const result = calculateDamages({
      items: [{ category: 'Damage', amount: 11_000 }],
      jurisdictionCap: PA_SMALL_CLAIMS_CAP,
    })
    expect(result.nearingCap).toBe(true)
  })

  it('not nearing PA cap at 6000', () => {
    const result = calculateDamages({
      items: [{ category: 'Damage', amount: 6_000 }],
      jurisdictionCap: PA_SMALL_CLAIMS_CAP,
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
