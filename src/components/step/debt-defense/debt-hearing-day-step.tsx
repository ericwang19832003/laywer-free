'use client'

import { GuidedStep } from '../guided-step'
import { debtHearingDayConfig } from '@/lib/guided-steps/debt-defense/debt-hearing-day'

interface DebtHearingDayStepProps {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
}

export function DebtHearingDayStep({ caseId, taskId, existingAnswers }: DebtHearingDayStepProps) {
  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={debtHearingDayConfig}
      existingAnswers={existingAnswers}
    />
  )
}
