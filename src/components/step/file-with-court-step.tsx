'use client'

import { GuidedStep } from './guided-step'
import { fileWithCourtConfig } from '@/lib/guided-steps/file-with-court'

interface FileWithCourtStepProps {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
}

export function FileWithCourtStep({
  caseId,
  taskId,
  existingAnswers,
}: FileWithCourtStepProps) {
  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={fileWithCourtConfig}
      existingAnswers={existingAnswers}
    />
  )
}
