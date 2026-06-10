import type { StateConfig } from './types'

export const HI_CONFIG: StateConfig = {
  code: 'HI',
  name: 'Hawaii',
  abbreviation: 'HI',
  courtTypes: [
    { value: 'hi_small_claims', label: 'Small Claims Court', maxAmount: 5_000 },
    { value: 'hi_district', label: 'District Court', maxAmount: 40_000 },
    { value: 'hi_circuit', label: 'Circuit Court' },
  ],
  federalCourtAvailable: true,
  thresholds: {
    smallClaimsMax: 5_000,
  },
  statuteOfLimitations: {
    personalInjury: 2,
    writtenContract: 6,
    oralContract: 6,
    propertyDamage: 2,
  },
  amountRanges: [
    { value: 'under_5k', label: 'Under $5,000', maxAmount: 5_000 },
    { value: '5k_20k', label: '$5,001 – $40,000', maxAmount: 40_000 },
    { value: 'over_20k', label: 'Over $40,000' },
    { value: 'not_money', label: "It's not about money" },
  ],
}
