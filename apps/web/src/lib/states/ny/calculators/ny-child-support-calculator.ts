/**
 * New York Child Support Standards Act (CSSA) Calculator
 *
 * Calculates child support obligations based on the CSSA formula.
 * Pure computation module — no side effects.
 *
 * References:
 *   - NY Domestic Relations Law § 240(1-b)
 *   - CSSA income cap: $193,000 (as of March 2026)
 */

import { z } from 'zod'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Combined parental income cap for CSSA calculation (2026) */
export const CSSA_INCOME_CAP = 193_000

/** CSSA percentage per number of children */
export const CSSA_PERCENTAGES: Record<number, number> = {
  1: 0.17,
  2: 0.25,
  3: 0.29,
  4: 0.31,
  5: 0.35,
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

export const cssaInputSchema = z.object({
  /** Non-custodial parent's annual gross income */
  nonCustodialIncome: z.number().nonnegative(),
  /** Custodial parent's annual gross income */
  custodialIncome: z.number().nonnegative(),
  /** Number of children (1-5) */
  numberOfChildren: z.number().int().min(1).max(5),
  /** Annual childcare expenses */
  childcareExpenses: z.number().nonnegative().optional().default(0),
  /** Annual health insurance premium for children */
  healthInsurance: z.number().nonnegative().optional().default(0),
  /** Annual education expenses */
  educationExpenses: z.number().nonnegative().optional().default(0),
})

export type CSSAInput = z.infer<typeof cssaInputSchema>

// ---------------------------------------------------------------------------
// Result
// ---------------------------------------------------------------------------

export interface CSSAResult {
  /** Combined parental income */
  combinedIncome: number
  /** Income used for calculation (capped at $193K) */
  cappedIncome: number
  /** Whether combined income exceeds the cap */
  exceedsCap: boolean
  /** CSSA percentage applied */
  percentage: number
  /** Non-custodial parent's pro-rata share (fraction) */
  nonCustodialShare: number
  /** Basic child support obligation (before add-ons) */
  basicObligation: number
  /** Total add-on expenses (childcare + health + education) */
  addOnExpenses: number
  /** Non-custodial parent's share of add-ons */
  addOnObligation: number
  /** Total estimated monthly obligation */
  monthlyObligation: number
  /** Total estimated annual obligation */
  annualObligation: number
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

// ---------------------------------------------------------------------------
// Calculator
// ---------------------------------------------------------------------------

export function calculateCSSA(input: CSSAInput): CSSAResult {
  const combinedIncome = input.nonCustodialIncome + input.custodialIncome
  const exceedsCap = combinedIncome > CSSA_INCOME_CAP
  const cappedIncome = Math.min(combinedIncome, CSSA_INCOME_CAP)

  const percentage = CSSA_PERCENTAGES[input.numberOfChildren] ?? 0.35
  const nonCustodialShare = combinedIncome > 0
    ? input.nonCustodialIncome / combinedIncome
    : 0.5

  const basicObligation = round2(cappedIncome * percentage * nonCustodialShare)

  const addOnExpenses = (input.childcareExpenses ?? 0) +
    (input.healthInsurance ?? 0) +
    (input.educationExpenses ?? 0)
  const addOnObligation = round2(addOnExpenses * nonCustodialShare)

  const annualObligation = round2(basicObligation + addOnObligation)
  const monthlyObligation = round2(annualObligation / 12)

  return {
    combinedIncome,
    cappedIncome,
    exceedsCap,
    percentage,
    nonCustodialShare: round2(nonCustodialShare),
    basicObligation,
    addOnExpenses,
    addOnObligation,
    monthlyObligation,
    annualObligation,
  }
}
