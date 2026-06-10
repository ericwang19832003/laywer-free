import type { StateConfig } from './types'

export const LA_CONFIG: StateConfig = {
  code: 'LA',
  name: 'Louisiana',
  abbreviation: 'LA',
  courtTypes: [
    { value: 'la_small_claims', label: 'City Court — Small Claims', maxAmount: 5_000 },
    { value: 'la_district', label: 'District Court' },
  ],
  federalCourtAvailable: true,
  thresholds: {
    smallClaimsMax: 5_000,
  },
  statuteOfLimitations: {
    personalInjury: 2,
    writtenContract: 10,
    oralContract: 10,
    propertyDamage: 2,
  },
  amountRanges: [
    { value: 'under_5k', label: 'Under $5,000', maxAmount: 5_000 },
    { value: 'over_5k', label: 'Over $5,000' },
    { value: 'not_money', label: "It's not about money" },
  ],
}
