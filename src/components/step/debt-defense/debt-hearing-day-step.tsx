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

interface DebtHearingDayStepProps {
  caseId: string
  taskId: string
}

export function DebtHearingDayStep({
  caseId,
  taskId,
}: DebtHearingDayStepProps) {
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
      reassurance="You've prepared well. Here's what to expect."
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
              Arrive 15&ndash;30 minutes early
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Dress professionally (business casual minimum)
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Bring all documents organized in order
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Turn off your phone
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Check in with the court clerk when you arrive
            </li>
          </ul>
        </ExpandableSection>

        <ExpandableSection
          title="Courtroom etiquette"
          isOpen={openSection === 'etiquette'}
          onToggle={() => toggleSection('etiquette')}
        >
          <ul className="space-y-2 text-sm text-warm-muted">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Stand when the judge enters and when speaking to the judge
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Address the judge as &ldquo;Your Honor&rdquo;
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Speak clearly and calmly
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Don&apos;t interrupt the other side &mdash; you&apos;ll get your
              turn
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Stick to facts, not emotions
            </li>
          </ul>
        </ExpandableSection>

        <ExpandableSection
          title="Common creditor attorney tactics"
          isOpen={openSection === 'tactics'}
          onToggle={() => toggleSection('tactics')}
        >
          <ul className="space-y-2 text-sm text-warm-muted">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Requesting a continuance (delay) &mdash; you can object if
              they&apos;ve had plenty of time to prepare
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Producing documents at the last minute &mdash; you can object and
              ask for time to review
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Offering a settlement in the hallway &mdash; you can accept,
              reject, or ask for time to think
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Claiming the debt has been &ldquo;verified&rdquo; without actual
              documentation
            </li>
          </ul>
        </ExpandableSection>

        <ExpandableSection
          title="Possible outcomes"
          isOpen={openSection === 'outcomes'}
          onToggle={() => toggleSection('outcomes')}
        >
          <ul className="space-y-2 text-sm text-warm-muted">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              <span>
                <strong className="text-warm-text">Case dismissed</strong> (you
                win) &mdash; no further obligation on this debt
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              <span>
                <strong className="text-warm-text">
                  Judgment for plaintiff
                </strong>{' '}
                &mdash; you may owe the amount, but have appeal rights
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              <span>
                <strong className="text-warm-text">Settlement agreement</strong>{' '}
                &mdash; both sides agree to terms
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              <span>
                <strong className="text-warm-text">Continuance</strong> &mdash;
                hearing is rescheduled to a later date
              </span>
            </li>
          </ul>
        </ExpandableSection>
      </div>
    </StepRunner>
  )
}
