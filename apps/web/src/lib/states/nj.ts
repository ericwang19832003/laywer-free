import type { StateConfig } from './types'

export const NJ_CONFIG: StateConfig = {
  code: 'NJ',
  name: 'New Jersey',
  abbreviation: 'NJ',
  courtTypes: [
    { value: 'nj_small_claims', label: 'Small Claims Court', maxAmount: 5_000 },
    { value: 'nj_special_civil', label: 'Special Civil Part', maxAmount: 20_000 },
    { value: 'nj_civil', label: 'Superior Court — Civil Part' },
    { value: 'nj_family', label: 'Superior Court — Family Part' },
  ],
  federalCourtAvailable: true,
  thresholds: {
    smallClaimsMax: 5_000,
  },
  statuteOfLimitations: {
    personalInjury: 2,
    writtenContract: 6,
    oralContract: 6,
    propertyDamage: 6,
  },
  amountRanges: [
    { value: 'under_5k', label: 'Under $5,000', maxAmount: 5_000 },
    { value: '5k_20k', label: '$5,000 – $20,000', maxAmount: 20_000 },
    { value: 'over_20k', label: 'Over $20,000' },
    { value: 'not_money', label: "It's not about money" },
  ],
}
