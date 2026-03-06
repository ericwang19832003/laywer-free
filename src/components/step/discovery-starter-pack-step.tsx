'use client'

import { GuidedStep } from './guided-step'
import { discoveryStarterPackConfig } from '@/lib/guided-steps/discovery-starter-pack'

interface DiscoveryStarterPackStepProps {
  caseId: string
  taskId: string
  courtType?: string
  existingAnswers?: Record<string, string>
}

export function DiscoveryStarterPackStep({ caseId, taskId, existingAnswers }: DiscoveryStarterPackStepProps) {
  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={discoveryStarterPackConfig}
      existingAnswers={existingAnswers}
    />
  )
}
