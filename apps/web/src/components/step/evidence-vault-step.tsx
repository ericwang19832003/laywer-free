'use client'

import { GuidedStep } from './guided-step'
import { evidenceVaultConfig } from '@lawyer-free/shared/guided-steps/evidence-vault'

interface EvidenceVaultStepProps {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
}

export function EvidenceVaultStep({
  caseId,
  taskId,
  existingAnswers,
}: EvidenceVaultStepProps) {
  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={evidenceVaultConfig}
      existingAnswers={existingAnswers}
    />
  )
}
