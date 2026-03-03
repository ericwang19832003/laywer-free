'use client'

import { useState } from 'react'
import { StepRunner } from '../step-runner'

function ExpandableSection({
  title,
  isOpen,
  onToggle,
  children,
}: {
  title: string
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-warm-border">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-sm font-medium text-warm-text">{title}</span>
        <span
          className={`text-warm-muted transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        >
          ▾
        </span>
      </button>
      {isOpen && (
        <div className="border-t border-warm-border px-4 py-3">
          {children}
        </div>
      )}
    </div>
  )
}

interface WaitingPeriodStepProps {
  caseId: string
  taskId: string
}

export function WaitingPeriodStep({
  caseId,
  taskId,
}: WaitingPeriodStepProps) {
  const [checklistOpen, setChecklistOpen] = useState(false)

  async function patchTask(status: string) {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Failed to update task')
    }
  }

  async function handleConfirm() {
    await patchTask('in_progress')
    await patchTask('completed')
  }

  return (
    <StepRunner
      caseId={caseId}
      taskId={taskId}
      title="Mandatory Waiting Period"
      reassurance="Texas requires a waiting period before finalizing your case. This is normal and required by law."
      onConfirm={handleConfirm}
      skipReview
    >
      <div className="space-y-4">
        {/* Main info card */}
        <div className="rounded-lg border border-calm-indigo/20 bg-calm-indigo/5 p-4">
          <p className="text-sm text-warm-text">
            Texas law requires a <strong>60-day waiting period</strong> after
            filing for divorce before the court can grant a final decree. This
            clock starts the day your petition is filed with the court.
          </p>
          <p className="text-xs text-warm-muted mt-2">
            Tex. Fam. Code &sect; 6.702
          </p>
        </div>

        {/* Expandable checklist */}
        <ExpandableSection
          title="What to do during the waiting period"
          isOpen={checklistOpen}
          onToggle={() => setChecklistOpen((prev) => !prev)}
        >
          <ul className="space-y-2 text-sm text-warm-muted">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Gather any remaining financial documents
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Consider attending mediation (may be required)
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Continue following any temporary orders
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Prepare for the final hearing
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Consult with a legal aid organization if needed
            </li>
          </ul>
        </ExpandableSection>

        {/* Non-divorce note */}
        <div className="rounded-lg border border-calm-indigo/20 bg-calm-indigo/5 p-4">
          <p className="text-sm text-warm-text">
            For non-divorce family cases (custody, support), there may not be a
            mandatory waiting period. The court may schedule a hearing as soon as
            possible.
          </p>
        </div>
      </div>
    </StepRunner>
  )
}
