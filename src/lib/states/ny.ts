import type { StateConfig } from './types'

export const NY_CONFIG: StateConfig = {
  code: 'NY',
  name: 'New York',
  abbreviation: 'NY',
  courtTypes: [
    { value: 'ny_small_claims', label: 'Small Claims Court', maxAmount: 10_000 },
    { value: 'ny_civil', label: 'Civil Court', maxAmount: 25_000 },
    { value: 'ny_supreme', label: 'Supreme Court' },
  ],
  federalCourtAvailable: true,
  thresholds: {
    smallClaimsMax: 10_000,
  },
  statuteOfLimitations: {
    personalInjury: 3,
    writtenContract: 6,
    oralContract: 6,
    propertyDamage: 3,
  },
  amountRanges: [
    { value: 'under_10k', label: 'Under $10,000', maxAmount: 10_000 },
    { value: '10k_25k', label: '$10,000 – $25,000', maxAmount: 25_000 },
    { value: 'over_25k', label: 'Over $25,000' },
    { value: 'not_money', label: "It's not about money" },
  ],
}
