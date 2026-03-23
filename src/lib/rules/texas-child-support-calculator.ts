/**
 * Texas Child Support Guidelines Calculator
 *
 * Calculates guideline child support per Texas Family Code §154.125-154.129.
 *
 * Pure function — no side effects, trivially unit-testable.
 *
 * Sources:
 *  - Tex. Fam. Code § 154.125 (guideline percentages)
 *  - Tex. Fam. Code § 154.126 (net resources cap)
 *  - Tex. Fam. Code § 154.129 (multiple family adjustment)
 */

// ── Types ────────────────────────────────────────────────────────

export interface ChildSupportInput {
  /** Obligor's net monthly resources */
  monthlyNetIncome: number
  /** Number of children before the court (1-7+) */
  numberOfChildren: number
  /** Number of children from other relationships (0+) */
  numberOfOtherChildren: number
  /** Monthly health insurance cost for children */
  healthInsuranceCost: number
}

export interface ChildSupportResult {
  /** Monthly guideline amount */
  guidelineAmount: number
  /** Percentage of net resources applied */
  percentage: number
  /** Whether the amount was adjusted for other children */
  adjustedForOtherChildren: boolean
  /** Monthly health insurance credit */
  healthInsuranceCredit: number
  /** Total monthly obligation (guideline + insurance) */
  totalObligation: number
  /** Human-readable explanation */
  explanation: string
  /** Statutory citation */
  statute: string
}

// ── Constants ────────────────────────────────────────────────────

/**
 * Net resources cap per Tex. Fam. Code § 154.125(a).
 * 2024-2025 guideline amount — this changes periodically.
 */
const NET_RESOURCES_CAP = 9_200

/**
 * Guideline percentages per § 154.125(b).
 * Index 0 = 1 child, index 5 = 6 children, 7+ uses 40% floor.
 */
const GUIDELINE_PERCENTAGES: Record<number, number> = {
  1: 0.20,
  2: 0.25,
  3: 0.30,
  4: 0.35,
  5: 0.40,
  6: 0.40,
}

/**
 * Multiple-family adjustment table per § 154.129.
 * Maps total other children → percentage reduction applied to the
 * guideline percentage for children before the court.
 *
 * The table gives the adjusted percentage of net resources for
 * children before the court when the obligor also supports other
 * children. Rows = children before the court, columns = other children.
 */
const MULTIPLE_FAMILY_TABLE: Record<number, Record<number, number>> = {
  // children before court → { other children → adjusted % }
  1: { 0: 0.20, 1: 0.175, 2: 0.16, 3: 0.1475, 4: 0.1360, 5: 0.1333, 6: 0.1314, 7: 0.13 },
  2: { 0: 0.25, 1: 0.225, 2: 0.2063, 3: 0.19, 4: 0.1767, 5: 0.1733, 6: 0.17, 7: 0.1680 },
  3: { 0: 0.30, 1: 0.2738, 2: 0.2520, 3: 0.234, 4: 0.218, 5: 0.2133, 6: 0.2086, 7: 0.2050 },
  4: { 0: 0.35, 1: 0.3225, 2: 0.2975, 3: 0.2775, 4: 0.26, 5: 0.2533, 6: 0.2471, 7: 0.2425 },
  5: { 0: 0.40, 1: 0.3700, 2: 0.3420, 3: 0.32, 4: 0.30, 5: 0.2933, 6: 0.2857, 7: 0.28 },
  6: { 0: 0.40, 1: 0.3700, 2: 0.3420, 3: 0.32, 4: 0.30, 5: 0.2933, 6: 0.2857, 7: 0.28 },
}

// ── Helpers ──────────────────────────────────────────────────────

function getGuidelinePercentage(numberOfChildren: number): number {
  if (numberOfChildren <= 0) return 0
  if (numberOfChildren >= 6) return GUIDELINE_PERCENTAGES[6]
  return GUIDELINE_PERCENTAGES[numberOfChildren]
}

function getAdjustedPercentage(
  numberOfChildren: number,
  numberOfOtherChildren: number
): number {
  if (numberOfOtherChildren <= 0) {
    return getGuidelinePercentage(numberOfChildren)
  }

  const childKey = Math.min(numberOfChildren, 6)
  const otherKey = Math.min(numberOfOtherChildren, 7)

  const row = MULTIPLE_FAMILY_TABLE[childKey]
  if (row && row[otherKey] !== undefined) {
    return row[otherKey]
  }

  // Fallback: use the base percentage if table entry missing
  return getGuidelinePercentage(numberOfChildren)
}

function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
}

// ── Public API ───────────────────────────────────────────────────

/**
 * Calculate Texas guideline child support.
 *
 * @param input - Child support calculation inputs
 * @returns Detailed child support calculation result
 * @throws Error if inputs are invalid
 */
export function calculateChildSupport(input: ChildSupportInput): ChildSupportResult {
  const { monthlyNetIncome, numberOfChildren, numberOfOtherChildren, healthInsuranceCost } = input

  if (monthlyNetIncome < 0) {
    throw new Error('Monthly net income cannot be negative.')
  }
  if (numberOfChildren < 1) {
    throw new Error('Number of children before the court must be at least 1.')
  }
  if (numberOfOtherChildren < 0) {
    throw new Error('Number of other children cannot be negative.')
  }
  if (healthInsuranceCost < 0) {
    throw new Error('Health insurance cost cannot be negative.')
  }

  // Apply net resources cap per § 154.125(a)
  const cappedIncome = Math.min(monthlyNetIncome, NET_RESOURCES_CAP)

  const adjustedForOtherChildren = numberOfOtherChildren > 0

  const percentage = adjustedForOtherChildren
    ? getAdjustedPercentage(numberOfChildren, numberOfOtherChildren)
    : getGuidelinePercentage(numberOfChildren)

  const guidelineAmount = Math.round(cappedIncome * percentage * 100) / 100
  const healthInsuranceCredit = healthInsuranceCost
  const totalObligation = Math.round((guidelineAmount + healthInsuranceCredit) * 100) / 100

  const explanation = formatChildSupportExplanation({
    guidelineAmount,
    percentage,
    adjustedForOtherChildren,
    healthInsuranceCredit,
    totalObligation,
    explanation: '',
    statute: '',
  }, input)

  const statute = adjustedForOtherChildren
    ? 'Tex. Fam. Code §§ 154.125, 154.129'
    : 'Tex. Fam. Code § 154.125'

  return {
    guidelineAmount,
    percentage,
    adjustedForOtherChildren,
    healthInsuranceCredit,
    totalObligation,
    explanation,
    statute,
  }
}

/**
 * Format a human-readable explanation of the child support calculation.
 */
export function formatChildSupportExplanation(
  result: ChildSupportResult,
  input?: ChildSupportInput
): string {
  const lines: string[] = []

  lines.push(`Texas Guideline Child Support Calculation`)
  lines.push(`──────────────────────────────────────────`)

  if (input) {
    lines.push(`Obligor's net monthly resources: ${formatCurrency(input.monthlyNetIncome)}`)
    if (input.monthlyNetIncome > NET_RESOURCES_CAP) {
      lines.push(`Net resources cap applied: ${formatCurrency(NET_RESOURCES_CAP)} (§ 154.125(a))`)
    }
    lines.push(`Children before the court: ${input.numberOfChildren}`)
    if (input.numberOfOtherChildren > 0) {
      lines.push(`Children from other relationships: ${input.numberOfOtherChildren}`)
    }
  }

  lines.push(``)
  lines.push(`Applied percentage: ${(result.percentage * 100).toFixed(2)}%`)

  if (result.adjustedForOtherChildren) {
    lines.push(`(Adjusted for multiple-family obligation per § 154.129)`)
  }

  lines.push(`Guideline support amount: ${formatCurrency(result.guidelineAmount)}/month`)

  if (result.healthInsuranceCredit > 0) {
    lines.push(`Health insurance for children: +${formatCurrency(result.healthInsuranceCredit)}/month`)
  }

  lines.push(`Total monthly obligation: ${formatCurrency(result.totalObligation)}`)

  return lines.join('\n')
}
