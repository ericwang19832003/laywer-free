import type { StateConfig } from './types'

export const RI_CONFIG: StateConfig = {
  code: 'RI',
  name: 'Rhode Island',
  abbreviation: 'RI',
  courtTypes: [
    { value: 'ri_small_claims', label: 'District Court Small Claims', maxAmount: 2_500 },
    { value: 'ri_district', label: 'District Court', maxAmount: 25_000 },
    { value: 'ri_superior', label: 'Superior Court' },
  ],
  federalCourtAvailable: true,
  thresholds: {
    smallClaimsMax: 2_500,
  },
  statuteOfLimitations: {
    personalInjury: 3,
    writtenContract: 10,
    oralContract: 10,
    propertyDamage: 10,
  },
  amountRanges: [
    { value: 'under_2500', label: 'Under $2,500', maxAmount: 2_500 },
    { value: '2500_5k', label: '$2,501 – $25,000', maxAmount: 25_000 },
    { value: 'over_25k', label: 'Over $25,000' },
    { value: 'not_money', label: "It's not about money" },
  ],
}
