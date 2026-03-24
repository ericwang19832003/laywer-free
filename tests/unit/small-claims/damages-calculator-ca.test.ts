import { describe, it, expect } from 'vitest'
import { calculateDamages, CA_SMALL_CLAIMS_CAP } from '@/lib/small-claims/damages-calculator'

describe('calculateDamages — California', () => {
  it('CA_SMALL_CLAIMS_CAP is 12500', () => {
    expect(CA_SMALL_CLAIMS_CAP).toBe(12_500)
  })

  it('uses CA cap when passed as jurisdictionCap', () => {
    const result = calculateDamages({
      items: [{ category: 'Damage', amount: 10_000 }],
      jurisdictionCap: CA_SMALL_CLAIMS_CAP,
    })
    expect(result.capAmount).toBe(12_500)
    expect(result.exceedsCap).toBe(false)
  })

  it('exceeds CA cap at 13000', () => {
    const result = calculateDamages({
      items: [{ category: 'Damage', amount: 13_000 }],
      jurisdictionCap: CA_SMALL_CLAIMS_CAP,
    })
    expect(result.exceedsCap).toBe(true)
    expect(result.overCapBy).toBe(500)
  })

  it('nearing CA cap at 11500', () => {
    const result = calculateDamages({
      items: [{ category: 'Damage', amount: 11_500 }],
      jurisdictionCap: CA_SMALL_CLAIMS_CAP,
    })
    expect(result.nearingCap).toBe(true)
  })

  it('not nearing CA cap at 8000', () => {
    const result = calculateDamages({
      items: [{ category: 'Damage', amount: 8_000 }],
      jurisdictionCap: CA_SMALL_CLAIMS_CAP,
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
