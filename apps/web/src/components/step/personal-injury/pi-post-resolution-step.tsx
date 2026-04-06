'use client'

import { GuidedStep } from '../guided-step'
import { piPostResolutionConfig } from '@lawyer-free/shared/guided-steps/personal-injury/pi-post-resolution'
import { piPostResolutionPropertyConfig } from '@lawyer-free/shared/guided-steps/personal-injury/pi-post-resolution-property'
import { isPropertyDamageSubType } from '@lawyer-free/shared/guided-steps/personal-injury/constants'

interface Props {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
  piSubType?: string
}

export function PIPostResolutionStep({ caseId, taskId, existingAnswers, piSubType }: Props) {
  const config = isPropertyDamageSubType(piSubType)
    ? piPostResolutionPropertyConfig
    : piPostResolutionConfig

  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={config}
      existingAnswers={existingAnswers}
    />
  )
}
