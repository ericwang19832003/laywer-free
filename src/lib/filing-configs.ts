import { STATE_FILING_INFO } from '@/lib/guided-steps/personal-injury/state-filing-info'

export interface FilingConfig {
  /** Guide-and-File legalProcessKey for deep-linking (TX only), null if not supported */
  legalProcessKey: string | null
  /** Case category for e-filing */
  caseCategory: string
  /** Label for the petition document */
  documentLabel: string
}

/**
 * Maps dispute types (and sub-types where needed) to filing config.
 * TX Guide-and-File deep-link: https://selfhelp.efiletexas.gov/SRL/SRL/Start?legalProcessKey=<KEY>
 */
export const FILING_CONFIGS: Record<string, FilingConfig> = {
  personal_injury: { legalProcessKey: null, caseCategory: 'Civil', documentLabel: 'petition' },
  contract: { legalProcessKey: null, caseCategory: 'Civil', documentLabel: 'petition' },
  property: { legalProcessKey: null, caseCategory: 'Civil', documentLabel: 'petition' },
  divorce: { legalProcessKey: 'divorce', caseCategory: 'Family', documentLabel: 'petition' },
  custody: { legalProcessKey: 'custody', caseCategory: 'Family', documentLabel: 'petition' },
  child_support: { legalProcessKey: null, caseCategory: 'Family', documentLabel: 'petition' },
  visitation: { legalProcessKey: null, caseCategory: 'Family', documentLabel: 'petition' },
  spousal_support: { legalProcessKey: null, caseCategory: 'Family', documentLabel: 'petition' },
  protective_order: { legalProcessKey: 'protective_order', caseCategory: 'Family', documentLabel: 'application' },
  modification: { legalProcessKey: null, caseCategory: 'Family', documentLabel: 'petition' },
  small_claims: { legalProcessKey: 'small_claims', caseCategory: 'Civil', documentLabel: 'petition' },
  eviction: { legalProcessKey: 'eviction', caseCategory: 'Civil', documentLabel: 'petition' },
  landlord_tenant: { legalProcessKey: null, caseCategory: 'Civil', documentLabel: 'petition' },
  debt_defense: { legalProcessKey: null, caseCategory: 'Civil', documentLabel: 'answer' },
  real_estate: { legalProcessKey: null, caseCategory: 'Civil', documentLabel: 'petition' },
  partnership: { legalProcessKey: null, caseCategory: 'Civil', documentLabel: 'petition' },
  employment: { legalProcessKey: null, caseCategory: 'Civil', documentLabel: 'petition' },
  b2b_commercial: { legalProcessKey: null, caseCategory: 'Civil', documentLabel: 'petition' },
  other: { legalProcessKey: null, caseCategory: 'Civil', documentLabel: 'petition' },
  civil: { legalProcessKey: null, caseCategory: 'Civil', documentLabel: 'petition' },
}

/** Returns the e-filing system info for a state, if available */
export function getEFilingSystem(state: string) {
  return STATE_FILING_INFO[state]?.eFilingSystem ?? null
}

/** Returns the e-filing portal URL for the given state. TX uses Guide-and-File deep-links when available. */
export function getEFilingUrl(state: string, config: FilingConfig): string | null {
  const info = STATE_FILING_INFO[state]
  if (!info?.eFilingSystem) return null

  // TX Guide-and-File deep-links
  if (state === 'TX' && config.legalProcessKey) {
    return `https://selfhelp.efiletexas.gov/SRL/SRL/Start?legalProcessKey=${config.legalProcessKey}`
  }

  return info.eFilingSystem.url
}

/** Returns the fee range for a given state + court type, or a generic fallback */
export function getStateFeeRange(state: string, courtType: string): string {
  const info = STATE_FILING_INFO[state]
  if (info?.courts[courtType]) {
    return info.courts[courtType].feeRange
  }
  // Fallback for states without court-specific data
  return 'varies by court'
}

/** Returns the full state name (e.g. "Texas") from abbreviation */
export function getStateName(state: string): string {
  return STATE_FILING_INFO[state]?.name ?? state
}

/** Returns the court label from STATE_FILING_INFO if available, otherwise formats the key */
export function getCourtLabel(state: string, courtType: string): string {
  const info = STATE_FILING_INFO[state]
  if (info?.courts[courtType]) {
    return info.courts[courtType].label
  }
  // Fallback: humanize the court type key
  switch (courtType) {
    case 'jp': return 'Justice of the Peace Court'
    case 'county': return 'County Court'
    case 'district': return 'District Court'
    case 'federal': return 'Federal District Court'
    default: return courtType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  }
}
