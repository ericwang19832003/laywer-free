import type { StateConfig } from './types'

export const NV_CONFIG: StateConfig = {
  code: 'NV',
  name: 'Nevada',
  abbreviation: 'NV',
  courtTypes: [
    { value: 'nv_small_claims', label: 'Small Claims Court (Justice Court)', maxAmount: 10_000 },
    { value: 'nv_district', label: 'District Court' },
  ],
  federalCourtAvailable: true,
  thresholds: {
    smallClaimsMax: 10_000,
  },
  statuteOfLimitations: {
    personalInjury: 2,
    writtenContract: 6,
    oralContract: 4,
    propertyDamage: 3,
  },
  amountRanges: [
    { value: 'under_10k', label: 'Under $10,000', maxAmount: 10_000 },
    { value: 'over_10k', label: 'Over $10,000' },
    { value: 'not_money', label: "It's not about money" },
  ],
}
