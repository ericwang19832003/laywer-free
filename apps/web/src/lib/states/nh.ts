import type { StateConfig } from './types'

export const NH_CONFIG: StateConfig = {
  code: 'NH',
  name: 'New Hampshire',
  abbreviation: 'NH',
  courtTypes: [
    { value: 'nh_small_claims', label: 'Circuit Court Small Claims', maxAmount: 10_000 },
    { value: 'nh_superior', label: 'Superior Court' },
  ],
  federalCourtAvailable: true,
  thresholds: {
    smallClaimsMax: 10_000,
  },
  statuteOfLimitations: {
    personalInjury: 3,
    writtenContract: 3,
    oralContract: 3,
    propertyDamage: 3,
  },
  amountRanges: [
    { value: 'under_10k', label: 'Under $10,000', maxAmount: 10_000 },
    { value: 'over_10k', label: 'Over $10,000' },
    { value: 'not_money', label: "It's not about money" },
  ],
}
