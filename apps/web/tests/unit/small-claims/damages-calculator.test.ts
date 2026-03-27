import { describe, it, expect } from 'vitest'
import { calculateDamages, TX_JP_COURT_CAP } from '@/lib/small-claims/damages-calculator'

/**
 * Tests for Texas Small Claims Damages Calculator.
 *
 * The 16 tests cover:
 *   - Single and multiple item totals
 *   - Filtering of zero and negative amounts
 *   - Empty items array
 *   - Rounding to 2 decimal places
 *   - Item count accuracy
 *   - Default TX JP Court cap ($20,000)
 *   - Custom jurisdiction cap
 *   - Exceeds cap detection and overCapBy calculation
 *   - Nearing cap threshold (90%)
 *   - Exact cap boundary
 *   - TX_JP_COURT_CAP constant value
 *   - Large number of items
 */

/** Helper to build an input with sensible defaults */
function makeInput(overrides: Partial<Parameters<typeof calculateDamages>[0]> = {}) {
  return {
    items: [{ category: 'Test', amount: 1000 }],
    ...overrides,
  }
}

describe('calculateDamages', () => {
  // -----------------------------------------------------------------------
  // Test 1: Single item total
  // -----------------------------------------------------------------------
  it('calculates total for single item', () => {
    const result = calculateDamages(makeInput())
    expect(result.totalDamages).toBe(1000)
    expect(result.itemCount).toBe(1)
  })

  // -----------------------------------------------------------------------
  // Test 2: Multiple items total
  // -----------------------------------------------------------------------
  it('calculates total for multiple items', () => {
    const result = calculateDamages(
      makeInput({
        items: [
          { category: 'Property Damage', amount: 5000 },
          { category: 'Lost Wages', amount: 3000 },
          { category: 'Repair Costs', amount: 2500 },
        ],
      }),
    )
    expect(result.totalDamages).toBe(10500)
    expect(result.itemCount).toBe(3)
  })

  // -----------------------------------------------------------------------
  // Test 3: Filters out zero-amount items
  // -----------------------------------------------------------------------
  it('filters out zero-amount items', () => {
    const result = calculateDamages(
      makeInput({
        items: [
          { category: 'Valid', amount: 500 },
          { category: 'Zero', amount: 0 },
        ],
      }),
    )
    expect(result.totalDamages).toBe(500)
    expect(result.itemCount).toBe(1)
    expect(result.items).toHaveLength(1)
    expect(result.items[0].category).toBe('Valid')
  })

  // -----------------------------------------------------------------------
  // Test 4: Filters out negative-amount items
  // -----------------------------------------------------------------------
  it('filters out negative-amount items', () => {
    const result = calculateDamages(
      makeInput({
        items: [
          { category: 'Valid', amount: 1500 },
          { category: 'Negative', amount: -100 },
        ],
      }),
    )
    expect(result.totalDamages).toBe(1500)
    expect(result.itemCount).toBe(1)
    expect(result.items).toHaveLength(1)
  })

  // -----------------------------------------------------------------------
  // Test 5: Empty items array
  // -----------------------------------------------------------------------
  it('handles empty items array', () => {
    const result = calculateDamages(makeInput({ items: [] }))
    expect(result.totalDamages).toBe(0)
    expect(result.itemCount).toBe(0)
    expect(result.exceedsCap).toBe(false)
    expect(result.nearingCap).toBe(false)
  })

  // -----------------------------------------------------------------------
  // Test 6: Rounds to 2 decimal places
  // -----------------------------------------------------------------------
  it('rounds to 2 decimal places', () => {
    const result = calculateDamages(
      makeInput({
        items: [
          { category: 'Item A', amount: 10.155 },
          { category: 'Item B', amount: 20.333 },
        ],
      }),
    )
    expect(result.totalDamages).toBe(30.49)
  })

  // -----------------------------------------------------------------------
  // Test 7: Returns correct itemCount
  // -----------------------------------------------------------------------
  it('returns correct itemCount', () => {
    const result = calculateDamages(
      makeInput({
        items: [
          { category: 'Valid 1', amount: 100 },
          { category: 'Zero', amount: 0 },
          { category: 'Valid 2', amount: 200 },
          { category: 'Negative', amount: -50 },
          { category: 'Valid 3', amount: 300 },
        ],
      }),
    )
    expect(result.itemCount).toBe(3)
    expect(result.items).toHaveLength(3)
  })

  // -----------------------------------------------------------------------
  // Test 8: Uses TX_JP_COURT_CAP as default cap
  // -----------------------------------------------------------------------
  it('uses TX_JP_COURT_CAP as default cap', () => {
    const result = calculateDamages(makeInput())
    expect(result.capAmount).toBe(20000)
    expect(result.capAmount).toBe(TX_JP_COURT_CAP)
  })

  // -----------------------------------------------------------------------
  // Test 9: Respects custom jurisdictionCap
  // -----------------------------------------------------------------------
  it('respects custom jurisdictionCap', () => {
    const result = calculateDamages(
      makeInput({
        items: [{ category: 'Test', amount: 3000 }],
        jurisdictionCap: 5000,
      }),
    )
    expect(result.capAmount).toBe(5000)
    expect(result.exceedsCap).toBe(false)
  })

  // -----------------------------------------------------------------------
  // Test 10: Detects exceeds cap
  // -----------------------------------------------------------------------
  it('detects exceeds cap', () => {
    const result = calculateDamages(
      makeInput({
        items: [{ category: 'Large Claim', amount: 25000 }],
      }),
    )
    expect(result.totalDamages).toBe(25000)
    expect(result.exceedsCap).toBe(true)
    expect(result.nearingCap).toBe(false)
  })

  // -----------------------------------------------------------------------
  // Test 11: Calculates overCapBy amount
  // -----------------------------------------------------------------------
  it('calculates overCapBy amount', () => {
    const result = calculateDamages(
      makeInput({
        items: [{ category: 'Large Claim', amount: 25000 }],
      }),
    )
    expect(result.overCapBy).toBe(5000)
  })

  // -----------------------------------------------------------------------
  // Test 12: Detects nearing cap at 90%+
  // -----------------------------------------------------------------------
  it('detects nearing cap at 90%+', () => {
    const result = calculateDamages(
      makeInput({
        items: [{ category: 'Near Cap', amount: 18000 }],
      }),
    )
    expect(result.totalDamages).toBe(18000)
    expect(result.exceedsCap).toBe(false)
    expect(result.nearingCap).toBe(true)
  })

  // -----------------------------------------------------------------------
  // Test 13: Not nearing cap at 89%
  // -----------------------------------------------------------------------
  it('not nearing cap at 89%', () => {
    const result = calculateDamages(
      makeInput({
        items: [{ category: 'Under Threshold', amount: 17800 }],
      }),
    )
    expect(result.totalDamages).toBe(17800)
    expect(result.exceedsCap).toBe(false)
    expect(result.nearingCap).toBe(false)
  })

  // -----------------------------------------------------------------------
  // Test 14: Handles exactly at cap boundary
  // -----------------------------------------------------------------------
  it('handles exactly at cap boundary', () => {
    const result = calculateDamages(
      makeInput({
        items: [{ category: 'Exact Cap', amount: 20000 }],
      }),
    )
    expect(result.totalDamages).toBe(20000)
    expect(result.exceedsCap).toBe(false)
    expect(result.nearingCap).toBe(true)
    expect(result.overCapBy).toBe(0)
  })

  // -----------------------------------------------------------------------
  // Test 15: TX_JP_COURT_CAP is 20000
  // -----------------------------------------------------------------------
  it('TX_JP_COURT_CAP is 20000', () => {
    expect(TX_JP_COURT_CAP).toBe(20000)
  })

  // -----------------------------------------------------------------------
  // Test 16: Handles large number of items
  // -----------------------------------------------------------------------
  it('handles large number of items', () => {
    const items = Array.from({ length: 100 }, (_, i) => ({
      category: `Item ${i + 1}`,
      amount: 100,
    }))
    const result = calculateDamages(makeInput({ items }))
    expect(result.totalDamages).toBe(10000)
    expect(result.itemCount).toBe(100)
    expect(result.exceedsCap).toBe(false)
  })
})
