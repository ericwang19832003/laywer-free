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
