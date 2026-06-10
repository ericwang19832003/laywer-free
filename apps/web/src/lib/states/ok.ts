import type { StateConfig } from './types'

export const OK_CONFIG: StateConfig = {
  code: 'OK',
  name: 'Oklahoma',
  abbreviation: 'OK',
  courtTypes: [
    { value: 'ok_small_claims', label: 'Small Claims Docket, District Court', maxAmount: 10_000 },
    { value: 'ok_district', label: 'District Court' },
  ],
  federalCourtAvailable: true,
  thresholds: {
    smallClaimsMax: 10_000,
  },
  statuteOfLimitations: {
    personalInjury: 2,
    writtenContract: 5,
    oralContract: 3,
    propertyDamage: 2,
  },
  amountRanges: [
    { value: 'under_10k', label: 'Under $10,000', maxAmount: 10_000 },
    { value: 'over_10k', label: 'Over $10,000' },
    { value: 'not_money', label: "It's not about money" },
  ],
}
