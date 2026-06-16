'use client'

import { GuidedStep } from '../guided-step'
import { createPiTrialPrepConfig } from '@lawyer-free/shared/guided-steps/personal-injury/pi-trial-prep'

interface PITrialPrepStepProps {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
  piSubType?: string
}

export function PITrialPrepStep({ caseId, taskId, existingAnswers, piSubType }: PITrialPrepStepProps) {
  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={createPiTrialPrepConfig(piSubType)}
      existingAnswers={existingAnswers}
    />
  )
}
