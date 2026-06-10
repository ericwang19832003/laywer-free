import type { StateConfig } from './types'

export const ND_CONFIG: StateConfig = {
  code: 'ND',
  name: 'North Dakota',
  abbreviation: 'ND',
  courtTypes: [
    { value: 'nd_small_claims', label: 'Small Claims Court', maxAmount: 15_000 },
    { value: 'nd_district', label: 'District Court' },
  ],
  federalCourtAvailable: true,
  thresholds: {
    smallClaimsMax: 15_000,
  },
  statuteOfLimitations: {
    personalInjury: 6,
    writtenContract: 6,
    oralContract: 6,
    propertyDamage: 6,
  },
  amountRanges: [
    { value: 'under_15k', label: 'Under $15,000', maxAmount: 15_000 },
    { value: 'over_15k', label: 'Over $15,000' },
    { value: 'not_money', label: "It's not about money" },
  ],
}
