'use client'

import { GuidedStep } from '../guided-step'
import { piMedicalRecordsConfig } from '@/lib/guided-steps/personal-injury/pi-medical-records'

interface PIMedicalRecordsStepProps {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
}

export function PIMedicalRecordsStep({ caseId, taskId, existingAnswers }: PIMedicalRecordsStepProps) {
  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={piMedicalRecordsConfig}
      existingAnswers={existingAnswers}
    />
  )
}
