import type { StateConfig } from './types'

export const NM_CONFIG: StateConfig = {
  code: 'NM',
  name: 'New Mexico',
  abbreviation: 'NM',
  courtTypes: [
    { value: 'nm_magistrate', label: 'Magistrate Court (or Metro Court in Bernalillo)', maxAmount: 10_000 },
    { value: 'nm_district', label: 'District Court' },
  ],
  federalCourtAvailable: true,
  thresholds: {
    smallClaimsMax: 10_000,
  },
  statuteOfLimitations: {
    personalInjury: 3,
    writtenContract: 6,
    oralContract: 4,
    propertyDamage: 4,
  },
  amountRanges: [
    { value: 'under_10k', label: 'Under $10,000', maxAmount: 10_000 },
    { value: 'over_10k', label: 'Over $10,000' },
    { value: 'not_money', label: "It's not about money" },
  ],
}
