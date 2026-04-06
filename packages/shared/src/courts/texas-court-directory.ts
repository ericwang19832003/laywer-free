/**
 * Texas Court Directory — top 20 most populous counties
 *
 * Provides court contact information, filing fees, and e-filing URLs
 * for debt defense users who need to file an answer.
 *
 * Note: eFileTexas.gov is the universal e-filing portal for all Texas courts.
 * Filing fees and addresses are approximate and should be confirmed with the
 * court clerk before filing.
 */

export interface JpCourtEntry {
  name: string
  address: string
  phone: string
  hours: string
  efileUrl?: string
}

export interface CountyCourtEntry {
  name: string
  address: string
  phone: string
  hours: string
  clerkPhone: string
  efileUrl: string
}

export interface DistrictCourtEntry {
  name: string
  address: string
  phone: string
  hours: string
  clerkPhone: string
  efileUrl: string
}

export interface FilingFees {
  jp: number
  county: number
  district: number
}

export interface TexasCourtInfo {
  county: string
  jpCourts: JpCourtEntry[]
  countyCourt: CountyCourtEntry
  districtCourt: DistrictCourtEntry
  feeWaiverForm: string
  filingFees: FilingFees
}

const EFILE_URL = 'https://efiletexas.gov'
const FEE_WAIVER =
  'File Statement of Inability to Afford Payment of Court Costs (OCA Form)'
const DEFAULT_HOURS = '8:00 AM – 5:00 PM, Monday – Friday'

// ---------------------------------------------------------------------------
// County data
// ---------------------------------------------------------------------------

const TEXAS_COURTS: TexasCourtInfo[] = [
  // 1. Harris County (Houston)
  {
    county: 'Harris',
    jpCourts: [
      {
        name: 'Justice of the Peace Precinct 1, Place 1',
        address: '1115 Congress St, Houston, TX 77002',
        phone: '(713) 368-4300',
        hours: DEFAULT_HOURS,
        efileUrl: EFILE_URL,
      },
      {
        name: 'Justice of the Peace Precinct 2, Place 1',
        address: '7310 Gulf Fwy, Houston, TX 77017',
        phone: '(713) 643-6222',
        hours: DEFAULT_HOURS,
        efileUrl: EFILE_URL,
      },
    ],
    countyCourt: {
      name: 'Harris County Civil Court at Law',
      address: '201 Caroline St, Houston, TX 77002',
      phone: '(713) 274-8600',
      hours: DEFAULT_HOURS,
      clerkPhone: '(713) 274-8680',
      efileUrl: EFILE_URL,
    },
    districtCourt: {
      name: 'Harris County District Clerk',
      address: '201 Caroline St, Houston, TX 77002',
      phone: '(713) 755-6405',
      hours: DEFAULT_HOURS,
      clerkPhone: '(713) 755-6405',
      efileUrl: EFILE_URL,
    },
    feeWaiverForm: FEE_WAIVER,
    filingFees: { jp: 46, county: 298, district: 360 },
  },

  // 2. Dallas County
  {
    county: 'Dallas',
    jpCourts: [
      {
        name: 'Justice of the Peace Precinct 1',
        address: '600 Commerce St, Dallas, TX 75202',
        phone: '(214) 653-6201',
        hours: DEFAULT_HOURS,
        efileUrl: EFILE_URL,
      },
      {
        name: 'Justice of the Peace Precinct 2',
        address: '408 Grauwyler Rd, Irving, TX 75061',
        phone: '(214) 688-4500',
        hours: DEFAULT_HOURS,
        efileUrl: EFILE_URL,
      },
    ],
    countyCourt: {
      name: 'Dallas County Civil Courts',
      address: '600 Commerce St, Dallas, TX 75202',
      phone: '(214) 653-7301',
      hours: DEFAULT_HOURS,
      clerkPhone: '(214) 653-7301',
      efileUrl: EFILE_URL,
    },
    districtCourt: {
      name: 'Dallas County District Clerk',
      address: '600 Commerce St, Dallas, TX 75202',
      phone: '(214) 653-7301',
      hours: DEFAULT_HOURS,
      clerkPhone: '(214) 653-7301',
      efileUrl: EFILE_URL,
    },
    feeWaiverForm: FEE_WAIVER,
    filingFees: { jp: 46, county: 296, district: 361 },
  },

  // 3. Tarrant County (Fort Worth)
  {
    county: 'Tarrant',
    jpCourts: [
      {
        name: 'Justice of the Peace Precinct 1',
        address: '100 W Weatherford St, Fort Worth, TX 76196',
        phone: '(817) 884-1195',
        hours: DEFAULT_HOURS,
        efileUrl: EFILE_URL,
      },
      {
        name: 'Justice of the Peace Precinct 2',
        address: '861 NE Green Oaks Blvd, Arlington, TX 76006',
        phone: '(817) 548-3932',
        hours: DEFAULT_HOURS,
        efileUrl: EFILE_URL,
      },
    ],
    countyCourt: {
      name: 'Tarrant County Civil Courts',
      address: '100 W Weatherford St, Fort Worth, TX 76196',
      phone: '(817) 884-1240',
      hours: DEFAULT_HOURS,
      clerkPhone: '(817) 884-1240',
      efileUrl: EFILE_URL,
    },
    districtCourt: {
      name: 'Tarrant County District Clerk',
      address: '100 W Weatherford St, Fort Worth, TX 76196',
      phone: '(817) 884-1265',
      hours: DEFAULT_HOURS,
      clerkPhone: '(817) 884-1265',
      efileUrl: EFILE_URL,
    },
    feeWaiverForm: FEE_WAIVER,
    filingFees: { jp: 46, county: 290, district: 350 },
  },

  // 4. Bexar County (San Antonio)
  {
    county: 'Bexar',
    jpCourts: [
      {
        name: 'Justice of the Peace Precinct 1',
        address: '100 Dolorosa St, San Antonio, TX 78205',
        phone: '(210) 335-2681',
        hours: DEFAULT_HOURS,
        efileUrl: EFILE_URL,
      },
      {
        name: 'Justice of the Peace Precinct 2',
        address: '7968 Pat Booker Rd, Live Oak, TX 78233',
        phone: '(210) 335-2656',
        hours: DEFAULT_HOURS,
        efileUrl: EFILE_URL,
      },
    ],
    countyCourt: {
      name: 'Bexar County Civil Courts',
      address: '100 Dolorosa St, San Antonio, TX 78205',
      phone: '(210) 335-2011',
      hours: DEFAULT_HOURS,
      clerkPhone: '(210) 335-2216',
      efileUrl: EFILE_URL,
    },
    districtCourt: {
      name: 'Bexar County District Clerk',
      address: '100 Dolorosa St, San Antonio, TX 78205',
      phone: '(210) 335-2113',
      hours: DEFAULT_HOURS,
      clerkPhone: '(210) 335-2113',
      efileUrl: EFILE_URL,
    },
    feeWaiverForm: FEE_WAIVER,
    filingFees: { jp: 44, county: 286, district: 350 },
  },

  // 5. Travis County (Austin)
  {
    county: 'Travis',
    jpCourts: [
      {
        name: 'Justice of the Peace Precinct 1',
        address: '509 W 11th St, Austin, TX 78701',
        phone: '(512) 854-9896',
        hours: DEFAULT_HOURS,
        efileUrl: EFILE_URL,
      },
      {
        name: 'Justice of the Peace Precinct 2',
        address: '4011 McKinney Falls Pkwy, Austin, TX 78744',
        phone: '(512) 854-7660',
        hours: DEFAULT_HOURS,
        efileUrl: EFILE_URL,
      },
    ],
    countyCourt: {
      name: 'Travis County Civil Courts',
      address: '1000 Guadalupe St, Austin, TX 78701',
      phone: '(512) 854-9457',
      hours: DEFAULT_HOURS,
      clerkPhone: '(512) 854-9457',
      efileUrl: EFILE_URL,
    },
    districtCourt: {
      name: 'Travis County District Clerk',
      address: '1000 Guadalupe St, Austin, TX 78701',
      phone: '(512) 854-9457',
      hours: DEFAULT_HOURS,
      clerkPhone: '(512) 854-9457',
      efileUrl: EFILE_URL,
    },
    feeWaiverForm: FEE_WAIVER,
    filingFees: { jp: 46, county: 298, district: 362 },
  },

  // 6. Collin County (McKinney/Plano)
  {
    county: 'Collin',
    jpCourts: [
      {
        name: 'Justice of the Peace Precinct 1',
        address: '2100 Bloomdale Rd, McKinney, TX 75071',
        phone: '(972) 548-4210',
        hours: DEFAULT_HOURS,
        efileUrl: EFILE_URL,
      },
    ],
    countyCourt: {
      name: 'Collin County Court at Law',
      address: '2100 Bloomdale Rd, McKinney, TX 75071',
      phone: '(972) 548-4100',
      hours: DEFAULT_HOURS,
      clerkPhone: '(972) 548-4100',
      efileUrl: EFILE_URL,
    },
    districtCourt: {
      name: 'Collin County District Clerk',
      address: '2100 Bloomdale Rd, McKinney, TX 75071',
      phone: '(972) 548-4320',
      hours: DEFAULT_HOURS,
      clerkPhone: '(972) 548-4320',
      efileUrl: EFILE_URL,
    },
    feeWaiverForm: FEE_WAIVER,
    filingFees: { jp: 46, county: 292, district: 352 },
  },

  // 7. Denton County
  {
    county: 'Denton',
    jpCourts: [
      {
        name: 'Justice of the Peace Precinct 1',
        address: '127 N Woodrow Ln, Denton, TX 76205',
        phone: '(940) 349-2110',
        hours: DEFAULT_HOURS,
        efileUrl: EFILE_URL,
      },
    ],
    countyCourt: {
      name: 'Denton County Courts at Law',
      address: '1450 E McKinney St, Denton, TX 76209',
      phone: '(940) 349-2012',
      hours: DEFAULT_HOURS,
      clerkPhone: '(940) 349-2012',
      efileUrl: EFILE_URL,
    },
    districtCourt: {
      name: 'Denton County District Clerk',
      address: '1450 E McKinney St, Denton, TX 76209',
      phone: '(940) 349-2200',
      hours: DEFAULT_HOURS,
      clerkPhone: '(940) 349-2200',
      efileUrl: EFILE_URL,
    },
    feeWaiverForm: FEE_WAIVER,
    filingFees: { jp: 46, county: 290, district: 350 },
  },

  // 8. Hidalgo County (McAllen/Edinburg)
  {
    county: 'Hidalgo',
    jpCourts: [
      {
        name: 'Justice of the Peace Precinct 1',
        address: '100 E Cano St, Edinburg, TX 78539',
        phone: '(956) 318-2200',
        hours: DEFAULT_HOURS,
        efileUrl: EFILE_URL,
      },
    ],
    countyCourt: {
      name: 'Hidalgo County Court at Law',
      address: '100 N Closner Blvd, Edinburg, TX 78539',
      phone: '(956) 318-2100',
      hours: DEFAULT_HOURS,
      clerkPhone: '(956) 318-2100',
      efileUrl: EFILE_URL,
    },
    districtCourt: {
      name: 'Hidalgo County District Clerk',
      address: '100 N Closner Blvd, Edinburg, TX 78539',
      phone: '(956) 318-2200',
      hours: DEFAULT_HOURS,
      clerkPhone: '(956) 318-2200',
      efileUrl: EFILE_URL,
    },
    feeWaiverForm: FEE_WAIVER,
    filingFees: { jp: 40, county: 280, district: 340 },
  },

  // 9. El Paso County
  {
    county: 'El Paso',
    jpCourts: [
      {
        name: 'Justice of the Peace Precinct 1',
        address: '500 E San Antonio Ave, El Paso, TX 79901',
        phone: '(915) 546-2021',
        hours: DEFAULT_HOURS,
        efileUrl: EFILE_URL,
      },
    ],
    countyCourt: {
      name: 'El Paso County Court at Law',
      address: '500 E San Antonio Ave, El Paso, TX 79901',
      phone: '(915) 546-2071',
      hours: DEFAULT_HOURS,
      clerkPhone: '(915) 546-2071',
      efileUrl: EFILE_URL,
    },
    districtCourt: {
      name: 'El Paso County District Clerk',
      address: '500 E San Antonio Ave, El Paso, TX 79901',
      phone: '(915) 546-2021',
      hours: DEFAULT_HOURS,
      clerkPhone: '(915) 546-2021',
      efileUrl: EFILE_URL,
    },
    feeWaiverForm: FEE_WAIVER,
    filingFees: { jp: 42, county: 282, district: 342 },
  },

  // 10. Fort Bend County (Richmond/Sugar Land)
  {
    county: 'Fort Bend',
    jpCourts: [
      {
        name: 'Justice of the Peace Precinct 1',
        address: '301 Jackson St, Richmond, TX 77469',
        phone: '(281) 341-8650',
        hours: DEFAULT_HOURS,
        efileUrl: EFILE_URL,
      },
    ],
    countyCourt: {
      name: 'Fort Bend County Court at Law',
      address: '301 Jackson St, Richmond, TX 77469',
      phone: '(281) 341-8600',
      hours: DEFAULT_HOURS,
      clerkPhone: '(281) 341-8600',
      efileUrl: EFILE_URL,
    },
    districtCourt: {
      name: 'Fort Bend County District Clerk',
      address: '301 Jackson St, Richmond, TX 77469',
      phone: '(281) 341-8650',
      hours: DEFAULT_HOURS,
      clerkPhone: '(281) 341-8650',
      efileUrl: EFILE_URL,
    },
    feeWaiverForm: FEE_WAIVER,
    filingFees: { jp: 46, county: 290, district: 350 },
  },

  // 11. Williamson County (Georgetown/Round Rock)
  {
    county: 'Williamson',
    jpCourts: [
      {
        name: 'Justice of the Peace Precinct 1',
        address: '405 Martin Luther King St, Georgetown, TX 78626',
        phone: '(512) 943-1201',
        hours: DEFAULT_HOURS,
        efileUrl: EFILE_URL,
      },
    ],
    countyCourt: {
      name: 'Williamson County Court at Law',
      address: '405 Martin Luther King St, Georgetown, TX 78626',
      phone: '(512) 943-1515',
      hours: DEFAULT_HOURS,
      clerkPhone: '(512) 943-1515',
      efileUrl: EFILE_URL,
    },
    districtCourt: {
      name: 'Williamson County District Clerk',
      address: '405 Martin Luther King St, Georgetown, TX 78626',
      phone: '(512) 943-1212',
      hours: DEFAULT_HOURS,
      clerkPhone: '(512) 943-1212',
      efileUrl: EFILE_URL,
    },
    feeWaiverForm: FEE_WAIVER,
    filingFees: { jp: 46, county: 292, district: 352 },
  },

  // 12. Montgomery County (Conroe)
  {
    county: 'Montgomery',
    jpCourts: [
      {
        name: 'Justice of the Peace Precinct 1',
        address: '301 N Thompson St, Conroe, TX 77301',
        phone: '(936) 539-7866',
        hours: DEFAULT_HOURS,
        efileUrl: EFILE_URL,
      },
    ],
    countyCourt: {
      name: 'Montgomery County Court at Law',
      address: '301 N Thompson St, Conroe, TX 77301',
      phone: '(936) 539-7855',
      hours: DEFAULT_HOURS,
      clerkPhone: '(936) 539-7855',
      efileUrl: EFILE_URL,
    },
    districtCourt: {
      name: 'Montgomery County District Clerk',
      address: '301 N Thompson St, Conroe, TX 77301',
      phone: '(936) 539-7885',
      hours: DEFAULT_HOURS,
      clerkPhone: '(936) 539-7885',
      efileUrl: EFILE_URL,
    },
    feeWaiverForm: FEE_WAIVER,
    filingFees: { jp: 46, county: 290, district: 350 },
  },

  // 13. Brazoria County (Angleton)
  {
    county: 'Brazoria',
    jpCourts: [
      {
        name: 'Justice of the Peace Precinct 1',
        address: '111 E Locust St, Angleton, TX 77515',
        phone: '(979) 864-1842',
        hours: DEFAULT_HOURS,
        efileUrl: EFILE_URL,
      },
    ],
    countyCourt: {
      name: 'Brazoria County Court at Law',
      address: '111 E Locust St, Angleton, TX 77515',
      phone: '(979) 864-1355',
      hours: DEFAULT_HOURS,
      clerkPhone: '(979) 864-1355',
      efileUrl: EFILE_URL,
    },
    districtCourt: {
      name: 'Brazoria County District Clerk',
      address: '111 E Locust St, Angleton, TX 77515',
      phone: '(979) 864-1316',
      hours: DEFAULT_HOURS,
      clerkPhone: '(979) 864-1316',
      efileUrl: EFILE_URL,
    },
    feeWaiverForm: FEE_WAIVER,
    filingFees: { jp: 46, county: 288, district: 348 },
  },

  // 14. Nueces County (Corpus Christi)
  {
    county: 'Nueces',
    jpCourts: [
      {
        name: 'Justice of the Peace Precinct 1',
        address: '901 Leopard St, Corpus Christi, TX 78401',
        phone: '(361) 888-0460',
        hours: DEFAULT_HOURS,
        efileUrl: EFILE_URL,
      },
    ],
    countyCourt: {
      name: 'Nueces County Court at Law',
      address: '901 Leopard St, Corpus Christi, TX 78401',
      phone: '(361) 888-0580',
      hours: DEFAULT_HOURS,
      clerkPhone: '(361) 888-0580',
      efileUrl: EFILE_URL,
    },
    districtCourt: {
      name: 'Nueces County District Clerk',
      address: '901 Leopard St, Corpus Christi, TX 78401',
      phone: '(361) 888-0450',
      hours: DEFAULT_HOURS,
      clerkPhone: '(361) 888-0450',
      efileUrl: EFILE_URL,
    },
    feeWaiverForm: FEE_WAIVER,
    filingFees: { jp: 42, county: 284, district: 344 },
  },

  // 15. Lubbock County
  {
    county: 'Lubbock',
    jpCourts: [
      {
        name: 'Justice of the Peace Precinct 1',
        address: '904 Broadway St, Lubbock, TX 79401',
        phone: '(806) 775-1040',
        hours: DEFAULT_HOURS,
        efileUrl: EFILE_URL,
      },
    ],
    countyCourt: {
      name: 'Lubbock County Court at Law',
      address: '904 Broadway St, Lubbock, TX 79401',
      phone: '(806) 775-1023',
      hours: DEFAULT_HOURS,
      clerkPhone: '(806) 775-1023',
      efileUrl: EFILE_URL,
    },
    districtCourt: {
      name: 'Lubbock County District Clerk',
      address: '904 Broadway St, Lubbock, TX 79401',
      phone: '(806) 775-1045',
      hours: DEFAULT_HOURS,
      clerkPhone: '(806) 775-1045',
      efileUrl: EFILE_URL,
    },
    feeWaiverForm: FEE_WAIVER,
    filingFees: { jp: 40, county: 280, district: 340 },
  },

  // 16. Cameron County (Brownsville)
  {
    county: 'Cameron',
    jpCourts: [
      {
        name: 'Justice of the Peace Precinct 1',
        address: '974 E Harrison St, Brownsville, TX 78520',
        phone: '(956) 544-0838',
        hours: DEFAULT_HOURS,
        efileUrl: EFILE_URL,
      },
    ],
    countyCourt: {
      name: 'Cameron County Court at Law',
      address: '974 E Harrison St, Brownsville, TX 78520',
      phone: '(956) 544-0815',
      hours: DEFAULT_HOURS,
      clerkPhone: '(956) 544-0815',
      efileUrl: EFILE_URL,
    },
    districtCourt: {
      name: 'Cameron County District Clerk',
      address: '974 E Harrison St, Brownsville, TX 78520',
      phone: '(956) 544-0838',
      hours: DEFAULT_HOURS,
      clerkPhone: '(956) 544-0838',
      efileUrl: EFILE_URL,
    },
    feeWaiverForm: FEE_WAIVER,
    filingFees: { jp: 40, county: 278, district: 338 },
  },

  // 17. Bell County (Belton/Killeen/Temple)
  {
    county: 'Bell',
    jpCourts: [
      {
        name: 'Justice of the Peace Precinct 1',
        address: '550 E 2nd Ave, Belton, TX 76513',
        phone: '(254) 933-5262',
        hours: DEFAULT_HOURS,
        efileUrl: EFILE_URL,
      },
    ],
    countyCourt: {
      name: 'Bell County Court at Law',
      address: '550 E 2nd Ave, Belton, TX 76513',
      phone: '(254) 933-5160',
      hours: DEFAULT_HOURS,
      clerkPhone: '(254) 933-5160',
      efileUrl: EFILE_URL,
    },
    districtCourt: {
      name: 'Bell County District Clerk',
      address: '550 E 2nd Ave, Belton, TX 76513',
      phone: '(254) 933-5197',
      hours: DEFAULT_HOURS,
      clerkPhone: '(254) 933-5197',
      efileUrl: EFILE_URL,
    },
    feeWaiverForm: FEE_WAIVER,
    filingFees: { jp: 44, county: 286, district: 346 },
  },

  // 18. Webb County (Laredo)
  {
    county: 'Webb',
    jpCourts: [
      {
        name: 'Justice of the Peace Precinct 1',
        address: '1110 Washington St, Laredo, TX 78040',
        phone: '(956) 523-4260',
        hours: DEFAULT_HOURS,
        efileUrl: EFILE_URL,
      },
    ],
    countyCourt: {
      name: 'Webb County Court at Law',
      address: '1110 Washington St, Laredo, TX 78040',
      phone: '(956) 523-4268',
      hours: DEFAULT_HOURS,
      clerkPhone: '(956) 523-4268',
      efileUrl: EFILE_URL,
    },
    districtCourt: {
      name: 'Webb County District Clerk',
      address: '1110 Washington St, Laredo, TX 78040',
      phone: '(956) 523-4268',
      hours: DEFAULT_HOURS,
      clerkPhone: '(956) 523-4268',
      efileUrl: EFILE_URL,
    },
    feeWaiverForm: FEE_WAIVER,
    filingFees: { jp: 40, county: 278, district: 338 },
  },

  // 19. Galveston County
  {
    county: 'Galveston',
    jpCourts: [
      {
        name: 'Justice of the Peace Precinct 1',
        address: '600 59th St, Galveston, TX 77551',
        phone: '(409) 766-2241',
        hours: DEFAULT_HOURS,
        efileUrl: EFILE_URL,
      },
    ],
    countyCourt: {
      name: 'Galveston County Court at Law',
      address: '722 Moody Ave, Galveston, TX 77550',
      phone: '(409) 766-2200',
      hours: DEFAULT_HOURS,
      clerkPhone: '(409) 766-2200',
      efileUrl: EFILE_URL,
    },
    districtCourt: {
      name: 'Galveston County District Clerk',
      address: '722 Moody Ave, Galveston, TX 77550',
      phone: '(409) 766-2230',
      hours: DEFAULT_HOURS,
      clerkPhone: '(409) 766-2230',
      efileUrl: EFILE_URL,
    },
    feeWaiverForm: FEE_WAIVER,
    filingFees: { jp: 46, county: 290, district: 350 },
  },

  // 20. McLennan County (Waco)
  {
    county: 'McLennan',
    jpCourts: [
      {
        name: 'Justice of the Peace Precinct 1',
        address: '501 Washington Ave, Waco, TX 76701',
        phone: '(254) 757-5075',
        hours: DEFAULT_HOURS,
        efileUrl: EFILE_URL,
      },
    ],
    countyCourt: {
      name: 'McLennan County Court at Law',
      address: '501 Washington Ave, Waco, TX 76701',
      phone: '(254) 757-5049',
      hours: DEFAULT_HOURS,
      clerkPhone: '(254) 757-5049',
      efileUrl: EFILE_URL,
    },
    districtCourt: {
      name: 'McLennan County District Clerk',
      address: '501 Washington Ave, Waco, TX 76701',
      phone: '(254) 757-5054',
      hours: DEFAULT_HOURS,
      clerkPhone: '(254) 757-5054',
      efileUrl: EFILE_URL,
    },
    feeWaiverForm: FEE_WAIVER,
    filingFees: { jp: 44, county: 284, district: 344 },
  },
]

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

/** Normalize county name for case-insensitive matching */
function normalize(county: string): string {
  return county.trim().toLowerCase().replace(/\s+county$/i, '')
}

/**
 * Look up court information by county name.
 * Accepts "Harris", "harris", "Harris County", etc.
 */
export function getCourtInfo(county: string): TexasCourtInfo | null {
  const key = normalize(county)
  return TEXAS_COURTS.find((c) => normalize(c.county) === key) ?? null
}

/**
 * Alias for getCourtInfo — provided for convenience.
 */
export function getCourtByCounty(county: string): TexasCourtInfo | null {
  return getCourtInfo(county)
}

/**
 * Return every county in the directory (sorted alphabetically).
 */
export function listCounties(): string[] {
  return TEXAS_COURTS.map((c) => c.county).sort()
}

/**
 * Return all court entries.
 */
export function getAllCourts(): TexasCourtInfo[] {
  return [...TEXAS_COURTS]
}
