import type { StateConfig } from './types'

export const TN_CONFIG: StateConfig = {
  code: 'TN',
  name: 'Tennessee',
  abbreviation: 'TN',
  courtTypes: [
    { value: 'tn_general_sessions', label: 'General Sessions Court', maxAmount: 25_000 },
    { value: 'tn_circuit', label: 'Circuit Court' },
  ],
  federalCourtAvailable: true,
  thresholds: {
    smallClaimsMax: 25_000,
  },
  statuteOfLimitations: {
    personalInjury: 1,
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
