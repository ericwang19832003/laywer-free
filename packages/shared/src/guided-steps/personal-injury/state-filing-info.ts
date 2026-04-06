export interface CourtFilingInfo {
  label: string;
  feeRange: string;
  filingSteps: string[];
  eFilingUrl?: string;
  specialRequirements?: string;
}

export interface StateFilingInfo {
  name: string;
  abbreviation: string;
  sol: {
    personalInjury: string;
    propertyDamage: string;
    note?: string;
  };
  eFilingSystem?: {
    name: string;
    url: string;
    mandatory: boolean;
    mandatoryNote?: string;
  };
  filingMethods: string[];
  feeWaiverForm: string;
  feeWaiverRule?: string;
  courtSelectionGuide: string;
  courts: Record<string, CourtFilingInfo>;
}

export const STATE_FILING_INFO: Record<string, StateFilingInfo> = {
  TX: {
    name: 'Texas',
    abbreviation: 'TX',
    sol: { personalInjury: '2 years', propertyDamage: '2 years' },
    eFilingSystem: {
      name: 'eFileTexas',
      url: 'https://www.efiletexas.gov',
      mandatory: true,
      mandatoryNote:
        'Mandatory for attorneys; optional for self-represented litigants',
    },
    filingMethods: ['e-file', 'in-person', 'mail'],
    feeWaiverForm:
      'Statement of Inability to Afford Payment of Court Costs',
    feeWaiverRule: 'Texas Rules of Civil Procedure, Rule 145',
    courtSelectionGuide:
      'File in the county where the accident occurred or where the defendant lives. Justice Court handles claims up to $20,000. County Court handles claims from $200 to $325,000. District Court handles claims over $325,000.',
    courts: {
      jp: {
        label: 'Justice of the Peace Court',
        feeRange: '$75 – $200',
        filingSteps: [
          'Go to efiletexas.gov and select a certified Electronic Filing Service Provider (EFSP).',
          'Click "Select Location" and choose your county and Justice Court.',
          'Select case category "Civil" and case type (e.g., "Injury/Damage - Motor Vehicle").',
          'Enter plaintiff and defendant information.',
          'Upload your petition as a text-searchable PDF. Redact any sensitive data (SSN, DOB).',
          'Pay the filing fee by credit/debit card, or upload your Statement of Inability to Afford Payment.',
          'Review and submit. You will receive email confirmation when the clerk accepts your filing.',
        ],
      },
      county: {
        label: 'County Court at Law',
        feeRange: '$250 – $350',
        filingSteps: [
          'Go to efiletexas.gov and select a certified Electronic Filing Service Provider (EFSP).',
          'Click "Select Location" and choose your county and County Court at Law.',
          'Select case category "Civil" and case type (e.g., "Injury/Damage - Motor Vehicle").',
          'Enter plaintiff and defendant information.',
          'Upload your petition as a text-searchable PDF. Redact any sensitive data (SSN, DOB).',
          'Pay the filing fee by credit/debit card, or upload your Statement of Inability to Afford Payment.',
          'Review and submit. You will receive email confirmation when the clerk accepts your filing.',
        ],
      },
      district: {
        label: 'District Court',
        feeRange: '$250 – $400',
        filingSteps: [
          'Go to efiletexas.gov and select a certified Electronic Filing Service Provider (EFSP).',
          'Click "Select Location" and choose your county and District Court.',
          'Select case category "Civil" and case type (e.g., "Injury/Damage - Motor Vehicle").',
          'Enter plaintiff and defendant information.',
          'Upload your petition as a text-searchable PDF. Redact any sensitive data (SSN, DOB).',
          'Pay the filing fee by credit/debit card, or upload your Statement of Inability to Afford Payment.',
          'Review and submit. You will receive email confirmation when the clerk accepts your filing.',
        ],
      },
      federal: {
        label: 'Federal District Court',
        feeRange: '$405',
        filingSteps: [
          'Go to the CM/ECF (PACER) system for your federal district court.',
          'Register for a PACER account if you do not have one.',
          'Log in and select "Civil" to file a new civil case.',
          'Enter case information, including jurisdiction basis (diversity or federal question).',
          'Enter plaintiff and defendant information.',
          'Upload your complaint, civil cover sheet (JS-44), and summons.',
          'Pay the $405 filing fee online, or upload a motion to proceed In Forma Pauperis (IFP).',
          'Submit and note your assigned case number.',
        ],
      },
    },
  },

  CA: {
    name: 'California',
    abbreviation: 'CA',
    sol: {
      personalInjury: '2 years',
      propertyDamage: '3 years',
      note: 'Claims against government agencies require filing a government tort claim within 6 months of the incident.',
    },
    eFilingSystem: {
      name: 'Odyssey eFileCA',
      url: 'https://www.odysseyefileca.com',
      mandatory: true,
      mandatoryNote:
        'Mandatory for attorneys in most counties; self-represented parties are exempt',
    },
    filingMethods: ['e-file', 'in-person', 'mail'],
    feeWaiverForm: 'Request to Waive Court Fees (Form FW-001)',
    feeWaiverRule: 'California Government Code 68631-68636',
    courtSelectionGuide:
      'File in the county where the incident occurred or where the defendant resides. Small Claims handles up to $12,500. Limited Civil handles up to $35,000. Unlimited Civil handles over $35,000.',
    courts: {
      small_claims: {
        label: 'Small Claims Court',
        feeRange: '$30 – $100',
        filingSteps: [
          "Visit your local Superior Court clerk's office or court website.",
          "Complete the Plaintiff's Claim and ORDER to Go to Small Claims Court (Form SC-100).",
          'File the form with the clerk and pay the filing fee.',
          'The clerk will set a hearing date.',
          'You must arrange to have the defendant served with a copy of your claim.',
        ],
        specialRequirements:
          'Attorneys cannot represent parties in small claims court. You must represent yourself.',
      },
      limited_civil: {
        label: 'Limited Civil Court',
        feeRange: '$225 – $370',
        filingSteps: [
          'Select an EFSP from the approved list at odysseyefileca.com.',
          'Create an account with the chosen EFSP.',
          'Select the appropriate Superior Court (by county) and case category "Personal Injury."',
          'Select "Initiate New Case" and enter case type.',
          'Add all plaintiff and defendant information.',
          'Upload your Complaint, Civil Case Cover Sheet (Form CM-010), and Summons (Form SUM-100) as PDFs.',
          'Pay the filing fee or attach Form FW-001 for a fee waiver.',
          'Review and submit. The court processes filings within two business days.',
        ],
      },
      unlimited_civil: {
        label: 'Unlimited Civil Court',
        feeRange: '$435',
        filingSteps: [
          'Select an EFSP from the approved list at odysseyefileca.com.',
          'Create an account with the chosen EFSP.',
          'Select the appropriate Superior Court (by county) and case category "Personal Injury."',
          'Select "Initiate New Case" and enter case type.',
          'Add all plaintiff and defendant information.',
          'Upload your Complaint, Civil Case Cover Sheet (Form CM-010), and Summons (Form SUM-100) as PDFs.',
          'Pay the filing fee or attach Form FW-001 for a fee waiver.',
          'Review and submit. The court processes filings within two business days.',
        ],
      },
      federal: {
        label: 'Federal District Court',
        feeRange: '$405',
        filingSteps: [
          'Go to the CM/ECF (PACER) system for your federal district court.',
          'Register for a PACER account if you do not have one.',
          'Log in and select "Civil" to file a new civil case.',
          'Enter case information, including jurisdiction basis (diversity or federal question).',
          'Enter plaintiff and defendant information.',
          'Upload your complaint, civil cover sheet (JS-44), and summons.',
          'Pay the $405 filing fee online, or upload a motion to proceed In Forma Pauperis (IFP).',
          'Submit and note your assigned case number.',
        ],
      },
    },
  },

  NY: {
    name: 'New York',
    abbreviation: 'NY',
    sol: {
      personalInjury: '3 years',
      propertyDamage: '3 years',
      note: 'Claims against municipalities require a Notice of Claim within 90 days of the incident.',
    },
    eFilingSystem: {
      name: 'NYSCEF',
      url: 'https://iapps.courts.state.ny.us/nyscef/HomePage',
      mandatory: true,
      mandatoryNote:
        'Mandatory in Supreme Court in certain counties; voluntary in other participating courts',
    },
    filingMethods: ['e-file', 'in-person', 'mail'],
    feeWaiverForm: 'Affidavit/Application to Proceed as a Poor Person',
    feeWaiverRule: 'CPLR Article 11, Section 1101',
    courtSelectionGuide:
      'File in the county where the incident occurred or where the defendant resides. Small Claims handles up to $10,000 (NYC) or $5,000 (outside NYC). NYC Civil Court handles up to $50,000. Supreme Court handles cases of any amount (typically over $50,000).',
    courts: {
      ny_small_claims: {
        label: 'Small Claims Court',
        feeRange: '$15 – $20',
        filingSteps: [
          "Visit the clerk's office of the Small Claims Court in the county where the defendant resides or does business.",
          'Complete the small claims filing form with case details.',
          'Pay the filing fee ($15 for claims up to $1,000; $20 for $1,001-$10,000).',
          'The clerk will schedule a hearing date (usually evening sessions).',
          'You will be given information about serving the defendant.',
        ],
        specialRequirements:
          'Corporations and partnerships must be represented by an employee, officer, or attorney. No jury trials in small claims.',
      },
      ny_civil: {
        label: 'NYC Civil Court',
        feeRange: '$45',
        filingSteps: [
          "Visit the Civil Court Clerk's office in the county (borough) where the defendant resides or where the claim arose.",
          'File your Summons and Complaint (or Summons with Notice) with the clerk.',
          'Pay the filing fee ($45 for non-consumer actions).',
          'Purchase an index number if required.',
          'Arrange for service of process on the defendant.',
        ],
      },
      ny_supreme: {
        label: 'Supreme Court',
        feeRange: '$305',
        filingSteps: [
          'Go to NYSCEF (iapps.courts.state.ny.us/nyscef) and register or log in.',
          'Click "Start a New Case."',
          'Select the county and case type (e.g., "Torts - Personal Injury").',
          'Enter all plaintiff and defendant details.',
          'Upload your Summons and Complaint as a PDF.',
          'Pay the filing fee ($210 index number + $95 RJI fee = $305) via credit card.',
          'Serve a "Notice Regarding Availability of Electronic Filing" on all defendants along with your papers.',
          'The system will generate a confirmation number and file-stamped copies.',
        ],
      },
      federal: {
        label: 'Federal District Court',
        feeRange: '$405',
        filingSteps: [
          'Go to the CM/ECF (PACER) system for your federal district court (SDNY, EDNY, NDNY, or WDNY).',
          'Register for a PACER account if you do not have one.',
          'Log in and select "Civil" to file a new civil case.',
          'Enter case information, including jurisdiction basis (diversity or federal question).',
          'Enter plaintiff and defendant information.',
          'Upload your complaint, civil cover sheet (JS-44), and summons.',
          'Pay the $405 filing fee online, or upload a motion to proceed In Forma Pauperis (IFP).',
          'Submit and note your assigned case number.',
        ],
      },
    },
  },

  FL: {
    name: 'Florida',
    abbreviation: 'FL',
    sol: {
      personalInjury: '2 years',
      propertyDamage: '4 years',
      note: 'For injuries before March 24, 2023, the personal injury SOL was 4 years. The 2023 tort reform (HB 837) reduced it to 2 years.',
    },
    eFilingSystem: {
      name: 'Florida Courts E-Filing Portal',
      url: 'https://www.myflcourtaccess.com',
      mandatory: true,
      mandatoryNote:
        'Mandatory for attorneys; optional for self-represented litigants',
    },
    filingMethods: ['e-file', 'in-person', 'mail'],
    feeWaiverForm:
      'Application for Determination of Civil Indigent Status',
    feeWaiverRule: 'Florida Statute 57.082',
    courtSelectionGuide:
      'File in the county where the incident occurred or where the defendant resides. Small Claims handles up to $8,000. County Court handles up to $50,000. Circuit Court handles over $50,000.',
    courts: {
      fl_small_claims: {
        label: 'Small Claims Court',
        feeRange: '$55 – $295',
        filingSteps: [
          'Go to myflcourtaccess.com and register or log in.',
          'Click "FILE NOW" and select your county.',
          'Select "New Case" and choose "County Civil - Small Claims" division.',
          'Select the appropriate case type (e.g., "Negligence - Auto").',
          'Enter plaintiff and defendant information.',
          'Upload your Statement of Claim as a PDF.',
          'Pay the filing fee (graduated: $55 for up to $500, $170 for $501-$2,500, $295 for $2,501-$8,000).',
          'Submit and await email confirmation from the clerk.',
        ],
      },
      fl_county: {
        label: 'County Court',
        feeRange: '$295 – $395',
        filingSteps: [
          'Go to myflcourtaccess.com and register or log in.',
          'Click "FILE NOW" and select your county.',
          'Select "New Case" and choose "County Civil" division.',
          'Select case type (e.g., "Negligence - Auto," "Personal Injury").',
          'Enter plaintiff and defendant information.',
          'Upload your Complaint as a PDF (300 DPI for scanned documents).',
          'Pay the filing fee by credit/debit card or ACH.',
          'Submit and await email confirmation.',
        ],
      },
      fl_circuit: {
        label: 'Circuit Court',
        feeRange: '$395 – $1,900',
        filingSteps: [
          'Go to myflcourtaccess.com and register or log in.',
          'Click "FILE NOW" and select your county.',
          'Select "New Case" and choose "Circuit Civil" division.',
          'Select case type (e.g., "Negligence - Auto," "Personal Injury").',
          'Enter plaintiff and defendant information.',
          'Upload your Complaint as a PDF (300 DPI for scanned documents).',
          'Pay the filing fee ($395 for up to $50k, $900 for $50k-$250k, $1,900 for over $250k).',
          'Submit and await email confirmation.',
        ],
        specialRequirements:
          'Filing fees are graduated based on the amount claimed. A credit card convenience fee of approximately 4% applies.',
      },
      federal: {
        label: 'Federal District Court',
        feeRange: '$405',
        filingSteps: [
          'Go to the CM/ECF (PACER) system for your federal district court (SDFL, MDFL, or NDFL).',
          'Register for a PACER account if you do not have one.',
          'Log in and select "Civil" to file a new civil case.',
          'Enter case information, including jurisdiction basis (diversity or federal question).',
          'Enter plaintiff and defendant information.',
          'Upload your complaint, civil cover sheet (JS-44), and summons.',
          'Pay the $405 filing fee online, or upload a motion to proceed In Forma Pauperis (IFP).',
          'Submit and note your assigned case number.',
        ],
      },
    },
  },

  PA: {
    name: 'Pennsylvania',
    abbreviation: 'PA',
    sol: {
      personalInjury: '2 years',
      propertyDamage: '4 years',
      note: 'Claims against government entities require written notice within 6 months of the injury.',
    },
    eFilingSystem: {
      name: 'PACFile',
      url: 'https://ujsportal.pacourts.us/PACFile/Overview',
      mandatory: false,
      mandatoryNote:
        'Mandatory in some counties for certain case types; voluntary in most others',
    },
    filingMethods: ['e-file', 'in-person', 'mail'],
    feeWaiverForm: 'Petition to Proceed In Forma Pauperis',
    feeWaiverRule: 'Pennsylvania Rules of Civil Procedure, Rule 240',
    courtSelectionGuide:
      'File in the county where the incident occurred or where the defendant resides. Magisterial District Court handles claims up to $12,000. Court of Common Pleas handles claims over $12,000.',
    courts: {
      pa_magisterial: {
        label: 'Magisterial District Court',
        feeRange: '$53 – $128',
        filingSteps: [
          "Visit the Magisterial District Judge's office in the jurisdiction where the defendant resides or where the incident occurred.",
          'Complete the civil complaint form provided by the office.',
          'Pay the filing fee (graduated based on amount claimed).',
          "The Magisterial District Judge's office will schedule a hearing.",
          'The defendant will be served by mail or constable.',
        ],
        specialRequirements:
          'PACFile does NOT cover Magisterial District Courts. Filings must be done in-person or by mail.',
      },
      pa_common_pleas: {
        label: 'Court of Common Pleas',
        feeRange: '$130 – $350',
        filingSteps: [
          'Go to PACFile (ujsportal.pacourts.us/PACFile) and register or log in.',
          "Verify that your county's Court of Common Pleas accepts PACFile submissions.",
          'Select "New Case" and choose "Civil Action - Trespass" for personal injury cases.',
          'Enter all plaintiff and defendant information.',
          'Upload your Complaint, Civil Cover Sheet, and any other required documents as PDFs.',
          'Pay the filing fee by credit/debit card.',
          'If filing IFP, upload your Petition to Proceed In Forma Pauperis and supporting Affidavit.',
          'Submit and receive electronic confirmation.',
        ],
      },
      federal: {
        label: 'Federal District Court',
        feeRange: '$405',
        filingSteps: [
          'Go to the CM/ECF (PACER) system for your federal district court (EDPA, MDPA, or WDPA).',
          'Register for a PACER account if you do not have one.',
          'Log in and select "Civil" to file a new civil case.',
          'Enter case information, including jurisdiction basis (diversity or federal question).',
          'Enter plaintiff and defendant information.',
          'Upload your complaint, civil cover sheet (JS-44), and summons.',
          'Pay the $405 filing fee online, or upload a motion to proceed In Forma Pauperis (IFP).',
          'Submit and note your assigned case number.',
        ],
      },
    },
  },

  // --- Tier 2 States ---

  AL: {
    name: 'Alabama',
    abbreviation: 'AL',
    sol: { personalInjury: '2 years', propertyDamage: '6 years' },
    filingMethods: ['in-person', 'mail', 'e-file (check local court)'],
    feeWaiverForm: 'Petition/Application to Proceed In Forma Pauperis',
    courtSelectionGuide:
      'File in the county where the incident occurred or where the defendant resides. Contact your local court clerk for specific jurisdiction rules and filing fees.',
    courts: {},
  },

  AK: {
    name: 'Alaska',
    abbreviation: 'AK',
    sol: { personalInjury: '2 years', propertyDamage: '6 years' },
    filingMethods: ['in-person', 'mail', 'e-file (check local court)'],
    feeWaiverForm: 'Petition/Application to Proceed In Forma Pauperis',
    courtSelectionGuide:
      'File in the county where the incident occurred or where the defendant resides. Contact your local court clerk for specific jurisdiction rules and filing fees.',
    courts: {},
  },

  AZ: {
    name: 'Arizona',
    abbreviation: 'AZ',
    sol: { personalInjury: '2 years', propertyDamage: '2 years' },
    filingMethods: ['in-person', 'mail', 'e-file (check local court)'],
    feeWaiverForm: 'Petition/Application to Proceed In Forma Pauperis',
    courtSelectionGuide:
      'File in the county where the incident occurred or where the defendant resides. Contact your local court clerk for specific jurisdiction rules and filing fees.',
    courts: {},
  },

  AR: {
    name: 'Arkansas',
    abbreviation: 'AR',
    sol: { personalInjury: '3 years', propertyDamage: '3 years' },
    filingMethods: ['in-person', 'mail', 'e-file (check local court)'],
    feeWaiverForm: 'Petition/Application to Proceed In Forma Pauperis',
    courtSelectionGuide:
      'File in the county where the incident occurred or where the defendant resides. Contact your local court clerk for specific jurisdiction rules and filing fees.',
    courts: {},
  },

  CO: {
    name: 'Colorado',
    abbreviation: 'CO',
    sol: {
      personalInjury: '2 years',
      propertyDamage: '2 years',
      note: '3 years under discovery rule',
    },
    filingMethods: ['in-person', 'mail', 'e-file (check local court)'],
    feeWaiverForm: 'Petition/Application to Proceed In Forma Pauperis',
    courtSelectionGuide:
      'File in the county where the incident occurred or where the defendant resides. Contact your local court clerk for specific jurisdiction rules and filing fees.',
    courts: {},
  },

  CT: {
    name: 'Connecticut',
    abbreviation: 'CT',
    sol: { personalInjury: '2 years', propertyDamage: '2 years' },
    filingMethods: ['in-person', 'mail', 'e-file (check local court)'],
    feeWaiverForm: 'Petition/Application to Proceed In Forma Pauperis',
    courtSelectionGuide:
      'File in the county where the incident occurred or where the defendant resides. Contact your local court clerk for specific jurisdiction rules and filing fees.',
    courts: {},
  },

  DC: {
    name: 'District of Columbia',
    abbreviation: 'DC',
    sol: { personalInjury: '3 years', propertyDamage: '3 years' },
    filingMethods: ['in-person', 'mail', 'e-file (check local court)'],
    feeWaiverForm: 'Petition/Application to Proceed In Forma Pauperis',
    courtSelectionGuide:
      'File in the county where the incident occurred or where the defendant resides. Contact your local court clerk for specific jurisdiction rules and filing fees.',
    courts: {},
  },

  DE: {
    name: 'Delaware',
    abbreviation: 'DE',
    sol: { personalInjury: '2 years', propertyDamage: '2 years' },
    filingMethods: ['in-person', 'mail', 'e-file (check local court)'],
    feeWaiverForm: 'Petition/Application to Proceed In Forma Pauperis',
    courtSelectionGuide:
      'File in the county where the incident occurred or where the defendant resides. Contact your local court clerk for specific jurisdiction rules and filing fees.',
    courts: {},
  },

  GA: {
    name: 'Georgia',
    abbreviation: 'GA',
    sol: { personalInjury: '2 years', propertyDamage: '4 years' },
    filingMethods: ['in-person', 'mail', 'e-file (check local court)'],
    feeWaiverForm: 'Petition/Application to Proceed In Forma Pauperis',
    courtSelectionGuide:
      'File in the county where the incident occurred or where the defendant resides. Contact your local court clerk for specific jurisdiction rules and filing fees.',
    courts: {},
  },

  HI: {
    name: 'Hawaii',
    abbreviation: 'HI',
    sol: { personalInjury: '2 years', propertyDamage: '2 years' },
    filingMethods: ['in-person', 'mail', 'e-file (check local court)'],
    feeWaiverForm: 'Petition/Application to Proceed In Forma Pauperis',
    courtSelectionGuide:
      'File in the county where the incident occurred or where the defendant resides. Contact your local court clerk for specific jurisdiction rules and filing fees.',
    courts: {},
  },

  ID: {
    name: 'Idaho',
    abbreviation: 'ID',
    sol: { personalInjury: '2 years', propertyDamage: '3 years' },
    filingMethods: ['in-person', 'mail', 'e-file (check local court)'],
    feeWaiverForm: 'Petition/Application to Proceed In Forma Pauperis',
    courtSelectionGuide:
      'File in the county where the incident occurred or where the defendant resides. Contact your local court clerk for specific jurisdiction rules and filing fees.',
    courts: {},
  },

  IL: {
    name: 'Illinois',
    abbreviation: 'IL',
    sol: { personalInjury: '2 years', propertyDamage: '5 years' },
    filingMethods: ['in-person', 'mail', 'e-file (check local court)'],
    feeWaiverForm: 'Petition/Application to Proceed In Forma Pauperis',
    courtSelectionGuide:
      'File in the county where the incident occurred or where the defendant resides. Contact your local court clerk for specific jurisdiction rules and filing fees.',
    courts: {},
  },

  IN: {
    name: 'Indiana',
    abbreviation: 'IN',
    sol: { personalInjury: '2 years', propertyDamage: '6 years' },
    filingMethods: ['in-person', 'mail', 'e-file (check local court)'],
    feeWaiverForm: 'Petition/Application to Proceed In Forma Pauperis',
    courtSelectionGuide:
      'File in the county where the incident occurred or where the defendant resides. Contact your local court clerk for specific jurisdiction rules and filing fees.',
    courts: {},
  },

  IA: {
    name: 'Iowa',
    abbreviation: 'IA',
    sol: { personalInjury: '2 years', propertyDamage: '5 years' },
    filingMethods: ['in-person', 'mail', 'e-file (check local court)'],
    feeWaiverForm: 'Petition/Application to Proceed In Forma Pauperis',
    courtSelectionGuide:
      'File in the county where the incident occurred or where the defendant resides. Contact your local court clerk for specific jurisdiction rules and filing fees.',
    courts: {},
  },

  KS: {
    name: 'Kansas',
    abbreviation: 'KS',
    sol: { personalInjury: '2 years', propertyDamage: '2 years' },
    filingMethods: ['in-person', 'mail', 'e-file (check local court)'],
    feeWaiverForm: 'Petition/Application to Proceed In Forma Pauperis',
    courtSelectionGuide:
      'File in the county where the incident occurred or where the defendant resides. Contact your local court clerk for specific jurisdiction rules and filing fees.',
    courts: {},
  },

  KY: {
    name: 'Kentucky',
    abbreviation: 'KY',
    sol: { personalInjury: '1 year', propertyDamage: '5 years' },
    filingMethods: ['in-person', 'mail', 'e-file (check local court)'],
    feeWaiverForm: 'Petition/Application to Proceed In Forma Pauperis',
    courtSelectionGuide:
      'File in the county where the incident occurred or where the defendant resides. Contact your local court clerk for specific jurisdiction rules and filing fees.',
    courts: {},
  },

  LA: {
    name: 'Louisiana',
    abbreviation: 'LA',
    sol: { personalInjury: '1 year', propertyDamage: '1 year' },
    filingMethods: ['in-person', 'mail', 'e-file (check local court)'],
    feeWaiverForm: 'Petition/Application to Proceed In Forma Pauperis',
    courtSelectionGuide:
      'File in the county where the incident occurred or where the defendant resides. Contact your local court clerk for specific jurisdiction rules and filing fees.',
    courts: {},
  },

  ME: {
    name: 'Maine',
    abbreviation: 'ME',
    sol: { personalInjury: '6 years', propertyDamage: '6 years' },
    filingMethods: ['in-person', 'mail', 'e-file (check local court)'],
    feeWaiverForm: 'Petition/Application to Proceed In Forma Pauperis',
    courtSelectionGuide:
      'File in the county where the incident occurred or where the defendant resides. Contact your local court clerk for specific jurisdiction rules and filing fees.',
    courts: {},
  },

  MD: {
    name: 'Maryland',
    abbreviation: 'MD',
    sol: { personalInjury: '3 years', propertyDamage: '3 years' },
    filingMethods: ['in-person', 'mail', 'e-file (check local court)'],
    feeWaiverForm: 'Petition/Application to Proceed In Forma Pauperis',
    courtSelectionGuide:
      'File in the county where the incident occurred or where the defendant resides. Contact your local court clerk for specific jurisdiction rules and filing fees.',
    courts: {},
  },

  MA: {
    name: 'Massachusetts',
    abbreviation: 'MA',
    sol: { personalInjury: '3 years', propertyDamage: '3 years' },
    filingMethods: ['in-person', 'mail', 'e-file (check local court)'],
    feeWaiverForm: 'Petition/Application to Proceed In Forma Pauperis',
    courtSelectionGuide:
      'File in the county where the incident occurred or where the defendant resides. Contact your local court clerk for specific jurisdiction rules and filing fees.',
    courts: {},
  },

  MI: {
    name: 'Michigan',
    abbreviation: 'MI',
    sol: { personalInjury: '3 years', propertyDamage: '3 years' },
    filingMethods: ['in-person', 'mail', 'e-file (check local court)'],
    feeWaiverForm: 'Petition/Application to Proceed In Forma Pauperis',
    courtSelectionGuide:
      'File in the county where the incident occurred or where the defendant resides. Contact your local court clerk for specific jurisdiction rules and filing fees.',
    courts: {},
  },

  MN: {
    name: 'Minnesota',
    abbreviation: 'MN',
    sol: { personalInjury: '6 years', propertyDamage: '6 years' },
    filingMethods: ['in-person', 'mail', 'e-file (check local court)'],
    feeWaiverForm: 'Petition/Application to Proceed In Forma Pauperis',
    courtSelectionGuide:
      'File in the county where the incident occurred or where the defendant resides. Contact your local court clerk for specific jurisdiction rules and filing fees.',
    courts: {},
  },

  MS: {
    name: 'Mississippi',
    abbreviation: 'MS',
    sol: { personalInjury: '3 years', propertyDamage: '3 years' },
    filingMethods: ['in-person', 'mail', 'e-file (check local court)'],
    feeWaiverForm: 'Petition/Application to Proceed In Forma Pauperis',
    courtSelectionGuide:
      'File in the county where the incident occurred or where the defendant resides. Contact your local court clerk for specific jurisdiction rules and filing fees.',
    courts: {},
  },

  MO: {
    name: 'Missouri',
    abbreviation: 'MO',
    sol: { personalInjury: '5 years', propertyDamage: '5 years' },
    filingMethods: ['in-person', 'mail', 'e-file (check local court)'],
    feeWaiverForm: 'Petition/Application to Proceed In Forma Pauperis',
    courtSelectionGuide:
      'File in the county where the incident occurred or where the defendant resides. Contact your local court clerk for specific jurisdiction rules and filing fees.',
    courts: {},
  },

  MT: {
    name: 'Montana',
    abbreviation: 'MT',
    sol: { personalInjury: '3 years', propertyDamage: '2 years' },
    filingMethods: ['in-person', 'mail', 'e-file (check local court)'],
    feeWaiverForm: 'Petition/Application to Proceed In Forma Pauperis',
    courtSelectionGuide:
      'File in the county where the incident occurred or where the defendant resides. Contact your local court clerk for specific jurisdiction rules and filing fees.',
    courts: {},
  },

  NE: {
    name: 'Nebraska',
    abbreviation: 'NE',
    sol: { personalInjury: '4 years', propertyDamage: '4 years' },
    filingMethods: ['in-person', 'mail', 'e-file (check local court)'],
    feeWaiverForm: 'Petition/Application to Proceed In Forma Pauperis',
    courtSelectionGuide:
      'File in the county where the incident occurred or where the defendant resides. Contact your local court clerk for specific jurisdiction rules and filing fees.',
    courts: {},
  },

  NV: {
    name: 'Nevada',
    abbreviation: 'NV',
    sol: { personalInjury: '2 years', propertyDamage: '3 years' },
    filingMethods: ['in-person', 'mail', 'e-file (check local court)'],
    feeWaiverForm: 'Petition/Application to Proceed In Forma Pauperis',
    courtSelectionGuide:
      'File in the county where the incident occurred or where the defendant resides. Contact your local court clerk for specific jurisdiction rules and filing fees.',
    courts: {},
  },

  NH: {
    name: 'New Hampshire',
    abbreviation: 'NH',
    sol: { personalInjury: '3 years', propertyDamage: '3 years' },
    filingMethods: ['in-person', 'mail', 'e-file (check local court)'],
    feeWaiverForm: 'Petition/Application to Proceed In Forma Pauperis',
    courtSelectionGuide:
      'File in the county where the incident occurred or where the defendant resides. Contact your local court clerk for specific jurisdiction rules and filing fees.',
    courts: {},
  },

  NJ: {
    name: 'New Jersey',
    abbreviation: 'NJ',
    sol: { personalInjury: '2 years', propertyDamage: '6 years' },
    filingMethods: ['in-person', 'mail', 'e-file (check local court)'],
    feeWaiverForm: 'Petition/Application to Proceed In Forma Pauperis',
    courtSelectionGuide:
      'File in the county where the incident occurred or where the defendant resides. Contact your local court clerk for specific jurisdiction rules and filing fees.',
    courts: {},
  },

  NM: {
    name: 'New Mexico',
    abbreviation: 'NM',
    sol: { personalInjury: '3 years', propertyDamage: '4 years' },
    filingMethods: ['in-person', 'mail', 'e-file (check local court)'],
    feeWaiverForm: 'Petition/Application to Proceed In Forma Pauperis',
    courtSelectionGuide:
      'File in the county where the incident occurred or where the defendant resides. Contact your local court clerk for specific jurisdiction rules and filing fees.',
    courts: {},
  },

  NC: {
    name: 'North Carolina',
    abbreviation: 'NC',
    sol: { personalInjury: '3 years', propertyDamage: '3 years' },
    filingMethods: ['in-person', 'mail', 'e-file (check local court)'],
    feeWaiverForm: 'Petition/Application to Proceed In Forma Pauperis',
    courtSelectionGuide:
      'File in the county where the incident occurred or where the defendant resides. Contact your local court clerk for specific jurisdiction rules and filing fees.',
    courts: {},
  },

  ND: {
    name: 'North Dakota',
    abbreviation: 'ND',
    sol: { personalInjury: '6 years', propertyDamage: '6 years' },
    filingMethods: ['in-person', 'mail', 'e-file (check local court)'],
    feeWaiverForm: 'Petition/Application to Proceed In Forma Pauperis',
    courtSelectionGuide:
      'File in the county where the incident occurred or where the defendant resides. Contact your local court clerk for specific jurisdiction rules and filing fees.',
    courts: {},
  },

  OH: {
    name: 'Ohio',
    abbreviation: 'OH',
    sol: { personalInjury: '2 years', propertyDamage: '4 years' },
    filingMethods: ['in-person', 'mail', 'e-file (check local court)'],
    feeWaiverForm: 'Petition/Application to Proceed In Forma Pauperis',
    courtSelectionGuide:
      'File in the county where the incident occurred or where the defendant resides. Contact your local court clerk for specific jurisdiction rules and filing fees.',
    courts: {},
  },

  OK: {
    name: 'Oklahoma',
    abbreviation: 'OK',
    sol: { personalInjury: '2 years', propertyDamage: '2 years' },
    filingMethods: ['in-person', 'mail', 'e-file (check local court)'],
    feeWaiverForm: 'Petition/Application to Proceed In Forma Pauperis',
    courtSelectionGuide:
      'File in the county where the incident occurred or where the defendant resides. Contact your local court clerk for specific jurisdiction rules and filing fees.',
    courts: {},
  },

  OR: {
    name: 'Oregon',
    abbreviation: 'OR',
    sol: { personalInjury: '2 years', propertyDamage: '6 years' },
    filingMethods: ['in-person', 'mail', 'e-file (check local court)'],
    feeWaiverForm: 'Petition/Application to Proceed In Forma Pauperis',
    courtSelectionGuide:
      'File in the county where the incident occurred or where the defendant resides. Contact your local court clerk for specific jurisdiction rules and filing fees.',
    courts: {},
  },

  RI: {
    name: 'Rhode Island',
    abbreviation: 'RI',
    sol: { personalInjury: '3 years', propertyDamage: '10 years' },
    filingMethods: ['in-person', 'mail', 'e-file (check local court)'],
    feeWaiverForm: 'Petition/Application to Proceed In Forma Pauperis',
    courtSelectionGuide:
      'File in the county where the incident occurred or where the defendant resides. Contact your local court clerk for specific jurisdiction rules and filing fees.',
    courts: {},
  },

  SC: {
    name: 'South Carolina',
    abbreviation: 'SC',
    sol: { personalInjury: '3 years', propertyDamage: '3 years' },
    filingMethods: ['in-person', 'mail', 'e-file (check local court)'],
    feeWaiverForm: 'Petition/Application to Proceed In Forma Pauperis',
    courtSelectionGuide:
      'File in the county where the incident occurred or where the defendant resides. Contact your local court clerk for specific jurisdiction rules and filing fees.',
    courts: {},
  },

  SD: {
    name: 'South Dakota',
    abbreviation: 'SD',
    sol: { personalInjury: '3 years', propertyDamage: '6 years' },
    filingMethods: ['in-person', 'mail', 'e-file (check local court)'],
    feeWaiverForm: 'Petition/Application to Proceed In Forma Pauperis',
    courtSelectionGuide:
      'File in the county where the incident occurred or where the defendant resides. Contact your local court clerk for specific jurisdiction rules and filing fees.',
    courts: {},
  },

  TN: {
    name: 'Tennessee',
    abbreviation: 'TN',
    sol: { personalInjury: '1 year', propertyDamage: '3 years' },
    filingMethods: ['in-person', 'mail', 'e-file (check local court)'],
    feeWaiverForm: 'Petition/Application to Proceed In Forma Pauperis',
    courtSelectionGuide:
      'File in the county where the incident occurred or where the defendant resides. Contact your local court clerk for specific jurisdiction rules and filing fees.',
    courts: {},
  },

  UT: {
    name: 'Utah',
    abbreviation: 'UT',
    sol: { personalInjury: '4 years', propertyDamage: '3 years' },
    filingMethods: ['in-person', 'mail', 'e-file (check local court)'],
    feeWaiverForm: 'Petition/Application to Proceed In Forma Pauperis',
    courtSelectionGuide:
      'File in the county where the incident occurred or where the defendant resides. Contact your local court clerk for specific jurisdiction rules and filing fees.',
    courts: {},
  },

  VT: {
    name: 'Vermont',
    abbreviation: 'VT',
    sol: { personalInjury: '3 years', propertyDamage: '3 years' },
    filingMethods: ['in-person', 'mail', 'e-file (check local court)'],
    feeWaiverForm: 'Petition/Application to Proceed In Forma Pauperis',
    courtSelectionGuide:
      'File in the county where the incident occurred or where the defendant resides. Contact your local court clerk for specific jurisdiction rules and filing fees.',
    courts: {},
  },

  VA: {
    name: 'Virginia',
    abbreviation: 'VA',
    sol: { personalInjury: '2 years', propertyDamage: '5 years' },
    filingMethods: ['in-person', 'mail', 'e-file (check local court)'],
    feeWaiverForm: 'Petition/Application to Proceed In Forma Pauperis',
    courtSelectionGuide:
      'File in the county where the incident occurred or where the defendant resides. Contact your local court clerk for specific jurisdiction rules and filing fees.',
    courts: {},
  },

  WA: {
    name: 'Washington',
    abbreviation: 'WA',
    sol: { personalInjury: '3 years', propertyDamage: '3 years' },
    filingMethods: ['in-person', 'mail', 'e-file (check local court)'],
    feeWaiverForm: 'Petition/Application to Proceed In Forma Pauperis',
    courtSelectionGuide:
      'File in the county where the incident occurred or where the defendant resides. Contact your local court clerk for specific jurisdiction rules and filing fees.',
    courts: {},
  },

  WV: {
    name: 'West Virginia',
    abbreviation: 'WV',
    sol: { personalInjury: '2 years', propertyDamage: '2 years' },
    filingMethods: ['in-person', 'mail', 'e-file (check local court)'],
    feeWaiverForm: 'Petition/Application to Proceed In Forma Pauperis',
    courtSelectionGuide:
      'File in the county where the incident occurred or where the defendant resides. Contact your local court clerk for specific jurisdiction rules and filing fees.',
    courts: {},
  },

  WI: {
    name: 'Wisconsin',
    abbreviation: 'WI',
    sol: { personalInjury: '3 years', propertyDamage: '6 years' },
    filingMethods: ['in-person', 'mail', 'e-file (check local court)'],
    feeWaiverForm: 'Petition/Application to Proceed In Forma Pauperis',
    courtSelectionGuide:
      'File in the county where the incident occurred or where the defendant resides. Contact your local court clerk for specific jurisdiction rules and filing fees.',
    courts: {},
  },

  WY: {
    name: 'Wyoming',
    abbreviation: 'WY',
    sol: { personalInjury: '4 years', propertyDamage: '4 years' },
    filingMethods: ['in-person', 'mail', 'e-file (check local court)'],
    feeWaiverForm: 'Petition/Application to Proceed In Forma Pauperis',
    courtSelectionGuide:
      'File in the county where the incident occurred or where the defendant resides. Contact your local court clerk for specific jurisdiction rules and filing fees.',
    courts: {},
  },
};
