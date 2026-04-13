import type { JurisdictionRuleConfig } from '../schema'

export const txLandlordTenant = {
  state: 'TX',
  disputeType: 'landlord_tenant',

  requiredSections: [
    {
      id: 'caption',
      label: 'Caption',
      description:
        'Case caption identifying the court, parties, and cause number. Eviction suits (forcible entry and detainer) are filed in Justice of the Peace Court under TX Property Code Chapter 24.',
      legalElements: [
        'Court name (Justice of the Peace Court, Precinct and County)',
        'Plaintiff name (landlord or property management company)',
        'Defendant name (tenant — your legal name as it appears on the lease)',
        'Cause number placeholder (assigned by clerk at filing)',
      ],
      minParagraphs: 1,
    },
    {
      id: 'facts',
      label: 'Facts',
      description:
        'A clear chronological statement of what happened — the lease terms, the alleged violation or issue, any notices given or received, and the current status of the dispute. Include dates, amounts, and specific conditions.',
      legalElements: [
        'Lease start date and term (month-to-month or fixed term)',
        'Monthly rent amount and due date',
        'Description of the alleged violation, habitability issue, or unpaid rent',
        'Date and method of any notice to vacate received (TX Property Code §24.005 requires written notice)',
        'Description of any repair requests made and landlord response (TX Property Code §92.052)',
        'Current occupancy status and any rent withheld or paid under protest',
      ],
      minParagraphs: 3,
    },
    {
      id: 'defenses',
      label: 'Affirmative Defenses',
      description:
        'Specific legal defenses that, if proven, defeat the landlord\'s eviction or damage claim. Must be pleaded or they are waived (TRCP Rule 94). In eviction suits, defenses are raised under TRCP Rule 510.',
      legalElements: [
        'Improper notice to vacate — landlord failed to provide the required written notice period (TX Property Code §24.005: 3 days for nonpayment unless lease says otherwise)',
        'Retaliation defense — eviction filed within 6 months of tenant exercising legal rights such as requesting repairs or reporting code violations (TX Property Code §92.331)',
        'Habitability defense — landlord failed to make diligent repairs after written notice of conditions materially affecting health or safety (TX Property Code §92.052-92.061)',
        'Waiver — landlord accepted partial rent or otherwise waived the breach',
        'Improper service — citation not served at least 6 days before trial date (TRCP Rule 510.4)',
      ],
      minParagraphs: 3,
    },
    {
      id: 'counterclaims',
      label: 'Counterclaims',
      description:
        'Claims the tenant asserts against the landlord. In JP Court, counterclaims up to $20,000 may be heard alongside the eviction. Security deposit and repair counterclaims are common.',
      legalElements: [
        'Security deposit — landlord failed to return deposit within 30 days or provide itemized deduction list (TX Property Code §92.103-92.109; bad faith retention allows 3x penalty plus $100)',
        'Repair costs — tenant paid for repairs after landlord failed to act within a reasonable time following proper written notice (TX Property Code §92.0561 repair-and-deduct remedy)',
        'Damages for utility cutoff — landlord interrupted utilities as retaliation or to force move-out (TX Property Code §92.008; tenant may recover actual damages, one month rent plus $1,000, and attorney fees)',
        'Damages for lock change — landlord changed locks without providing new key within 2 hours of tenant request (TX Property Code §92.0081)',
      ],
      minParagraphs: 2,
    },
    {
      id: 'verification',
      label: 'Verification',
      description:
        'A sworn statement that the facts in the answer are true and correct. Required when the landlord\'s petition is verified (TRCP Rule 93).',
      legalElements: [
        'Signed under penalty of perjury under the laws of the State of Texas',
        'Statement that the facts set forth in the answer are true and correct to the best of defendant\'s knowledge',
      ],
      minParagraphs: 1,
    },
    {
      id: 'certificate_of_service',
      label: 'Certificate of Service',
      description:
        'Certification that a copy of the answer was delivered to the opposing party or their attorney, as required by TRCP Rule 21a.',
      legalElements: [
        'Date of service',
        'Method of service (certified mail, hand delivery, e-service, or fax)',
        'Name and address of the landlord or landlord\'s attorney served',
      ],
      minParagraphs: 1,
    },
  ],

  filingRules: {
    courtName:
      'Justice of the Peace Court for eviction suits (TX Property Code Chapter 24); JP Court (claims under $20,000) or County Court at Law (claims $20,000+) for security deposit and damage claims',
    serviceRequirements:
      'Eviction citation must be served at least 6 days before trial (TRCP Rule 510.4). Answer and counterclaims served on opposing party via certified mail, hand delivery, e-service, or fax per TRCP Rule 21a.',
    filingFee:
      '~$54 for Justice of the Peace Court (fee waiver available via Statement of Inability to Afford Payment of Court Costs, TX Gov\'t Code §6.001)',
    maxPages: 25,
    fontRequirements: '14-point minimum for body text in JP Court',
    marginRequirements: '1-inch margins on all sides',
    copies: 2,
    localFormUrl: 'https://www.txcourts.gov/rules-forms/forms/',
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
        'Attach a certificate of service showing the date, method, and recipient of service per TRCP Rule 21a.',
      wizardStep: 'review',
    },
    {
      reason: 'Incorrect court name in caption',
      howToAvoid:
        'Eviction suits must be filed in the Justice of the Peace Court for the precinct where the property is located (TX Property Code §24.004). Verify the court name matches the landlord\'s original petition.',
      wizardStep: 'venue',
    },
    {
      reason: 'Counterclaim exceeds JP Court jurisdiction',
      howToAvoid:
        'JP Court jurisdiction is limited to $20,000. If your counterclaim exceeds this amount, you may need to file separately in County Court at Law.',
      wizardStep: 'claims',
    },
    {
      reason: 'No cause number referenced',
      howToAvoid:
        'Include the cause number from the landlord\'s petition in your caption. If not yet assigned, write "Cause No. ____________" and the clerk will assign it.',
      wizardStep: 'parties',
    },
    {
      reason: 'Answer not filed before trial date',
      howToAvoid:
        'In eviction suits under TRCP Rule 510, the answer is due by 8:00 a.m. on the day of trial. File early to avoid rejection for untimeliness.',
      wizardStep: 'how_to_file',
    },
  ],

  stepValidations: {
    facts: {
      required: ['lease_start_date'],
      warnings: [
        {
          condition: 'no_notice_to_vacate_date',
          message:
            'Include the date you received the notice to vacate. Under TX Property Code §24.005, the landlord must give at least 3 days\' written notice for nonpayment of rent (unless the lease specifies otherwise). An improper or missing notice is a strong defense.',
        },
        {
          condition: 'no_condition_issues_described',
          message:
            'If the property has habitability problems (mold, plumbing leaks, pest infestation, broken locks, no hot water), describe each condition in detail with dates. Under TX Property Code §92.052, the landlord must make diligent efforts to repair conditions that materially affect health or safety.',
        },
        {
          condition: 'no_rent_payment_history',
          message:
            'Document your rent payment history, including any partial payments accepted by the landlord. Acceptance of partial rent after serving a notice to vacate may waive the landlord\'s right to evict for that period.',
        },
      ],
    },
    claims: {
      required: ['defense_type'],
      warnings: [
        {
          condition: 'no_repair_request_documentation',
          message:
            'If raising a habitability defense, document every written repair request you sent to the landlord — include dates, method of delivery, and what you requested. TX Property Code §92.052 requires that the tenant give notice before the landlord\'s duty to repair is triggered.',
        },
        {
          condition: 'no_security_deposit_details',
          message:
            'If claiming wrongful retention of security deposit, note the deposit amount, move-out date, and whether the landlord sent an itemized deduction list. Under TX Property Code §92.104, the landlord has 30 days after move-out to return the deposit or provide a written itemization.',
        },
      ],
    },
    parties: {
      required: [],
      warnings: [
        {
          condition: 'no_landlord_registered_agent',
          message:
            'If the landlord is a corporation or LLC, you may need their registered agent\'s address for service. Search the Texas Secretary of State\'s business filings at https://www.sos.state.tx.us/corp/sosda/index.shtml.',
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
      term: 'Forcible Entry and Detainer',
      plainEnglish:
        'The legal name for an eviction lawsuit in Texas. Filed in Justice of the Peace Court under TX Property Code Chapter 24, it is how a landlord asks the court to order a tenant to leave the property.',
    },
    {
      term: 'Security Deposit',
      plainEnglish:
        'Money you paid the landlord at move-in to cover potential damages. Under TX Property Code §92.103, the landlord must return it within 30 days of move-out (minus legitimate deductions) with an itemized list. Bad faith retention can result in a penalty of 3 times the wrongfully withheld amount plus $100.',
    },
    {
      term: 'Habitability',
      plainEnglish:
        'The legal requirement that a rental property be safe and livable. Under TX Property Code §92.052, the landlord must make diligent efforts to repair conditions that materially affect the physical health or safety of an ordinary tenant — such as no running water, sewage backups, or broken locks on exterior doors.',
    },
    {
      term: 'Retaliation Defense',
      plainEnglish:
        'A defense you can raise if the landlord evicts you (or raises rent, cuts services, etc.) within 6 months of you exercising a legal right — like requesting repairs, reporting code violations, or joining a tenant organization. TX Property Code §92.331 presumes retaliation if the adverse action occurs within that 6-month window.',
    },
    {
      term: 'Notice to Vacate',
      plainEnglish:
        'A written notice the landlord must give before filing an eviction suit. For nonpayment of rent, TX Property Code §24.005 requires at least 3 days\' notice (unless the lease says otherwise). The notice must be delivered in person, by mail, or posted on the inside of the main entry door.',
    },
    {
      term: 'Repair and Deduct',
      plainEnglish:
        'A tenant remedy under TX Property Code §92.0561. If the landlord fails to repair a condition that materially affects health or safety after proper written notice and a reasonable time, the tenant may hire someone to make the repair and deduct the cost from rent — but strict notice procedures must be followed first.',
    },
    {
      term: 'Lease Violation',
      plainEnglish:
        'A breach of a term in your rental agreement. Common examples include unauthorized pets, subletting without permission, or noise complaints. The landlord must follow the lease\'s notice and cure provisions before pursuing eviction for most non-rent violations.',
    },
    {
      term: 'Fee Waiver',
      plainEnglish:
        'If you cannot afford the filing fee, you can file a Statement of Inability to Afford Payment of Court Costs. The court waives the fee if you qualify based on income or government assistance (TX Gov\'t Code §6.001).',
    },
    {
      term: 'TRCP Rule 510',
      plainEnglish:
        'The Texas Rule of Civil Procedure that governs eviction suits in Justice of the Peace Court. It sets the rules for filing, service (citation at least 6 days before trial), trial procedures, and appeals. Your answer is due by 8:00 a.m. on the trial date.',
    },
  ],
} as const satisfies JurisdictionRuleConfig
