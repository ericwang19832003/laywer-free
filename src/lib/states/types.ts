export type StateCode = 'TX' | 'CA'

export const STATE_CODES = ['TX', 'CA'] as const

export interface CourtTypeConfig {
  value: string
  label: string
  maxAmount?: number
}

export interface StateConfig {
  code: StateCode
  name: string
  abbreviation: string
  courtTypes: CourtTypeConfig[]
  federalCourtAvailable: boolean
  thresholds: {
    smallClaimsMax: number
  }
  statuteOfLimitations: {
    personalInjury: number
    writtenContract: number
    oralContract: number
    propertyDamage: number
  }
  amountRanges: {
    value: string
    label: string
    maxAmount?: number
  }[]
}
