import type { StateConfig } from './types'

export const PA_CONFIG: StateConfig = {
  code: 'PA',
  name: 'Pennsylvania',
  abbreviation: 'PA',
  courtTypes: [
    { value: 'pa_magisterial', label: 'Magisterial District Court', maxAmount: 12_000 },
    { value: 'pa_common_pleas', label: 'Court of Common Pleas' },
  ],
  federalCourtAvailable: true,
  thresholds: {
    smallClaimsMax: 12_000,
  },
  statuteOfLimitations: {
    personalInjury: 2,
    writtenContract: 4,
    oralContract: 4,
    propertyDamage: 2,
  },
  amountRanges: [
    { value: 'under_12k', label: 'Under $12,000', maxAmount: 12_000 },
    { value: 'over_12k', label: 'Over $12,000' },
    { value: 'not_money', label: "It's not about money" },
  ],
}
