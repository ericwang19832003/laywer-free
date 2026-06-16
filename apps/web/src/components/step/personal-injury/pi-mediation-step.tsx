'use client'

import { GuidedStep } from '../guided-step'
import { createPiMediationConfig } from '@lawyer-free/shared/guided-steps/personal-injury/pi-mediation'

interface Props {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
  piSubType?: string
}

export function PIMediationStep({ caseId, taskId, existingAnswers, piSubType }: Props) {
  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={createPiMediationConfig(piSubType)}
      existingAnswers={existingAnswers}
    />
  )
}
