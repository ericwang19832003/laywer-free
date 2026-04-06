'use client'

import { GuidedStep } from '../guided-step'
import { piPretrialMotionsConfig } from '@lawyer-free/shared/guided-steps/personal-injury/pi-pretrial-motions'

interface Props {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
}

export function PIPretrialMotionsStep({ caseId, taskId, existingAnswers }: Props) {
  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={piPretrialMotionsConfig}
      existingAnswers={existingAnswers}
    />
  )
}
