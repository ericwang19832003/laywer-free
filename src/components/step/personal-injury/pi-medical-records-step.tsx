'use client'

import { GuidedStep } from '../guided-step'
import { piMedicalRecordsConfig } from '@/lib/guided-steps/personal-injury/pi-medical-records'
import { piDamageDocumentationConfig } from '@/lib/guided-steps/personal-injury/pi-damage-documentation'
import { isPropertyDamageSubType } from '@/lib/guided-steps/personal-injury/constants'

interface PIMedicalRecordsStepProps {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
  piSubType?: string
}

export function PIMedicalRecordsStep({ caseId, taskId, existingAnswers, piSubType }: PIMedicalRecordsStepProps) {
  const config = isPropertyDamageSubType(piSubType)
    ? piDamageDocumentationConfig
    : piMedicalRecordsConfig

  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={config}
      existingAnswers={existingAnswers}
    />
  )
}
