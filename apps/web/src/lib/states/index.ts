import type { StateCode, StateConfig } from './types'
import { TX_CONFIG } from './tx'
import { CA_CONFIG } from './ca'
import { NY_CONFIG } from './ny'
import { FL_CONFIG } from './fl'
import { PA_CONFIG } from './pa'
import { IL_CONFIG } from './il'
import { OH_CONFIG } from './oh'
import { GA_CONFIG } from './ga'
import { NC_CONFIG } from './nc'
import { MI_CONFIG } from './mi'
import { NJ_CONFIG } from './nj'
import { VA_CONFIG } from './va'
import { WA_CONFIG } from './wa'
import { AZ_CONFIG } from './az'
import { CO_CONFIG } from './co'
import { TN_CONFIG } from './tn'
import { IN_CONFIG } from './in'
import { MO_CONFIG } from './mo'
import { MD_CONFIG } from './md'
import { WI_CONFIG } from './wi'
import { MN_CONFIG } from './mn'
import { SC_CONFIG } from './sc'
import { AL_CONFIG } from './al'
import { LA_CONFIG } from './la'
import { KY_CONFIG } from './ky'
import { OR_CONFIG } from './or'
import { NV_CONFIG } from './nv'
import { CT_CONFIG } from './ct'
import { MA_CONFIG } from './ma'
import { OK_CONFIG } from './ok'
import { AR_CONFIG } from './ar'
import { MS_CONFIG } from './ms'
import { UT_CONFIG } from './ut'
import { NM_CONFIG } from './nm'
import { WV_CONFIG } from './wv'
import { DE_CONFIG } from './de'
import { RI_CONFIG } from './ri'
import { NH_CONFIG } from './nh'
import { VT_CONFIG } from './vt'
import { ME_CONFIG } from './me'
import { IA_CONFIG } from './ia'
import { KS_CONFIG } from './ks'
import { NE_CONFIG } from './ne'
import { SD_CONFIG } from './sd'
import { ND_CONFIG } from './nd'
import { MT_CONFIG } from './mt'
import { WY_CONFIG } from './wy'
import { ID_CONFIG } from './id'
import { HI_CONFIG } from './hi'
import { AK_CONFIG } from './ak'

export type { StateCode, StateConfig, CourtTypeConfig } from './types'
export { STATE_CODES } from './types'

const STATE_CONFIGS: Record<StateCode, StateConfig> = {
  TX: TX_CONFIG,
  CA: CA_CONFIG,
  NY: NY_CONFIG,
  FL: FL_CONFIG,
  PA: PA_CONFIG,
  IL: IL_CONFIG,
  OH: OH_CONFIG,
  GA: GA_CONFIG,
  NC: NC_CONFIG,
  MI: MI_CONFIG,
  NJ: NJ_CONFIG,
  VA: VA_CONFIG,
  WA: WA_CONFIG,
  AZ: AZ_CONFIG,
  CO: CO_CONFIG,
  TN: TN_CONFIG,
  IN: IN_CONFIG,
  MO: MO_CONFIG,
  MD: MD_CONFIG,
  WI: WI_CONFIG,
  MN: MN_CONFIG,
  SC: SC_CONFIG,
  AL: AL_CONFIG,
  LA: LA_CONFIG,
  KY: KY_CONFIG,
  OR: OR_CONFIG,
  NV: NV_CONFIG,
  CT: CT_CONFIG,
  MA: MA_CONFIG,
  OK: OK_CONFIG,
  AR: AR_CONFIG,
  MS: MS_CONFIG,
  UT: UT_CONFIG,
  NM: NM_CONFIG,
  WV: WV_CONFIG,
  DE: DE_CONFIG,
  RI: RI_CONFIG,
  NH: NH_CONFIG,
  VT: VT_CONFIG,
  ME: ME_CONFIG,
  IA: IA_CONFIG,
  KS: KS_CONFIG,
  NE: NE_CONFIG,
  SD: SD_CONFIG,
  ND: ND_CONFIG,
  MT: MT_CONFIG,
  WY: WY_CONFIG,
  ID: ID_CONFIG,
  HI: HI_CONFIG,
  AK: AK_CONFIG,
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
