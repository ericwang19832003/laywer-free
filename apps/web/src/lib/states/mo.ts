import type { StateConfig } from './types'

export const MO_CONFIG: StateConfig = {
  code: 'MO',
  name: 'Missouri',
  abbreviation: 'MO',
  courtTypes: [
    { value: 'mo_small_claims', label: 'Small Claims Court', maxAmount: 5_000 },
    { value: 'mo_associate_circuit', label: 'Associate Circuit Court', maxAmount: 25_000 },
    { value: 'mo_circuit', label: 'Circuit Court' },
  ],
  federalCourtAvailable: true,
  thresholds: {
    smallClaimsMax: 5_000,
  },
  statuteOfLimitations: {
    personalInjury: 5,
    writtenContract: 10,
    oralContract: 5,
    propertyDamage: 5,
  },
  amountRanges: [
    { value: 'under_5k', label: 'Under $5,000', maxAmount: 5_000 },
    { value: '5k_25k', label: '$5,000 – $25,000', maxAmount: 25_000 },
    { value: 'over_25k', label: 'Over $25,000' },
    { value: 'not_money', label: "It's not about money" },
  ],
}
