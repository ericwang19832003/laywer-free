'use client'

import { GuidedStep } from '../guided-step'
import { debtPostJudgmentConfig } from '@lawyer-free/shared/guided-steps/debt-defense/debt-post-judgment'

interface DebtPostJudgmentStepProps {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
}

export function DebtPostJudgmentStep({ caseId, taskId, existingAnswers }: DebtPostJudgmentStepProps) {
  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={debtPostJudgmentConfig}
      existingAnswers={existingAnswers}
    />
  )
}
