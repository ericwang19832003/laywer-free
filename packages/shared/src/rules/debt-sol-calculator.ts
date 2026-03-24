/**
 * Texas Debt Statute of Limitations Calculator
 *
 * Calculates SOL expiration for common Texas debt categories based on
 * the Texas Civil Practice & Remedies Code and UCC provisions.
 *
 * Pure function — no side effects, trivially unit-testable.
 *
 * Sources:
 *  - Tex. Civ. Prac. & Rem. Code § 16.004
 *  - Tex. Bus. & Com. Code § 3.118 (UCC promissory notes)
 */

// ── Types ────────────────────────────────────────────────────────

export interface DebtSolResult {
  /** Date the SOL expires */
  expiresAt: Date
  /** Days remaining until expiration (negative = expired) */
  daysRemaining: number
  /** Whether the statute of limitations has already expired */
  isExpired: boolean
  /** Statutory citation */
  statute: string
  /** SOL period in years */
  years: number
}

// ── SOL Rules ────────────────────────────────────────────────────

interface DebtSolRule {
  years: number
  statute: string
}

const TX_DEBT_SOL: Record<string, DebtSolRule> = {
  written_contract: {
    years: 4,
    statute: 'Tex. Civ. Prac. & Rem. Code § 16.004(a)(3)',
  },
  oral_contract: {
    years: 4,
    statute: 'Tex. Civ. Prac. & Rem. Code § 16.004(a)(5)',
  },
  promissory_note: {
    years: 6,
    statute: 'Tex. Bus. & Com. Code § 3.118 (UCC)',
  },
  open_account: {
    years: 4,
    statute: 'Tex. Civ. Prac. & Rem. Code § 16.004(a)(3)',
  },
  credit_card: {
    years: 4,
    statute: 'Tex. Civ. Prac. & Rem. Code § 16.004(a)(3)',
  },
  medical_debt: {
    years: 4,
    statute: 'Tex. Civ. Prac. & Rem. Code § 16.004(a)(3)',
  },
}

const VALID_DEBT_TYPES = Object.keys(TX_DEBT_SOL)

// ── Helpers ──────────────────────────────────────────────────────

const MS_PER_DAY = 24 * 60 * 60 * 1000

// ── Public API ───────────────────────────────────────────────────

/**
 * Calculate the statute of limitations for a Texas debt case.
 *
 * @param debtType - One of: written_contract, oral_contract, promissory_note,
 *                   open_account, credit_card, medical_debt
 * @param lastPaymentOrDefaultDate - ISO date string (YYYY-MM-DD) of the last
 *                                    payment or date of default
 * @param now - Current date (injectable for testing)
 * @returns SOL calculation result
 * @throws Error if debtType is unrecognized or date is invalid
 */
export function calculateDebtSol(
  debtType: string,
  lastPaymentOrDefaultDate: string,
  now: Date = new Date()
): DebtSolResult {
  const normalizedType = debtType.toLowerCase().replace(/[\s-]/g, '_')

  const rule = TX_DEBT_SOL[normalizedType]
  if (!rule) {
    throw new Error(
      `Unknown debt type: "${debtType}". Valid types: ${VALID_DEBT_TYPES.join(', ')}`
    )
  }

  const baseDate = new Date(lastPaymentOrDefaultDate)
  if (isNaN(baseDate.getTime())) {
    throw new Error(
      `Invalid date: "${lastPaymentOrDefaultDate}". Expected ISO format (YYYY-MM-DD).`
    )
  }

  const expiresAt = new Date(baseDate)
  expiresAt.setFullYear(expiresAt.getFullYear() + rule.years)

  const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / MS_PER_DAY)
  const isExpired = daysRemaining <= 0

  return {
    expiresAt,
    daysRemaining,
    isExpired,
    statute: rule.statute,
    years: rule.years,
  }
}

/**
 * Get the list of supported debt types.
 */
export function getSupportedDebtTypes(): string[] {
  return [...VALID_DEBT_TYPES]
}
