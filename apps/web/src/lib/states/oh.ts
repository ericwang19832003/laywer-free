import type { StateConfig } from './types'

export const OH_CONFIG: StateConfig = {
  code: 'OH',
  name: 'Ohio',
  abbreviation: 'OH',
  courtTypes: [
    { value: 'oh_small_claims', label: 'Small Claims Court', maxAmount: 6_000 },
    { value: 'oh_municipal', label: 'Municipal Court', maxAmount: 15_000 },
    { value: 'oh_common_pleas', label: 'Court of Common Pleas' },
  ],
  federalCourtAvailable: true,
  thresholds: {
    smallClaimsMax: 6_000,
  },
  statuteOfLimitations: {
    personalInjury: 2,
    writtenContract: 6,
    oralContract: 4,
    propertyDamage: 2,
  },
  amountRanges: [
    { value: 'under_6k', label: 'Under $6,000', maxAmount: 6_000 },
    { value: '6k_15k', label: '$6,000 – $15,000', maxAmount: 15_000 },
    { value: 'over_15k', label: 'Over $15,000' },
    { value: 'not_money', label: "It's not about money" },
  ],
}
