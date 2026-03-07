'use client'

import { GuidedStep } from '../guided-step'
import { piDiscoveryResponsesConfig } from '@/lib/guided-steps/personal-injury/pi-discovery-responses'

interface Props {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
}

export function PIDiscoveryResponsesStep({ caseId, taskId, existingAnswers }: Props) {
  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={piDiscoveryResponsesConfig}
      existingAnswers={existingAnswers}
    />
  )
}
