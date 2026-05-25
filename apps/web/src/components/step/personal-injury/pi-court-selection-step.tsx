'use client'

import { useMemo } from 'react'
import { GuidedStep } from '../guided-step'
import { createPiCourtSelectionConfig } from '@lawyer-free/shared/guided-steps/personal-injury/pi-court-selection'

interface PiCourtSelectionStepProps {
  caseId: string
  taskId: string
  piSubType?: string
  existingAnswers?: Record<string, string>
}

export function PiCourtSelectionStep({
  caseId,
  taskId,
  piSubType,
  existingAnswers,
}: PiCourtSelectionStepProps) {
  // Memoize so config reference stays stable across re-renders
  const config = useMemo(() => createPiCourtSelectionConfig(piSubType), [piSubType])
  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={config}
      existingAnswers={existingAnswers}
      skippable
    />
  )
}
