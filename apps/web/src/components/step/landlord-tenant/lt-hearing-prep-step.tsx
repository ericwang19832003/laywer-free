'use client'

import { GuidedStep } from '../guided-step'
import { ltHearingPrepConfig } from '@lawyer-free/shared/guided-steps/landlord-tenant/lt-hearing-prep'

interface LtHearingPrepStepProps {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
}

export function LtHearingPrepStep({ caseId, taskId, existingAnswers }: LtHearingPrepStepProps) {
  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={ltHearingPrepConfig}
      existingAnswers={existingAnswers}
    />
  )
}
