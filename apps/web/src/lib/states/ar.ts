import type { StateConfig } from './types'

export const AR_CONFIG: StateConfig = {
  code: 'AR',
  name: 'Arkansas',
  abbreviation: 'AR',
  courtTypes: [
    { value: 'ar_small_claims', label: 'Small Claims Court (District Court)', maxAmount: 5_000 },
    { value: 'ar_circuit', label: 'Circuit Court' },
  ],
  federalCourtAvailable: true,
  thresholds: {
    smallClaimsMax: 5_000,
  },
  statuteOfLimitations: {
    personalInjury: 3,
    writtenContract: 5,
    oralContract: 3,
    propertyDamage: 3,
  },
  amountRanges: [
    { value: 'under_5k', label: 'Under $5,000', maxAmount: 5_000 },
    { value: 'over_5k', label: 'Over $5,000' },
    { value: 'not_money', label: "It's not about money" },
  ],
}
