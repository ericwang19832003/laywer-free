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

interface HearingDayStepProps {
  caseId: string
  taskId: string
}

export function HearingDayStep({ caseId, taskId }: HearingDayStepProps) {
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
      reassurance="Today's the day. Here's what to expect at the courthouse and what happens after."
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
              You (plaintiff) present first &mdash; tell the judge what happened
              and show your evidence
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              The defendant responds &mdash; they may dispute facts or present
              their own evidence
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              The judge may ask questions to both sides
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Total hearing time is usually 15&ndash;30 minutes
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              The judge may rule immediately or mail the decision within a few
              days
            </li>
          </ul>
          <p className="text-xs text-warm-muted mt-3">
            Stay respectful throughout, even if you disagree with what the
            defendant says.
          </p>
        </ExpandableSection>

        <ExpandableSection
          title="After the hearing"
          isOpen={openSection === 'after'}
          onToggle={() => toggleSection('after')}
        >
          <div className="space-y-3 text-sm text-warm-muted">
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
                <span>
                  <strong className="text-warm-text">If you win:</strong> the
                  judgment is entered in your favor. If the defendant
                  doesn&apos;t pay within 30 days, you can pursue enforcement
                  (wage garnishment, property lien, etc.)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
                <span>
                  <strong className="text-warm-text">If you lose:</strong> you
                  have the right to appeal within 21 days by filing in County
                  Court (TRCP 506.1). The appeal is a completely new trial.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
                <span>
                  <strong className="text-warm-text">
                    If the defendant doesn&apos;t show up:
                  </strong>{' '}
                  you may win by default judgment
                </span>
              </li>
            </ul>
            <p className="text-xs text-warm-muted mt-3">
              Keep all your documents. You may need them for enforcement or
              appeal.
            </p>
          </div>
        </ExpandableSection>
      </div>
    </StepRunner>
  )
}
