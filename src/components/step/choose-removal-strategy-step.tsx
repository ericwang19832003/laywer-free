'use client'

import { useState } from 'react'
import { StepRunner } from './step-runner'

interface ChooseRemovalStrategyStepProps {
  caseId: string
  taskId: string
  remandDeadline?: string | null
}

type Strategy = 'accept' | 'remand' | 'both' | null

const STRATEGIES = [
  {
    value: 'both' as const,
    title: 'File motion to remand AND prepare amended complaint',
    description: 'Recommended if you\'re unsure. File a motion asking the judge to send the case back to state court, and prepare your amended complaint as a backup in case the motion is denied.',
  },
  {
    value: 'remand' as const,
    title: 'File a motion to remand only',
    description: 'Ask the federal judge to send your case back to state court. Grounds include: no federal jurisdiction, untimely removal, or procedural defects. Must be filed within 30 days of removal.',
  },
  {
    value: 'accept' as const,
    title: 'Accept the removal and proceed in federal court',
    description: 'File a First Amended Complaint in federal court, then prepare for the Rule 26(f) conference and mandatory initial disclosures.',
  },
]

export function ChooseRemovalStrategyStep({
  caseId,
  taskId,
  remandDeadline,
}: ChooseRemovalStrategyStepProps) {
  const [strategy, setStrategy] = useState<Strategy>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleConfirm() {
    if (!strategy) {
      setError('Please select a response strategy.')
      throw new Error('No strategy selected')
    }
    setError(null)

    await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'in_progress',
        metadata: { strategy },
      }),
    })

    await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' }),
    })

    await fetch(`/api/cases/${caseId}/rules/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
  }

  return (
    <StepRunner
      caseId={caseId}
      taskId={taskId}
      title="Choose Your Response Strategy"
      reassurance="Decide how you want to respond to the removal. You can always change course later."
      onConfirm={handleConfirm}
      skipReview
    >
      <div className="space-y-4">
        {remandDeadline && (
          <div className="rounded-lg border border-calm-amber/30 bg-calm-amber/5 p-3">
            <p className="text-sm text-warm-text">
              <strong>Remand deadline:</strong>{' '}
              {new Date(remandDeadline).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
            <p className="text-xs text-warm-muted mt-1">
              A motion to remand must be filed within 30 days of the removal date.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {STRATEGIES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setStrategy(s.value)}
              className={`w-full rounded-md border px-4 py-4 text-left transition-colors ${
                strategy === s.value
                  ? 'border-primary bg-primary/5'
                  : 'border-warm-border hover:border-warm-text'
              }`}
            >
              <p className={`text-sm font-medium ${
                strategy === s.value ? 'text-primary' : 'text-warm-text'
              }`}>
                {s.title}
              </p>
              <p className="text-xs text-warm-muted mt-1">{s.description}</p>
            </button>
          ))}
        </div>

        {error && (
          <div className="rounded-lg border border-calm-amber bg-calm-amber/5 p-3">
            <p className="text-sm text-warm-text">{error}</p>
          </div>
        )}
      </div>
    </StepRunner>
  )
}
