'use client'

import { GuidedStep } from '../guided-step'
import { hearingDayConfig } from '@/lib/guided-steps/small-claims/hearing-day'

interface HearingDayStepProps {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
}

export function HearingDayStep({ caseId, taskId, existingAnswers }: HearingDayStepProps) {
  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={hearingDayConfig}
      existingAnswers={existingAnswers}
    />
  )
}
