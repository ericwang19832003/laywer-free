import type { StateConfig } from './types'

export const AZ_CONFIG: StateConfig = {
  code: 'AZ',
  name: 'Arizona',
  abbreviation: 'AZ',
  courtTypes: [
    { value: 'az_small_claims', label: 'Small Claims Court', maxAmount: 5_000 },
    { value: 'az_justice', label: 'Justice Court', maxAmount: 10_000 },
    { value: 'az_superior', label: 'Superior Court' },
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
    { value: '5k_10k', label: '$5,000 – $10,000', maxAmount: 10_000 },
    { value: 'over_10k', label: 'Over $10,000' },
    { value: 'not_money', label: "It's not about money" },
  ],
}
