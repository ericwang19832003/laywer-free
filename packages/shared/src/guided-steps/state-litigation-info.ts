/**
 * State-specific litigation data for small claims, contract, and landlord-tenant
 * guided step configs. Covers the five supported states: TX, CA, NY, FL, PA.
 */

export interface SmallClaimsStateInfo {
  courtName: string
  courtAbbrev: string
  limit: string
  limitNumber: number
  upperCourtName: string
  eFilingUrl: string
  eFilingName: string
  helpSiteUrl: string
  helpSiteName: string
  appealDeadlineEviction: string
  appealDeadlineOther: string
  wageGarnishmentAllowed: boolean
  judgmentInterestRate: string
  judgmentInterestCitation: string
  sosUrl: string
  sosName: string
  sosStatute: string
  feeWaiverForm: string
}

export interface ContractStateInfo {
  solWritten: string
  solOral: string
  solCitation: string
  answerDeadline: string
  jpCourtName: string
  jpCourtLimit: string
  jpCourtLimitNumber: number
  midCourtName: string
  midCourtRange: string
  highCourtName: string
  eFilingUrl: string
  eFilingName: string
  helpSiteUrl: string
  helpSiteName: string
  feeWaiverForm: string
  sosUrl: string
  sosName: string
  sosStatute: string
}

export interface LandlordTenantStateInfo {
  repairStatute: string
  repairStatuteShort: string
  evictionNoticeStatute: string
  evictionNoticeStatuteShort: string
  retaliationStatute: string
  retaliationStatuteShort: string
  civilRightsDivision: string
  noticeDefaultDays: string
}

export interface StateLitigationInfo {
  smallClaims: SmallClaimsStateInfo
  contract: ContractStateInfo
  landlordTenant: LandlordTenantStateInfo
}

export const STATE_LIT_INFO: Record<string, StateLitigationInfo> = {
  TX: {
    smallClaims: {
      courtName: 'Justice of the Peace (JP) Court',
      courtAbbrev: 'JP Court',
      limit: '$20,000',
      limitNumber: 20000,
      upperCourtName: 'County Court at Law',
      eFilingUrl: 'efiletexas.gov',
      eFilingName: 'eFileTexas',
      helpSiteUrl: 'texaslawhelp.org',
      helpSiteName: 'Texas Law Help',
      appealDeadlineEviction: '5 days',
      appealDeadlineOther: '21 days',
      wageGarnishmentAllowed: false,
      judgmentInterestRate: '5% per year',
      judgmentInterestCitation: 'Tex. Fin. Code §304.003',
      sosUrl: 'sos.state.tx.us',
      sosName: 'Texas Secretary of State',
      sosStatute: 'Tex. Civ. Prac. & Rem. Code §17.044',
      feeWaiverForm: 'Statement of Inability to Afford Payment of Court Costs',
    },
    contract: {
      solWritten: '4 years',
      solOral: '4 years',
      solCitation: 'Civ. Prac. & Rem. Code §16.004',
      answerDeadline: 'the first Monday after 20 days from the date of service',
      jpCourtName: 'Justice of the Peace (JP) Court',
      jpCourtLimit: '$20,000',
      jpCourtLimitNumber: 20000,
      midCourtName: 'County Court at Law',
      midCourtRange: '$20,000 to $100,000',
      highCourtName: 'District Court',
      eFilingUrl: 'efiletexas.gov',
      eFilingName: 'eFileTexas',
      helpSiteUrl: 'texaslawhelp.org',
      helpSiteName: 'Texas Law Help',
      feeWaiverForm: 'Statement of Inability to Afford Payment of Court Costs',
      sosUrl: 'sos.state.tx.us',
      sosName: 'Texas Secretary of State',
      sosStatute: 'Tex. Civ. Prac. & Rem. Code §17.044',
    },
    landlordTenant: {
      repairStatute: 'Texas Property Code § 92.052',
      repairStatuteShort: 'Tex. Prop. Code § 92.052',
      evictionNoticeStatute: 'Texas Property Code § 24.005',
      evictionNoticeStatuteShort: 'Tex. Prop. Code § 24.005',
      retaliationStatute: 'Texas Property Code § 92.331',
      retaliationStatuteShort: 'Tex. Prop. Code § 92.331',
      civilRightsDivision: 'Texas Workforce Commission Civil Rights Division',
      noticeDefaultDays: '3 days',
    },
  },

  CA: {
    smallClaims: {
      courtName: 'Small Claims Court',
      courtAbbrev: 'Small Claims Court',
      limit: '$12,500',
      limitNumber: 12500,
      upperCourtName: 'Limited Civil Court',
      eFilingUrl: 'odysseyefileca.com',
      eFilingName: 'Odyssey eFileCA',
      helpSiteUrl: 'selfhelp.courts.ca.gov',
      helpSiteName: 'California Courts Self-Help',
      appealDeadlineEviction: '30 days',
      appealDeadlineOther: '30 days',
      wageGarnishmentAllowed: true,
      judgmentInterestRate: '10% per year',
      judgmentInterestCitation: 'CCP §685.010',
      sosUrl: 'bizfileonline.sos.ca.gov',
      sosName: 'California Secretary of State',
      sosStatute: 'California Corporations Code §2110',
      feeWaiverForm: 'Request to Waive Court Fees (Form FW-001)',
    },
    contract: {
      solWritten: '4 years',
      solOral: '2 years',
      solCitation: 'CCP §337 (written), CCP §339 (oral)',
      answerDeadline: '30 days from the date of service',
      jpCourtName: 'Small Claims Court',
      jpCourtLimit: '$12,500',
      jpCourtLimitNumber: 12500,
      midCourtName: 'Limited Civil Court',
      midCourtRange: '$12,500 to $35,000',
      highCourtName: 'Unlimited Civil Court',
      eFilingUrl: 'odysseyefileca.com',
      eFilingName: 'Odyssey eFileCA',
      helpSiteUrl: 'selfhelp.courts.ca.gov',
      helpSiteName: 'California Courts Self-Help',
      feeWaiverForm: 'Request to Waive Court Fees (Form FW-001)',
      sosUrl: 'bizfileonline.sos.ca.gov',
      sosName: 'California Secretary of State',
      sosStatute: 'California Corporations Code §2110',
    },
    landlordTenant: {
      repairStatute: 'California Civil Code § 1941',
      repairStatuteShort: 'Civil Code § 1941',
      evictionNoticeStatute: 'California Code of Civil Procedure § 1161',
      evictionNoticeStatuteShort: 'CCP § 1161',
      retaliationStatute: 'California Civil Code § 1942.5',
      retaliationStatuteShort: 'Civil Code § 1942.5',
      civilRightsDivision: 'California Civil Rights Department (CRD)',
      noticeDefaultDays: '3 days',
    },
  },

  NY: {
    smallClaims: {
      courtName: 'Small Claims Court',
      courtAbbrev: 'Small Claims Court',
      limit: '$10,000 (NYC) or $5,000 (outside NYC)',
      limitNumber: 10000,
      upperCourtName: 'Civil Court',
      eFilingUrl: 'iapps.courts.state.ny.us/nyscef',
      eFilingName: 'NYSCEF',
      helpSiteUrl: 'nycourts.gov/courthelp',
      helpSiteName: 'New York Courts Self-Help',
      appealDeadlineEviction: '30 days',
      appealDeadlineOther: '30 days',
      wageGarnishmentAllowed: true,
      judgmentInterestRate: '9% per year',
      judgmentInterestCitation: 'CPLR §5004',
      sosUrl: 'apps.dos.ny.gov/corpweb',
      sosName: 'New York Department of State',
      sosStatute: 'CPLR §313 (long-arm service)',
      feeWaiverForm: 'Affidavit/Application to Proceed as a Poor Person',
    },
    contract: {
      solWritten: '6 years',
      solOral: '6 years',
      solCitation: 'CPLR §213(2)',
      answerDeadline: '20 days (personal service) or 30 days (other methods) from the date of service',
      jpCourtName: 'Small Claims Court',
      jpCourtLimit: '$10,000',
      jpCourtLimitNumber: 10000,
      midCourtName: 'Civil Court',
      midCourtRange: '$10,000 to $50,000',
      highCourtName: 'Supreme Court',
      eFilingUrl: 'iapps.courts.state.ny.us/nyscef',
      eFilingName: 'NYSCEF',
      helpSiteUrl: 'nycourts.gov/courthelp',
      helpSiteName: 'New York Courts Self-Help',
      feeWaiverForm: 'Affidavit/Application to Proceed as a Poor Person',
      sosUrl: 'apps.dos.ny.gov/corpweb',
      sosName: 'New York Department of State',
      sosStatute: 'CPLR §313 (long-arm service)',
    },
    landlordTenant: {
      repairStatute: 'New York Real Property Law § 235-b',
      repairStatuteShort: 'RPL § 235-b',
      evictionNoticeStatute: 'New York Real Property Law § 713',
      evictionNoticeStatuteShort: 'RPL § 713',
      retaliationStatute: 'New York Real Property Law § 223-b',
      retaliationStatuteShort: 'RPL § 223-b',
      civilRightsDivision: 'New York Division of Human Rights',
      noticeDefaultDays: '14 days',
    },
  },

  FL: {
    smallClaims: {
      courtName: 'Small Claims Court (County Court)',
      courtAbbrev: 'Small Claims Court',
      limit: '$8,000',
      limitNumber: 8000,
      upperCourtName: 'County Court',
      eFilingUrl: 'myflcourtaccess.com',
      eFilingName: 'Florida Courts E-Filing Portal',
      helpSiteUrl: 'flcourts.gov/resources-and-services/publications/pro-se-handbooks',
      helpSiteName: 'Florida Courts Self-Help',
      appealDeadlineEviction: '30 days',
      appealDeadlineOther: '30 days',
      wageGarnishmentAllowed: true,
      judgmentInterestRate: 'the statutory rate set annually',
      judgmentInterestCitation: 'Fla. Stat. §55.03',
      sosUrl: 'search.sunbiz.org',
      sosName: 'Florida Division of Corporations',
      sosStatute: 'Fla. Stat. §48.181 (long-arm service)',
      feeWaiverForm: 'Application for Determination of Civil Indigent Status',
    },
    contract: {
      solWritten: '5 years',
      solOral: '4 years',
      solCitation: 'Fla. Stat. §95.11(2)(b) (written), §95.11(3)(k) (oral)',
      answerDeadline: '20 days from the date of service',
      jpCourtName: 'Small Claims Court',
      jpCourtLimit: '$8,000',
      jpCourtLimitNumber: 8000,
      midCourtName: 'County Court',
      midCourtRange: '$8,000 to $50,000',
      highCourtName: 'Circuit Court',
      eFilingUrl: 'myflcourtaccess.com',
      eFilingName: 'Florida Courts E-Filing Portal',
      helpSiteUrl: 'flcourts.gov/resources-and-services/publications/pro-se-handbooks',
      helpSiteName: 'Florida Courts Self-Help',
      feeWaiverForm: 'Application for Determination of Civil Indigent Status',
      sosUrl: 'search.sunbiz.org',
      sosName: 'Florida Division of Corporations',
      sosStatute: 'Fla. Stat. §48.181 (long-arm service)',
    },
    landlordTenant: {
      repairStatute: 'Florida Statutes § 83.51',
      repairStatuteShort: 'Fla. Stat. § 83.51',
      evictionNoticeStatute: 'Florida Statutes § 83.56',
      evictionNoticeStatuteShort: 'Fla. Stat. § 83.56',
      retaliationStatute: 'Florida Statutes § 83.64',
      retaliationStatuteShort: 'Fla. Stat. § 83.64',
      civilRightsDivision: 'Florida Commission on Human Relations (FCHR)',
      noticeDefaultDays: '3 days',
    },
  },

  PA: {
    smallClaims: {
      courtName: 'Magisterial District Court',
      courtAbbrev: 'Magisterial District Court',
      limit: '$12,000',
      limitNumber: 12000,
      upperCourtName: 'Court of Common Pleas',
      eFilingUrl: 'ujsportal.pacourts.us',
      eFilingName: 'Pennsylvania Unified Judicial System',
      helpSiteUrl: 'palawhelp.org',
      helpSiteName: 'PA Law Help',
      appealDeadlineEviction: '30 days',
      appealDeadlineOther: '30 days',
      wageGarnishmentAllowed: true,
      judgmentInterestRate: 'the statutory rate set by Pennsylvania law',
      judgmentInterestCitation: '42 Pa. C.S. §8101',
      sosUrl: 'file.dos.pa.gov',
      sosName: 'Pennsylvania Department of State',
      sosStatute: '42 Pa. C.S. §5322 (long-arm service)',
      feeWaiverForm: 'In Forma Pauperis petition',
    },
    contract: {
      solWritten: '4 years',
      solOral: '4 years',
      solCitation: '42 Pa. C.S. §5525',
      answerDeadline: '20 days from the date of service',
      jpCourtName: 'Magisterial District Court',
      jpCourtLimit: '$12,000',
      jpCourtLimitNumber: 12000,
      midCourtName: 'Court of Common Pleas',
      midCourtRange: '$12,000 to $100,000',
      highCourtName: 'Court of Common Pleas',
      eFilingUrl: 'ujsportal.pacourts.us',
      eFilingName: 'Pennsylvania Unified Judicial System',
      helpSiteUrl: 'palawhelp.org',
      helpSiteName: 'PA Law Help',
      feeWaiverForm: 'In Forma Pauperis petition',
      sosUrl: 'file.dos.pa.gov',
      sosName: 'Pennsylvania Department of State',
      sosStatute: '42 Pa. C.S. §5322 (long-arm service)',
    },
    landlordTenant: {
      repairStatute: 'Pennsylvania Landlord and Tenant Act, 68 Pa. C.S. § 250.204',
      repairStatuteShort: '68 Pa. C.S. § 250.204',
      evictionNoticeStatute: 'Pennsylvania Landlord and Tenant Act, 68 Pa. C.S. § 250.501',
      evictionNoticeStatuteShort: '68 Pa. C.S. § 250.501',
      retaliationStatute: 'Pennsylvania Landlord and Tenant Act, 68 Pa. C.S. § 250.205',
      retaliationStatuteShort: '68 Pa. C.S. § 250.205',
      civilRightsDivision: 'Pennsylvania Human Relations Commission (PHRC)',
      noticeDefaultDays: '15 days',
    },
  },
}

const DEFAULT_STATE = 'TX'

export function getSmallClaimsInfo(state?: string): SmallClaimsStateInfo {
  return STATE_LIT_INFO[state ?? DEFAULT_STATE]?.smallClaims ?? STATE_LIT_INFO.TX.smallClaims
}

export function getContractInfo(state?: string): ContractStateInfo {
  return STATE_LIT_INFO[state ?? DEFAULT_STATE]?.contract ?? STATE_LIT_INFO.TX.contract
}

export function getLandlordTenantInfo(state?: string): LandlordTenantStateInfo {
  return STATE_LIT_INFO[state ?? DEFAULT_STATE]?.landlordTenant ?? STATE_LIT_INFO.TX.landlordTenant
}
