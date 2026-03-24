/**
 * Statute of Limitations rules by state and dispute type.
 *
 * Returns the SOL period in years. Each dispute type maps to a default
 * SOL; sub-types may override. Family law disputes generally have no
 * traditional SOL (marked as null).
 *
 * Sources:
 *  - TX: Tex. Civ. Prac. & Rem. Code §§ 16.001–16.070
 *  - CA: Cal. Code Civ. Proc. §§ 312–366.3
 *  - NY: CPLR §§ 201–218
 *  - FL: Fla. Stat. §§ 95.011–95.18
 *  - PA: 42 Pa. C.S. §§ 5501–5574
 */

type State = 'TX' | 'CA' | 'NY' | 'FL' | 'PA'

// null = no SOL / not applicable (e.g., family law filings)
type SolYears = number | null

interface SolRule {
  default: SolYears
  overrides?: Record<string, SolYears>
  notes?: string
}

type SolRuleMap = Record<string, SolRule>

const TX_RULES: SolRuleMap = {
  personal_injury: {
    default: 2,
    notes: 'Tex. Civ. Prac. & Rem. Code § 16.003',
  },
  contract: {
    default: 4,
    overrides: { oral: 4, written: 4, employment: 2 },
    notes: 'Tex. Civ. Prac. & Rem. Code § 16.004',
  },
  property: {
    default: 2,
    overrides: { trespass: 2, boundary_dispute: 4, title_defect: 4 },
    notes: 'Tex. Civ. Prac. & Rem. Code § 16.003',
  },
  landlord_tenant: {
    default: 2,
    overrides: { security_deposit: 2, property_damage: 2, lease_termination: 4 },
    notes: 'Tex. Civ. Prac. & Rem. Code § 16.003',
  },
  small_claims: {
    default: 2,
    overrides: { breach_of_contract: 4, unpaid_loan: 4 },
    notes: 'Follows underlying cause of action SOL',
  },
  debt_collection: {
    default: 4,
    overrides: { medical_bills: 4, credit_card: 4, personal_loan: 4 },
    notes: 'Tex. Civ. Prac. & Rem. Code § 16.004',
  },
  real_estate: {
    default: 4,
    overrides: { fraud: 4, construction_defect: 10 },
    notes: 'Tex. Civ. Prac. & Rem. Code § 16.004; construction per § 16.009',
  },
  business: {
    default: 4,
    notes: 'Generally follows contract SOL',
  },
  family: {
    default: null,
    notes: 'Family law filings are not subject to traditional SOL',
  },
  other: {
    default: 2,
    overrides: {
      fraud: 4,
      defamation: 1,
      consumer_protection: 2,
      conversion: 2,
      unjust_enrichment: 4,
    },
    notes: 'Varies by cause of action',
  },
}

const CA_RULES: SolRuleMap = {
  personal_injury: { default: 2, notes: 'Cal. Code Civ. Proc. § 335.1' },
  contract: { default: 4, overrides: { oral: 2, written: 4 }, notes: 'Cal. Code Civ. Proc. §§ 337, 339' },
  property: { default: 3, notes: 'Cal. Code Civ. Proc. § 338' },
  landlord_tenant: { default: 2, notes: 'Cal. Code Civ. Proc. § 339' },
  small_claims: { default: 2, overrides: { breach_of_contract: 4 } },
  debt_collection: { default: 4 },
  real_estate: { default: 4, overrides: { construction_defect: 10 } },
  business: { default: 4 },
  family: { default: null },
  other: { default: 2, overrides: { fraud: 3, defamation: 1 } },
}

const NY_RULES: SolRuleMap = {
  personal_injury: { default: 3, notes: 'CPLR § 214' },
  contract: { default: 6, overrides: { oral: 6, written: 6 }, notes: 'CPLR § 213' },
  property: { default: 3, notes: 'CPLR § 214' },
  landlord_tenant: { default: 3 },
  small_claims: { default: 3, overrides: { breach_of_contract: 6 } },
  debt_collection: { default: 6, notes: 'CPLR § 213' },
  real_estate: { default: 6 },
  business: { default: 6 },
  family: { default: null },
  other: { default: 3, overrides: { fraud: 6, defamation: 1 } },
}

const FL_RULES: SolRuleMap = {
  personal_injury: { default: 2, notes: 'Fla. Stat. § 95.11(3)' },
  contract: { default: 5, overrides: { oral: 4, written: 5 }, notes: 'Fla. Stat. § 95.11(2)' },
  property: { default: 4, notes: 'Fla. Stat. § 95.11(3)' },
  landlord_tenant: { default: 4 },
  small_claims: { default: 4, overrides: { breach_of_contract: 5 } },
  debt_collection: { default: 5 },
  real_estate: { default: 5 },
  business: { default: 5 },
  family: { default: null },
  other: { default: 4, overrides: { fraud: 4, defamation: 2 } },
}

const PA_RULES: SolRuleMap = {
  personal_injury: { default: 2, notes: '42 Pa. C.S. § 5524' },
  contract: { default: 4, overrides: { oral: 4, written: 4 }, notes: '42 Pa. C.S. § 5525' },
  property: { default: 2, notes: '42 Pa. C.S. § 5524' },
  landlord_tenant: { default: 2 },
  small_claims: { default: 2, overrides: { breach_of_contract: 4 } },
  debt_collection: { default: 4 },
  real_estate: { default: 4 },
  business: { default: 4 },
  family: { default: null },
  other: { default: 2, overrides: { fraud: 2, defamation: 1 } },
}

const SOL_BY_STATE: Record<State, SolRuleMap> = {
  TX: TX_RULES,
  CA: CA_RULES,
  NY: NY_RULES,
  FL: FL_RULES,
  PA: PA_RULES,
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface SolResult {
  /** SOL period in years, or null if not applicable */
  years: number | null
  /** Expiration date (null if no SOL or no incident date) */
  expiresAt: Date | null
  /** Days remaining until expiration (negative = expired) */
  daysRemaining: number | null
  /** Warning level for UI display */
  level: 'expired' | 'critical' | 'warning' | 'caution' | 'safe' | 'not_applicable'
  /** Statutory citation or note */
  notes: string | null
}

/**
 * Calculate statute of limitations for a case.
 *
 * @param state - Two-letter state code
 * @param disputeType - Main dispute type
 * @param subType - Optional sub-type for override lookup
 * @param incidentDate - Date the incident/breach occurred (ISO string or Date)
 * @param now - Current date (for testing)
 */
export function calculateSol(
  state: string,
  disputeType: string,
  subType?: string | null,
  incidentDate?: string | Date | null,
  now: Date = new Date()
): SolResult {
  const stateRules = SOL_BY_STATE[state.toUpperCase() as State]
  if (!stateRules) {
    return { years: null, expiresAt: null, daysRemaining: null, level: 'not_applicable', notes: `No SOL data for state: ${state}` }
  }

  const rule = stateRules[disputeType]
  if (!rule) {
    return { years: null, expiresAt: null, daysRemaining: null, level: 'not_applicable', notes: `No SOL rule for dispute type: ${disputeType}` }
  }

  // Look up years: sub-type override → default
  const overrideYears = subType ? rule.overrides?.[subType] : undefined
  const years: SolYears = overrideYears ?? rule.default

  if (years === null) {
    return { years: null, expiresAt: null, daysRemaining: null, level: 'not_applicable', notes: rule.notes ?? null }
  }

  if (!incidentDate) {
    return { years, expiresAt: null, daysRemaining: null, level: 'caution', notes: rule.notes ?? null }
  }

  const incident = typeof incidentDate === 'string' ? new Date(incidentDate) : incidentDate
  if (isNaN(incident.getTime())) {
    return { years, expiresAt: null, daysRemaining: null, level: 'caution', notes: rule.notes ?? null }
  }

  const expiresAt = new Date(incident)
  expiresAt.setFullYear(expiresAt.getFullYear() + years)

  const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))

  let level: SolResult['level']
  if (daysRemaining <= 0) {
    level = 'expired'
  } else if (daysRemaining <= 30) {
    level = 'critical'
  } else if (daysRemaining <= 90) {
    level = 'warning'
  } else if (daysRemaining <= 180) {
    level = 'caution'
  } else {
    level = 'safe'
  }

  return { years, expiresAt, daysRemaining, level, notes: rule.notes ?? null }
}

/**
 * Get the SOL period for a state/dispute without incident date.
 * Useful for display purposes (e.g., "2-year statute of limitations applies").
 */
export function getSolYears(state: string, disputeType: string, subType?: string | null): number | null {
  const stateRules = SOL_BY_STATE[state.toUpperCase() as State]
  if (!stateRules) return null
  const rule = stateRules[disputeType]
  if (!rule) return null
  const overrideYears = subType ? rule.overrides?.[subType] : undefined
  return overrideYears ?? rule.default
}
