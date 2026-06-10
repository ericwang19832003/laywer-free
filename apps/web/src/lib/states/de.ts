import type { StateConfig } from './types'

export const DE_CONFIG: StateConfig = {
  code: 'DE',
  name: 'Delaware',
  abbreviation: 'DE',
  courtTypes: [
    { value: 'de_jp', label: 'Justice of the Peace Court', maxAmount: 25_000 },
    { value: 'de_common_pleas', label: 'Court of Common Pleas', maxAmount: 75_000 },
    { value: 'de_superior', label: 'Superior Court' },
  ],
  federalCourtAvailable: true,
  thresholds: {
    smallClaimsMax: 25_000,
  },
  statuteOfLimitations: {
    personalInjury: 2,
    writtenContract: 3,
    oralContract: 3,
    propertyDamage: 2,
  },
  amountRanges: [
    { value: 'under_25k', label: 'Under $25,000', maxAmount: 25_000 },
    { value: '25k_75k', label: '$25,001 – $75,000', maxAmount: 75_000 },
    { value: 'over_25k', label: 'Over $75,000' },
    { value: 'not_money', label: "It's not about money" },
  ],
}
