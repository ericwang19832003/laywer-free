import type { StateConfig } from './types'

export const AL_CONFIG: StateConfig = {
  code: 'AL',
  name: 'Alabama',
  abbreviation: 'AL',
  courtTypes: [
    { value: 'al_small_claims', label: 'District Court — Small Claims', maxAmount: 6_000 },
    { value: 'al_district', label: 'District Court', maxAmount: 20_000 },
    { value: 'al_circuit', label: 'Circuit Court' },
  ],
  federalCourtAvailable: true,
  thresholds: {
    smallClaimsMax: 6_000,
  },
  statuteOfLimitations: {
    personalInjury: 2,
    writtenContract: 6,
    oralContract: 6,
    propertyDamage: 6,
  },
  amountRanges: [
    { value: 'under_6k', label: 'Under $6,000', maxAmount: 6_000 },
    { value: '6k_20k', label: '$6,000 – $20,000', maxAmount: 20_000 },
    { value: 'over_20k', label: 'Over $20,000' },
    { value: 'not_money', label: "It's not about money" },
  ],
}
