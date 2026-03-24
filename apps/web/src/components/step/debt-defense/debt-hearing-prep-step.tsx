'use client'

import { GuidedStep } from '../guided-step'
import { debtHearingPrepConfig } from '@lawyer-free/shared/guided-steps/debt-defense/debt-hearing-prep'

interface Props {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
}

export function DebtHearingPrepStep({ caseId, taskId, existingAnswers }: Props) {
  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={debtHearingPrepConfig}
      existingAnswers={existingAnswers}
    />
  )
}
