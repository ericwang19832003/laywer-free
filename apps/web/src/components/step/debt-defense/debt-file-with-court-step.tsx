'use client'

import { GuidedStep } from '../guided-step'
import { debtFileWithCourtConfig } from '@lawyer-free/shared/guided-steps/debt-defense/debt-file-with-court'

interface Props {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
}

export function DebtFileWithCourtStep({ caseId, taskId, existingAnswers }: Props) {
  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={debtFileWithCourtConfig}
      existingAnswers={existingAnswers}
    />
  )
}
