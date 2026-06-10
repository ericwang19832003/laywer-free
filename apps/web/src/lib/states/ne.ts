import type { StateConfig } from './types'

export const NE_CONFIG: StateConfig = {
  code: 'NE',
  name: 'Nebraska',
  abbreviation: 'NE',
  courtTypes: [
    { value: 'ne_small_claims', label: 'County Court Small Claims', maxAmount: 3_600 },
    { value: 'ne_county', label: 'County Court', maxAmount: 67_500 },
    { value: 'ne_district', label: 'District Court' },
  ],
  federalCourtAvailable: true,
  thresholds: {
    smallClaimsMax: 3_600,
  },
  statuteOfLimitations: {
    personalInjury: 4,
    writtenContract: 5,
    oralContract: 4,
    propertyDamage: 4,
  },
  amountRanges: [
    { value: 'under_3500', label: 'Under $3,600', maxAmount: 3_600 },
    { value: 'over_3500', label: '$3,601 – $67,500', maxAmount: 67_500 },
    { value: 'over_50k', label: 'Over $67,500' },
    { value: 'not_money', label: "It's not about money" },
  ],
}
