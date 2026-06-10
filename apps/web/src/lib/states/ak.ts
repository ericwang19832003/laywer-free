import type { StateConfig } from './types'

export const AK_CONFIG: StateConfig = {
  code: 'AK',
  name: 'Alaska',
  abbreviation: 'AK',
  courtTypes: [
    { value: 'ak_small_claims', label: 'District Court Small Claims', maxAmount: 10_000 },
    { value: 'ak_district', label: 'District Court' },
  ],
  federalCourtAvailable: true,
  thresholds: {
    smallClaimsMax: 10_000,
  },
  statuteOfLimitations: {
    personalInjury: 2,
    writtenContract: 3,
    oralContract: 3,
    propertyDamage: 2,
  },
  amountRanges: [
    { value: 'under_10k', label: 'Under $10,000', maxAmount: 10_000 },
    { value: 'over_10k', label: 'Over $10,000' },
    { value: 'not_money', label: "It's not about money" },
  ],
}
