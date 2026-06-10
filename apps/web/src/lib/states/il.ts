import type { StateConfig } from './types'

export const IL_CONFIG: StateConfig = {
  code: 'IL',
  name: 'Illinois',
  abbreviation: 'IL',
  courtTypes: [
    { value: 'il_small_claims', label: 'Circuit Court — Small Claims', maxAmount: 10_000 },
    { value: 'il_circuit', label: 'Circuit Court' },
  ],
  federalCourtAvailable: true,
  thresholds: {
    smallClaimsMax: 10_000,
  },
  statuteOfLimitations: {
    personalInjury: 2,
    writtenContract: 10,
    oralContract: 5,
    propertyDamage: 5,
  },
  amountRanges: [
    { value: 'under_10k', label: 'Under $10,000', maxAmount: 10_000 },
    { value: 'over_10k', label: 'Over $10,000' },
    { value: 'not_money', label: "It's not about money" },
  ],
}
