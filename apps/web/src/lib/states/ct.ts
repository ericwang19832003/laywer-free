import type { StateConfig } from './types'

export const CT_CONFIG: StateConfig = {
  code: 'CT',
  name: 'Connecticut',
  abbreviation: 'CT',
  courtTypes: [
    { value: 'ct_small_claims', label: 'Superior Court — Small Claims Session', maxAmount: 5_000 },
    { value: 'ct_superior', label: 'Superior Court' },
  ],
  federalCourtAvailable: true,
  thresholds: {
    smallClaimsMax: 5_000,
  },
  statuteOfLimitations: {
    personalInjury: 2,
    writtenContract: 6,
    oralContract: 3,
    propertyDamage: 2,
  },
  amountRanges: [
    { value: 'under_5k', label: 'Under $5,000', maxAmount: 5_000 },
    { value: 'over_5k', label: 'Over $5,000' },
    { value: 'not_money', label: "It's not about money" },
  ],
}
