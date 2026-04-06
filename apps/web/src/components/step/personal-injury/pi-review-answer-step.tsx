'use client'

import { GuidedStep } from '../guided-step'
import { piReviewAnswerConfig } from '@lawyer-free/shared/guided-steps/personal-injury/pi-review-answer'

interface Props {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
}

export function PIReviewAnswerStep({ caseId, taskId, existingAnswers }: Props) {
  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={piReviewAnswerConfig}
      existingAnswers={existingAnswers}
    />
  )
}
