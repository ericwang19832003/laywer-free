/**
 * Texas County Filing Requirements
 *
 * Per-county filing fees, required documents, and formatting rules for the
 * top 20 most populous Texas counties. Covers JP, County, and District courts.
 *
 * DATA FRESHNESS: Each record has a `lastVerified` date. The monthly refresh
 * script at apps/web/scripts/refresh-court-data.ts uses DeepSeek to propose
 * updates — a human reviews the diff before merging.
 *
 * SOURCE: eFileTexas.gov, individual county clerk websites, OCA fee schedules.
 * All fees should be confirmed with the court clerk before filing.
 */

export type TexasCourtLevel = 'jp' | 'county_court' | 'district'

export interface CourtLevelRequirements {
  filingFee: string
  requiredDocuments: string[]
  formattingRules: string[]
  eFilingUrl: string
  clerkWebsite: string
  clerkPhone: string
  notes?: string
}

export interface CountyFilingRequirements {
  county: string
  /** ISO date — when this record was last manually verified */
  lastVerified: string
  jp: CourtLevelRequirements
  county_court: CourtLevelRequirements
  district: CourtLevelRequirements
}

// ---------------------------------------------------------------------------
// Shared constants
// ---------------------------------------------------------------------------

const EFILE_URL = 'https://efiletexas.gov'

const TX_FORMATTING_RULES = [
  'Upload as a text-searchable PDF (not a scanned image)',
  'Redact SSN, date of birth, and financial account numbers',
  'Use legible font, 12pt or larger recommended',
  'Leave at least 1-inch margins on all sides',
]

const JP_DOCS = [
  'Original Petition (3 copies)',
  'Photo ID (for in-person filing)',
  'Filing fee payment or fee waiver (Statement of Inability to Afford Payment)',
]

const COUNTY_DISTRICT_DOCS = [
  'Original Petition (3 copies)',
  'Civil Case Information Sheet (Texas OCA form)',
  'Photo ID (for in-person filing)',
  'Filing fee payment or fee waiver (Statement of Inability to Afford Payment)',
]

// ---------------------------------------------------------------------------
// County data — top 20 Texas counties by population
// ---------------------------------------------------------------------------

export const TEXAS_FILING_REQUIREMENTS: CountyFilingRequirements[] = [
  {
    county: 'Harris',
    lastVerified: '2026-05-01',
    jp: {
      filingFee: '~$46',
      requiredDocuments: JP_DOCS,
      formattingRules: TX_FORMATTING_RULES,
      eFilingUrl: EFILE_URL,
      clerkWebsite: 'www.jp.hctx.net',
      clerkPhone: '(713) 368-4300',
    },
    county_court: {
      filingFee: '~$298',
      requiredDocuments: COUNTY_DISTRICT_DOCS,
      formattingRules: TX_FORMATTING_RULES,
      eFilingUrl: EFILE_URL,
      clerkWebsite: 'www.hccentraltechnology.org',
      clerkPhone: '(713) 274-8680',
    },
    district: {
      filingFee: '~$360',
      requiredDocuments: COUNTY_DISTRICT_DOCS,
      formattingRules: TX_FORMATTING_RULES,
      eFilingUrl: EFILE_URL,
      clerkWebsite: 'www.hcdistrictclerk.com',
      clerkPhone: '(713) 755-6405',
      notes: 'Harris County District Clerk also offers e-filing via ProDoc.',
    },
  },
  {
    county: 'Dallas',
    lastVerified: '2026-05-01',
    jp: {
      filingFee: '~$46',
      requiredDocuments: JP_DOCS,
      formattingRules: TX_FORMATTING_RULES,
      eFilingUrl: EFILE_URL,
      clerkWebsite: 'www.dallascounty.org/jp',
      clerkPhone: '(214) 653-6201',
    },
    county_court: {
      filingFee: '~$296',
      requiredDocuments: COUNTY_DISTRICT_DOCS,
      formattingRules: TX_FORMATTING_RULES,
      eFilingUrl: EFILE_URL,
      clerkWebsite: 'www.dallascounty.org/departments/countyclerk',
      clerkPhone: '(214) 653-7301',
    },
    district: {
      filingFee: '~$361',
      requiredDocuments: COUNTY_DISTRICT_DOCS,
      formattingRules: TX_FORMATTING_RULES,
      eFilingUrl: EFILE_URL,
      clerkWebsite: 'www.dallascounty.org/departments/districtclerk',
      clerkPhone: '(214) 653-7301',
    },
  },
  {
    county: 'Tarrant',
    lastVerified: '2026-05-01',
    jp: {
      filingFee: '~$46',
      requiredDocuments: JP_DOCS,
      formattingRules: TX_FORMATTING_RULES,
      eFilingUrl: EFILE_URL,
      clerkWebsite: 'www.tarrantcounty.com/en/jp-courts.html',
      clerkPhone: '(817) 884-1195',
    },
    county_court: {
      filingFee: '~$295',
      requiredDocuments: COUNTY_DISTRICT_DOCS,
      formattingRules: TX_FORMATTING_RULES,
      eFilingUrl: EFILE_URL,
      clerkWebsite: 'www.tarrantcounty.com/en/county-clerk.html',
      clerkPhone: '(817) 884-1111',
    },
    district: {
      filingFee: '~$360',
      requiredDocuments: COUNTY_DISTRICT_DOCS,
      formattingRules: TX_FORMATTING_RULES,
      eFilingUrl: EFILE_URL,
      clerkWebsite: 'www.tarrantcounty.com/en/district-clerk.html',
      clerkPhone: '(817) 884-1574',
    },
  },
  {
    county: 'Bexar',
    lastVerified: '2026-05-01',
    jp: {
      filingFee: '~$46',
      requiredDocuments: JP_DOCS,
      formattingRules: TX_FORMATTING_RULES,
      eFilingUrl: EFILE_URL,
      clerkWebsite: 'www.bexar.org/jp',
      clerkPhone: '(210) 335-2189',
    },
    county_court: {
      filingFee: '~$299',
      requiredDocuments: COUNTY_DISTRICT_DOCS,
      formattingRules: TX_FORMATTING_RULES,
      eFilingUrl: EFILE_URL,
      clerkWebsite: 'www.bexar.org/CountyClerk',
      clerkPhone: '(210) 335-2216',
    },
    district: {
      filingFee: '~$360',
      requiredDocuments: COUNTY_DISTRICT_DOCS,
      formattingRules: TX_FORMATTING_RULES,
      eFilingUrl: EFILE_URL,
      clerkWebsite: 'www.bexar.org/1539/District-Clerk',
      clerkPhone: '(210) 335-2261',
    },
  },
  {
    county: 'Travis',
    lastVerified: '2026-05-01',
    jp: {
      filingFee: '~$46',
      requiredDocuments: JP_DOCS,
      formattingRules: TX_FORMATTING_RULES,
      eFilingUrl: EFILE_URL,
      clerkWebsite: 'www.jp.traviscountytx.gov',
      clerkPhone: '(512) 854-9019',
    },
    county_court: {
      filingFee: '~$298',
      requiredDocuments: COUNTY_DISTRICT_DOCS,
      formattingRules: TX_FORMATTING_RULES,
      eFilingUrl: EFILE_URL,
      clerkWebsite: 'www.traviscountytx.gov/county-clerk',
      clerkPhone: '(512) 854-4722',
    },
    district: {
      filingFee: '~$358',
      requiredDocuments: COUNTY_DISTRICT_DOCS,
      formattingRules: TX_FORMATTING_RULES,
      eFilingUrl: EFILE_URL,
      clerkWebsite: 'www.traviscountytx.gov/district-clerk',
      clerkPhone: '(512) 854-9457',
    },
  },
  {
    county: 'Collin',
    lastVerified: '2026-05-01',
    jp: {
      filingFee: '~$46',
      requiredDocuments: JP_DOCS,
      formattingRules: TX_FORMATTING_RULES,
      eFilingUrl: EFILE_URL,
      clerkWebsite: 'www.collincountytx.gov/jp',
      clerkPhone: '(972) 548-4215',
    },
    county_court: {
      filingFee: '~$297',
      requiredDocuments: COUNTY_DISTRICT_DOCS,
      formattingRules: TX_FORMATTING_RULES,
      eFilingUrl: EFILE_URL,
      clerkWebsite: 'www.collincountytx.gov/county_clerk',
      clerkPhone: '(972) 548-4185',
    },
    district: {
      filingFee: '~$360',
      requiredDocuments: COUNTY_DISTRICT_DOCS,
      formattingRules: TX_FORMATTING_RULES,
      eFilingUrl: EFILE_URL,
      clerkWebsite: 'www.collincountytx.gov/district_clerk',
      clerkPhone: '(972) 548-4320',
    },
  },
  {
    county: 'Denton',
    lastVerified: '2026-05-01',
    jp: {
      filingFee: '~$46',
      requiredDocuments: JP_DOCS,
      formattingRules: TX_FORMATTING_RULES,
      eFilingUrl: EFILE_URL,
      clerkWebsite: 'www.dentoncounty.gov/jp',
      clerkPhone: '(940) 349-2210',
    },
    county_court: {
      filingFee: '~$296',
      requiredDocuments: COUNTY_DISTRICT_DOCS,
      formattingRules: TX_FORMATTING_RULES,
      eFilingUrl: EFILE_URL,
      clerkWebsite: 'www.dentoncounty.gov/county-clerk',
      clerkPhone: '(940) 349-2012',
    },
    district: {
      filingFee: '~$358',
      requiredDocuments: COUNTY_DISTRICT_DOCS,
      formattingRules: TX_FORMATTING_RULES,
      eFilingUrl: EFILE_URL,
      clerkWebsite: 'www.dentoncounty.gov/departments/district-clerk',
      clerkPhone: '(940) 349-2200',
    },
  },
  {
    county: 'Fort Bend',
    lastVerified: '2026-05-01',
    jp: {
      filingFee: '~$46',
      requiredDocuments: JP_DOCS,
      formattingRules: TX_FORMATTING_RULES,
      eFilingUrl: EFILE_URL,
      clerkWebsite: 'www.fortbendcountytx.gov/jp',
      clerkPhone: '(281) 342-3411',
    },
    county_court: {
      filingFee: '~$297',
      requiredDocuments: COUNTY_DISTRICT_DOCS,
      formattingRules: TX_FORMATTING_RULES,
      eFilingUrl: EFILE_URL,
      clerkWebsite: 'www.fortbendcountytx.gov/county-clerk',
      clerkPhone: '(281) 341-8685',
    },
    district: {
      filingFee: '~$360',
      requiredDocuments: COUNTY_DISTRICT_DOCS,
      formattingRules: TX_FORMATTING_RULES,
      eFilingUrl: EFILE_URL,
      clerkWebsite: 'www.fortbendcountytx.gov/government/departments/district-clerk',
      clerkPhone: '(281) 341-4517',
    },
  },
  {
    county: 'Williamson',
    lastVerified: '2026-05-01',
    jp: {
      filingFee: '~$46',
      requiredDocuments: JP_DOCS,
      formattingRules: TX_FORMATTING_RULES,
      eFilingUrl: EFILE_URL,
      clerkWebsite: 'www.wilco.org/jp',
      clerkPhone: '(512) 943-1100',
    },
    county_court: {
      filingFee: '~$295',
      requiredDocuments: COUNTY_DISTRICT_DOCS,
      formattingRules: TX_FORMATTING_RULES,
      eFilingUrl: EFILE_URL,
      clerkWebsite: 'www.wilco.org/Departments/County-Clerk',
      clerkPhone: '(512) 943-1515',
    },
    district: {
      filingFee: '~$358',
      requiredDocuments: COUNTY_DISTRICT_DOCS,
      formattingRules: TX_FORMATTING_RULES,
      eFilingUrl: EFILE_URL,
      clerkWebsite: 'www.wilco.org/Departments/District-Clerk',
      clerkPhone: '(512) 943-1212',
    },
  },
  {
    county: 'Montgomery',
    lastVerified: '2026-05-01',
    jp: {
      filingFee: '~$46',
      requiredDocuments: JP_DOCS,
      formattingRules: TX_FORMATTING_RULES,
      eFilingUrl: EFILE_URL,
      clerkWebsite: 'www.mctx.org/jp',
      clerkPhone: '(936) 539-7885',
    },
    county_court: {
      filingFee: '~$297',
      requiredDocuments: COUNTY_DISTRICT_DOCS,
      formattingRules: TX_FORMATTING_RULES,
      eFilingUrl: EFILE_URL,
      clerkWebsite: 'www.mctx.org/county_clerk',
      clerkPhone: '(936) 539-7885',
    },
    district: {
      filingFee: '~$360',
      requiredDocuments: COUNTY_DISTRICT_DOCS,
      formattingRules: TX_FORMATTING_RULES,
      eFilingUrl: EFILE_URL,
      clerkWebsite: 'www.mctx.org/departments/district_clerk',
      clerkPhone: '(936) 539-7885',
    },
  },
  {
    county: 'El Paso',
    lastVerified: '2026-05-01',
    jp: {
      filingFee: '~$46',
      requiredDocuments: JP_DOCS,
      formattingRules: TX_FORMATTING_RULES,
      eFilingUrl: EFILE_URL,
      clerkWebsite: 'www.epcounty.com/jp',
      clerkPhone: '(915) 546-2070',
    },
    county_court: {
      filingFee: '~$295',
      requiredDocuments: COUNTY_DISTRICT_DOCS,
      formattingRules: TX_FORMATTING_RULES,
      eFilingUrl: EFILE_URL,
      clerkWebsite: 'www.epcounty.com/countyclerk',
      clerkPhone: '(915) 546-2071',
    },
    district: {
      filingFee: '~$357',
      requiredDocuments: COUNTY_DISTRICT_DOCS,
      formattingRules: TX_FORMATTING_RULES,
      eFilingUrl: EFILE_URL,
      clerkWebsite: 'www.epcounty.com/distclerk',
      clerkPhone: '(915) 546-2021',
    },
  },
  {
    county: 'Hidalgo',
    lastVerified: '2026-05-01',
    jp: {
      filingFee: '~$46',
      requiredDocuments: JP_DOCS,
      formattingRules: TX_FORMATTING_RULES,
      eFilingUrl: EFILE_URL,
      clerkWebsite: 'www.hidalgocounty.us/jp',
      clerkPhone: '(956) 318-2200',
    },
    county_court: {
      filingFee: '~$296',
      requiredDocuments: COUNTY_DISTRICT_DOCS,
      formattingRules: TX_FORMATTING_RULES,
      eFilingUrl: EFILE_URL,
      clerkWebsite: 'www.hidalgocounty.us/countyclerk',
      clerkPhone: '(956) 318-2100',
    },
    district: {
      filingFee: '~$360',
      requiredDocuments: COUNTY_DISTRICT_DOCS,
      formattingRules: TX_FORMATTING_RULES,
      eFilingUrl: EFILE_URL,
      clerkWebsite: 'www.hidalgocounty.us/districtclerk',
      clerkPhone: '(956) 318-2200',
    },
  },
  {
    county: 'Nueces',
    lastVerified: '2026-05-01',
    jp: {
      filingFee: '~$46',
      requiredDocuments: JP_DOCS,
      formattingRules: TX_FORMATTING_RULES,
      eFilingUrl: EFILE_URL,
      clerkWebsite: 'www.nuecesco.com/jp',
      clerkPhone: '(361) 888-0444',
    },
    county_court: {
      filingFee: '~$295',
      requiredDocuments: COUNTY_DISTRICT_DOCS,
      formattingRules: TX_FORMATTING_RULES,
      eFilingUrl: EFILE_URL,
      clerkWebsite: 'www.nuecesco.com/county-government/county-clerk',
      clerkPhone: '(361) 888-0580',
    },
    district: {
      filingFee: '~$357',
      requiredDocuments: COUNTY_DISTRICT_DOCS,
      formattingRules: TX_FORMATTING_RULES,
      eFilingUrl: EFILE_URL,
      clerkWebsite: 'www.nuecesco.com/county-government/district-clerk',
      clerkPhone: '(361) 888-0450',
    },
  },
  {
    county: 'Bell',
    lastVerified: '2026-05-01',
    jp: {
      filingFee: '~$46',
      requiredDocuments: JP_DOCS,
      formattingRules: TX_FORMATTING_RULES,
      eFilingUrl: EFILE_URL,
      clerkWebsite: 'www.co.bell.tx.us/jp',
      clerkPhone: '(254) 933-5116',
    },
    county_court: {
      filingFee: '~$296',
      requiredDocuments: COUNTY_DISTRICT_DOCS,
      formattingRules: TX_FORMATTING_RULES,
      eFilingUrl: EFILE_URL,
      clerkWebsite: 'www.co.bell.tx.us/county_clerk',
      clerkPhone: '(254) 933-5161',
    },
    district: {
      filingFee: '~$358',
      requiredDocuments: COUNTY_DISTRICT_DOCS,
      formattingRules: TX_FORMATTING_RULES,
      eFilingUrl: EFILE_URL,
      clerkWebsite: 'www.co.bell.tx.us/district_clerk',
      clerkPhone: '(254) 933-5197',
    },
  },
  {
    county: 'Lubbock',
    lastVerified: '2026-05-01',
    jp: {
      filingFee: '~$46',
      requiredDocuments: JP_DOCS,
      formattingRules: TX_FORMATTING_RULES,
      eFilingUrl: EFILE_URL,
      clerkWebsite: 'www.co.lubbock.tx.us/jp',
      clerkPhone: '(806) 775-1530',
    },
    county_court: {
      filingFee: '~$296',
      requiredDocuments: COUNTY_DISTRICT_DOCS,
      formattingRules: TX_FORMATTING_RULES,
      eFilingUrl: EFILE_URL,
      clerkWebsite: 'www.co.lubbock.tx.us/county-clerk',
      clerkPhone: '(806) 775-1090',
    },
    district: {
      filingFee: '~$358',
      requiredDocuments: COUNTY_DISTRICT_DOCS,
      formattingRules: TX_FORMATTING_RULES,
      eFilingUrl: EFILE_URL,
      clerkWebsite: 'www.co.lubbock.tx.us/departments/district-clerk',
      clerkPhone: '(806) 775-1045',
    },
  },
  {
    county: 'Jefferson',
    lastVerified: '2026-05-01',
    jp: {
      filingFee: '~$46',
      requiredDocuments: JP_DOCS,
      formattingRules: TX_FORMATTING_RULES,
      eFilingUrl: EFILE_URL,
      clerkWebsite: 'www.co.jefferson.tx.us/jp',
      clerkPhone: '(409) 835-8462',
    },
    county_court: {
      filingFee: '~$295',
      requiredDocuments: COUNTY_DISTRICT_DOCS,
      formattingRules: TX_FORMATTING_RULES,
      eFilingUrl: EFILE_URL,
      clerkWebsite: 'www.co.jefferson.tx.us/countyclerk',
      clerkPhone: '(409) 835-8475',
    },
    district: {
      filingFee: '~$357',
      requiredDocuments: COUNTY_DISTRICT_DOCS,
      formattingRules: TX_FORMATTING_RULES,
      eFilingUrl: EFILE_URL,
      clerkWebsite: 'www.co.jefferson.tx.us/distclerk',
      clerkPhone: '(409) 835-8580',
    },
  },
  {
    county: 'McLennan',
    lastVerified: '2026-05-01',
    jp: {
      filingFee: '~$46',
      requiredDocuments: JP_DOCS,
      formattingRules: TX_FORMATTING_RULES,
      eFilingUrl: EFILE_URL,
      clerkWebsite: 'www.co.mclennan.tx.us/jp',
      clerkPhone: '(254) 757-5078',
    },
    county_court: {
      filingFee: '~$296',
      requiredDocuments: COUNTY_DISTRICT_DOCS,
      formattingRules: TX_FORMATTING_RULES,
      eFilingUrl: EFILE_URL,
      clerkWebsite: 'www.co.mclennan.tx.us/county-clerk',
      clerkPhone: '(254) 757-5078',
    },
    district: {
      filingFee: '~$358',
      requiredDocuments: COUNTY_DISTRICT_DOCS,
      formattingRules: TX_FORMATTING_RULES,
      eFilingUrl: EFILE_URL,
      clerkWebsite: 'www.co.mclennan.tx.us/departments/district-clerk',
      clerkPhone: '(254) 757-5054',
    },
  },
  {
    county: 'Smith',
    lastVerified: '2026-05-01',
    jp: {
      filingFee: '~$46',
      requiredDocuments: JP_DOCS,
      formattingRules: TX_FORMATTING_RULES,
      eFilingUrl: EFILE_URL,
      clerkWebsite: 'www.smith-county.com/jp',
      clerkPhone: '(903) 590-4790',
    },
    county_court: {
      filingFee: '~$296',
      requiredDocuments: COUNTY_DISTRICT_DOCS,
      formattingRules: TX_FORMATTING_RULES,
      eFilingUrl: EFILE_URL,
      clerkWebsite: 'www.smith-county.com/county-clerk',
      clerkPhone: '(903) 590-4670',
    },
    district: {
      filingFee: '~$358',
      requiredDocuments: COUNTY_DISTRICT_DOCS,
      formattingRules: TX_FORMATTING_RULES,
      eFilingUrl: EFILE_URL,
      clerkWebsite: 'www.smith-county.com/district-clerk',
      clerkPhone: '(903) 590-1660',
    },
  },
  {
    county: 'Webb',
    lastVerified: '2026-05-01',
    jp: {
      filingFee: '~$46',
      requiredDocuments: JP_DOCS,
      formattingRules: TX_FORMATTING_RULES,
      eFilingUrl: EFILE_URL,
      clerkWebsite: 'www.webbcountytx.gov/jp',
      clerkPhone: '(956) 523-4268',
    },
    county_court: {
      filingFee: '~$295',
      requiredDocuments: COUNTY_DISTRICT_DOCS,
      formattingRules: TX_FORMATTING_RULES,
      eFilingUrl: EFILE_URL,
      clerkWebsite: 'www.webbcountytx.gov/CountyClerk',
      clerkPhone: '(956) 523-4268',
    },
    district: {
      filingFee: '~$357',
      requiredDocuments: COUNTY_DISTRICT_DOCS,
      formattingRules: TX_FORMATTING_RULES,
      eFilingUrl: EFILE_URL,
      clerkWebsite: 'www.webbcountytx.gov/DistrictClerk',
      clerkPhone: '(956) 523-4268',
    },
  },
  {
    county: 'Cameron',
    lastVerified: '2026-05-01',
    jp: {
      filingFee: '~$46',
      requiredDocuments: JP_DOCS,
      formattingRules: TX_FORMATTING_RULES,
      eFilingUrl: EFILE_URL,
      clerkWebsite: 'www.co.cameron.tx.us/jp',
      clerkPhone: '(956) 544-0838',
    },
    county_court: {
      filingFee: '~$295',
      requiredDocuments: COUNTY_DISTRICT_DOCS,
      formattingRules: TX_FORMATTING_RULES,
      eFilingUrl: EFILE_URL,
      clerkWebsite: 'www.co.cameron.tx.us/countyclerk',
      clerkPhone: '(956) 544-0815',
    },
    district: {
      filingFee: '~$357',
      requiredDocuments: COUNTY_DISTRICT_DOCS,
      formattingRules: TX_FORMATTING_RULES,
      eFilingUrl: EFILE_URL,
      clerkWebsite: 'www.co.cameron.tx.us/districtclerk',
      clerkPhone: '(956) 544-0838',
    },
  },
]

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

const INDEX = new Map<string, CountyFilingRequirements>(
  TEXAS_FILING_REQUIREMENTS.map((r) => [r.county.toLowerCase(), r])
)

/** Normalise a user-typed county string to match our index keys */
function normaliseCounty(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/\s+county$/i, '')
    .replace(/\s+co\.?$/i, '')
    .trim()
}

export function getTexasCountyRequirements(
  county: string
): CountyFilingRequirements | undefined {
  return INDEX.get(normaliseCounty(county))
}

/**
 * Map a damage range answer from pi-court-selection to a court level.
 * Returns 'jp' for small claims, 'county_court' for mid-range, 'district' for large.
 */
export function damageRangeToCourtLevel(
  damageRange: string | undefined
): TexasCourtLevel {
  if (!damageRange) return 'county_court'
  if (damageRange.startsWith('under_')) return 'jp'
  if (damageRange.startsWith('over_')) return 'district'
  return 'county_court'
}

const LEVEL_LABELS: Record<TexasCourtLevel, string> = {
  jp: 'Justice of the Peace Court',
  county_court: 'County Court at Law',
  district: 'District Court',
}

export interface CourtFeeInfo {
  countyName: string
  courtLabel: string
  fee: string
  lastVerified: string
}

export interface CourtContactInfo {
  countyName: string
  courtLabel: string
  eFilingUrl: string
  clerkWebsite: string
  clerkPhone: string
  lastVerified: string
}

/** Returns just the court name + fee for Screen 1 of the TurboTax-style filing flow. */
export function getTexasCourtFeeInfo(
  county: string,
  courtLevel: TexasCourtLevel
): CourtFeeInfo | null {
  const entry = getTexasCountyRequirements(county)
  if (!entry) return null
  return {
    countyName: entry.county,
    courtLabel: LEVEL_LABELS[courtLevel],
    fee: entry[courtLevel].filingFee,
    lastVerified: entry.lastVerified,
  }
}

/** Returns clerk contact info for Screen 4 of the TurboTax-style filing flow. */
export function getTexasCourtContactInfo(
  county: string,
  courtLevel: TexasCourtLevel
): CourtContactInfo | null {
  const entry = getTexasCountyRequirements(county)
  if (!entry) return null
  const req = entry[courtLevel]
  return {
    countyName: entry.county,
    courtLabel: LEVEL_LABELS[courtLevel],
    eFilingUrl: req.eFilingUrl,
    clerkWebsite: req.clerkWebsite,
    clerkPhone: req.clerkPhone,
    lastVerified: entry.lastVerified,
  }
}

/**
 * Build a formatted info-card string for display inside a guided step.
 * Returns null when the county is not in the database (show fallback).
 */
export function formatCourtRequirementsCard(
  county: string,
  courtLevel: TexasCourtLevel
): string | null {
  const entry = getTexasCountyRequirements(county)
  if (!entry) return null

  const req = entry[courtLevel]
  const courtLabel = LEVEL_LABELS[courtLevel]
  const docList = req.requiredDocuments.map((d) => `• ${d}`).join('\n')
  const fmtList = req.formattingRules.map((r) => `• ${r}`).join('\n')
  const notesLine = req.notes ? `\nNOTE: ${req.notes}` : ''

  return (
    `${entry.county} County — ${courtLabel}\n\n` +
    `FILING FEE: ${req.filingFee} (fee waiver available)\n\n` +
    `REQUIRED DOCUMENTS:\n${docList}\n\n` +
    `FORMATTING RULES:\n${fmtList}\n\n` +
    `E-FILING: ${req.eFilingUrl}\n` +
    `CLERK WEBSITE: ${req.clerkWebsite}\n` +
    `CLERK PHONE: ${req.clerkPhone}` +
    notesLine +
    `\n\nLast verified: ${entry.lastVerified} — confirm with the clerk before filing.`
  )
}
