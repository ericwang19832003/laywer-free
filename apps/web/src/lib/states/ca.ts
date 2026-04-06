import type { StateConfig } from './types'

export const CA_CONFIG: StateConfig = {
  code: 'CA',
  name: 'California',
  abbreviation: 'CA',
  courtTypes: [
    { value: 'small_claims', label: 'Small Claims Court', maxAmount: 12_500 },
    { value: 'limited_civil', label: 'Limited Civil Court', maxAmount: 35_000 },
    { value: 'unlimited_civil', label: 'Unlimited Civil Court' },
  ],
  federalCourtAvailable: true,
  thresholds: {
    smallClaimsMax: 12_500,
  },
  statuteOfLimitations: {
    personalInjury: 2,
    writtenContract: 4,
    oralContract: 2,
    propertyDamage: 3,
  },
  amountRanges: [
    { value: 'under_12500', label: 'Under $12,500', maxAmount: 12_500 },
    { value: '12500_35k', label: '$12,500 – $35,000', maxAmount: 35_000 },
    { value: 'over_35k', label: 'Over $35,000' },
    { value: 'not_money', label: "It's not about money" },
  ],
}
