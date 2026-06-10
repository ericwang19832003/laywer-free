import type { StateConfig } from './types'

export const GA_CONFIG: StateConfig = {
  code: 'GA',
  name: 'Georgia',
  abbreviation: 'GA',
  courtTypes: [
    { value: 'ga_magistrate', label: 'Magistrate Court', maxAmount: 15_000 },
    { value: 'ga_state_court', label: 'State Court' },
    { value: 'ga_superior', label: 'Superior Court' },
  ],
  federalCourtAvailable: true,
  thresholds: {
    smallClaimsMax: 15_000,
  },
  statuteOfLimitations: {
    personalInjury: 2,
    writtenContract: 6,
    oralContract: 4,
    propertyDamage: 4,
  },
  amountRanges: [
    { value: 'under_15k', label: 'Under $15,000', maxAmount: 15_000 },
    { value: 'over_15k', label: 'Over $15,000' },
    { value: 'not_money', label: "It's not about money" },
  ],
}
