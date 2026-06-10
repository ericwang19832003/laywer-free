import type { StateConfig } from './types'

export const SC_CONFIG: StateConfig = {
  code: 'SC',
  name: 'South Carolina',
  abbreviation: 'SC',
  courtTypes: [
    { value: 'sc_magistrate', label: 'Magistrate Court', maxAmount: 7_500 },
    { value: 'sc_circuit', label: 'Circuit Court' },
  ],
  federalCourtAvailable: true,
  thresholds: {
    smallClaimsMax: 7_500,
  },
  statuteOfLimitations: {
    personalInjury: 3,
    writtenContract: 3,
    oralContract: 3,
    propertyDamage: 3,
  },
  amountRanges: [
    { value: 'under_7500', label: 'Under $7,500', maxAmount: 7_500 },
    { value: 'over_7500', label: 'Over $7,500' },
    { value: 'not_money', label: "It's not about money" },
  ],
}
