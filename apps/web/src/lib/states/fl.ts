import type { StateConfig } from './types'

export const FL_CONFIG: StateConfig = {
  code: 'FL',
  name: 'Florida',
  abbreviation: 'FL',
  courtTypes: [
    { value: 'fl_small_claims', label: 'Small Claims Court', maxAmount: 8_000 },
    { value: 'fl_county', label: 'County Court', maxAmount: 50_000 },
    { value: 'fl_circuit', label: 'Circuit Court' },
  ],
  federalCourtAvailable: true,
  thresholds: {
    smallClaimsMax: 8_000,
  },
  statuteOfLimitations: {
    personalInjury: 2,
    writtenContract: 5,
    oralContract: 4,
    propertyDamage: 4,
  },
  amountRanges: [
    { value: 'under_8k', label: 'Under $8,000', maxAmount: 8_000 },
    { value: '8k_50k', label: '$8,000 – $50,000', maxAmount: 50_000 },
    { value: 'over_50k', label: 'Over $50,000' },
    { value: 'not_money', label: "It's not about money" },
  ],
}
