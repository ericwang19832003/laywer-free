/**
 * Texas Personal Injury Damages Calculator
 *
 * Estimates economic and non-economic damages using the multiplier method
 * commonly applied in Texas PI cases.
 *
 * Pure function — no side effects, trivially unit-testable.
 *
 * Note: These are rough estimates for negotiation purposes.
 * Actual damages are determined by juries and vary widely.
 */

// ── Types ────────────────────────────────────────────────────────

export type InjurySeverity = 'minor' | 'moderate' | 'severe' | 'catastrophic'

export interface DamagesInput {
  /** Total medical bills to date */
  medicalExpenses: number
  /** Estimated future medical costs */
  futureMedicalEstimate: number
  /** Documented lost income */
  lostWages: number
  /** Estimated future lost earnings */
  futureLostEarnings: number
  /** Property damage costs */
  propertyDamage: number
  /** Injury severity classification */
  injurySeverity: InjurySeverity
}

export interface DamagesResult {
  /** Economic damages (specials): medical + wages + property */
  economicDamages: number
  /** Multiplier applied for pain & suffering */
  painSufferingMultiplier: number
  /** Estimated pain & suffering amount */
  painSufferingEstimate: number
  /** Total demand range (low to high) */
  totalDemandRange: { low: number; high: number }
  /** Plain-language explanation of the calculation */
  explanation: string
}

// ── Multiplier Ranges ────────────────────────────────────────────

interface MultiplierRange {
  low: number
  high: number
  description: string
}

const SEVERITY_MULTIPLIERS: Record<InjurySeverity, MultiplierRange> = {
  minor: {
    low: 1.5,
    high: 2,
    description: 'soft tissue injuries, full recovery expected',
  },
  moderate: {
    low: 2,
    high: 3,
    description: 'broken bones, surgery, 3–6 month recovery',
  },
  severe: {
    low: 3,
    high: 5,
    description: 'permanent injury, disability',
  },
  catastrophic: {
    low: 5,
    high: 10,
    description: 'TBI, paralysis, amputation',
  },
}

// ── Helpers ──────────────────────────────────────────────────────

function formatDollars(amount: number): string {
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

// ── Public API ───────────────────────────────────────────────────

/**
 * Calculate estimated PI damages using the multiplier method.
 *
 * @param input - Damages input values
 * @returns Damages calculation result with range and explanation
 * @throws Error if any monetary value is negative
 */
export function calculatePIDamages(input: DamagesInput): DamagesResult {
  const {
    medicalExpenses,
    futureMedicalEstimate,
    lostWages,
    futureLostEarnings,
    propertyDamage,
    injurySeverity,
  } = input

  // Validate non-negative
  const fields = { medicalExpenses, futureMedicalEstimate, lostWages, futureLostEarnings, propertyDamage }
  for (const [name, value] of Object.entries(fields)) {
    if (value < 0) {
      throw new Error(`${name} cannot be negative (got ${value})`)
    }
  }

  const multiplierRange = SEVERITY_MULTIPLIERS[injurySeverity]
  if (!multiplierRange) {
    throw new Error(
      `Unknown injury severity: "${injurySeverity}". Valid values: ${Object.keys(SEVERITY_MULTIPLIERS).join(', ')}`
    )
  }

  const economicDamages =
    medicalExpenses + futureMedicalEstimate + lostWages + futureLostEarnings + propertyDamage

  // Pain & suffering is the multiplier applied to medical costs (not property)
  const medicalBase = medicalExpenses + futureMedicalEstimate
  const midMultiplier = (multiplierRange.low + multiplierRange.high) / 2
  const painSufferingEstimate = medicalBase * midMultiplier

  const totalLow = economicDamages + medicalBase * multiplierRange.low
  const totalHigh = economicDamages + medicalBase * multiplierRange.high

  const explanation = [
    `Economic damages (specials): ${formatDollars(economicDamages)}`,
    `  Medical expenses: ${formatDollars(medicalExpenses)}`,
    `  Future medical: ${formatDollars(futureMedicalEstimate)}`,
    `  Lost wages: ${formatDollars(lostWages)}`,
    `  Future lost earnings: ${formatDollars(futureLostEarnings)}`,
    `  Property damage: ${formatDollars(propertyDamage)}`,
    '',
    `Injury severity: ${injurySeverity} (${multiplierRange.description})`,
    `Pain & suffering multiplier: ${multiplierRange.low}x – ${multiplierRange.high}x`,
    `Pain & suffering estimate (midpoint ${midMultiplier}x): ${formatDollars(painSufferingEstimate)}`,
    '',
    `Total demand range: ${formatDollars(totalLow)} – ${formatDollars(totalHigh)}`,
  ].join('\n')

  return {
    economicDamages,
    painSufferingMultiplier: midMultiplier,
    painSufferingEstimate,
    totalDemandRange: { low: totalLow, high: totalHigh },
    explanation,
  }
}
