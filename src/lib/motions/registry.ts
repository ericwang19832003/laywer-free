import { MotionConfig } from './types'
import { motionToCompelConfig } from './configs/motion-to-compel'
import { summaryJudgmentConfig } from './configs/motion-summary-judgment'
import { settlementDemandConfig } from './configs/settlement-demand'
import { continuanceConfig } from './configs/motion-continuance'
import { mtdResponseConfig } from './configs/mtd-response'
import { noticeOfAppealConfig } from './configs/notice-of-appeal'
import { appellateBriefConfig } from './configs/appellate-brief'

export const MOTION_CONFIGS: Record<string, MotionConfig> = {
  motion_to_compel: motionToCompelConfig,
  motion_summary_judgment: summaryJudgmentConfig,
  settlement_demand: settlementDemandConfig,
  motion_continuance: continuanceConfig,
  mtd_response: mtdResponseConfig,
  notice_of_appeal: noticeOfAppealConfig,
  appellate_brief: appellateBriefConfig,
}

export const MOTION_CONFIGS_BY_CATEGORY = {
  discovery: Object.values(MOTION_CONFIGS).filter(c => c.category === 'discovery'),
  pretrial: Object.values(MOTION_CONFIGS).filter(c => c.category === 'pretrial'),
  post_trial: Object.values(MOTION_CONFIGS).filter(c => c.category === 'post_trial'),
}
