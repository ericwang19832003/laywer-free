import type { StateConfig } from './types'

export const MN_CONFIG: StateConfig = {
  code: 'MN',
  name: 'Minnesota',
  abbreviation: 'MN',
  courtTypes: [
    { value: 'mn_conciliation', label: 'Conciliation Court (Small Claims)', maxAmount: 20_000 },
    { value: 'mn_district', label: 'District Court' },
  ],
  federalCourtAvailable: true,
  thresholds: {
    smallClaimsMax: 20_000,
  },
  statuteOfLimitations: {
    personalInjury: 2,
    writtenContract: 6,
    oralContract: 6,
    propertyDamage: 6,
  },
  amountRanges: [
    { value: 'under_20k', label: 'Under $20,000', maxAmount: 20_000 },
    { value: 'over_20k', label: 'Over $20,000' },
    { value: 'not_money', label: "It's not about money" },
  ],
}
