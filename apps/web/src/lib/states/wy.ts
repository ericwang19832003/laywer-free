import type { StateConfig } from './types'

export const WY_CONFIG: StateConfig = {
  code: 'WY',
  name: 'Wyoming',
  abbreviation: 'WY',
  courtTypes: [
    { value: 'wy_small_claims', label: 'Circuit Court Small Claims', maxAmount: 6_000 },
    { value: 'wy_district', label: 'District Court' },
  ],
  federalCourtAvailable: true,
  thresholds: {
    smallClaimsMax: 6_000,
  },
  statuteOfLimitations: {
    personalInjury: 4,
    writtenContract: 10,
    oralContract: 8,
    propertyDamage: 4,
  },
  amountRanges: [
    { value: 'under_6k', label: 'Under $6,000', maxAmount: 6_000 },
    { value: 'over_5k', label: 'Over $6,000' },
    { value: 'not_money', label: "It's not about money" },
  ],
}
