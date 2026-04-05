'use client'

import { GuidedStep } from '../guided-step'
import { piTortClaimsTrackingConfig } from '@lawyer-free/shared/guided-steps/personal-injury/pi-tort-claims-tracking'

interface PITortClaimsTrackingStepProps {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
}

export function PITortClaimsTrackingStep({ caseId, taskId, existingAnswers }: PITortClaimsTrackingStepProps) {
  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={piTortClaimsTrackingConfig}
      existingAnswers={existingAnswers}
    />
  )
}
