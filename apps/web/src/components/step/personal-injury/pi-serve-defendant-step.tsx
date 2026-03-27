'use client'

import { GuidedStep } from '../guided-step'
import { piServeDefendantConfig } from '@lawyer-free/shared/guided-steps/personal-injury/pi-serve-defendant'

interface Props {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
}

export function PIServeDefendantStep({ caseId, taskId, existingAnswers }: Props) {
  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={piServeDefendantConfig}
      existingAnswers={existingAnswers}
    />
  )
}
