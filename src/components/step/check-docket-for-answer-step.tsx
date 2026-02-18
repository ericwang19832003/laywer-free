'use client'

import { useState } from 'react'
import { StepRunner } from './step-runner'

interface CheckDocketForAnswerStepProps {
  caseId: string
  taskId: string
}

type DocketResult = 'no_answer' | 'answer_filed' | null

export function CheckDocketForAnswerStep({
  caseId,
  taskId,
}: CheckDocketForAnswerStepProps) {
  const [result, setResult] = useState<DocketResult>(null)

  async function handleConfirm() {
    if (!result) throw new Error('Please select an option')

    // Transition task: todo → in_progress (with metadata) → completed
    await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'in_progress',
        metadata: { docket_result: result },
      }),
    })

    await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' }),
    })

    // Run gatekeeper to unlock the correct branch
    await fetch(`/api/cases/${caseId}/rules/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
  }

  const reviewContent = (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-warm-muted">Your selection</p>
        <p className="text-warm-text mt-0.5">
          {result === 'no_answer'
            ? 'No answer was filed'
            : 'An answer was filed'}
        </p>
      </div>
      <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3">
        <p className="text-sm text-amber-800">
          {result === 'no_answer'
            ? 'This will start the default judgment process. You\'ll prepare a default judgment packet to submit to the court.'
            : 'This means the case is contested. You\'ll upload the answer and move into the discovery phase.'}
        </p>
      </div>
    </div>
  )

  return (
    <StepRunner
      caseId={caseId}
      taskId={taskId}
      title="Check Docket for Answer"
      reassurance="Check the court docket to see if the other side filed an answer by the deadline. Select what you found."
      onConfirm={handleConfirm}
      reviewContent={reviewContent}
      reviewButtonLabel="Review &rarr;"
    >
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setResult('no_answer')}
          className={`w-full rounded-md border px-4 py-4 text-left transition-colors ${
            result === 'no_answer'
              ? 'border-primary bg-primary/5'
              : 'border-warm-border hover:border-warm-text'
          }`}
        >
          <p className={`text-sm font-medium ${
            result === 'no_answer' ? 'text-primary' : 'text-warm-text'
          }`}>
            No answer was filed
          </p>
          <p className="text-xs text-warm-muted mt-1">
            The deadline passed and no answer appears on the docket. You may be eligible for a default judgment.
          </p>
        </button>

        <button
          type="button"
          onClick={() => setResult('answer_filed')}
          className={`w-full rounded-md border px-4 py-4 text-left transition-colors ${
            result === 'answer_filed'
              ? 'border-primary bg-primary/5'
              : 'border-warm-border hover:border-warm-text'
          }`}
        >
          <p className={`text-sm font-medium ${
            result === 'answer_filed' ? 'text-primary' : 'text-warm-text'
          }`}>
            An answer was filed
          </p>
          <p className="text-xs text-warm-muted mt-1">
            The other side responded. The case will move into the discovery phase.
          </p>
        </button>
      </div>
    </StepRunner>
  )
}
