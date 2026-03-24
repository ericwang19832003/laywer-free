'use client'

import { GuidedStep } from '../guided-step'
import { temporaryOrdersConfig } from '@/lib/guided-steps/family/temporary-orders'

interface TemporaryOrdersStepProps {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
}

export function TemporaryOrdersStep({ caseId, taskId, existingAnswers }: TemporaryOrdersStepProps) {
  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={temporaryOrdersConfig}
      existingAnswers={existingAnswers}
    />
  )
}
