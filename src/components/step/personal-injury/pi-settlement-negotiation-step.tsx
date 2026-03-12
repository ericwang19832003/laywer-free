'use client'

import { GuidedStep } from '../guided-step'
import { StepAuthoritySidebar } from '../step-authority-sidebar'
import { piSettlementNegotiationConfig } from '@/lib/guided-steps/personal-injury/pi-settlement-negotiation'
import { piSettlementNegotiationPropertyConfig } from '@/lib/guided-steps/personal-injury/pi-settlement-negotiation-property'
import { isPropertyDamageSubType } from '@/lib/guided-steps/personal-injury/constants'

interface Props {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
  piSubType?: string
  skippable?: boolean
}

export function PISettlementNegotiationStep({ caseId, taskId, existingAnswers, piSubType, skippable }: Props) {
  const config = isPropertyDamageSubType(piSubType)
    ? piSettlementNegotiationPropertyConfig
    : piSettlementNegotiationConfig

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex gap-6 items-start">
        <div className="flex-1 min-w-0">
          <GuidedStep
            caseId={caseId}
            taskId={taskId}
            config={config}
            existingAnswers={existingAnswers}
            wrapperClassName=""
            skippable={skippable}
          />
        </div>
        <div className="hidden lg:block w-72 shrink-0 sticky top-8">
          <StepAuthoritySidebar
            caseId={caseId}
            mode="read-only"
          />
        </div>
      </div>
      <div className="lg:hidden mt-6">
        <StepAuthoritySidebar
          caseId={caseId}
          mode="read-only"
        />
      </div>
    </div>
  )
}
