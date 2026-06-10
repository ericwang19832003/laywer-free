import type { StateConfig } from './types'

export const UT_CONFIG: StateConfig = {
  code: 'UT',
  name: 'Utah',
  abbreviation: 'UT',
  courtTypes: [
    { value: 'ut_small_claims', label: 'Justice Court — Small Claims', maxAmount: 20_000 },
    { value: 'ut_district', label: 'District Court' },
  ],
  federalCourtAvailable: true,
  thresholds: {
    smallClaimsMax: 20_000,
  },
  statuteOfLimitations: {
    personalInjury: 4,
    writtenContract: 6,
    oralContract: 4,
    propertyDamage: 3,
  },
  amountRanges: [
    { value: 'under_20k', label: 'Under $20,000', maxAmount: 20_000 },
    { value: 'over_20k', label: 'Over $20,000' },
    { value: 'not_money', label: "It's not about money" },
  ],
}
