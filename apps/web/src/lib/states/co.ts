import type { StateConfig } from './types'

export const CO_CONFIG: StateConfig = {
  code: 'CO',
  name: 'Colorado',
  abbreviation: 'CO',
  courtTypes: [
    { value: 'co_small_claims', label: 'Small Claims Court', maxAmount: 7_500 },
    { value: 'co_county', label: 'County Court', maxAmount: 15_000 },
    { value: 'co_district', label: 'District Court' },
  ],
  federalCourtAvailable: true,
  thresholds: {
    smallClaimsMax: 7_500,
  },
  statuteOfLimitations: {
    personalInjury: 2,
    writtenContract: 3,
    oralContract: 3,
    propertyDamage: 2,
  },
  amountRanges: [
    { value: 'under_7500', label: 'Under $7,500', maxAmount: 7_500 },
    { value: '7500_15k', label: '$7,500 – $15,000', maxAmount: 15_000 },
    { value: 'over_15k', label: 'Over $15,000' },
    { value: 'not_money', label: "It's not about money" },
  ],
}
