'use client'

import { GuidedStep } from '../guided-step'
import { prepareForHearingConfig } from '@lawyer-free/shared/guided-steps/small-claims/prepare-for-hearing'

interface PrepareForHearingStepProps {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
}

export function PrepareForHearingStep({ caseId, taskId, existingAnswers }: PrepareForHearingStepProps) {
  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={prepareForHearingConfig}
      existingAnswers={existingAnswers}
    />
  )
}
