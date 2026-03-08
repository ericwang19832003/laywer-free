'use client'

import { GuidedStep } from '../guided-step'
import { piSettlementNegotiationConfig } from '@/lib/guided-steps/personal-injury/pi-settlement-negotiation'
import { piSettlementNegotiationPropertyConfig } from '@/lib/guided-steps/personal-injury/pi-settlement-negotiation-property'
import { isPropertyDamageSubType } from '@/lib/guided-steps/personal-injury/constants'

interface Props {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
  piSubType?: string
}

export function PISettlementNegotiationStep({ caseId, taskId, existingAnswers, piSubType }: Props) {
  const config = isPropertyDamageSubType(piSubType)
    ? piSettlementNegotiationPropertyConfig
    : piSettlementNegotiationConfig

  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={config}
      existingAnswers={existingAnswers}
    />
  )
}
