'use client'

import { GuidedStep } from '../guided-step'
import { mediationConfig } from '@lawyer-free/shared/guided-steps/family/mediation'

interface MediationStepProps {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
}

export function MediationStep({ caseId, taskId, existingAnswers }: MediationStepProps) {
  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={mediationConfig}
      existingAnswers={existingAnswers}
    />
  )
}
