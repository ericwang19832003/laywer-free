import { MotionConfig } from './types'
import { motionToCompelConfig } from './configs/motion-to-compel'
import { summaryJudgmentConfig } from './configs/motion-summary-judgment'
import { settlementDemandConfig } from './configs/settlement-demand'
import { continuanceConfig } from './configs/motion-continuance'
import { mtdResponseConfig } from './configs/mtd-response'
import { noticeOfAppealConfig } from './configs/notice-of-appeal'
import { appellateBriefConfig } from './configs/appellate-brief'
import { temporaryOrdersConfig } from './configs/temporary-orders'
import { protectiveOrderConfig } from './configs/protective-order'
import { motionToModifyConfig } from './configs/motion-to-modify'
import { motionForEnforcementConfig } from './configs/motion-for-enforcement'
import { motionForMediationConfig } from './configs/motion-for-mediation'

export const MOTION_CONFIGS: Record<string, MotionConfig> = {
  motion_to_compel: motionToCompelConfig,
  motion_summary_judgment: summaryJudgmentConfig,
  settlement_demand: settlementDemandConfig,
  motion_continuance: continuanceConfig,
  mtd_response: mtdResponseConfig,
  notice_of_appeal: noticeOfAppealConfig,
  appellate_brief: appellateBriefConfig,
  temporary_orders: temporaryOrdersConfig,
  protective_order: protectiveOrderConfig,
  motion_to_modify: motionToModifyConfig,
  motion_for_enforcement: motionForEnforcementConfig,
  motion_for_mediation: motionForMediationConfig,
}

export const MOTION_CONFIGS_BY_CATEGORY = {
  discovery: Object.values(MOTION_CONFIGS).filter(c => c.category === 'discovery'),
  pretrial: Object.values(MOTION_CONFIGS).filter(c => c.category === 'pretrial'),
  post_trial: Object.values(MOTION_CONFIGS).filter(c => c.category === 'post_trial'),
  family: Object.values(MOTION_CONFIGS).filter(c => c.category === 'family'),
}
