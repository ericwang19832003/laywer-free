import type { StateConfig } from './types'

export const TX_CONFIG: StateConfig = {
  code: 'TX',
  name: 'Texas',
  abbreviation: 'TX',
  courtTypes: [
    { value: 'jp', label: 'JP Court (Small Claims)', maxAmount: 20_000 },
    { value: 'county', label: 'County Court', maxAmount: 200_000 },
    { value: 'district', label: 'District Court' },
  ],
  federalCourtAvailable: true,
  thresholds: {
    smallClaimsMax: 20_000,
  },
  statuteOfLimitations: {
    personalInjury: 2,
    writtenContract: 4,
    oralContract: 4,
    propertyDamage: 2,
  },
  amountRanges: [
    { value: 'under_20k', label: 'Under $20,000', maxAmount: 20_000 },
    { value: '20k_75k', label: '$20,000 – $75,000', maxAmount: 75_000 },
    { value: '75k_200k', label: '$75,000 – $200,000', maxAmount: 200_000 },
    { value: 'over_200k', label: 'Over $200,000' },
    { value: 'not_money', label: "It's not about money" },
  ],
}
