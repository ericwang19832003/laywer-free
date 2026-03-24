'use client'

import { useMemo } from 'react'
import { GuidedStep } from '../guided-step'
import { createPiFileWithCourtConfig } from '@/lib/guided-steps/personal-injury/pi-file-with-court-factory'

interface PIFileWithCourtStepProps {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
  caseData?: {
    state: string
    court_type: string
    county: string | null
  }
}

export function PIFileWithCourtStep({ caseId, taskId, existingAnswers, caseData }: PIFileWithCourtStepProps) {
  const config = useMemo(
    () =>
      createPiFileWithCourtConfig(
        caseData?.state ?? 'TX',
        caseData?.court_type ?? 'district',
        caseData?.county ?? null
      ),
    [caseData?.state, caseData?.court_type, caseData?.county]
  )

  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={config}
      existingAnswers={existingAnswers}
    />
  )
}
