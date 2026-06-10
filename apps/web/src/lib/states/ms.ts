import type { StateConfig } from './types'

export const MS_CONFIG: StateConfig = {
  code: 'MS',
  name: 'Mississippi',
  abbreviation: 'MS',
  courtTypes: [
    { value: 'ms_justice', label: 'Justice Court', maxAmount: 3_500 },
    { value: 'ms_county', label: 'County Court', maxAmount: 200_000 },
    { value: 'ms_circuit', label: 'Circuit Court' },
  ],
  federalCourtAvailable: true,
  thresholds: {
    smallClaimsMax: 3_500,
  },
  statuteOfLimitations: {
    personalInjury: 3,
    writtenContract: 3,
    oralContract: 3,
    propertyDamage: 3,
  },
  amountRanges: [
    { value: 'under_3500', label: 'Under $3,500', maxAmount: 3_500 },
    { value: 'over_3500', label: 'Over $3,500' },
    { value: 'not_money', label: "It's not about money" },
  ],
}
