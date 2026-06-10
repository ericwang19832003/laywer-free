import type { StateConfig } from './types'

export const IA_CONFIG: StateConfig = {
  code: 'IA',
  name: 'Iowa',
  abbreviation: 'IA',
  courtTypes: [
    { value: 'ia_small_claims', label: 'Small Claims Court', maxAmount: 6_500 },
    { value: 'ia_district', label: 'District Court' },
  ],
  federalCourtAvailable: true,
  thresholds: {
    smallClaimsMax: 6_500,
  },
  statuteOfLimitations: {
    personalInjury: 2,
    writtenContract: 10,
    oralContract: 5,
    propertyDamage: 5,
  },
  amountRanges: [
    { value: 'under_7k', label: 'Under $6,500', maxAmount: 6_500 },
    { value: 'over_5k', label: 'Over $6,500' },
    { value: 'not_money', label: "It's not about money" },
  ],
}
