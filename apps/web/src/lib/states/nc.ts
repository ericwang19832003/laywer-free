import type { StateConfig } from './types'

export const NC_CONFIG: StateConfig = {
  code: 'NC',
  name: 'North Carolina',
  abbreviation: 'NC',
  courtTypes: [
    { value: 'nc_small_claims', label: 'Small Claims (Magistrate)', maxAmount: 10_000 },
    { value: 'nc_district', label: 'District Court', maxAmount: 25_000 },
    { value: 'nc_superior', label: 'Superior Court' },
  ],
  federalCourtAvailable: true,
  thresholds: {
    smallClaimsMax: 10_000,
  },
  statuteOfLimitations: {
    personalInjury: 3,
    writtenContract: 3,
    oralContract: 3,
    propertyDamage: 3,
  },
  amountRanges: [
    { value: 'under_10k', label: 'Under $10,000', maxAmount: 10_000 },
    { value: '10k_25k', label: '$10,000 – $25,000', maxAmount: 25_000 },
    { value: 'over_25k', label: 'Over $25,000' },
    { value: 'not_money', label: "It's not about money" },
  ],
}
