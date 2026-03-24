import { describe, it, expect } from 'vitest'
import { calculateChildSupport } from '@/lib/family/child-support-calculator'

/**
 * Tests for Texas Family Code Ch. 154 child support calculator.
 *
 * The 16 tests cover:
 *   - Basic percentage tiers (1–5+ children)
 *   - Deduction arithmetic
 *   - $9,200 net-resource cap
 *   - § 154.129 other-children offset
 *   - Edge cases (zero income, negative net, 0 children, cap boundary)
 *   - Combined cap + other-children scenarios
 */

/** Helper to build an input with sensible zero defaults */
function makeInput(overrides: Partial<Parameters<typeof calculateChildSupport>[0]> = {}) {
  return {
    grossMonthlyIncome: 0,
    federalTax: 0,
    stateTax: 0,
    socialSecurity: 0,
    healthInsurance: 0,
    unionDues: 0,
    numberOfChildren: 1,
    otherChildrenCount: 0,
    ...overrides,
  }
}

describe('calculateChildSupport', () => {
  // -----------------------------------------------------------------------
  // Test 1: Basic – 1 child, no deductions, under cap
  // -----------------------------------------------------------------------
  it('calculates 20% for 1 child with no deductions', () => {
    const result = calculateChildSupport(
      makeInput({ grossMonthlyIncome: 5000, numberOfChildren: 1 }),
    )
    expect(result.netMonthlyResources).toBe(5000)
    expect(result.guidelinePercentage).toBe(20)
    expect(result.guidelineAmount).toBe(1000)
    expect(result.finalAmount).toBe(1000)
  })

  // -----------------------------------------------------------------------
  // Test 2: With deductions – correct net resources
  // -----------------------------------------------------------------------
  it('calculates correct net after deductions', () => {
    const result = calculateChildSupport(
      makeInput({
        grossMonthlyIncome: 8000,
        federalTax: 1200,
        stateTax: 400,
        socialSecurity: 600,
        healthInsurance: 300,
        unionDues: 100,
        numberOfChildren: 1,
      }),
    )
    expect(result.netMonthlyResources).toBe(5400)
    expect(result.breakdown.totalDeductions).toBe(2600)
    expect(result.guidelineAmount).toBe(1080)
    expect(result.finalAmount).toBe(1080)
  })

  // -----------------------------------------------------------------------
  // Tests 3–7: Percentage tiers for 1–5+ children
  // -----------------------------------------------------------------------
  it('calculates 25% for 2 children', () => {
    const result = calculateChildSupport(
      makeInput({ grossMonthlyIncome: 5000, numberOfChildren: 2 }),
    )
    expect(result.guidelinePercentage).toBe(25)
    expect(result.guidelineAmount).toBe(1250)
    expect(result.finalAmount).toBe(1250)
  })

  it('calculates 30% for 3 children', () => {
    const result = calculateChildSupport(
      makeInput({ grossMonthlyIncome: 5000, numberOfChildren: 3 }),
    )
    expect(result.guidelinePercentage).toBe(30)
    expect(result.guidelineAmount).toBe(1500)
    expect(result.finalAmount).toBe(1500)
  })

  it('calculates 35% for 4 children', () => {
    const result = calculateChildSupport(
      makeInput({ grossMonthlyIncome: 5000, numberOfChildren: 4 }),
    )
    expect(result.guidelinePercentage).toBe(35)
    expect(result.guidelineAmount).toBe(1750)
    expect(result.finalAmount).toBe(1750)
  })

  it('calculates 40% for 5 children', () => {
    const result = calculateChildSupport(
      makeInput({ grossMonthlyIncome: 5000, numberOfChildren: 5 }),
    )
    expect(result.guidelinePercentage).toBe(40)
    expect(result.guidelineAmount).toBe(2000)
    expect(result.finalAmount).toBe(2000)
  })

  it('calculates 40% for 7 children (5+ rule)', () => {
    const result = calculateChildSupport(
      makeInput({ grossMonthlyIncome: 5000, numberOfChildren: 7 }),
    )
    expect(result.guidelinePercentage).toBe(40)
    expect(result.guidelineAmount).toBe(2000)
    expect(result.finalAmount).toBe(2000)
  })

  // -----------------------------------------------------------------------
  // Test 8: Cap applied when net > $9,200
  // -----------------------------------------------------------------------
  it('caps at $9,200 when net resources exceed cap', () => {
    const result = calculateChildSupport(
      makeInput({ grossMonthlyIncome: 15000, numberOfChildren: 1 }),
    )
    expect(result.netMonthlyResources).toBe(15000)
    expect(result.cappedAmount).toBe(1840) // 20% of 9200
    expect(result.finalAmount).toBe(1840)
  })

  // -----------------------------------------------------------------------
  // Test 9: Other-children offset (1 child + 1 other)
  // -----------------------------------------------------------------------
  it('applies other children offset for 1 child + 1 other', () => {
    const result = calculateChildSupport(
      makeInput({
        grossMonthlyIncome: 5000,
        numberOfChildren: 1,
        otherChildrenCount: 1,
      }),
    )
    expect(result.guidelinePercentage).toBe(17.5)
    expect(result.adjustedForOtherChildren).toBe(875)
    expect(result.finalAmount).toBe(875)
  })

  // -----------------------------------------------------------------------
  // Test 10: Zero income
  // -----------------------------------------------------------------------
  it('returns zero for zero income', () => {
    const result = calculateChildSupport(
      makeInput({ grossMonthlyIncome: 0, numberOfChildren: 2 }),
    )
    expect(result.netMonthlyResources).toBe(0)
    expect(result.guidelineAmount).toBe(0)
    expect(result.finalAmount).toBe(0)
  })

  // -----------------------------------------------------------------------
  // Test 11: Multiple children with other-children offset (2 + 2 other)
  // -----------------------------------------------------------------------
  it('applies offset for 2 children + 2 other', () => {
    const result = calculateChildSupport(
      makeInput({
        grossMonthlyIncome: 6000,
        numberOfChildren: 2,
        otherChildrenCount: 2,
      }),
    )
    expect(result.guidelinePercentage).toBe(20.63)
    expect(result.adjustedForOtherChildren).toBeCloseTo(1237.8)
    expect(result.finalAmount).toBeCloseTo(1237.8)
  })

  // -----------------------------------------------------------------------
  // Test 12: Exactly at cap boundary ($9,200) – should NOT trigger cap
  // -----------------------------------------------------------------------
  it('does not cap at exactly $9,200', () => {
    const result = calculateChildSupport(
      makeInput({ grossMonthlyIncome: 9200, numberOfChildren: 1 }),
    )
    expect(result.cappedAmount).toBeNull()
    expect(result.finalAmount).toBe(1840)
  })

  // -----------------------------------------------------------------------
  // Test 13: 0 children – zero obligation
  // -----------------------------------------------------------------------
  it('returns zero for 0 children', () => {
    const result = calculateChildSupport(
      makeInput({ grossMonthlyIncome: 5000, numberOfChildren: 0 }),
    )
    expect(result.finalAmount).toBe(0)
    expect(result.guidelinePercentage).toBe(0)
    expect(result.guidelineAmount).toBe(0)
  })

  // -----------------------------------------------------------------------
  // Test 14: Negative net resources – zero obligation
  // -----------------------------------------------------------------------
  it('returns zero for negative net resources', () => {
    const result = calculateChildSupport(
      makeInput({
        grossMonthlyIncome: 3000,
        federalTax: 2000,
        stateTax: 800,
        socialSecurity: 500,
        numberOfChildren: 1,
      }),
    )
    expect(result.netMonthlyResources).toBe(-300)
    expect(result.guidelineAmount).toBe(0)
    expect(result.finalAmount).toBe(0)
  })

  // -----------------------------------------------------------------------
  // Test 15: Cap + other-children offset combined
  // -----------------------------------------------------------------------
  it('applies both cap and other children offset', () => {
    const result = calculateChildSupport(
      makeInput({
        grossMonthlyIncome: 12000,
        numberOfChildren: 2,
        otherChildrenCount: 1,
      }),
    )
    // Net = 12000, exceeds cap
    // 2 children + 1 other → 22.50%
    // Capped: 22.50% × 9200 = 2070
    expect(result.guidelinePercentage).toBe(22.5)
    expect(result.cappedAmount).toBe(2070)
    expect(result.adjustedForOtherChildren).toBeCloseTo(2700) // 22.5% of 12000
    expect(result.finalAmount).toBe(2070)
  })

  // -----------------------------------------------------------------------
  // Test 16: Large other-children count (5+ bracket)
  // -----------------------------------------------------------------------
  it('uses 5+ bracket for 7 other children', () => {
    const result = calculateChildSupport(
      makeInput({
        grossMonthlyIncome: 5000,
        numberOfChildren: 1,
        otherChildrenCount: 7,
      }),
    )
    // 1 child + 5+ other → 12.50%
    expect(result.guidelinePercentage).toBe(12.5)
    expect(result.adjustedForOtherChildren).toBe(625)
    expect(result.finalAmount).toBe(625)
  })
})
