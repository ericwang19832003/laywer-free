import type { JurisdictionRuleConfig } from './schema'
import { txDebtCollection } from './tx'

const REGISTRY: Record<string, JurisdictionRuleConfig> = {
  'TX:debt_collection': txDebtCollection,
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
