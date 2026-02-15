'use client'

import { StepRunner } from './step-runner'

interface WelcomeStepProps {
  caseId: string
  taskId: string
}

export function WelcomeStep({ caseId, taskId }: WelcomeStepProps) {
  async function handleConfirm() {
    // Transition: todo -> in_progress
    const firstRes = await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'in_progress' }),
    })

    if (!firstRes.ok) {
      const err = await firstRes.json()
      // If already in_progress, that's fine — continue to completed
      if (!err.details?.includes?.("'in_progress'")) {
        throw new Error(err.error || 'Failed to update task')
      }
    }

    // Transition: in_progress -> completed
    const secondRes = await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' }),
    })

    if (!secondRes.ok) {
      throw new Error('Failed to complete task')
    }
  }

  return (
    <StepRunner
      caseId={caseId}
      taskId={taskId}
      title="Welcome — Get Started"
      reassurance="This is your case organizer. We'll walk you through each step at your own pace."
      onConfirm={handleConfirm}
      skipReview={true}
    >
      <div className="text-center py-4">
        <p className="text-warm-text mb-2">
          Welcome to your case organizer.
        </p>
        <p className="text-sm text-warm-muted">
          We&apos;ll help you stay organized, track deadlines, and prepare
          your documents. Everything here is at your pace — there&apos;s no
          rush.
        </p>
      </div>
    </StepRunner>
  )
}
