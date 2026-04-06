'use client'

import { GuidedStep } from '../guided-step'
import { piSettlementNegotiationConfig } from '@lawyer-free/shared/guided-steps/personal-injury/pi-settlement-negotiation'
import { piSettlementNegotiationPropertyConfig } from '@lawyer-free/shared/guided-steps/personal-injury/pi-settlement-negotiation-property'
import { isPropertyDamageSubType } from '@lawyer-free/shared/guided-steps/personal-injury/constants'

interface Props {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
  piSubType?: string
  skippable?: boolean
}

export function PISettlementNegotiationStep({ caseId, taskId, existingAnswers, piSubType, skippable }: Props) {
  const config = isPropertyDamageSubType(piSubType)
    ? piSettlementNegotiationPropertyConfig
    : piSettlementNegotiationConfig

  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={config}
      existingAnswers={existingAnswers}
      skippable={skippable}
    />
  )
}
