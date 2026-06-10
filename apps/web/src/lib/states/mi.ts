import type { StateConfig } from './types'

export const MI_CONFIG: StateConfig = {
  code: 'MI',
  name: 'Michigan',
  abbreviation: 'MI',
  courtTypes: [
    { value: 'mi_small_claims', label: 'Small Claims Court', maxAmount: 7_000 },
    { value: 'mi_district', label: 'District Court', maxAmount: 25_000 },
    { value: 'mi_circuit', label: 'Circuit Court' },
  ],
  federalCourtAvailable: true,
  thresholds: {
    smallClaimsMax: 7_000,
  },
  statuteOfLimitations: {
    personalInjury: 3,
    writtenContract: 6,
    oralContract: 6,
    propertyDamage: 3,
  },
  amountRanges: [
    { value: 'under_7k', label: 'Under $7,000', maxAmount: 7_000 },
    { value: '7k_25k', label: '$7,000 – $25,000', maxAmount: 25_000 },
    { value: 'over_25k', label: 'Over $25,000' },
    { value: 'not_money', label: "It's not about money" },
  ],
}
