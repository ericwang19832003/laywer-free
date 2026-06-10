import type { StateConfig } from './types'

export const WI_CONFIG: StateConfig = {
  code: 'WI',
  name: 'Wisconsin',
  abbreviation: 'WI',
  courtTypes: [
    { value: 'wi_small_claims', label: 'Circuit Court — Small Claims', maxAmount: 10_000 },
    { value: 'wi_circuit', label: 'Circuit Court' },
  ],
  federalCourtAvailable: true,
  thresholds: {
    smallClaimsMax: 10_000,
  },
  statuteOfLimitations: {
    personalInjury: 3,
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
