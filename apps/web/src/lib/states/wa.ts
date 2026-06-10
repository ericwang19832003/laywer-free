import type { StateConfig } from './types'

export const WA_CONFIG: StateConfig = {
  code: 'WA',
  name: 'Washington',
  abbreviation: 'WA',
  courtTypes: [
    { value: 'wa_small_claims', label: 'Small Claims Court', maxAmount: 10_000 },
    { value: 'wa_district', label: 'District Court', maxAmount: 100_000 },
    { value: 'wa_superior', label: 'Superior Court' },
  ],
  federalCourtAvailable: true,
  thresholds: {
    smallClaimsMax: 10_000,
  },
  statuteOfLimitations: {
    personalInjury: 3,
    writtenContract: 6,
    oralContract: 3,
    propertyDamage: 3,
  },
  amountRanges: [
    { value: 'under_10k', label: 'Under $10,000', maxAmount: 10_000 },
    { value: '10k_100k', label: '$10,000 – $100,000', maxAmount: 100_000 },
    { value: 'over_100k', label: 'Over $100,000' },
    { value: 'not_money', label: "It's not about money" },
  ],
}
