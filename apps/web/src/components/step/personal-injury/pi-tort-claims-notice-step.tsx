'use client'

import { GuidedStep } from '../guided-step'
import { piTortClaimsNoticeConfig } from '@lawyer-free/shared/guided-steps/personal-injury/pi-tort-claims-notice'

interface PITortClaimsNoticeStepProps {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
}

export function PITortClaimsNoticeStep({ caseId, taskId, existingAnswers }: PITortClaimsNoticeStepProps) {
  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={piTortClaimsNoticeConfig}
      existingAnswers={existingAnswers}
    />
  )
}
