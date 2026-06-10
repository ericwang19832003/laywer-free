import type { StateConfig } from './types'

export const MD_CONFIG: StateConfig = {
  code: 'MD',
  name: 'Maryland',
  abbreviation: 'MD',
  courtTypes: [
    { value: 'md_district', label: 'District Court', maxAmount: 30_000 },
    { value: 'md_circuit', label: 'Circuit Court' },
  ],
  federalCourtAvailable: true,
  thresholds: {
    smallClaimsMax: 5_000,
  },
  statuteOfLimitations: {
    personalInjury: 3,
    writtenContract: 3,
    oralContract: 3,
    propertyDamage: 3,
  },
  amountRanges: [
    { value: 'under_5k', label: 'Under $5,000', maxAmount: 5_000 },
    { value: '5k_25k', label: '$5,000 – $25,000', maxAmount: 25_000 },
    { value: 'over_25k', label: 'Over $25,000' },
    { value: 'not_money', label: "It's not about money" },
  ],
}
