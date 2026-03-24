import type { Court, CourtTypeCode, CourtLevel } from './court-types'

export function getCourtsByState(state: string): Court[] {
  switch (state) {
    case 'TX': return getTexasCourts()
    case 'CA': return getCaliforniaCourts()
    case 'NY': return getNewYorkCourts()
    case 'FL': return getFloridaCourts()
    case 'PA': return getPennsylvaniaCourts()
    default: return []
  }
}

export function getCourtsByCounty(state: string, county: string): Court[] {
  const courts = getCourtsByState(state)
  const normalizedCounty = county.toLowerCase()
  return courts.filter(c => 
    c.county?.toLowerCase() === normalizedCounty || 
    c.county?.toLowerCase().includes(normalizedCounty)
  )
}

export function searchCourts(state: string, query: string): Court[] {
  const courts = getCourtsByState(state)
  const q = query.toLowerCase()
  return courts.filter(c => 
    c.name.toLowerCase().includes(q) ||
    c.county?.toLowerCase().includes(q) ||
    c.city.toLowerCase().includes(q) ||
    c.address.toLowerCase().includes(q)
  )
}

export function getCourtsByType(state: string, types: CourtTypeCode[]): Court[] {
  if (types.length === 0) return getCourtsByState(state)
  const courts = getCourtsByState(state)
  return courts.filter(c => types.includes(c.type))
}

// -- Texas Courts ---------------------------------------------------------------

function getTexasCourts(): Court[] {
  return [
    // Harris County
    {
      id: 'tx-harris-jp-1',
      type: 'jp',
      name: 'Justice of the Peace Precinct 1',
      level: 'small_claims',
      county: 'Harris',
      address: '1115 Congress St',
      city: 'Houston',
      state: 'TX',
      zip: '77002',
      phone: '(713) 368-4300',
      website: 'https://www.jpctx.harris.com',
      divisions: ['Small Claims', 'Evictions'],
      filingFee: { filing: 46, service: 0, hearing: 0 },
      jurisdiction: ['Claims up to $20,000', 'Evictions', 'Small claims'],
      notes: 'Civil cases up to $20,000. No attorney representation required in small claims.'
    },
    {
      id: 'tx-harris-jp-2',
      type: 'jp',
      name: 'Justice of the Peace Precinct 2',
      level: 'small_claims',
      county: 'Harris',
      address: '7310 Gulf Fwy',
      city: 'Houston',
      state: 'TX',
      zip: '77017',
      phone: '(713) 643-6222',
      website: 'https://www.jpctx.harris.com',
      filingFee: { filing: 46, service: 0, hearing: 0 },
      jurisdiction: ['Claims up to $20,000', 'Evictions'],
    },
    {
      id: 'tx-harris-county',
      type: 'county',
      name: 'Harris County Civil Court',
      level: 'general',
      county: 'Harris',
      address: '201 Caroline St, 7th Floor',
      city: 'Houston',
      state: 'TX',
      zip: '77002',
      phone: '(713) 274-8600',
      website: 'https://www.cjo.co.harris.tx.us',
      divisions: ['Civil', 'Probate', 'Family'],
      filingFee: { filing: 268, service: 50, hearing: 25 },
      jurisdiction: ['Claims $20,001 to $200,000', 'Civil matters', 'Probate', 'Family law'],
      notes: 'County-level civil matters. Filing fee varies by case type.'
    },
    {
      id: 'tx-harris-district',
      type: 'district',
      name: 'Harris County District Courts',
      level: 'general',
      county: 'Harris',
      address: '201 Caroline St',
      city: 'Houston',
      state: 'TX',
      zip: '77002',
      phone: '(713) 274-8600',
      website: 'https://www.justex.net',
      divisions: ['Civil', 'Family', 'Criminal', 'Probate'],
      filingFee: { filing: 300, service: 75, hearing: 50 },
      jurisdiction: ['Claims over $200,000', 'Family law', 'Criminal matters', 'Probate', 'Title to real property'],
      notes: 'General jurisdiction court. Handles most major civil litigation.'
    },
    // Travis County
    {
      id: 'tx-travis-jp-1',
      type: 'jp',
      name: 'Justice of the Peace Precinct 1',
      level: 'small_claims',
      county: 'Travis',
      address: '5508 Airport Blvd',
      city: 'Austin',
      state: 'TX',
      zip: '78751',
      phone: '(512) 854-9473',
      website: 'https://www.traviscountytx.gov/justice-of-the-peace',
      filingFee: { filing: 46, service: 0, hearing: 0 },
      jurisdiction: ['Claims up to $20,000', 'Evictions'],
    },
    {
      id: 'tx-travis-county',
      type: 'county',
      name: 'Travis County Court',
      level: 'general',
      county: 'Travis',
      address: '1000 Guadalupe St, 4th Floor',
      city: 'Austin',
      state: 'TX',
      zip: '78701',
      phone: '(512) 854-9511',
      website: 'https://www.traviscountytx.gov',
      filingFee: { filing: 268, service: 50, hearing: 25 },
      jurisdiction: ['Claims $20,001 to $200,000', 'Civil appeals from JP'],
    },
    {
      id: 'tx-travis-district',
      type: 'district',
      name: 'Travis County District Courts',
      level: 'general',
      county: 'Travis',
      address: '1700 Congress Ave',
      city: 'Austin',
      state: 'TX',
      zip: '78701',
      phone: '(512) 854-9459',
      website: 'https://www.traviscountytx.gov/district-clerk',
      filingFee: { filing: 300, service: 75, hearing: 50 },
      jurisdiction: ['Claims over $200,000', 'Family law', 'Criminal matters', 'Probate'],
    },
    // Dallas County
    {
      id: 'tx-dallas-jp-1',
      type: 'jp',
      name: 'Justice of the Peace Precinct 1-1',
      level: 'small_claims',
      county: 'Dallas',
      address: '600 Commerce St, Suite 112',
      city: 'Dallas',
      state: 'TX',
      zip: '75202',
      phone: '(214) 653-6080',
      website: 'https://www.dallascounty.org/departments/jpc/',
      filingFee: { filing: 46, service: 0, hearing: 0 },
      jurisdiction: ['Claims up to $20,000', 'Evictions'],
    },
    {
      id: 'tx-dallas-county',
      type: 'county',
      name: 'Dallas County Civil Court',
      level: 'general',
      county: 'Dallas',
      address: '600 Commerce St, 5th Floor',
      city: 'Dallas',
      state: 'TX',
      zip: '75202',
      phone: '(214) 653-7268',
      website: 'https://www.dallascounty.org',
      filingFee: { filing: 268, service: 50, hearing: 25 },
      jurisdiction: ['Claims $20,001 to $200,000'],
    },
    {
      id: 'tx-dallas-district',
      type: 'district',
      name: 'Dallas County District Courts',
      level: 'general',
      county: 'Dallas',
      address: '600 Commerce St',
      city: 'Dallas',
      state: 'TX',
      zip: '75202',
      phone: '(214) 653-6000',
      website: 'https://www.dallascounty.org',
      filingFee: { filing: 300, service: 75, hearing: 50 },
      jurisdiction: ['Claims over $200,000', 'Family law', 'Criminal', 'Probate'],
    },
    // Tarrant County
    {
      id: 'tx-tarrant-jp-1',
      type: 'jp',
      name: 'Justice of the Peace Precinct 1',
      level: 'small_claims',
      county: 'Tarrant',
      address: '100 E Weatherford St',
      city: 'Fort Worth',
      state: 'TX',
      zip: '76196',
      phone: '(817) 884-1395',
      website: 'https://www.tarrantcounty.com/en/courts/jp.html',
      filingFee: { filing: 46, service: 0, hearing: 0 },
      jurisdiction: ['Claims up to $20,000', 'Evictions'],
    },
    {
      id: 'tx-tarrant-county',
      type: 'county',
      name: 'Tarrant County Civil Court',
      level: 'general',
      county: 'Tarrant',
      address: '100 E Weatherford St, 3rd Floor',
      city: 'Fort Worth',
      state: 'TX',
      zip: '76196',
      phone: '(817) 884-1550',
      website: 'https://www.tarrantcounty.com',
      filingFee: { filing: 268, service: 50, hearing: 25 },
      jurisdiction: ['Claims $20,001 to $200,000'],
    },
    {
      id: 'tx-tarrant-district',
      type: 'district',
      name: 'Tarrant County District Courts',
      level: 'general',
      county: 'Tarrant',
      address: '401 W Belknap St',
      city: 'Fort Worth',
      state: 'TX',
      zip: '76196',
      phone: '(817) 884-1700',
      website: 'https://www.tarrantcounty.com',
      filingFee: { filing: 300, service: 75, hearing: 50 },
      jurisdiction: ['Claims over $200,000', 'Family law', 'Criminal', 'Probate'],
    },
    // Federal - Texas Districts
    {
      id: 'tx-sd-houston',
      type: 'federal',
      name: 'U.S. District Court, Southern District of Texas - Houston Division',
      level: 'federal',
      county: 'Harris',
      address: '515 Rusk St',
      city: 'Houston',
      state: 'TX',
      zip: '77002',
      phone: '(713) 366-3400',
      website: 'https://www.txs.uscourts.gov',
      filingFee: { filing: 350, service: 60, hearing: 0 },
      jurisdiction: [
        'Federal question cases',
        'Diversity cases (over $75,000, parties from different states)',
        'Bankruptcy',
        'Civil rights claims',
      ],
      notes: 'Requires federal jurisdiction. Filing fee is $350. Review jurisdictional requirements carefully.'
    },
    {
      id: 'tx-nd-tyler',
      type: 'federal',
      name: 'U.S. District Court, Eastern District of Texas - Tyler Division',
      level: 'federal',
      county: 'Smith',
      address: '110 N College Ave',
      city: 'Tyler',
      state: 'TX',
      zip: '75702',
      phone: '(903) 590-1000',
      website: 'https://www.txed.uscourts.gov',
      filingFee: { filing: 350, service: 60, hearing: 0 },
      jurisdiction: ['Federal question cases', 'Diversity cases (over $75,000)', 'Patent cases'],
    },
    {
      id: 'tx-nd-dallas',
      type: 'federal',
      name: 'U.S. District Court, Northern District of Texas - Dallas Division',
      level: 'federal',
      county: 'Dallas',
      address: '1100 Commerce St, 14th Floor',
      city: 'Dallas',
      state: 'TX',
      zip: '75242',
      phone: '(214) 753-2100',
      website: 'https://www.txnd.uscourts.gov',
      filingFee: { filing: 350, service: 60, hearing: 0 },
      jurisdiction: ['Federal question cases', 'Diversity cases (over $75,000)'],
    },
  ]
}

// -- California Courts ---------------------------------------------------------

function getCaliforniaCourts(): Court[] {
  return [
    // Los Angeles County
    {
      id: 'ca-la-small',
      type: 'small_claims',
      name: 'Los Angeles Superior Court - Small Claims',
      level: 'small_claims',
      county: 'Los Angeles',
      address: '312 N Spring St',
      city: 'Los Angeles',
      state: 'CA',
      zip: '90012',
      phone: '(213) 830-0800',
      website: 'https://www.lacourt.org',
      filingFee: { filing: 30, service: 0, hearing: 0 },
      jurisdiction: ['Claims up to $12,500 (individuals)', 'Claims up to $6,250 (businesses)', 'Evictions'],
      notes: 'No attorney at hearing for claims under $1,500.'
    },
    {
      id: 'ca-la-limited',
      type: 'limited_civil',
      name: 'Los Angeles Superior Court - Limited Civil',
      level: 'limited',
      county: 'Los Angeles',
      address: '312 N Spring St',
      city: 'Los Angeles',
      state: 'CA',
      zip: '90012',
      phone: '(213) 830-0800',
      website: 'https://www.lacourt.org',
      filingFee: { filing: 435, service: 40, hearing: 0 },
      jurisdiction: ['Claims $12,501 to $35,000', 'Evictions over $12,500'],
    },
    {
      id: 'ca-la-unlimited',
      type: 'unlimited_civil',
      name: 'Los Angeles Superior Court - Unlimited Civil',
      level: 'general',
      county: 'Los Angeles',
      address: '111 N Hill St',
      city: 'Los Angeles',
      state: 'CA',
      zip: '90012',
      phone: '(213) 830-0800',
      website: 'https://www.lacourt.org',
      filingFee: { filing: 435, service: 60, hearing: 0 },
      jurisdiction: ['Claims over $35,000', 'Family law', 'Probate', 'Unlawful detainer'],
    },
    // San Francisco County
    {
      id: 'ca-sf-small',
      type: 'small_claims',
      name: 'San Francisco Superior Court - Small Claims',
      level: 'small_claims',
      county: 'San Francisco',
      address: '400 McAllister St',
      city: 'San Francisco',
      state: 'CA',
      zip: '94102',
      phone: '(415) 551-4000',
      website: 'https://www.sfsuperiorcourt.org',
      filingFee: { filing: 30, service: 0, hearing: 0 },
      jurisdiction: ['Claims up to $12,500 (individuals)', 'Claims up to $6,250 (businesses)'],
    },
    {
      id: 'ca-sf-unlimited',
      type: 'unlimited_civil',
      name: 'San Francisco Superior Court - Unlimited Civil',
      level: 'general',
      county: 'San Francisco',
      address: '400 McAllister St',
      city: 'San Francisco',
      state: 'CA',
      zip: '94102',
      phone: '(415) 551-4000',
      website: 'https://www.sfsuperiorcourt.org',
      filingFee: { filing: 435, service: 60, hearing: 0 },
      jurisdiction: ['Claims over $35,000', 'Family law', 'Probate'],
    },
    // Federal - California Districts
    {
      id: 'ca-cd-la',
      type: 'federal',
      name: 'U.S. District Court, Central District of California',
      level: 'federal',
      county: 'Los Angeles',
      address: '350 W 1st St',
      city: 'Los Angeles',
      state: 'CA',
      zip: '90012',
      phone: '(213) 894-1565',
      website: 'https://www.cacd.uscourts.gov',
      filingFee: { filing: 350, service: 60, hearing: 0 },
      jurisdiction: ['Federal question cases', 'Diversity cases (over $75,000)', 'Civil rights'],
    },
    {
      id: 'ca-nd-sf',
      type: 'federal',
      name: 'U.S. District Court, Northern District of California',
      level: 'federal',
      county: 'San Francisco',
      address: '450 Golden Gate Ave',
      city: 'San Francisco',
      state: 'CA',
      zip: '94102',
      phone: '(415) 522-2000',
      website: 'https://www.cand.uscourts.gov',
      filingFee: { filing: 350, service: 60, hearing: 0 },
      jurisdiction: ['Federal question cases', 'Diversity cases (over $75,000)', 'IP cases'],
    },
  ]
}

// -- New York Courts -----------------------------------------------------------

function getNewYorkCourts(): Court[] {
  return [
    // New York County (Manhattan)
    {
      id: 'ny-ny-small',
      type: 'ny_small_claims',
      name: 'NYC Civil Court - Manhattan Small Claims',
      level: 'small_claims',
      county: 'New York',
      address: '111 Centre St, Room 103',
      city: 'New York',
      state: 'NY',
      zip: '10013',
      phone: '(212) 791-6000',
      website: 'https://www.nycourts.gov',
      filingFee: { filing: 26, service: 0, hearing: 0 },
      jurisdiction: ['Claims up to $10,000', 'Evictions', 'Small claims'],
      notes: 'NYC residents file in borough where they reside or where claim arose.'
    },
    {
      id: 'ny-ny-civil',
      type: 'ny_civil',
      name: 'NYC Civil Court - Manhattan',
      level: 'limited',
      county: 'New York',
      address: '111 Centre St',
      city: 'New York',
      state: 'NY',
      zip: '10013',
      phone: '(212) 791-6000',
      website: 'https://www.nycourts.gov',
      filingFee: { filing: 170, service: 40, hearing: 0 },
      jurisdiction: ['Claims $10,001 to $50,000', 'Evictions', 'Housing cases'],
    },
    {
      id: 'ny-ny-supreme',
      type: 'ny_supreme',
      name: 'Supreme Court, New York County',
      level: 'general',
      county: 'New York',
      address: '60 Centre St',
      city: 'New York',
      state: 'NY',
      zip: '10007',
      phone: '(212) 298-9000',
      website: 'https://www.nycourts.gov',
      filingFee: { filing: 210, service: 45, hearing: 0 },
      jurisdiction: ['Claims over $50,000', 'Divorce', 'Real property disputes', 'Civil rights'],
      notes: 'In NY, Supreme Court is the main trial court, not the highest court.'
    },
    // Kings County (Brooklyn)
    {
      id: 'ny-kings-small',
      type: 'ny_small_claims',
      name: 'NYC Civil Court - Brooklyn Small Claims',
      level: 'small_claims',
      county: 'Kings',
      address: '141 Livingston St',
      city: 'Brooklyn',
      state: 'NY',
      zip: '11201',
      phone: '(718) 643-6060',
      website: 'https://www.nycourts.gov',
      filingFee: { filing: 26, service: 0, hearing: 0 },
      jurisdiction: ['Claims up to $10,000'],
    },
    {
      id: 'ny-kings-civil',
      type: 'ny_civil',
      name: 'NYC Civil Court - Brooklyn',
      level: 'limited',
      county: 'Kings',
      address: '141 Livingston St',
      city: 'Brooklyn',
      state: 'NY',
      zip: '11201',
      phone: '(718) 643-6060',
      website: 'https://www.nycourts.gov',
      filingFee: { filing: 170, service: 40, hearing: 0 },
      jurisdiction: ['Claims $10,001 to $50,000', 'Evictions'],
    },
    {
      id: 'ny-kings-supreme',
      type: 'ny_supreme',
      name: 'Supreme Court, Kings County',
      level: 'general',
      county: 'Kings',
      address: '360 Adams St',
      city: 'Brooklyn',
      state: 'NY',
      zip: '11201',
      phone: '(718) 643-5060',
      website: 'https://www.nycourts.gov',
      filingFee: { filing: 210, service: 45, hearing: 0 },
      jurisdiction: ['Claims over $50,000', 'Divorce', 'Real property'],
    },
    // Federal - NY Districts
    {
      id: 'ny-sd-manhattan',
      type: 'federal',
      name: 'U.S. District Court, Southern District of New York',
      level: 'federal',
      county: 'New York',
      address: '40 Foley Square',
      city: 'New York',
      state: 'NY',
      zip: '10007',
      phone: '(212) 805-0130',
      website: 'https://www.nysd.uscourts.gov',
      filingFee: { filing: 350, service: 60, hearing: 0 },
      jurisdiction: ['Federal question cases', 'Diversity cases (over $75,000)', 'Civil rights'],
    },
    {
      id: 'ny-ed-brooklyn',
      type: 'federal',
      name: 'U.S. District Court, Eastern District of New York',
      level: 'federal',
      county: 'Kings',
      address: '225 Cadman Plaza E',
      city: 'Brooklyn',
      state: 'NY',
      zip: '11201',
      phone: '(718) 780-7700',
      website: 'https://www.nyed.uscourts.gov',
      filingFee: { filing: 350, service: 60, hearing: 0 },
      jurisdiction: ['Federal question cases', 'Diversity cases (over $75,000)', 'Immigration'],
    },
  ]
}

// -- Florida Courts -----------------------------------------------------------

function getFloridaCourts(): Court[] {
  return [
    // Miami-Dade County
    {
      id: 'fl-miami-small',
      type: 'fl_small_claims',
      name: 'Miami-Dade County Court - Small Claims',
      level: 'small_claims',
      county: 'Miami-Dade',
      address: '175 NW 1st Ave',
      city: 'Miami',
      state: 'FL',
      zip: '33128',
      phone: '(305) 349-6000',
      website: 'https://www.jud11.flcourts.org',
      filingFee: { filing: 50, service: 0, hearing: 0 },
      jurisdiction: ['Claims up to $8,000', 'Evictions'],
      notes: 'Filing fee increases for claims over $2,500.'
    },
    {
      id: 'fl-miami-county',
      type: 'fl_county',
      name: 'Miami-Dade County Court',
      level: 'limited',
      county: 'Miami-Dade',
      address: '175 NW 1st Ave',
      city: 'Miami',
      state: 'FL',
      zip: '33128',
      phone: '(305) 349-6000',
      website: 'https://www.jud11.flcourts.org',
      filingFee: { filing: 300, service: 40, hearing: 0 },
      jurisdiction: ['Claims $8,001 to $50,000', 'Misdemeanors', 'Traffic'],
    },
    {
      id: 'fl-miami-circuit',
      type: 'fl_circuit',
      name: 'Miami-Dade Circuit Court',
      level: 'general',
      county: 'Miami-Dade',
      address: '73 W Flagler St',
      city: 'Miami',
      state: 'FL',
      zip: '33130',
      phone: '(305) 349-6000',
      website: 'https://www.jud11.flcourts.org',
      filingFee: { filing: 400, service: 60, hearing: 0 },
      jurisdiction: ['Claims over $50,000', 'Family law', 'Probate', 'Civil rights'],
    },
    // Orange County (Orlando)
    {
      id: 'fl-orange-small',
      type: 'fl_small_claims',
      name: 'Orange County Court - Small Claims',
      level: 'small_claims',
      county: 'Orange',
      address: '425 N Orange Ave',
      city: 'Orlando',
      state: 'FL',
      zip: '32801',
      phone: '(407) 836-2000',
      website: 'https://www.myorangeclerk.com',
      filingFee: { filing: 50, service: 0, hearing: 0 },
      jurisdiction: ['Claims up to $8,000'],
    },
    {
      id: 'fl-orange-circuit',
      type: 'fl_circuit',
      name: 'Orange County Circuit Court',
      level: 'general',
      county: 'Orange',
      address: '425 N Orange Ave',
      city: 'Orlando',
      state: 'FL',
      zip: '32801',
      phone: '(407) 836-2000',
      website: 'https://www.myorangeclerk.com',
      filingFee: { filing: 400, service: 60, hearing: 0 },
      jurisdiction: ['Claims over $50,000', 'Family law', 'Probate'],
    },
    // Federal - Florida Districts
    {
      id: 'fl-sd-miami',
      type: 'federal',
      name: 'U.S. District Court, Southern District of Florida',
      level: 'federal',
      county: 'Miami-Dade',
      address: '400 N Miami Ave',
      city: 'Miami',
      state: 'FL',
      zip: '33128',
      phone: '(305) 523-5100',
      website: 'https://www.flsd.uscourts.gov',
      filingFee: { filing: 350, service: 60, hearing: 0 },
      jurisdiction: ['Federal question cases', 'Diversity cases (over $75,000)', 'Immigration'],
    },
    {
      id: 'fl-md-orlando',
      type: 'federal',
      name: 'U.S. District Court, Middle District of Florida',
      level: 'federal',
      county: 'Orange',
      address: '401 W Central Blvd',
      city: 'Orlando',
      state: 'FL',
      zip: '32801',
      phone: '(407) 835-4200',
      website: 'https://www.flmd.uscourts.gov',
      filingFee: { filing: 350, service: 60, hearing: 0 },
      jurisdiction: ['Federal question cases', 'Diversity cases (over $75,000)'],
    },
  ]
}

// -- Pennsylvania Courts -------------------------------------------------------

function getPennsylvaniaCourts(): Court[] {
  return [
    // Philadelphia County
    {
      id: 'pa-phila-magisterial',
      type: 'pa_magisterial',
      name: 'Philadelphia Municipal Court - Magisterial Division',
      level: 'small_claims',
      county: 'Philadelphia',
      address: '1503-05 Sansom St',
      city: 'Philadelphia',
      state: 'PA',
      zip: '19102',
      phone: '(215) 686-7000',
      website: 'https://www.courts.phila.gov',
      filingFee: { filing: 53, service: 0, hearing: 0 },
      jurisdiction: ['Claims up to $12,000', 'Evictions', 'Landlord-tenant'],
      notes: 'Philadelphia has its own system - most disputes start here.'
    },
    {
      id: 'pa-phila-common-pleas',
      type: 'pa_common_pleas',
      name: 'Philadelphia Court of Common Pleas',
      level: 'general',
      county: 'Philadelphia',
      address: '1301 Arch St',
      city: 'Philadelphia',
      state: 'PA',
      zip: '19107',
      phone: '(215) 686-1500',
      website: 'https://www.courts.phila.gov',
      filingFee: { filing: 290, service: 50, hearing: 0 },
      jurisdiction: ['Claims over $12,000', 'Family law', 'Divorce', 'Probate', 'Criminal'],
    },
    // Allegheny County (Pittsburgh)
    {
      id: 'pa-allegheny-magisterial',
      type: 'pa_magisterial',
      name: 'Allegheny County Magisterial District Courts',
      level: 'small_claims',
      county: 'Allegheny',
      address: '542 Forbes Ave',
      city: 'Pittsburgh',
      state: 'PA',
      zip: '15219',
      phone: '(412) 350-4470',
      website: 'https://www.alleghenycourts.us',
      filingFee: { filing: 53, service: 0, hearing: 0 },
      jurisdiction: ['Claims up to $12,000', 'Evictions'],
    },
    {
      id: 'pa-allegheny-common-pleas',
      type: 'pa_common_pleas',
      name: 'Allegheny County Court of Common Pleas',
      level: 'general',
      county: 'Allegheny',
      address: '414 Grant St',
      city: 'Pittsburgh',
      state: 'PA',
      zip: '15219',
      phone: '(412) 350-4200',
      website: 'https://www.alleghenycourts.us',
      filingFee: { filing: 290, service: 50, hearing: 0 },
      jurisdiction: ['Claims over $12,000', 'Family law', 'Divorce', 'Probate'],
    },
    // Montgomery County
    {
      id: 'pa-montgomery-magisterial',
      type: 'pa_magisterial',
      name: 'Montgomery County Magisterial District Courts',
      level: 'small_claims',
      county: 'Montgomery',
      address: '425 Swede St',
      city: 'Norristown',
      state: 'PA',
      zip: '19401',
      phone: '(610) 278-3340',
      website: 'https://www.montgomerycountypa.gov',
      filingFee: { filing: 53, service: 0, hearing: 0 },
      jurisdiction: ['Claims up to $12,000'],
    },
    {
      id: 'pa-montgomery-common-pleas',
      type: 'pa_common_pleas',
      name: 'Montgomery County Court of Common Pleas',
      level: 'general',
      county: 'Montgomery',
      address: '425 Swede St',
      city: 'Norristown',
      state: 'PA',
      zip: '19401',
      phone: '(610) 278-3000',
      website: 'https://www.montgomerycountypa.gov',
      filingFee: { filing: 290, service: 50, hearing: 0 },
      jurisdiction: ['Claims over $12,000', 'Family law', 'Civil litigation'],
    },
    // Federal - Pennsylvania Districts
    {
      id: 'pa-ed-philadelphia',
      type: 'federal',
      name: 'U.S. District Court, Eastern District of Pennsylvania',
      level: 'federal',
      county: 'Philadelphia',
      address: '601 Market St',
      city: 'Philadelphia',
      state: 'PA',
      zip: '19106',
      phone: '(215) 597-7703',
      website: 'https://www.paed.uscourts.gov',
      filingFee: { filing: 350, service: 60, hearing: 0 },
      jurisdiction: ['Federal question cases', 'Diversity cases (over $75,000)', 'Civil rights'],
    },
    {
      id: 'pa-wd-pittsburgh',
      type: 'federal',
      name: 'U.S. District Court, Western District of Pennsylvania',
      level: 'federal',
      county: 'Allegheny',
      address: '700 Grant St',
      city: 'Pittsburgh',
      state: 'PA',
      zip: '15219',
      phone: '(412) 208-7500',
      website: 'https://www.pawd.uscourts.gov',
      filingFee: { filing: 350, service: 60, hearing: 0 },
      jurisdiction: ['Federal question cases', 'Diversity cases (over $75,000)'],
    },
  ]
}

// -- Utility Functions ---------------------------------------------------------

export function getCourtLevelLabel(level: CourtLevel): string {
  const labels: Record<CourtLevel, string> = {
    small_claims: 'Small Claims',
    limited: 'Limited Civil',
    general: 'General Jurisdiction',
    appellate: 'Appellate',
    federal: 'Federal Court',
  }
  return labels[level]
}

export function getCourtTypeLabel(type: CourtTypeCode): string {
  const labels: Record<CourtTypeCode, string> = {
    jp: 'Justice of the Peace',
    county: 'County Court',
    district: 'District Court',
    appellate: 'Court of Appeals',
    federal: 'Federal Court',
    small_claims: 'Small Claims Court',
    limited_civil: 'Limited Civil Court',
    unlimited_civil: 'Unlimited Civil Court',
    ny_small_claims: 'NYC Small Claims Court',
    ny_civil: 'NYC Civil Court',
    ny_supreme: 'Supreme Court',
    fl_small_claims: 'Small Claims Court',
    fl_county: 'County Court',
    fl_circuit: 'Circuit Court',
    fl_appellate: 'District Court of Appeal',
    pa_magisterial: 'Magisterial District Court',
    pa_common_pleas: 'Court of Common Pleas',
    pa_court: 'Commonwealth Court',
  }
  return labels[type] || type
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  return phone
}
