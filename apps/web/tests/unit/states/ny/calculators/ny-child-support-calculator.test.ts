import { describe, it, expect } from 'vitest'
import {
  calculateCSSA,
  cssaInputSchema,
  CSSA_INCOME_CAP,
  CSSA_PERCENTAGES,
} from '@/lib/states/ny/calculators/ny-child-support-calculator'

describe('NY CSSA Child Support Calculator', () => {
  describe('constants', () => {
    it('CSSA_INCOME_CAP is 193000', () => {
      expect(CSSA_INCOME_CAP).toBe(193_000)
    })

    it('1 child = 17%', () => {
      expect(CSSA_PERCENTAGES[1]).toBe(0.17)
    })

    it('2 children = 25%', () => {
      expect(CSSA_PERCENTAGES[2]).toBe(0.25)
    })

    it('3 children = 29%', () => {
      expect(CSSA_PERCENTAGES[3]).toBe(0.29)
    })

    it('4 children = 31%', () => {
      expect(CSSA_PERCENTAGES[4]).toBe(0.31)
    })
  })

  describe('schema', () => {
    it('accepts valid input', () => {
      const result = cssaInputSchema.safeParse({
        nonCustodialIncome: 80_000,
        custodialIncome: 40_000,
        numberOfChildren: 2,
      })
      expect(result.success).toBe(true)
    })

    it('rejects 0 children', () => {
      const result = cssaInputSchema.safeParse({
        nonCustodialIncome: 80_000,
        custodialIncome: 40_000,
        numberOfChildren: 0,
      })
      expect(result.success).toBe(false)
    })

    it('rejects 6 children', () => {
      const result = cssaInputSchema.safeParse({
        nonCustodialIncome: 80_000,
        custodialIncome: 40_000,
        numberOfChildren: 6,
      })
      expect(result.success).toBe(false)
    })

    it('rejects negative income', () => {
      const result = cssaInputSchema.safeParse({
        nonCustodialIncome: -10_000,
        custodialIncome: 40_000,
        numberOfChildren: 1,
      })
      expect(result.success).toBe(false)
    })
  })

  describe('calculateCSSA', () => {
    it('calculates basic obligation for 1 child', () => {
      const result = calculateCSSA({
        nonCustodialIncome: 60_000,
        custodialIncome: 40_000,
        numberOfChildren: 1,
      })
      // combined = 100K, capped = 100K, 17% = 17K, NC share = 60%, obligation = 10,200
      expect(result.combinedIncome).toBe(100_000)
      expect(result.cappedIncome).toBe(100_000)
      expect(result.exceedsCap).toBe(false)
      expect(result.percentage).toBe(0.17)
      expect(result.nonCustodialShare).toBe(0.6)
      expect(result.basicObligation).toBe(10_200)
      expect(result.monthlyObligation).toBe(850)
    })

    it('caps income at $193,000', () => {
      const result = calculateCSSA({
        nonCustodialIncome: 150_000,
        custodialIncome: 100_000,
        numberOfChildren: 1,
      })
      expect(result.combinedIncome).toBe(250_000)
      expect(result.cappedIncome).toBe(193_000)
      expect(result.exceedsCap).toBe(true)
    })

    it('includes add-on expenses', () => {
      const result = calculateCSSA({
        nonCustodialIncome: 60_000,
        custodialIncome: 40_000,
        numberOfChildren: 1,
        childcareExpenses: 12_000,
        healthInsurance: 3_000,
        educationExpenses: 5_000,
      })
      expect(result.addOnExpenses).toBe(20_000)
      // NC share = 60%, add-on obligation = 12,000
      expect(result.addOnObligation).toBe(12_000)
      expect(result.annualObligation).toBe(22_200)
    })

    it('handles equal incomes', () => {
      const result = calculateCSSA({
        nonCustodialIncome: 50_000,
        custodialIncome: 50_000,
        numberOfChildren: 2,
      })
      expect(result.nonCustodialShare).toBe(0.5)
      // combined=100K, 25% = 25K, NC share 50% = 12,500
      expect(result.basicObligation).toBe(12_500)
    })

    it('handles zero custodial income', () => {
      const result = calculateCSSA({
        nonCustodialIncome: 80_000,
        custodialIncome: 0,
        numberOfChildren: 1,
      })
      expect(result.nonCustodialShare).toBe(1)
      // 80K * 17% * 1.0 = 13,600
      expect(result.basicObligation).toBe(13_600)
    })

    it('handles zero combined income', () => {
      const result = calculateCSSA({
        nonCustodialIncome: 0,
        custodialIncome: 0,
        numberOfChildren: 1,
      })
      expect(result.nonCustodialShare).toBe(0.5)
      expect(result.basicObligation).toBe(0)
    })

    it('calculates correctly for 3 children at 29%', () => {
      const result = calculateCSSA({
        nonCustodialIncome: 100_000,
        custodialIncome: 0,
        numberOfChildren: 3,
      })
      // 100K * 29% * 1.0 = 29,000
      expect(result.basicObligation).toBe(29_000)
      expect(result.percentage).toBe(0.29)
    })
  })
})
