export type StateCode = 'TX' | 'CA' | 'NY' | 'FL' | 'PA' | 'IL' | 'OH' | 'GA' | 'NC' | 'MI' | 'NJ' | 'VA' | 'WA' | 'AZ' | 'CO'
  | 'TN' | 'IN' | 'MO' | 'MD' | 'WI' | 'MN' | 'SC' | 'AL' | 'LA' | 'KY'
  | 'OR' | 'NV' | 'CT' | 'MA' | 'OK' | 'AR' | 'MS' | 'UT' | 'NM' | 'WV'
  | 'DE' | 'RI' | 'NH' | 'VT' | 'ME' | 'IA' | 'KS' | 'NE' | 'SD' | 'ND'
  | 'MT' | 'WY' | 'ID' | 'HI' | 'AK'

export const STATE_CODES = [
  'TX', 'CA', 'NY', 'FL', 'PA', 'IL', 'OH', 'GA', 'NC', 'MI', 'NJ', 'VA', 'WA', 'AZ', 'CO',
  'TN', 'IN', 'MO', 'MD', 'WI', 'MN', 'SC', 'AL', 'LA', 'KY',
  'OR', 'NV', 'CT', 'MA', 'OK', 'AR', 'MS', 'UT', 'NM', 'WV',
  'DE', 'RI', 'NH', 'VT', 'ME', 'IA', 'KS', 'NE', 'SD', 'ND',
  'MT', 'WY', 'ID', 'HI', 'AK',
] as const

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
