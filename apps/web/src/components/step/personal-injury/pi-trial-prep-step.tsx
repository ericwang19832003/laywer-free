'use client'

import { GuidedStep } from '../guided-step'
import { piTrialPrepConfig } from '@lawyer-free/shared/guided-steps/personal-injury/pi-trial-prep'

interface PITrialPrepStepProps {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
}

export function PITrialPrepStep({ caseId, taskId, existingAnswers }: PITrialPrepStepProps) {
  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={piTrialPrepConfig}
      existingAnswers={existingAnswers}
    />
  )
}
