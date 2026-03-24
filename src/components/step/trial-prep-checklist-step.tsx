'use client'

import { GuidedStep } from './guided-step'
import { trialPrepChecklistConfig } from '@/lib/guided-steps/trial-prep-checklist'

interface TrialPrepChecklistStepProps {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
}

export function TrialPrepChecklistStep({ caseId, taskId, existingAnswers }: TrialPrepChecklistStepProps) {
  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={trialPrepChecklistConfig}
      existingAnswers={existingAnswers}
    />
  )
}
