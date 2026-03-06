'use client'

import { GuidedStep } from './guided-step'
import { rule26fPrepConfig } from '@/lib/guided-steps/rule-26f-prep'

interface Rule26fPrepStepProps {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
}

export function Rule26fPrepStep({
  caseId,
  taskId,
  existingAnswers,
}: Rule26fPrepStepProps) {
  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={rule26fPrepConfig}
      existingAnswers={existingAnswers}
    />
  )
}
