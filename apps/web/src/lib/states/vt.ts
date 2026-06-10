import type { StateConfig } from './types'

export const VT_CONFIG: StateConfig = {
  code: 'VT',
  name: 'Vermont',
  abbreviation: 'VT',
  courtTypes: [
    { value: 'vt_small_claims', label: 'Small Claims Court', maxAmount: 5_000 },
    { value: 'vt_superior', label: 'Superior Court' },
  ],
  federalCourtAvailable: true,
  thresholds: {
    smallClaimsMax: 5_000,
  },
  statuteOfLimitations: {
    personalInjury: 3,
    writtenContract: 6,
    oralContract: 6,
    propertyDamage: 3,
  },
  amountRanges: [
    { value: 'under_5k', label: 'Under $5,000', maxAmount: 5_000 },
    { value: 'over_5k', label: 'Over $5,000' },
    { value: 'not_money', label: "It's not about money" },
  ],
}
