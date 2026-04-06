'use client'

import { PetitionWizardEnhanced } from '../petition-wizard-enhanced'

interface REWizardProps {
  caseId: string
  taskId: string
  existingMetadata?: Record<string, unknown>
  caseData: {
    role: string
    court_type: string
    county: string | null
    dispute_type: string | null
    government_entity?: boolean
  }
}

export function REWizard({
  caseId,
  taskId,
  existingMetadata,
  caseData,
}: REWizardProps) {
  return (
    <PetitionWizardEnhanced
      caseId={caseId}
      taskId={taskId}
      existingMetadata={existingMetadata}
      caseData={caseData}
    />
  )
}
