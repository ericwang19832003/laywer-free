'use client'

import { GuidedStep } from '../guided-step'
import { createPiDiscoveryPrepConfig } from '@lawyer-free/shared/guided-steps/personal-injury/pi-discovery-prep'

interface Props {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
  piSubType?: string | null
}

export function PIDiscoveryPrepStep({ caseId, taskId, existingAnswers, piSubType }: Props) {
  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={createPiDiscoveryPrepConfig(piSubType)}
      existingAnswers={existingAnswers}
    />
  )
}
