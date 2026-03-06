'use client'

import { GuidedStep } from '../guided-step'
import { piSettlementNegotiationConfig } from '@/lib/guided-steps/personal-injury/pi-settlement-negotiation'

interface Props {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
}

export function PISettlementNegotiationStep({ caseId, taskId, existingAnswers }: Props) {
  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={piSettlementNegotiationConfig}
      existingAnswers={existingAnswers}
    />
  )
}
