/**
 * Texas Spousal Maintenance Calculator
 *
 * Determines eligibility, maximum duration, and maximum amount for
 * court-ordered spousal maintenance per Texas Family Code §8.051-8.055.
 *
 * Pure function — no side effects, trivially unit-testable.
 *
 * Sources:
 *  - Tex. Fam. Code § 8.051 (eligibility)
 *  - Tex. Fam. Code § 8.054 (duration limits)
 *  - Tex. Fam. Code § 8.055 (amount cap)
 */

// ── Types ────────────────────────────────────────────────────────

export interface SpousalSupportInput {
  /** Duration of the marriage in years */
  marriageDurationYears: number
  /** Monthly gross income of the paying spouse */
  monthlyGrossIncome: number
  /** Spouse convicted of or received deferred adjudication for family violence within 2 years */
  familyViolence: boolean
  /** Seeking spouse has an incapacitating physical or mental disability */
  spouseDisabled: boolean
  /** Seeking spouse is custodian of a child who requires substantial care due to disability */
  childDisabledRequiringCare: boolean
  /** Seeking spouse lacks sufficient property to provide for minimum reasonable needs */
  insufficientPropertyForMinimumNeeds: boolean
}

export interface SpousalSupportResult {
  /** Whether the seeking spouse is eligible for maintenance */
  eligible: boolean
  /** Basis for eligibility (or reason for ineligibility) */
  eligibilityBasis: string
  /** Maximum monthly amount (lesser of $5,000 or 20% of gross) */
  maxMonthlyAmount: number
  /** Maximum duration in months (0 if not eligible, -1 if indefinite) */
  maxDurationMonths: number
  /** Human-readable explanation */
  explanation: string
  /** Statutory citation */
  statute: string
}

// ── Constants ────────────────────────────────────────────────────

/** Maximum monthly maintenance cap per § 8.055(a)(1) */
const MAX_MONTHLY_CAP = 5_000

/** Maximum percentage of gross income per § 8.055(a)(2) */
const MAX_INCOME_PERCENTAGE = 0.20

// ── Helpers ──────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
}

// ── Public API ───────────────────────────────────────────────────

/**
 * Determine whether a spouse is eligible for Texas spousal maintenance.
 *
 * @param input - Spousal support inputs
 * @returns true if at least one eligibility basis is met
 */
export function isSpousalSupportEligible(input: SpousalSupportInput): boolean {
  const { familyViolence, marriageDurationYears, insufficientPropertyForMinimumNeeds,
    spouseDisabled, childDisabledRequiringCare } = input

  // § 8.051(1): Family violence conviction/deferred adjudication within 2 years
  if (familyViolence) return true

  // § 8.051(2): Marriage >= 10 years + insufficient property + unable to earn
  if (marriageDurationYears >= 10 && insufficientPropertyForMinimumNeeds) return true

  // § 8.051(3): Spouse has incapacitating disability
  if (spouseDisabled) return true

  // § 8.051(4): Custodian of disabled child requiring substantial care
  if (childDisabledRequiringCare) return true

  return false
}

/**
 * Calculate Texas spousal maintenance eligibility, amount, and duration.
 *
 * @param input - Spousal support inputs
 * @returns Detailed spousal maintenance calculation result
 * @throws Error if inputs are invalid
 */
export function calculateSpousalSupport(input: SpousalSupportInput): SpousalSupportResult {
  const { marriageDurationYears, monthlyGrossIncome, familyViolence,
    spouseDisabled, childDisabledRequiringCare, insufficientPropertyForMinimumNeeds } = input

  if (marriageDurationYears < 0) {
    throw new Error('Marriage duration cannot be negative.')
  }
  if (monthlyGrossIncome < 0) {
    throw new Error('Monthly gross income cannot be negative.')
  }

  // ── Eligibility ──────────────────────────────────────────────

  const eligible = isSpousalSupportEligible(input)

  const eligibilityReasons: string[] = []
  if (familyViolence) {
    eligibilityReasons.push('family violence conviction or deferred adjudication within 2 years (§ 8.051(1))')
  }
  if (marriageDurationYears >= 10 && insufficientPropertyForMinimumNeeds) {
    eligibilityReasons.push('marriage >= 10 years with insufficient property for minimum needs (§ 8.051(2))')
  }
  if (spouseDisabled) {
    eligibilityReasons.push('spouse has incapacitating physical or mental disability (§ 8.051(3))')
  }
  if (childDisabledRequiringCare) {
    eligibilityReasons.push('custodian of disabled child requiring substantial care (§ 8.051(4))')
  }

  const eligibilityBasis = eligible
    ? eligibilityReasons.join('; ')
    : 'No eligibility basis met under § 8.051'

  // ── Amount ───────────────────────────────────────────────────

  let maxMonthlyAmount = 0
  if (eligible) {
    // § 8.055: lesser of $5,000 or 20% of paying spouse's average monthly gross income
    const percentageAmount = Math.round(monthlyGrossIncome * MAX_INCOME_PERCENTAGE * 100) / 100
    maxMonthlyAmount = Math.min(MAX_MONTHLY_CAP, percentageAmount)
  }

  // ── Duration ─────────────────────────────────────────────────

  let maxDurationMonths = 0
  if (eligible) {
    if (spouseDisabled || childDisabledRequiringCare) {
      // Indefinite duration per § 8.054(a)(1) — spouse disabled or caring for disabled child
      maxDurationMonths = -1
    } else if (marriageDurationYears >= 30) {
      // § 8.054(a)(2): 30+ years → max 10 years
      maxDurationMonths = 120
    } else if (marriageDurationYears >= 20) {
      // § 8.054(a)(3): 20-30 years → max 7 years
      maxDurationMonths = 84
    } else if (marriageDurationYears >= 10) {
      // § 8.054(a)(4): 10-20 years → max 5 years
      maxDurationMonths = 60
    } else if (familyViolence) {
      // § 8.054(a)(5): < 10 years with FV → max 5 years
      maxDurationMonths = 60
    }
  }

  // ── Explanation ──────────────────────────────────────────────

  const lines: string[] = []
  lines.push(`Texas Spousal Maintenance Analysis`)
  lines.push(`──────────────────────────────────`)
  lines.push(`Marriage duration: ${marriageDurationYears} year${marriageDurationYears !== 1 ? 's' : ''}`)
  lines.push(`Paying spouse's monthly gross income: ${formatCurrency(monthlyGrossIncome)}`)
  lines.push(``)

  lines.push(`Eligibility: ${eligible ? 'YES' : 'NO'}`)
  if (eligible) {
    lines.push(`Basis: ${eligibilityBasis}`)
    lines.push(``)
    lines.push(`Maximum monthly amount: ${formatCurrency(maxMonthlyAmount)} (§ 8.055)`)
    lines.push(`  (Lesser of ${formatCurrency(MAX_MONTHLY_CAP)} or 20% of gross income = ${formatCurrency(monthlyGrossIncome * MAX_INCOME_PERCENTAGE)})`)

    if (maxDurationMonths === -1) {
      lines.push(`Maximum duration: Indefinite (§ 8.054(a)(1))`)
    } else {
      const years = maxDurationMonths / 12
      lines.push(`Maximum duration: ${maxDurationMonths} months (${years} years) (§ 8.054)`)
    }
  } else {
    lines.push(`Reason: ${eligibilityBasis}`)
  }

  const explanation = lines.join('\n')
  const statute = 'Tex. Fam. Code §§ 8.051-8.055'

  return {
    eligible,
    eligibilityBasis,
    maxMonthlyAmount,
    maxDurationMonths,
    explanation,
    statute,
  }
}
