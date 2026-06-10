import type { StateConfig } from './types'

export const ME_CONFIG: StateConfig = {
  code: 'ME',
  name: 'Maine',
  abbreviation: 'ME',
  courtTypes: [
    { value: 'me_small_claims', label: 'District Court Small Claims', maxAmount: 6_000 },
    { value: 'me_superior', label: 'Superior Court' },
  ],
  federalCourtAvailable: true,
  thresholds: {
    smallClaimsMax: 6_000,
  },
  statuteOfLimitations: {
    personalInjury: 6,
    writtenContract: 6,
    oralContract: 6,
    propertyDamage: 6,
  },
  amountRanges: [
    { value: 'under_6k', label: 'Under $6,000', maxAmount: 6_000 },
    { value: 'over_5k', label: 'Over $6,000' },
    { value: 'not_money', label: "It's not about money" },
  ],
}
