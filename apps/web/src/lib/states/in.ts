import type { StateConfig } from './types'

export const IN_CONFIG: StateConfig = {
  code: 'IN',
  name: 'Indiana',
  abbreviation: 'IN',
  courtTypes: [
    { value: 'in_small_claims', label: 'Small Claims Court', maxAmount: 10_000 },
    { value: 'in_circuit', label: 'Circuit / Superior Court' },
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
