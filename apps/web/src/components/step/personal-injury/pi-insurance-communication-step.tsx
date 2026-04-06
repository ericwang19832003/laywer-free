'use client'

import { GuidedStep } from '../guided-step'
import { piInsuranceCommunicationConfig } from '@lawyer-free/shared/guided-steps/personal-injury/pi-insurance-communication'
import { piInsuranceCommunicationPropertyConfig } from '@lawyer-free/shared/guided-steps/personal-injury/pi-insurance-communication-property'
import { isPropertyDamageSubType } from '@lawyer-free/shared/guided-steps/personal-injury/constants'

interface PIInsuranceCommunicationStepProps {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
  piSubType?: string
}

export function PIInsuranceCommunicationStep({ caseId, taskId, existingAnswers, piSubType }: PIInsuranceCommunicationStepProps) {
  const config = isPropertyDamageSubType(piSubType)
    ? piInsuranceCommunicationPropertyConfig
    : piInsuranceCommunicationConfig

  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={config}
      existingAnswers={existingAnswers}
    />
  )
}
