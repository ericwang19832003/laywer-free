import type { JurisdictionRuleConfig } from '../schema'

export const caLandlordTenant = {
  state: 'CA',
  disputeType: 'landlord_tenant',

  requiredSections: [
    {
      id: 'caption',
      label: 'Caption',
      description:
        'Case caption identifying the court, parties, and case number. Must name the Superior Court of the county where the rental property is located.',
      legalElements: [
        'Court name (Superior Court of California, County of ___)',
        'Plaintiff/Petitioner name (landlord or tenant depending on action)',
        'Defendant/Respondent name',
        'Case number placeholder (assigned by clerk at filing)',
      ],
      minParagraphs: 1,
    },
    {
      id: 'facts',
      label: 'Facts',
      description:
        'Statement of facts establishing the tenancy, lease terms, alleged violations, notices served, and any habitability issues. Must include specific dates, amounts, and property conditions.',
      legalElements: [
        'Lease start date and terms (month-to-month or fixed-term)',
        'Monthly rent amount and payment history',
        'Description of violation or dispute (nonpayment, breach, nuisance, or no-fault termination)',
        'Notices served with dates and method of service (3-day, 30-day, or 60-day notice)',
        'Habitability conditions if applicable (CA Civil Code §1941-1942.5)',
        'Security deposit amount and any deductions (CA Civil Code §1950.5)',
      ],
      minParagraphs: 3,
    },
    {
      id: 'defenses',
      label: 'Defenses',
      description:
        'Legal defenses available to the tenant in an unlawful detainer or landlord action. Must be specifically pleaded or they are waived.',
      legalElements: [
        'Improper notice — landlord failed to serve proper 3-day, 30-day, or 60-day notice (CA CCP §1161)',
        'Retaliation — eviction filed within 180 days of tenant exercising legal rights (CA Civil Code §1942.5)',
        'Implied warranty of habitability — unit has uninhabitable conditions that landlord failed to repair (CA Civil Code §1941-1942.5)',
        'Discrimination — eviction motivated by protected class status (CA Gov Code §12955, FEHA)',
        'Rent cap violation — rent increase exceeds AB 1482 cap of 5% + local CPI or 10%, whichever is lower (CA Civil Code §1946.2)',
        'Just cause eviction violation — no valid just cause under the Tenant Protection Act (CA Civil Code §1946.2)',
      ],
      minParagraphs: 3,
    },
    {
      id: 'counterclaims',
      label: 'Counterclaims',
      description:
        'Affirmative claims the tenant may bring against the landlord for damages, deposit violations, or statutory remedies.',
      legalElements: [
        'Security deposit wrongful withholding — landlord failed to return deposit within 21 days or made bad-faith deductions (CA Civil Code §1950.5(l), up to 2x deposit penalty)',
        'Repair and deduct costs — tenant paid for repairs landlord refused to make (CA Civil Code §1942)',
        'Relocation assistance — landlord failed to pay required relocation for no-fault eviction under AB 1482 (one month rent or waiver of final month)',
        'Breach of quiet enjoyment — landlord interfered with tenant\'s use of premises (CA Civil Code §1927)',
        'Uninhabitable conditions damages — tenant remedies for substandard housing (CA Civil Code §1942.4)',
      ],
      minParagraphs: 2,
    },
    {
      id: 'verification',
      label: 'Verification',
      description:
        'A sworn statement that the facts in the filing are true and correct. Required for unlawful detainer complaints (CA CCP §446).',
      legalElements: [
        'Signed under penalty of perjury under the laws of the State of California',
        'Statement that the facts set forth are true and correct to the best of the declarant\'s knowledge',
      ],
      minParagraphs: 1,
    },
    {
      id: 'proof_of_service',
      label: 'Proof of Service',
      description:
        'Proof that a copy of the filing was served on the opposing party as required by California Rules of Court and CA CCP §1011.',
      legalElements: [
        'Date of service',
        'Method of service (personal service, substituted service, posting and mailing, or e-service)',
        'Name and address of the party served',
        'Declaration of the person who performed service',
      ],
      minParagraphs: 1,
    },
  ],

  filingRules: {
    courtName:
      'Superior Court of California (unlimited civil jurisdiction for unlawful detainer); Small Claims Court for security deposit disputes ≤$10,000',
    serviceRequirements:
      'Unlawful detainer summons must be personally served or served by substituted service, then mailed. Defendant has 5 calendar days to respond after personal service. All notices (3-day, 30-day, 60-day) must be served per CA CCP §1162 (personal delivery, substituted service and mail, or posting and mail).',
    filingFee:
      '~$435 for unlimited civil (unlawful detainer); fee waiver available via Request to Waive Court Fees (FW-001) based on income or government benefits',
    maxPages: 25,
    fontRequirements: '12-point minimum for body text per California Rules of Court',
    marginRequirements: '1-inch margins on all sides',
    copies: 2,
    localFormUrl: 'https://www.courts.ca.gov/forms.htm',
  },

  rejectionReasons: [
    {
      reason: 'Missing or defective notice before filing',
      howToAvoid:
        'Attach a copy of the 3-day, 30-day, or 60-day notice served on the tenant. The notice must comply with CA CCP §1161 requirements including proper service method and correct notice period.',
      wizardStep: 'facts',
    },
    {
      reason: 'Wrong court or venue',
      howToAvoid:
        'File in the Superior Court of the county where the rental property is located. Unlawful detainer actions have mandatory venue in the property\'s county.',
      wizardStep: 'venue',
    },
    {
      reason: 'Missing verification',
      howToAvoid:
        'Include a signed verification under penalty of perjury stating the facts are true and correct. Required for unlawful detainer complaints under CA CCP §446.',
      wizardStep: 'review',
    },
    {
      reason: 'No proof of service attached',
      howToAvoid:
        'Attach a completed proof of service (POS-010 or POS-040) showing proper service on all parties.',
      wizardStep: 'review',
    },
    {
      reason: 'Insufficient facts for just cause eviction',
      howToAvoid:
        'If the property is covered by AB 1482 (Tenant Protection Act), specify the just cause reason for eviction per CA Civil Code §1946.2(b). No-fault terminations require relocation assistance.',
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
            'Include the exact dates when notices were served (3-day, 30-day, or 60-day). Under CA CCP §1161, the notice period must expire before filing an unlawful detainer.',
        },
        {
          condition: 'no_habitability_issues_described',
          message:
            'If the property has habitability problems (mold, plumbing, pest infestation, no heat), describe them specifically. Under CA Civil Code §1941-1942.5, tenants have a right to habitable premises and may withhold rent or repair and deduct after proper notice.',
        },
        {
          condition: 'no_security_deposit_amount',
          message:
            'Include the security deposit amount. Under CA Civil Code §1950.5, deposits are limited to 2x monthly rent (unfurnished) or 3x monthly rent (furnished), and must be returned within 21 days of move-out with an itemized statement.',
        },
      ],
    },
    claims: {
      required: ['defense_type'],
      warnings: [
        {
          condition: 'no_ab_1482_just_cause_analysis',
          message:
            'If the tenancy is over 12 months, AB 1482 (Tenant Protection Act) likely applies. Analyze whether the landlord has valid just cause for eviction under CA Civil Code §1946.2 — lack of just cause is a complete defense.',
        },
        {
          condition: 'no_repair_requests_documented',
          message:
            'Document all written repair requests and landlord responses. Under CA Civil Code §1942, a tenant who gave reasonable notice may repair and deduct up to one month\'s rent, or withhold rent entirely for serious habitability failures.',
        },
      ],
    },
    parties: {
      required: [],
      warnings: [
        {
          condition: 'property_management_vs_owner',
          message:
            'Identify whether the landlord is an individual owner, LLC, or property management company. The actual property owner must be named in unlawful detainer actions — a management company alone may lack standing to file.',
        },
      ],
    },
  },

  glossary: [
    {
      term: 'Unlawful Detainer',
      plainEnglish:
        'California\'s legal term for an eviction lawsuit. The landlord asks the court to order the tenant to move out. It follows an expedited timeline — the tenant has only 5 days to respond after being served (CA CCP §1167).',
    },
    {
      term: 'Just Cause Eviction',
      plainEnglish:
        'Under AB 1482, landlords cannot evict tenants who have lived in a unit for 12+ months without a legally valid reason. "At-fault" reasons include nonpayment or lease violations. "No-fault" reasons include owner move-in or major renovation — and require relocation assistance.',
    },
    {
      term: 'AB 1482 (Tenant Protection Act)',
      plainEnglish:
        'A California statewide law (Civil Code §1946.2) that caps annual rent increases at 5% plus local CPI (or 10%, whichever is lower) and requires just cause for evictions of tenants in place 12+ months. Exempts single-family homes not owned by corporations and units built within the last 15 years.',
    },
    {
      term: 'Security Deposit',
      plainEnglish:
        'Money a tenant pays upfront as protection for the landlord. In California, the maximum is 2x monthly rent for unfurnished units or 3x for furnished (Civil Code §1950.5). The landlord must return it within 21 days of move-out with an itemized deduction statement.',
    },
    {
      term: 'Habitability',
      plainEnglish:
        'California law requires every rental unit to be fit for human occupancy — meaning working plumbing, heating, electricity, no pest infestations, and no mold or structural hazards (Civil Code §1941). If the landlord fails to maintain habitability, the tenant can withhold rent, repair and deduct, or sue for damages.',
    },
    {
      term: 'Retaliation',
      plainEnglish:
        'It is illegal for a landlord to evict, raise rent, or reduce services because a tenant complained about habitability, reported code violations, or exercised other legal rights. California presumes retaliation if adverse action occurs within 180 days of the tenant\'s protected activity (Civil Code §1942.5).',
    },
    {
      term: 'Rent Cap',
      plainEnglish:
        'Under AB 1482, most California landlords cannot raise rent more than 5% plus the local Consumer Price Index (CPI) in a 12-month period, with a hard ceiling of 10%. Increases above this cap are void and can be challenged.',
    },
    {
      term: 'Notice to Quit',
      plainEnglish:
        'A written notice the landlord must give before filing an eviction lawsuit. The type depends on the reason: 3-day notice for nonpayment or lease violation, 30-day notice for month-to-month tenancies under 1 year, or 60-day notice for tenancies of 1 year or more (CCP §1161).',
    },
    {
      term: 'Repair and Deduct',
      plainEnglish:
        'A tenant\'s right to fix a habitability problem themselves and subtract the cost (up to one month\'s rent) from the next rent payment, after giving reasonable notice to the landlord and waiting a reasonable time for repair (Civil Code §1942). This can be used twice in any 12-month period.',
    },
  ],
} as const satisfies JurisdictionRuleConfig
