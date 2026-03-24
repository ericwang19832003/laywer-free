'use client'

import { GuidedStep } from '../guided-step'
import { serveDefendantConfig } from '@/lib/guided-steps/small-claims/serve-defendant'

interface ServeDefendantStepProps {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
}

export function ServeDefendantStep({ caseId, taskId, existingAnswers }: ServeDefendantStepProps) {
  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={serveDefendantConfig}
      existingAnswers={existingAnswers}
    />
  )
}
