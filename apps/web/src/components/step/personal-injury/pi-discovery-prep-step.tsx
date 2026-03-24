'use client'

import { GuidedStep } from '../guided-step'
import { piDiscoveryPrepConfig } from '@/lib/guided-steps/personal-injury/pi-discovery-prep'

interface Props {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
}

export function PIDiscoveryPrepStep({ caseId, taskId, existingAnswers }: Props) {
  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={piDiscoveryPrepConfig}
      existingAnswers={existingAnswers}
    />
  )
}
