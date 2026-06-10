import type { StateConfig } from './types'

export const WV_CONFIG: StateConfig = {
  code: 'WV',
  name: 'West Virginia',
  abbreviation: 'WV',
  courtTypes: [
    { value: 'wv_magistrate', label: 'Magistrate Court', maxAmount: 20_000 },
    { value: 'wv_circuit', label: 'Circuit Court' },
  ],
  federalCourtAvailable: true,
  thresholds: {
    smallClaimsMax: 20_000,
  },
  statuteOfLimitations: {
    personalInjury: 2,
    writtenContract: 10,
    oralContract: 5,
    propertyDamage: 2,
  },
  amountRanges: [
    { value: 'under_20k', label: 'Under $20,000', maxAmount: 20_000 },
    { value: 'over_20k', label: 'Over $20,000' },
    { value: 'not_money', label: "It's not about money" },
  ],
}
