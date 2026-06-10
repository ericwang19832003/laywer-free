import type { StateConfig } from './types'

export const ID_CONFIG: StateConfig = {
  code: 'ID',
  name: 'Idaho',
  abbreviation: 'ID',
  courtTypes: [
    { value: 'id_small_claims', label: 'Small Claims Court', maxAmount: 5_000 },
    { value: 'id_magistrate', label: 'Magistrate Division', maxAmount: 10_000 },
    { value: 'id_district', label: 'District Court' },
  ],
  federalCourtAvailable: true,
  thresholds: {
    smallClaimsMax: 5_000,
  },
  statuteOfLimitations: {
    personalInjury: 2,
    writtenContract: 5,
    oralContract: 4,
    propertyDamage: 3,
  },
  amountRanges: [
    { value: 'under_5k', label: 'Under $5,000', maxAmount: 5_000 },
    { value: '5k_10k', label: '$5,001 – $10,000', maxAmount: 10_000 },
    { value: 'over_10k', label: 'Over $10,000' },
    { value: 'not_money', label: "It's not about money" },
  ],
}
