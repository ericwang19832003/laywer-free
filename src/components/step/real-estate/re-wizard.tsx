'use client'

import { PetitionWizard } from '../petition-wizard'

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
    <PetitionWizard
      caseId={caseId}
      taskId={taskId}
      existingMetadata={existingMetadata}
      caseData={caseData}
    />
  )
}
