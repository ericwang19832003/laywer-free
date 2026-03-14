export interface FilingConfig {
  /** Guide-and-File legalProcessKey for deep-linking, null if not supported */
  legalProcessKey: string | null
  /** eFileTexas case category */
  caseCategory: string
  /** Label for the petition document */
  documentLabel: string
}

/**
 * Maps dispute types (and sub-types where needed) to eFileTexas filing config.
 * Guide-and-File deep-link: https://selfhelp.efiletexas.gov/SRL/SRL/Start?legalProcessKey=<KEY>
 * Fallback: https://www.efiletexas.gov
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

export function getEFileTexasUrl(config: FilingConfig): string {
  if (config.legalProcessKey) {
    return `https://selfhelp.efiletexas.gov/SRL/SRL/Start?legalProcessKey=${config.legalProcessKey}`
  }
  return 'https://www.efiletexas.gov'
}

export function getFeeRange(courtType: string): string {
  switch (courtType) {
    case 'jp': return '$75 – $200'
    case 'county': return '$250 – $350'
    case 'district': return '$250 – $400'
    case 'federal': return '$405'
    default: return 'varies by court'
  }
}
