'use client'

import { GuidedStep } from '../guided-step'
import { piWaitForAnswerConfig } from '@lawyer-free/shared/guided-steps/personal-injury/pi-wait-for-answer'

interface Props {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
}

export function PIWaitForAnswerStep({ caseId, taskId, existingAnswers }: Props) {
  const handleAfterComplete = async () => {
    await fetch(`/api/cases/${caseId}/rules/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
  }

  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={piWaitForAnswerConfig}
      existingAnswers={existingAnswers}
      onAfterComplete={handleAfterComplete}
    />
  )
}
