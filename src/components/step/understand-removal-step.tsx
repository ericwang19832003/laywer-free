'use client'

import { GuidedStep } from './guided-step'
import { understandRemovalConfig } from '@/lib/guided-steps/understand-removal'

interface UnderstandRemovalStepProps {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
}

export function UnderstandRemovalStep({
  caseId,
  taskId,
  existingAnswers,
}: UnderstandRemovalStepProps) {
  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={understandRemovalConfig}
      existingAnswers={existingAnswers}
    />
  )
}
