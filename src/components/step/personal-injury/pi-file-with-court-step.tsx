'use client'

import { GuidedStep } from '../guided-step'
import { piFileWithCourtConfig } from '@/lib/guided-steps/personal-injury/pi-file-with-court'

interface PIFileWithCourtStepProps {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
}

export function PIFileWithCourtStep({ caseId, taskId, existingAnswers }: PIFileWithCourtStepProps) {
  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={piFileWithCourtConfig}
      existingAnswers={existingAnswers}
    />
  )
}
