'use client'

import { GuidedStep } from '../guided-step'
import { postJudgmentConfig } from '@/lib/guided-steps/landlord-tenant/post-judgment'

interface PostJudgmentStepProps {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
}

export function PostJudgmentStep({ caseId, taskId, existingAnswers }: PostJudgmentStepProps) {
  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={postJudgmentConfig}
      existingAnswers={existingAnswers}
    />
  )
}
