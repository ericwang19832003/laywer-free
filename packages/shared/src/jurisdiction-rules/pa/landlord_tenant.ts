import type { JurisdictionRuleConfig } from '../schema'

export const paLandlordTenant = {
  state: 'PA',
  disputeType: 'landlord_tenant',

  requiredSections: [
    {
      id: 'caption',
      label: 'Caption',
      description:
        'Case caption identifying the court, parties, and docket number. Eviction (ejectment) proceedings are governed by 68 P.S. \u00A7250.501 and filed in the Magisterial District Court where the property is located.',
      legalElements: [
        'Court name (Magisterial District Court for the district where the property is located)',
        'Plaintiff name (landlord or property management company)',
        'Defendant name (tenant — your legal name as it appears on the lease)',
        'Docket number placeholder (assigned by clerk at filing)',
        'Property address',
      ],
      minParagraphs: 1,
    },
    {
      id: 'facts',
      label: 'Facts',
      description:
        'A clear chronological statement of the lease terms, the alleged violation or issue, any notices given or received, and the current status of the dispute. Include dates, amounts, and specific conditions.',
      legalElements: [
        'Lease start date and term (month-to-month or fixed term)',
        'Monthly rent amount and due date',
        'Description of the alleged violation, habitability issue, or unpaid rent',
        'Date and type of notice to quit received (10-day for nonpayment with lease >1 year, 15-day for lease violations, 30-day for month-to-month termination)',
        'Description of any repair requests made and landlord response',
        'Security deposit amount paid and any deductions claimed',
        'Current occupancy status and any rent withheld or paid under protest',
      ],
      minParagraphs: 3,
    },
    {
      id: 'defenses',
      label: 'Defenses',
      description:
        'Legal defenses to the landlord\'s eviction or damage claim. Pennsylvania recognizes several tenant defenses including improper notice, habitability violations established by case law (Pugh v. Holmes), retaliation, and utility shutoff protections.',
      legalElements: [
        'Improper notice — landlord failed to provide the required notice period (10-day for nonpayment with lease >1 year, 15-day for violations, 30-day for month-to-month termination per 68 P.S. \u00A7250.501)',
        'Implied warranty of habitability — landlord failed to maintain the property in a habitable condition as established in Pugh v. Holmes, 486 Pa. 272 (1979)',
        'Retaliation — eviction filed in response to tenant exercising legal rights such as requesting repairs, reporting code violations, or organizing tenants (68 P.S. \u00A7250.205)',
        'Utility shutoff — landlord unlawfully terminated utility service in violation of the Utility Service Tenants Rights Act (35 P.S. \u00A71700-1)',
        'Philadelphia Good Cause Eviction (if applicable) — landlord lacks good cause as required by Philadelphia Bill No. 200200',
      ],
      minParagraphs: 3,
    },
    {
      id: 'counterclaims',
      label: 'Counterclaims',
      description:
        'Claims the tenant asserts against the landlord. Security deposit violations and repair costs are the most common counterclaims in Pennsylvania landlord-tenant disputes.',
      legalElements: [
        'Security deposit — landlord failed to return deposit within 30 days of lease termination or failed to provide itemized list of deductions (68 P.S. \u00A7250.511a-250.512; wrongful retention allows tenant to recover double the deposit amount)',
        'Security deposit limit violation — landlord collected more than 2 months\' rent in the first year or more than 1 month\'s rent after the first year (68 P.S. \u00A7250.511a)',
        'Repair costs — tenant paid for essential repairs after landlord failed to maintain habitable conditions following reasonable notice',
        'Damages for utility shutoff — landlord interrupted utilities in violation of the Utility Service Tenants Rights Act (35 P.S. \u00A71700-1)',
      ],
      minParagraphs: 2,
    },
    {
      id: 'verification',
      label: 'Verification',
      description:
        'A sworn statement that the facts in the answer are true and correct. Pennsylvania requires verification of pleadings containing averments of fact (Pa.R.C.P. 1024).',
      legalElements: [
        'Signed statement that the facts set forth are true and correct to the best of the signer\'s knowledge, information, and belief',
        'Acknowledgment that false statements are subject to penalties under 18 Pa.C.S. \u00A74904 (unsworn falsification to authorities)',
      ],
      minParagraphs: 1,
    },
    {
      id: 'certificate_of_service',
      label: 'Certificate of Service',
      description:
        'Certification that a copy of the answer and any counterclaims were served on the opposing party or their attorney, as required by Pa.R.C.P. 440.',
      legalElements: [
        'Date of service',
        'Method of service (personal delivery, first-class mail, or electronic filing if available)',
        'Name and address of the landlord or landlord\'s attorney served',
      ],
      minParagraphs: 1,
    },
  ],

  filingRules: {
    courtName:
      'Magisterial District Court for possession (ejectment) actions; Court of Common Pleas for appeals (supersedeas bond required to stay eviction during appeal)',
    serviceRequirements:
      'Must serve all parties by personal delivery or first-class mail per Pa.R.C.P. 440. Original process in Magisterial District Court served per rules of that court.',
    filingFee:
      '~$50-75 for Magisterial District Court (In Forma Pauperis petition available for fee waiver under Pa.R.C.P. 240)',
    maxPages: 25,
    fontRequirements: '12-point minimum for body text',
    marginRequirements: '1-inch margins on all sides',
    copies: 2,
    localFormUrl: 'https://www.pacourts.us/forms',
  },

  rejectionReasons: [
    {
      reason: 'Missing verification paragraph',
      howToAvoid:
        'Include a signed verification stating that the facts are true and correct under penalty of law per Pa.R.C.P. 1024.',
      wizardStep: 'review',
    },
    {
      reason: 'No certificate of service attached',
      howToAvoid:
        'Attach a certificate of service showing the date, method, and recipient of service per Pa.R.C.P. 440.',
      wizardStep: 'review',
    },
    {
      reason: 'Incorrect court or venue',
      howToAvoid:
        'Eviction (ejectment) actions must be filed in the Magisterial District Court for the district where the rental property is located. Verify the court matches the landlord\'s complaint.',
      wizardStep: 'venue',
    },
    {
      reason: 'Notice period defense not properly documented',
      howToAvoid:
        'If raising an improper notice defense, specify the notice type received (or not received), the date, and the required notice period. Different situations require different notice periods: 10-day (nonpayment, lease >1 year), 15-day (violations), or 30-day (month-to-month termination).',
      wizardStep: 'facts',
    },
    {
      reason: 'No docket number referenced',
      howToAvoid:
        'Include the docket number from the landlord\'s complaint in your caption. If not yet assigned, write "Docket No. ____________" and the clerk will assign it.',
      wizardStep: 'parties',
    },
    {
      reason: 'Supersedeas bond not addressed on appeal',
      howToAvoid:
        'If appealing a Magisterial District Court judgment to the Court of Common Pleas, a supersedeas bond is required to stay the eviction. Note this requirement in your filing strategy.',
      wizardStep: 'how_to_file',
    },
  ],

  stepValidations: {
    facts: {
      required: ['lease_start_date'],
      warnings: [
        {
          condition: 'no_notice_to_quit_date',
          message:
            'Include the date you received the notice to quit. Pennsylvania requires different notice periods depending on the situation: 10-day for nonpayment (lease >1 year), 15-day for lease violations, and 30-day for month-to-month termination. An improper or missing notice is a strong defense.',
        },
        {
          condition: 'no_condition_issues_described',
          message:
            'If the property has habitability problems (mold, plumbing leaks, pest infestation, no heat, structural damage), describe each condition in detail with dates. Under the implied warranty of habitability (Pugh v. Holmes), the landlord must maintain the property in a livable condition.',
        },
        {
          condition: 'no_security_deposit_amount',
          message:
            'Document your security deposit amount and when it was paid. Under 68 P.S. \u00A7250.511a, the landlord cannot charge more than 2 months\' rent in the first year or more than 1 month\'s rent after the first year. The deposit must be returned within 30 days of lease termination.',
        },
      ],
    },
    claims: {
      required: ['defense_type'],
      warnings: [
        {
          condition: 'no_repair_request_documentation',
          message:
            'If raising a habitability defense, document every repair request you sent to the landlord — include dates, method of delivery, and what you requested. Written notice strengthens your claim under the implied warranty of habitability.',
        },
        {
          condition: 'no_utility_shutoff_details',
          message:
            'If the landlord terminated utility service, document the dates, which utilities were affected, and any harm caused. The Utility Service Tenants Rights Act (35 P.S. \u00A71700-1) prohibits landlords from shutting off utilities to force tenants to vacate.',
        },
      ],
    },
    parties: {
      required: [],
      warnings: [
        {
          condition: 'no_landlord_registered_agent',
          message:
            'If the landlord is a corporation or LLC, you may need their registered agent\'s address for service. Search the Pennsylvania Department of State business filings at https://www.corporations.pa.gov/.',
        },
        {
          condition: 'no_property_management_company',
          message:
            'If a property management company manages the property, include their name and address. They may be the proper party to name, especially for repair and security deposit claims.',
        },
      ],
    },
  },

  glossary: [
    {
      term: 'Ejectment',
      plainEnglish:
        'The legal term for an eviction lawsuit in Pennsylvania. Governed by 68 P.S. \u00A7250.501, it is how a landlord asks the court to order a tenant to leave the property. Filed in the Magisterial District Court where the property is located.',
    },
    {
      term: 'Security Deposit',
      plainEnglish:
        'Money you paid the landlord at move-in to cover potential damages. Under 68 P.S. \u00A7250.511a-250.512, the landlord is limited to 2 months\' rent in the first year and 1 month\'s rent after that. The deposit must be returned within 30 days of lease termination with an itemized list of deductions. Wrongful retention allows you to recover double the amount.',
    },
    {
      term: 'Implied Warranty of Habitability',
      plainEnglish:
        'A legal requirement established by the Pennsylvania Supreme Court in Pugh v. Holmes (1979) that landlords must maintain rental properties in a livable condition. This covers essential services like heat, plumbing, structural integrity, and freedom from serious pest infestation.',
    },
    {
      term: 'Retaliation',
      plainEnglish:
        'A defense you can raise if the landlord evicts you or takes adverse action in response to you exercising a legal right — like requesting repairs, reporting code violations, or organizing with other tenants. Protected under 68 P.S. \u00A7250.205.',
    },
    {
      term: 'Supersedeas Bond',
      plainEnglish:
        'A bond you must post when appealing an eviction judgment from Magisterial District Court to the Court of Common Pleas. It stays (pauses) the eviction while your appeal is pending. Without it, the landlord can proceed with the eviction despite your appeal.',
    },
    {
      term: 'Magisterial District Court',
      plainEnglish:
        'Pennsylvania\'s local court that handles eviction (ejectment) cases and civil claims up to $12,000. Procedures are less formal than the Court of Common Pleas, and you can represent yourself.',
    },
    {
      term: 'Notice to Quit',
      plainEnglish:
        'A written notice the landlord must give before filing an eviction suit. The required notice period depends on the situation: 10 days for nonpayment of rent (lease over 1 year), 15 days for lease violations, and 30 days for month-to-month termination. An improper notice is a strong defense.',
    },
    {
      term: 'Utility Service Tenants Rights Act',
      plainEnglish:
        'A Pennsylvania law (35 P.S. \u00A71700-1) that prohibits landlords from shutting off utilities (gas, electric, water) to force tenants to leave. If your landlord cuts off your utilities, you may have legal remedies including damages.',
    },
    {
      term: 'In Forma Pauperis (IFP)',
      plainEnglish:
        'A petition to waive court filing fees if you cannot afford them. Under Pa.R.C.P. 240, you can file an IFP petition showing your income and expenses. If approved, the court waives the filing fee.',
    },
  ],
} as const satisfies JurisdictionRuleConfig
