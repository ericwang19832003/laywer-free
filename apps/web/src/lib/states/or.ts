import type { StateConfig } from './types'

export const OR_CONFIG: StateConfig = {
  code: 'OR',
  name: 'Oregon',
  abbreviation: 'OR',
  courtTypes: [
    { value: 'or_small_claims', label: 'Small Claims Dept, Circuit Court', maxAmount: 10_000 },
    { value: 'or_circuit', label: 'Circuit Court' },
  ],
  federalCourtAvailable: true,
  thresholds: {
    smallClaimsMax: 10_000,
  },
  statuteOfLimitations: {
    personalInjury: 2,
    writtenContract: 6,
    oralContract: 6,
    propertyDamage: 6,
  },
  amountRanges: [
    { value: 'under_10k', label: 'Under $10,000', maxAmount: 10_000 },
    { value: 'over_10k', label: 'Over $10,000' },
    { value: 'not_money', label: "It's not about money" },
  ],
}
