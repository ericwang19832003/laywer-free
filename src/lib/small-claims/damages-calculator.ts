/**
 * Texas Small Claims Damages Calculator
 *
 * Calculates total damages for small claims cases and checks them against
 * the jurisdiction cap. In Texas, Justice of the Peace (JP) courts handle
 * small claims with a maximum of $20,000.
 *
 * This is a pure computation module with no side effects—suitable for use
 * in both server and client contexts.
 *
 * References:
 *   - Tex. Gov't Code § 27.031 (JP court jurisdiction limit)
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DamageItem {
  /** Category of the damage (e.g., "Property Damage", "Unpaid Wages") */
  category: string
  /** Dollar amount of the damage */
  amount: number
  /** Optional description providing details about the damage */
  description?: string
}

export interface DamagesInput {
  /** List of individual damage items to calculate */
  items: DamageItem[]
  /** Optional jurisdiction cap override (defaults to TX JP Court cap) */
  jurisdictionCap?: number
}

export interface DamagesResult {
  /** Sum of all valid damage item amounts */
  totalDamages: number
  /** Number of valid items (positive amounts only) */
  itemCount: number
  /** Whether total damages exceed the jurisdiction cap */
  exceedsCap: boolean
  /** The applicable jurisdiction cap amount */
  capAmount: number
  /** Filtered list of valid damage items */
  items: DamageItem[]
  /** Amount by which damages exceed the cap (0 if under cap) */
  overCapBy: number
  /** Whether damages are at or above 90% of the cap without exceeding it */
  nearingCap: boolean
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Tex. Gov't Code § 27.031: Texas Justice of the Peace courts have
 * jurisdiction over civil matters where the amount in controversy does
 * not exceed $20,000, exclusive of interest.
 */
export const TX_JP_COURT_CAP = 20_000

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Round to two decimal places (standard currency rounding).
 */
function round2(n: number): number {
  return Math.round(n * 100) / 100
}

// ---------------------------------------------------------------------------
// Main Calculator
// ---------------------------------------------------------------------------

export function calculateDamages(input: DamagesInput): DamagesResult {
  const cap = input.jurisdictionCap ?? TX_JP_COURT_CAP
  const items = input.items.filter(item => item.amount > 0)
  const totalDamages = round2(items.reduce((sum, item) => sum + item.amount, 0))
  const exceedsCap = totalDamages > cap
  const overCapBy = exceedsCap ? round2(totalDamages - cap) : 0
  const nearingCap = !exceedsCap && totalDamages >= cap * 0.9

  return {
    totalDamages,
    itemCount: items.length,
    exceedsCap,
    capAmount: cap,
    items,
    overCapBy,
    nearingCap,
  }
}
