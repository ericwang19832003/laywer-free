/**
 * Texas Child Support Calculator
 *
 * Implements the Texas Family Code Chapter 154 guidelines for calculating
 * child support obligations. This is a pure computation module with no
 * side effects—suitable for use in both server and client contexts.
 *
 * References:
 *   - Tex. Fam. Code § 154.125 (guideline percentages)
 *   - Tex. Fam. Code § 154.129 (multiple families adjustment table)
 *   - Tex. Fam. Code § 154.125(a) (net resource cap)
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ChildSupportInput {
  /** Obligor's gross monthly income */
  grossMonthlyIncome: number
  /** Federal income tax withholding (monthly) */
  federalTax: number
  /** State income tax withholding (monthly) */
  stateTax: number
  /** Social security / FICA withholding (monthly) */
  socialSecurity: number
  /** Cost of health insurance for the obligor (monthly) */
  healthInsurance: number
  /** Union dues (monthly) */
  unionDues: number
  /** Number of children before the court (with this custodial parent) */
  numberOfChildren: number
  /** Number of children the obligor supports from other relationships */
  otherChildrenCount: number
}

export interface ChildSupportResult {
  /** Net monthly resources after statutory deductions */
  netMonthlyResources: number
  /** Applicable guideline percentage (may be adjusted for other children) */
  guidelinePercentage: number
  /** Guideline amount before cap (percentage × net resources) */
  guidelineAmount: number
  /** Amount after other-children offset, or null if no offset applies */
  adjustedForOtherChildren: number | null
  /** Capped amount (percentage × $9,200), or null if net ≤ cap */
  cappedAmount: number | null
  /** The final recommended monthly child support amount */
  finalAmount: number
  /** Itemised breakdown for display purposes */
  breakdown: {
    grossIncome: number
    totalDeductions: number
    netResources: number
    percentage: number
    amount: number
  }
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Tex. Fam. Code § 154.125(a): the guideline percentage applies only to the
 * first $9,200 of the obligor's net monthly resources.
 */
const NET_RESOURCE_CAP = 9_200

/**
 * Tex. Fam. Code § 154.125: base guideline percentages indexed by children
 * before the court (index 0 is unused; indices 1–5 map to 1–5+ children).
 */
const BASE_PERCENTAGES: Record<number, number> = {
  1: 20,
  2: 25,
  3: 30,
  4: 35,
  5: 40,
}

/**
 * Tex. Fam. Code § 154.129: multiple-families adjustment table.
 *
 * Keyed by (children before the court) then by (other children count).
 * The "other" key 5 covers "5 or more" other children.
 */
const MULTIPLE_FAMILIES_TABLE: Record<number, Record<number, number>> = {
  1: { 0: 20.0, 1: 17.5, 2: 16.0, 3: 14.75, 4: 13.33, 5: 12.5 },
  2: { 0: 25.0, 1: 22.5, 2: 20.63, 3: 19.0, 4: 17.33, 5: 16.25 },
  3: { 0: 30.0, 1: 27.0, 2: 24.75, 3: 22.88, 4: 21.0, 5: 19.69 },
  4: { 0: 35.0, 1: 31.5, 2: 28.88, 3: 26.69, 4: 24.5, 5: 23.0 },
  5: { 0: 40.0, 1: 36.0, 2: 33.0, 3: 30.5, 4: 28.0, 5: 26.25 },
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Clamp the children-before-court value to the 1–5 range used by the tables.
 * Values above 5 are treated as 5 per the statute ("5 or more").
 */
function clampChildren(n: number): number {
  return Math.min(Math.max(n, 1), 5)
}

/**
 * Clamp the other-children count to the 0–5 range used by § 154.129.
 */
function clampOther(n: number): number {
  return Math.min(Math.max(n, 0), 5)
}

/**
 * Look up the appropriate percentage from the § 154.129 table.
 */
function getPercentage(childrenBeforeCourt: number, otherChildren: number): number {
  const row = MULTIPLE_FAMILIES_TABLE[clampChildren(childrenBeforeCourt)]
  return row[clampOther(otherChildren)]
}

/**
 * Round to two decimal places (standard currency rounding).
 */
function round2(value: number): number {
  return Math.round(value * 100) / 100
}

// ---------------------------------------------------------------------------
// Main Calculator
// ---------------------------------------------------------------------------

export function calculateChildSupport(input: ChildSupportInput): ChildSupportResult {
  const {
    grossMonthlyIncome,
    federalTax,
    stateTax,
    socialSecurity,
    healthInsurance,
    unionDues,
    numberOfChildren,
    otherChildrenCount,
  } = input

  // Edge case: 0 or negative children → zero obligation
  if (numberOfChildren <= 0) {
    return {
      netMonthlyResources: 0,
      guidelinePercentage: 0,
      guidelineAmount: 0,
      adjustedForOtherChildren: null,
      cappedAmount: null,
      finalAmount: 0,
      breakdown: {
        grossIncome: grossMonthlyIncome,
        totalDeductions: 0,
        netResources: 0,
        percentage: 0,
        amount: 0,
      },
    }
  }

  // Step 1: Compute net monthly resources
  const totalDeductions = federalTax + stateTax + socialSecurity + healthInsurance + unionDues
  const netResources = grossMonthlyIncome - totalDeductions

  // Edge case: negative net resources → zero obligation
  if (netResources <= 0) {
    return {
      netMonthlyResources: round2(netResources),
      guidelinePercentage: 0,
      guidelineAmount: 0,
      adjustedForOtherChildren: null,
      cappedAmount: null,
      finalAmount: 0,
      breakdown: {
        grossIncome: grossMonthlyIncome,
        totalDeductions: round2(totalDeductions),
        netResources: round2(netResources),
        percentage: 0,
        amount: 0,
      },
    }
  }

  // Step 2: Determine the applicable percentage
  const hasOtherChildren = otherChildrenCount > 0
  const percentage = getPercentage(numberOfChildren, otherChildrenCount)

  // Step 3: Calculate the base guideline amount (percentage × net resources)
  const basePercentage = BASE_PERCENTAGES[clampChildren(numberOfChildren)]
  const baseGuidelineAmount = round2(netResources * (basePercentage / 100))

  // Step 4: Other-children adjustment
  let adjustedForOtherChildren: number | null = null
  if (hasOtherChildren) {
    adjustedForOtherChildren = round2(netResources * (percentage / 100))
  }

  // Step 5: Cap — only applies when net resources exceed $9,200
  let cappedAmount: number | null = null
  if (netResources > NET_RESOURCE_CAP) {
    cappedAmount = round2(NET_RESOURCE_CAP * (percentage / 100))
  }

  // Step 6: Determine final amount
  //   Priority: cap trumps all (if net > cap, use capped amount)
  //   Then: other-children adjustment if applicable
  //   Otherwise: base guideline amount
  let finalAmount: number
  if (cappedAmount !== null) {
    finalAmount = cappedAmount
  } else if (adjustedForOtherChildren !== null) {
    finalAmount = adjustedForOtherChildren
  } else {
    finalAmount = baseGuidelineAmount
  }

  return {
    netMonthlyResources: round2(netResources),
    guidelinePercentage: percentage,
    guidelineAmount: round2(netResources * (percentage / 100)),
    adjustedForOtherChildren,
    cappedAmount,
    finalAmount,
    breakdown: {
      grossIncome: grossMonthlyIncome,
      totalDeductions: round2(totalDeductions),
      netResources: round2(netResources),
      percentage,
      amount: finalAmount,
    },
  }
}
