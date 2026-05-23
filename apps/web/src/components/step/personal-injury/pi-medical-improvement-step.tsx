'use client'

import { GuidedStep } from '../guided-step'
import { piMedicalImprovementConfig } from '@lawyer-free/shared/guided-steps/personal-injury/pi-medical-improvement'

interface PIMedicalImprovementStepProps {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
}

export function PIMedicalImprovementStep({ caseId, taskId, existingAnswers }: PIMedicalImprovementStepProps) {
  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={piMedicalImprovementConfig}
      existingAnswers={existingAnswers}
    />
  )
}
