'use client'

import { GuidedStep } from '../guided-step'
import { piPostResolutionConfig } from '@/lib/guided-steps/personal-injury/pi-post-resolution'

interface Props {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
}

export function PIPostResolutionStep({ caseId, taskId, existingAnswers }: Props) {
  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={piPostResolutionConfig}
      existingAnswers={existingAnswers}
    />
  )
}
