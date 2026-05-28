'use client'

import { GuidedStep } from '../guided-step'
import { createServeDefendantConfig } from '@lawyer-free/shared/guided-steps/small-claims/serve-defendant'

interface ServeDefendantStepProps {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
  state?: string
}

export function ServeDefendantStep({ caseId, taskId, existingAnswers, state }: ServeDefendantStepProps) {
  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={createServeDefendantConfig(state)}
      existingAnswers={existingAnswers}
    />
  )
}
