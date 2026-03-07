'use client'

import { GuidedStep } from '../guided-step'
import { piWaitForAnswerConfig } from '@/lib/guided-steps/personal-injury/pi-wait-for-answer'

interface Props {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
}

export function PIWaitForAnswerStep({ caseId, taskId, existingAnswers }: Props) {
  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={piWaitForAnswerConfig}
      existingAnswers={existingAnswers}
    />
  )
}
