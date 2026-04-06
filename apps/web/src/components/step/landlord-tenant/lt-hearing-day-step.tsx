'use client'

import { GuidedStep } from '../guided-step'
import { ltHearingDayConfig } from '@lawyer-free/shared/guided-steps/landlord-tenant/lt-hearing-day'

interface LtHearingDayStepProps {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
}

export function LtHearingDayStep({ caseId, taskId, existingAnswers }: LtHearingDayStepProps) {
  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={ltHearingDayConfig}
      existingAnswers={existingAnswers}
    />
  )
}
