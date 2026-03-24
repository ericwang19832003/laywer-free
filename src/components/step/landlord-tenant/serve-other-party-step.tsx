'use client'

import { GuidedStep } from '../guided-step'
import { serveOtherPartyConfig } from '@/lib/guided-steps/landlord-tenant/serve-other-party'

interface ServeOtherPartyStepProps {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
}

export function ServeOtherPartyStep({ caseId, taskId, existingAnswers }: ServeOtherPartyStepProps) {
  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={serveOtherPartyConfig}
      existingAnswers={existingAnswers}
    />
  )
}
