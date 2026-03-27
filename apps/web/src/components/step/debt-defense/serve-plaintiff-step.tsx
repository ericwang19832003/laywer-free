'use client'

import { GuidedStep } from '../guided-step'
import { servePlaintiffConfig } from '@lawyer-free/shared/guided-steps/debt-defense/serve-plaintiff'

interface Props {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
}

export function ServePlaintiffStep({ caseId, taskId, existingAnswers }: Props) {
  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={servePlaintiffConfig}
      existingAnswers={existingAnswers}
    />
  )
}
