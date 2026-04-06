'use client'

import { GuidedStep } from '../guided-step'
import { waitingPeriodConfig } from '@lawyer-free/shared/guided-steps/family/waiting-period'

interface WaitingPeriodStepProps {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
}

export function WaitingPeriodStep({ caseId, taskId, existingAnswers }: WaitingPeriodStepProps) {
  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={waitingPeriodConfig}
      existingAnswers={existingAnswers}
    />
  )
}
