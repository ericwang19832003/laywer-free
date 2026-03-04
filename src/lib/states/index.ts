import type { StateCode, StateConfig } from './types'
import { TX_CONFIG } from './tx'
import { CA_CONFIG } from './ca'
import { NY_CONFIG } from './ny'

export type { StateCode, StateConfig, CourtTypeConfig } from './types'
export { STATE_CODES } from './types'

const STATE_CONFIGS: Record<StateCode, StateConfig> = {
  TX: TX_CONFIG,
  CA: CA_CONFIG,
  NY: NY_CONFIG,
}

export function getStateConfig(state: StateCode): StateConfig {
  return STATE_CONFIGS[state]
}

export function getCourtLabel(state: StateCode, courtType: string): string {
  if (courtType === 'federal') return 'Federal Court'
  const config = STATE_CONFIGS[state]
  const found = config.courtTypes.find((c) => c.value === courtType)
  return found?.label ?? courtType
}

export function getSmallClaimsMax(state: StateCode): number {
  return STATE_CONFIGS[state].thresholds.smallClaimsMax
}
