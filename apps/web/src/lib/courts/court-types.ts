export type CourtLevel = 'small_claims' | 'limited' | 'general' | 'appellate' | 'federal'

export type CourtTypeCode =
  | 'jp' | 'county' | 'district' | 'appellate' | 'federal'
  | 'small_claims' | 'limited_civil' | 'unlimited_civil' | 'ny_supreme' | 'ny_civil' | 'ny_small_claims'
  | 'fl_small_claims' | 'fl_county' | 'fl_circuit' | 'fl_appellate'
  | 'pa_magisterial' | 'pa_common_pleas' | 'pa_court'

export interface CourtFee {
  filing?: number
  service?: number
  hearing?: number
}

export interface CourtInfo {
  name: string
  level: CourtLevel
  address: string
  city: string
  state: string
  zip: string
  phone: string
  website?: string
  filingFee?: CourtFee
  jurisdiction?: string[]
  notes?: string
}

export interface Court extends CourtInfo {
  id: string
  type: CourtTypeCode
  county?: string
  divisions?: string[]
}

export interface CourtFilters {
  query: string
  types: CourtTypeCode[]
  county: string
  hasFeeInfo: boolean
}

export interface CourtRecommendationDetail {
  courtType: CourtTypeCode
  reason: string
  statute?: string
  requirements?: string[]
}

export const STATE_COURT_TYPES: Record<string, { value: CourtTypeCode; label: string }[]> = {
  TX: [
    { value: 'jp', label: 'Justice of the Peace (JP) Court' },
    { value: 'county', label: 'County Court' },
    { value: 'district', label: 'District Court' },
    { value: 'appellate', label: 'Court of Appeals' },
    { value: 'federal', label: 'Federal Court' },
  ],
  CA: [
    { value: 'small_claims', label: 'Small Claims Court' },
    { value: 'limited_civil', label: 'Limited Civil Court' },
    { value: 'unlimited_civil', label: 'Unlimited Civil Court (Superior Court)' },
    { value: 'appellate', label: 'Court of Appeal' },
    { value: 'federal', label: 'Federal Court' },
  ],
  NY: [
    { value: 'ny_small_claims', label: 'Small Claims Court' },
    { value: 'ny_civil', label: 'Civil Court' },
    { value: 'ny_supreme', label: 'Supreme Court' },
    { value: 'appellate', label: 'Appellate Division' },
    { value: 'federal', label: 'Federal Court' },
  ],
  FL: [
    { value: 'fl_small_claims', label: 'Small Claims Court' },
    { value: 'fl_county', label: 'County Court' },
    { value: 'fl_circuit', label: 'Circuit Court' },
    { value: 'fl_appellate', label: 'District Court of Appeal' },
    { value: 'federal', label: 'Federal Court' },
  ],
  PA: [
    { value: 'pa_magisterial', label: 'Magisterial District Court' },
    { value: 'pa_common_pleas', label: 'Court of Common Pleas' },
    { value: 'pa_court', label: 'Commonwealth Court' },
    { value: 'appellate', label: 'Superior Court / Supreme Court' },
    { value: 'federal', label: 'Federal Court' },
  ],
}
