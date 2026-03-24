'use client'

import { GuidedStep } from '../guided-step'
import { piSchedulingConferenceConfig } from '@/lib/guided-steps/personal-injury/pi-scheduling-conference'

interface Props {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
}

export function PISchedulingConferenceStep({ caseId, taskId, existingAnswers }: Props) {
  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={piSchedulingConferenceConfig}
      existingAnswers={existingAnswers}
    />
  )
}
