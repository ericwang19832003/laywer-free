'use client'

import { GuidedStep } from '../guided-step'
import { piInsuranceCommunicationConfig } from '@/lib/guided-steps/personal-injury/pi-insurance-communication'

interface PIInsuranceCommunicationStepProps {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
}

export function PIInsuranceCommunicationStep({ caseId, taskId, existingAnswers }: PIInsuranceCommunicationStepProps) {
  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={piInsuranceCommunicationConfig}
      existingAnswers={existingAnswers}
    />
  )
}
