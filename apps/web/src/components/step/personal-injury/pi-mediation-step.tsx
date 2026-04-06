'use client'

import { GuidedStep } from '../guided-step'
import { piMediationConfig } from '@lawyer-free/shared/guided-steps/personal-injury/pi-mediation'

interface Props {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
}

export function PIMediationStep({ caseId, taskId, existingAnswers }: Props) {
  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={piMediationConfig}
      existingAnswers={existingAnswers}
    />
  )
}
