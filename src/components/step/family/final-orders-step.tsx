'use client'

import { GuidedStep } from '../guided-step'
import { finalOrdersConfig } from '@/lib/guided-steps/family/final-orders'

interface FinalOrdersStepProps {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
}

export function FinalOrdersStep({ caseId, taskId, existingAnswers }: FinalOrdersStepProps) {
  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={finalOrdersConfig}
      existingAnswers={existingAnswers}
    />
  )
}
