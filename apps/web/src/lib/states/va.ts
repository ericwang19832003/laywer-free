import type { StateConfig } from './types'

export const VA_CONFIG: StateConfig = {
  code: 'VA',
  name: 'Virginia',
  abbreviation: 'VA',
  courtTypes: [
    { value: 'va_small_claims', label: 'Small Claims Division', maxAmount: 5_000 },
    { value: 'va_general_district', label: 'General District Court', maxAmount: 25_000 },
    { value: 'va_circuit', label: 'Circuit Court' },
    { value: 'va_jdr', label: 'J&DR District Court' },
  ],
  federalCourtAvailable: true,
  thresholds: {
    smallClaimsMax: 5_000,
  },
  statuteOfLimitations: {
    personalInjury: 2,
    writtenContract: 5,
    oralContract: 3,
    propertyDamage: 5,
  },
  amountRanges: [
    { value: 'under_5k', label: 'Under $5,000', maxAmount: 5_000 },
    { value: '5k_25k', label: '$5,000 – $25,000', maxAmount: 25_000 },
    { value: 'over_25k', label: 'Over $25,000' },
    { value: 'not_money', label: "It's not about money" },
  ],
}
