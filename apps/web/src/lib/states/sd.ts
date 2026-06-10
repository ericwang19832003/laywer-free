import type { StateConfig } from './types'

export const SD_CONFIG: StateConfig = {
  code: 'SD',
  name: 'South Dakota',
  abbreviation: 'SD',
  courtTypes: [
    { value: 'sd_small_claims', label: 'Small Claims Court', maxAmount: 12_000 },
    { value: 'sd_circuit', label: 'Circuit Court' },
  ],
  federalCourtAvailable: true,
  thresholds: {
    smallClaimsMax: 12_000,
  },
  statuteOfLimitations: {
    personalInjury: 3,
    writtenContract: 6,
    oralContract: 6,
    propertyDamage: 6,
  },
  amountRanges: [
    { value: 'under_12500', label: 'Under $12,000', maxAmount: 12_000 },
    { value: 'over_12k', label: 'Over $12,000' },
    { value: 'not_money', label: "It's not about money" },
  ],
}
