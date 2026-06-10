import type { StateConfig } from './types'

export const MT_CONFIG: StateConfig = {
  code: 'MT',
  name: 'Montana',
  abbreviation: 'MT',
  courtTypes: [
    { value: 'mt_justice', label: 'Justice Court Small Claims', maxAmount: 7_000 },
    { value: 'mt_district', label: 'District Court' },
  ],
  federalCourtAvailable: true,
  thresholds: {
    smallClaimsMax: 7_000,
  },
  statuteOfLimitations: {
    personalInjury: 3,
    writtenContract: 8,
    oralContract: 5,
    propertyDamage: 2,
  },
  amountRanges: [
    { value: 'under_7k', label: 'Under $7,000', maxAmount: 7_000 },
    { value: 'over_7500', label: 'Over $7,000' },
    { value: 'not_money', label: "It's not about money" },
  ],
}
