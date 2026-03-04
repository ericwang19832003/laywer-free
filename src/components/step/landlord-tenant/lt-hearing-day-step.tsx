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

interface LtHearingDayStepProps {
  caseId: string
  taskId: string
}

export function LtHearingDayStep({
  caseId,
  taskId,
}: LtHearingDayStepProps) {
  const [openSection, setOpenSection] = useState<string | null>(null)

  function toggleSection(key: string) {
    setOpenSection((prev) => (prev === key ? null : key))
  }

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
      title="Hearing Day"
      reassurance="Today's the day. Here's what to expect at the courthouse."
      onConfirm={handleConfirm}
      skipReview
    >
      <div className="space-y-4">
        <ExpandableSection
          title="Day-of checklist"
          isOpen={openSection === 'checklist'}
          onToggle={() => toggleSection('checklist')}
        >
          <ul className="space-y-2 text-sm text-warm-muted">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Confirm courthouse address and courtroom number
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Plan for parking (courthouses can be busy)
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Arrive 30 minutes early to find the courtroom
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Dress professionally (business casual minimum)
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Turn off your phone
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Have your evidence folder ready
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Bring a pen and notepad
            </li>
          </ul>
        </ExpandableSection>

        <ExpandableSection
          title="What happens at the hearing"
          isOpen={openSection === 'hearing'}
          onToggle={() => toggleSection('hearing')}
        >
          <ul className="space-y-2 text-sm text-warm-muted">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Landlord-tenant hearings in JP Court are usually
              15&ndash;30 minutes
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              The plaintiff presents first &mdash; tell the judge what happened
              and show evidence
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              The defendant responds with their side and evidence
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              The judge may ask questions to both sides
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              The judge may rule immediately or mail the decision within a few
              days
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              For eviction: the judge may rule from the bench (same day)
            </li>
          </ul>
          <p className="text-xs text-warm-muted mt-3">
            Stay respectful throughout, even if you disagree with what the other
            party says.
          </p>
        </ExpandableSection>

        <ExpandableSection
          title="Possible outcomes"
          isOpen={openSection === 'outcomes'}
          onToggle={() => toggleSection('outcomes')}
        >
          <div className="space-y-3 text-sm text-warm-muted">
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
                <span>
                  <strong className="text-warm-text">Eviction cases:</strong>{' '}
                  Judgment for possession (landlord wins, tenant must leave),
                  judgment for defendant (tenant stays), or dismissal
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
                <span>
                  <strong className="text-warm-text">Money claims:</strong>{' '}
                  Judgment for the amount owed, partial judgment, or dismissal
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
                <span>
                  <strong className="text-warm-text">Both:</strong> Either party
                  may appeal &mdash; 5 days for eviction (TRCP 510.9), 21 days
                  for other cases
                </span>
              </li>
            </ul>
            <p className="text-xs text-warm-muted mt-3">
              If the other party doesn&apos;t show up, you may win by default
              judgment.
            </p>
          </div>
        </ExpandableSection>
      </div>
    </StepRunner>
  )
}
