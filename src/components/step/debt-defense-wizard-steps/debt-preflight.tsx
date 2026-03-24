'use client'

import { GuidedStep } from '../guided-step'
import { debtPreflightConfig } from '@/lib/guided-steps/debt-defense/debt-preflight'

interface DebtPreflightProps {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
}

export function DebtPreflight({ caseId, taskId, existingAnswers }: DebtPreflightProps) {
  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={debtPreflightConfig}
      existingAnswers={existingAnswers}
    />
  )
}
