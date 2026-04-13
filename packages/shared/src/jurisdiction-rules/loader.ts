import type { JurisdictionRuleConfig } from './schema'
import {
  txDebtCollection,
  txLandlordTenant,
  txPersonalInjury,
  txContract,
  txProperty,
  txRealEstate,
  txBusiness,
  txFamily,
  txSmallClaims,
} from './tx'
import {
  caDebtCollection,
  caLandlordTenant,
  caPersonalInjury,
  caContract,
  caProperty,
  caRealEstate,
  caBusiness,
  caFamily,
  caSmallClaims,
} from './ca'
import {
  nyDebtCollection,
  nyLandlordTenant,
  nyPersonalInjury,
  nyContract,
  nyProperty,
  nyRealEstate,
  nyBusiness,
  nyFamily,
  nySmallClaims,
} from './ny'
import {
  flDebtCollection,
  flLandlordTenant,
  flPersonalInjury,
  flContract,
  flProperty,
  flRealEstate,
  flBusiness,
  flFamily,
  flSmallClaims,
} from './fl'

const REGISTRY: Record<string, JurisdictionRuleConfig> = {
  'TX:debt_collection': txDebtCollection,
  'TX:landlord_tenant': txLandlordTenant,
  'TX:personal_injury': txPersonalInjury,
  'TX:contract': txContract,
  'TX:property': txProperty,
  'TX:real_estate': txRealEstate,
  'TX:business': txBusiness,
  'TX:family': txFamily,
  'TX:small_claims': txSmallClaims,
  'CA:debt_collection': caDebtCollection,
  'CA:landlord_tenant': caLandlordTenant,
  'CA:personal_injury': caPersonalInjury,
  'CA:contract': caContract,
  'CA:property': caProperty,
  'CA:real_estate': caRealEstate,
  'CA:business': caBusiness,
  'CA:family': caFamily,
  'CA:small_claims': caSmallClaims,
  'NY:debt_collection': nyDebtCollection,
  'NY:landlord_tenant': nyLandlordTenant,
  'NY:personal_injury': nyPersonalInjury,
  'NY:contract': nyContract,
  'NY:property': nyProperty,
  'NY:real_estate': nyRealEstate,
  'NY:business': nyBusiness,
  'NY:family': nyFamily,
  'NY:small_claims': nySmallClaims,
  'FL:debt_collection': flDebtCollection,
  'FL:landlord_tenant': flLandlordTenant,
  'FL:personal_injury': flPersonalInjury,
  'FL:contract': flContract,
  'FL:property': flProperty,
  'FL:real_estate': flRealEstate,
  'FL:business': flBusiness,
  'FL:family': flFamily,
  'FL:small_claims': flSmallClaims,
}

export function loadJurisdictionRules(
  state: string,
  disputeType: string,
  subType?: string,
): JurisdictionRuleConfig | null {
  const key = subType
    ? `${state}:${disputeType}:${subType}`
    : `${state}:${disputeType}`
  return REGISTRY[key] ?? null
}
