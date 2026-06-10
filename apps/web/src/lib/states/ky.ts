import type { StateConfig } from './types'

export const KY_CONFIG: StateConfig = {
  code: 'KY',
  name: 'Kentucky',
  abbreviation: 'KY',
  courtTypes: [
    { value: 'ky_small_claims', label: 'District Court — Small Claims', maxAmount: 2_500 },
    { value: 'ky_district', label: 'District Court', maxAmount: 5_000 },
    { value: 'ky_circuit', label: 'Circuit Court' },
  ],
  federalCourtAvailable: true,
  thresholds: {
    smallClaimsMax: 2_500,
  },
  statuteOfLimitations: {
    personalInjury: 1,
    writtenContract: 5,
    oralContract: 5,
    propertyDamage: 2,
  },
  amountRanges: [
    { value: 'under_2500', label: 'Under $2,500', maxAmount: 2_500 },
    { value: '2500_5k', label: '$2,500 – $5,000', maxAmount: 5_000 },
    { value: 'over_5k', label: 'Over $5,000' },
    { value: 'not_money', label: "It's not about money" },
  ],
}
