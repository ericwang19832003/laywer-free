import type { JurisdictionRuleConfig } from '../schema'

export const nyLandlordTenant = {
  state: 'NY',
  disputeType: 'landlord_tenant',

  requiredSections: [
    {
      id: 'caption',
      label: 'Caption',
      description:
        'Case caption identifying the court, parties, and index/docket number. Must identify the correct Housing Court (NYC) or City/Justice Court (outside NYC) where the property is located.',
      legalElements: [
        'Court name (NYC Housing Court, City Court, or Justice Court)',
        'Petitioner name (landlord or management company)',
        'Respondent name (tenant\'s legal name)',
        'Index/docket number (assigned by clerk at filing)',
        'Property address including apartment number',
      ],
      minParagraphs: 1,
    },
    {
      id: 'facts',
      label: 'Facts',
      description:
        'Detailed factual background of the tenancy and the dispute. Must describe the lease terms, any violations or habitability issues, notices served, and the timeline of events.',
      legalElements: [
        'Lease start date, duration, and renewal terms',
        'Monthly rent amount and payment history',
        'Rent stabilization status (if applicable — NYC Admin Code §26-501 et seq.)',
        'Description of the violation, nonpayment, or habitability issue',
        'Predicate notices served: 14-day rent demand (nonpayment) or 30/60/90-day termination notice based on tenancy length (RPL §226-c)',
        'Dates of notice service and method of delivery',
        'Building conditions and any HPD violations on record',
        'Communications with landlord regarding repairs or disputes',
      ],
      minParagraphs: 3,
    },
    {
      id: 'defenses',
      label: 'Defenses',
      description:
        'Legal defenses to the landlord\'s petition. Must be specifically pleaded. Under HSTPA (2019), tenants have expanded protections including security deposit caps, limits on rent increases, and good cause eviction requirements.',
      legalElements: [
        'Improper notice — predicate notice failed to comply with RPAPL §711 or RPL §226-c (wrong notice period for tenancy length)',
        'Warranty of habitability — landlord failed to maintain habitable conditions (RPL §227-a)',
        'Retaliatory eviction — eviction filed in retaliation for tenant complaints or code violations (RPL §223-b)',
        'HSTPA violations — landlord violated Housing Stability and Tenant Protection Act provisions (e.g., exceeded security deposit cap of 1 month rent, improper preferential rent increase)',
        'Rent overcharge — landlord charged above the legal regulated rent (NYC Admin Code §26-516)',
        'Laches or waiver — landlord unreasonably delayed enforcement or accepted rent after violation',
        'Discrimination — eviction motivated by protected class status (NYC Human Rights Law §8-107; Fair Housing Act 42 U.S.C. §3604)',
      ],
      minParagraphs: 3,
    },
    {
      id: 'counterclaims',
      label: 'Counterclaims',
      description:
        'Affirmative claims the tenant asserts against the landlord. These may entitle the tenant to monetary damages, rent abatement, or other relief.',
      legalElements: [
        'Security deposit recovery — landlord failed to hold deposit in trust or return within 14 days (GOL §7-108)',
        'Rent abatement for habitability defects — reduction in rent proportional to diminished use and enjoyment (RPL §227-a)',
        'Rent overcharge recovery — recovery of excess rent plus interest and potential treble damages (CPLR §213-a; NYC Admin Code §26-516)',
        'Damages for retaliatory conduct — attorney\'s fees and damages for retaliatory eviction (RPL §223-b)',
        'Repair costs — tenant expended funds on repairs that were landlord\'s responsibility',
      ],
      minParagraphs: 2,
    },
    {
      id: 'verification',
      label: 'Verification',
      description:
        'A sworn statement that the facts in the answer are true and correct. Required when responding to a verified petition in summary proceedings (CPLR §3020).',
      legalElements: [
        'Signed under penalty of perjury under the laws of the State of New York',
        'Statement that the facts set forth in the answer are true and correct to the best of respondent\'s knowledge',
      ],
      minParagraphs: 1,
    },
    {
      id: 'proof_of_service',
      label: 'Proof of Service',
      description:
        'Certification that a copy of the answer was delivered to the opposing party or their attorney, as required by CPLR §2103.',
      legalElements: [
        'Date of service',
        'Method of service (personal delivery, first-class mail, or NYSCEF e-filing if applicable)',
        'Name and address of the party or attorney served',
      ],
      minParagraphs: 1,
    },
  ],

  filingRules: {
    courtName:
      'NYC Housing Court (New York City), City Court (cities outside NYC), or Justice Court (towns and villages)',
    serviceRequirements:
      'Must serve all parties via personal delivery or first-class mail per CPLR §2103. If the court uses NYSCEF (New York State Courts Electronic Filing), e-filing is available and may be mandatory.',
    filingFee:
      '~$45 for NYC Housing Court petition; poor person relief (fee waiver) available under CPLR §1101',
    maxPages: 25,
    fontRequirements: '12-point minimum for body text',
    marginRequirements: '1-inch margins on all sides',
    copies: 2,
    localFormUrl: 'https://www.nycourts.gov/courts/nyc/housing/forms.shtml',
  },

  rejectionReasons: [
    {
      reason: 'Missing or defective predicate notice',
      howToAvoid:
        'Verify that the landlord served the correct predicate notice: 14-day rent demand for nonpayment, or 30/60/90-day termination notice based on tenancy length under RPL §226-c. Attach a copy if available.',
      wizardStep: 'facts',
    },
    {
      reason: 'Incorrect court or venue',
      howToAvoid:
        'File in the court where the property is located: NYC Housing Court for NYC properties, City Court for other cities, Justice Court for towns/villages. Match the court name exactly.',
      wizardStep: 'venue',
    },
    {
      reason: 'No verification paragraph',
      howToAvoid:
        'Include a signed verification stating that the facts in the answer are true and correct under penalty of perjury (CPLR §3020).',
      wizardStep: 'review',
    },
    {
      reason: 'Missing proof of service',
      howToAvoid:
        'Attach a proof of service showing the date, method, and recipient of service per CPLR §2103.',
      wizardStep: 'review',
    },
    {
      reason: 'Rent stabilization status not addressed',
      howToAvoid:
        'If the property is in NYC, determine whether the unit is rent-stabilized. Check the DHCR rent history and note the legal regulated rent. This affects available defenses and counterclaims.',
      wizardStep: 'facts',
    },
  ],

  stepValidations: {
    facts: {
      required: ['lease_start_date'],
      warnings: [
        {
          condition: 'no_notice_dates_mentioned',
          message:
            'Include the dates and type of any predicate notices served. Under RPAPL §711, a nonpayment proceeding requires a 14-day rent demand. Under RPL §226-c, termination notices must be 30 days (tenancy under 1 year), 60 days (1-2 years), or 90 days (over 2 years).',
        },
        {
          condition: 'no_habitability_conditions_documented',
          message:
            'If there are habitability issues (mold, pests, no heat/hot water, lead paint), document them with dates and any HPD complaints or inspection results. This supports a warranty of habitability defense under RPL §227-a.',
        },
        {
          condition: 'no_notice_type_specified',
          message:
            'Specify the type of proceeding: nonpayment (RPAPL §711(2)), holdover (RPAPL §711(1)), or objectionable conduct (RPAPL §711(1)). Each has different notice requirements and defenses.',
        },
      ],
    },
    claims: {
      required: ['defense_type'],
      warnings: [
        {
          condition: 'no_hstpa_protections_considered',
          message:
            'The Housing Stability and Tenant Protection Act (2019) provides significant protections: security deposit cap of 1 month, elimination of vacancy bonus for stabilized units, and limits on preferential rent increases. Consider whether any HSTPA provisions apply.',
        },
        {
          condition: 'no_rent_stabilization_status',
          message:
            'If the property is in NYC, check whether the unit is rent-stabilized (NYC Admin Code §26-501 et seq.). Stabilized tenants have additional protections including renewal rights, rent increase caps, and overcharge recovery.',
        },
      ],
    },
    parties: {
      required: [],
      warnings: [
        {
          condition: 'no_landlord_registered_agent',
          message:
            'Check whether the landlord has a registered agent or managing agent on file with HPD. Multiple Dwelling Law §325 requires NYC landlords to register with HPD. Service may need to go to the registered agent.',
        },
        {
          condition: 'no_hpd_violations_checked',
          message:
            'Search HPD\'s online portal for open violations on the property. Active HPD violations strengthen habitability defenses and can be introduced as evidence.',
        },
      ],
    },
  },

  glossary: [
    {
      term: 'Summary Proceeding',
      plainEnglish:
        'A fast-track court process used for eviction cases in New York (RPAPL §731-§749). It is quicker than a regular lawsuit but still requires proper notice and a court hearing before any eviction can happen.',
    },
    {
      term: 'Warranty of Habitability',
      plainEnglish:
        'A legal guarantee that your apartment must be livable — with working heat, hot water, no pests, and no dangerous conditions (RPL §227-a). If the landlord fails to maintain these standards, you can use it as a defense and seek a rent reduction.',
    },
    {
      term: 'HSTPA (Housing Stability and Tenant Protection Act)',
      plainEnglish:
        'A major 2019 New York law that strengthened tenant rights statewide. Key changes: security deposits capped at 1 month rent, landlords must return deposits within 14 days, vacancy bonuses eliminated for rent-stabilized units, and longer notice periods for lease terminations.',
    },
    {
      term: 'Rent Stabilization',
      plainEnglish:
        'A system that limits how much a landlord can raise rent each year in qualifying NYC buildings (NYC Admin Code §26-501 et seq.). If your apartment is rent-stabilized, you have the right to a lease renewal and your rent increases are set by the Rent Guidelines Board.',
    },
    {
      term: 'Predicate Notice',
      plainEnglish:
        'A required written notice the landlord must give you before filing an eviction case. For nonpayment, it is a 14-day rent demand. For lease termination, it is 30, 60, or 90 days depending on how long you have lived there (RPL §226-c). Without a proper predicate notice, the case can be dismissed.',
    },
    {
      term: 'Retaliatory Eviction',
      plainEnglish:
        'An illegal eviction filed because you complained about conditions, reported code violations, or joined a tenant organization (RPL §223-b). If you can show the eviction was filed within a certain time after your complaint, the court may presume it is retaliatory.',
    },
    {
      term: 'Security Deposit',
      plainEnglish:
        'Money you paid the landlord when you moved in as collateral for damage. Under HSTPA and GOL §7-108, the deposit is capped at 1 month rent, must be held in a separate trust account, and must be returned within 14 days of move-out with an itemized statement of any deductions.',
    },
    {
      term: 'Housing Court',
      plainEnglish:
        'A specialized court in New York City that handles landlord-tenant disputes including evictions, repairs, and housing code violations. In certain NYC zip codes, tenants facing eviction have a right to free legal representation.',
    },
    {
      term: 'Good Cause Eviction',
      plainEnglish:
        'A legal standard that requires landlords to have a legitimate reason to evict a tenant or refuse to renew a lease. Under RPL §226-c and local laws, landlords cannot simply refuse to renew — they must demonstrate a valid cause such as nonpayment, lease violation, or personal use.',
    },
  ],
} as const satisfies JurisdictionRuleConfig
