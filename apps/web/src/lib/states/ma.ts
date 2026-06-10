import type { StateConfig } from './types'

export const MA_CONFIG: StateConfig = {
  code: 'MA',
  name: 'Massachusetts',
  abbreviation: 'MA',
  courtTypes: [
    { value: 'ma_small_claims', label: 'Small Claims Session, District Court', maxAmount: 7_000 },
    { value: 'ma_district', label: 'District Court / Superior Court' },
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
