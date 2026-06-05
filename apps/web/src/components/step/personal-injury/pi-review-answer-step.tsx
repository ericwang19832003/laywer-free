'use client'

import { GuidedStep } from '../guided-step'
import { createPiReviewAnswerConfig } from '@lawyer-free/shared/guided-steps/personal-injury/pi-review-answer'

interface Props {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
  piSubType?: string | null
}

export function PIReviewAnswerStep({ caseId, taskId, existingAnswers, piSubType }: Props) {
  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={createPiReviewAnswerConfig(piSubType)}
      existingAnswers={existingAnswers}
    />
  )
}
