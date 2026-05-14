import type { JurisdictionRuleConfig } from '../schema'

export const flLandlordTenant = {
  state: 'FL',
  disputeType: 'landlord_tenant',

  requiredSections: [
    {
      id: 'caption',
      label: 'Caption',
      description:
        'Case caption identifying the court, parties, and case number. Eviction cases are filed in County Court in the county where the property is located.',
      legalElements: [
        'Court name (County Court)',
        'Plaintiff name (landlord or property management company)',
        'Defendant name (tenant\'s legal name as it appears on the lease)',
        'Case number placeholder (assigned by clerk at filing)',
      ],
      minParagraphs: 1,
    },
    {
      id: 'facts',
      label: 'Statement of Facts',
      description:
        'A chronological account of the tenancy, the dispute, and the events leading to the lawsuit. Must include key dates and relevant communications.',
      legalElements: [
        'Lease start date and rental terms',
        'Description of the dispute (nonpayment, noncompliance, or other)',
        'Notice(s) received and dates served',
        'Landlord communications and tenant responses',
        'Current status of the tenancy',
      ],
      minParagraphs: 3,
    },
    {
      id: 'defenses',
      label: 'Defenses',
      description:
        'Legal defenses to the eviction action under the Florida Residential Landlord and Tenant Act (FL Stat. §83.40-83.683).',
      legalElements: [
        'Improper notice — landlord failed to provide proper 3-day notice for nonpayment or did not include exact amount owed',
        'Retaliation — eviction filed in retaliation for tenant exercising legal rights (FL Stat. §83.64)',
        'Habitability — landlord failed to maintain premises in compliance with building and housing codes (FL Stat. §83.51)',
        'Landlord noncompliance — landlord breached obligations under FL Stat. §83.51, giving tenant right to withhold via 7-day notice procedure (FL Stat. §83.60)',
      ],
      minParagraphs: 2,
    },
    {
      id: 'counterclaims',
      label: 'Counterclaims',
      description:
        'Claims the tenant asserts against the landlord, typically related to security deposit violations or failure to make repairs.',
      legalElements: [
        'Security deposit — landlord failed to return deposit within 15 days (no claim) or 30 days (with claim) or failed to hold in separate account (FL Stat. §83.49)',
        'Repairs — landlord failed to maintain premises after proper notice, tenant entitled to damages',
        'Retaliation damages — tenant may recover actual damages and attorney fees for retaliatory conduct (FL Stat. §83.64)',
      ],
      minParagraphs: 1,
    },
    {
      id: 'verification',
      label: 'Verification',
      description:
        'A sworn statement that the facts in the answer are true and correct.',
      legalElements: [
        'Signed under penalty of perjury under the laws of the State of Florida',
        'Statement that the facts set forth in the answer are true and correct to the best of defendant\'s knowledge',
      ],
      minParagraphs: 1,
    },
    {
      id: 'certificate_of_service',
      label: 'Certificate of Service',
      description:
        'Certification that a copy of the answer was delivered to the opposing party or their attorney.',
      legalElements: [
        'Date of service',
        'Method of service (mail, hand delivery, e-service, or fax)',
        'Name and address of the party or attorney served',
      ],
      minParagraphs: 1,
    },
  ],

  filingRules: {
    courtName: 'County Court in the county where the rental property is located',
    serviceRequirements:
      'Must serve all parties via mail, hand delivery, e-service, or fax per FL Rule of Civil Procedure 1.080. Venue is in the county where the property is located.',
    filingFee:
      '~$185 for eviction (fee waiver available via Application for Determination of Civil Indigent Status)',
    maxPages: 25,
    fontRequirements: '12-point minimum for body text',
    marginRequirements: '1-inch margins on all sides',
    copies: 2,
    localFormUrl: 'https://www.flcourts.gov/resources-and-services/court-improvement/family-courts/family-law-self-help-information/family-law-forms',
  },

  rejectionReasons: [
    {
      reason: 'Missing verification paragraph',
      howToAvoid:
        'Include a signed verification stating that the facts in the answer are true and correct under penalty of perjury.',
      wizardStep: 'review',
    },
    {
      reason: 'No certificate of service attached',
      howToAvoid:
        'Attach a certificate of service showing the date, method, and recipient of service.',
      wizardStep: 'review',
    },
    {
      reason: 'No lease start date in facts',
      howToAvoid:
        'Include the lease start date in your statement of facts. This is critical for establishing the tenancy and determining which notice requirements apply.',
      wizardStep: 'facts',
    },
    {
      reason: 'Defense not specific to notice type',
      howToAvoid:
        'Specify whether the notice was a 3-day notice for nonpayment, 7-day notice for noncompliance, or 15-day notice for month-to-month termination. Each has different legal requirements under FL Stat. §83.56.',
      wizardStep: 'claims',
    },
  ],

  stepValidations: {
    facts: {
      required: ['lease_start_date'],
      warnings: [
        {
          condition: 'no_notice_details',
          message:
            'Describe the notice you received in detail — type (3-day, 7-day, or 15-day), date served, and method of delivery. Under FL Stat. §83.56, the notice type and contents must be correct or the eviction is defective.',
        },
        {
          condition: 'no_rent_amount_mentioned',
          message:
            'If this is a nonpayment case, note the monthly rent amount. Florida\'s 3-day notice must state the exact amount owed — any overstatement can invalidate it.',
        },
      ],
    },
    claims: {
      required: ['defense_type'],
      warnings: [
        {
          condition: 'no_habitability_details',
          message:
            'If raising a habitability defense, document specific code violations and dates you notified the landlord. Florida does not allow rent withholding — you must use the 7-day notice procedure under FL Stat. §83.60.',
        },
        {
          condition: 'no_security_deposit_details',
          message:
            'If claiming security deposit violations, note the deposit amount, move-out date, and whether the landlord sent a written claim within 30 days. Under FL Stat. §83.49, the deposit must be held in a separate account.',
        },
      ],
    },
    parties: {
      required: [],
      warnings: [
        {
          condition: 'no_property_address',
          message:
            'Include the full property address. Venue for eviction is in the county where the property is located.',
        },
      ],
    },
  },

  glossary: [
    {
      term: 'Eviction',
      plainEnglish:
        'The legal process a landlord must follow to remove a tenant from a rental property. In Florida, a landlord cannot lock you out or remove your belongings without a court order — they must file a lawsuit in County Court.',
    },
    {
      term: 'Security Deposit',
      plainEnglish:
        'Money you paid the landlord at move-in to cover potential damages. Under FL Stat. §83.49, the landlord must hold it in a separate account and return it within 15 days of move-out (or 30 days if they intend to make a claim against it).',
    },
    {
      term: 'Habitability',
      plainEnglish:
        'The landlord\'s legal duty to keep the rental property safe and livable. Under FL Stat. §83.51, the landlord must comply with building and housing codes and maintain the roof, plumbing, and other structural components.',
    },
    {
      term: 'Retaliation',
      plainEnglish:
        'It is illegal for a landlord to evict you, raise rent, or reduce services because you complained about living conditions or exercised a legal right. FL Stat. §83.64 prohibits retaliatory conduct.',
    },
    {
      term: 'Notice to Vacate',
      plainEnglish:
        'A written notice from the landlord telling you to leave. Florida requires specific notice periods: 3 days for nonpayment, 7 days for lease violations (with chance to cure), and 15 days for month-to-month termination (FL Stat. §83.56).',
    },
    {
      term: 'Three-Day Notice',
      plainEnglish:
        'A notice the landlord must give you before filing for eviction based on nonpayment of rent. It must state the exact amount owed — if the amount is wrong, the notice may be invalid.',
    },
    {
      term: 'Noncompliance',
      plainEnglish:
        'When either the landlord or tenant fails to meet their obligations under the lease or Florida law. A 7-day notice of noncompliance gives the violating party a chance to fix the problem before further action (FL Stat. §83.56).',
    },
    {
      term: 'Fee Waiver',
      plainEnglish:
        'If you cannot afford the filing fee (~$185 for eviction), you can file an Application for Determination of Civil Indigent Status. The court waives the fee if you qualify based on income or government assistance.',
    },
  ],
} as const satisfies JurisdictionRuleConfig
