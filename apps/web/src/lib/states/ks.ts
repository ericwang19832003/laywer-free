import type { StateConfig } from './types'

export const KS_CONFIG: StateConfig = {
  code: 'KS',
  name: 'Kansas',
  abbreviation: 'KS',
  courtTypes: [
    { value: 'ks_small_claims', label: 'Small Claims Court', maxAmount: 4_000 },
    { value: 'ks_district', label: 'District Court' },
  ],
  federalCourtAvailable: true,
  thresholds: {
    smallClaimsMax: 4_000,
  },
  statuteOfLimitations: {
    personalInjury: 2,
    writtenContract: 5,
    oralContract: 3,
    propertyDamage: 2,
  },
  amountRanges: [
    { value: 'under_5k', label: 'Under $4,000', maxAmount: 4_000 },
    { value: 'over_5k', label: 'Over $4,000' },
    { value: 'not_money', label: "It's not about money" },
  ],
}
