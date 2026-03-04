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

interface DebtHearingPrepStepProps {
  caseId: string
  taskId: string
}

export function DebtHearingPrepStep({
  caseId,
  taskId,
}: DebtHearingPrepStepProps) {
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
      title="Prepare for Your Hearing"
      reassurance="Being prepared is the best thing you can do."
      onConfirm={handleConfirm}
      skipReview
    >
      <div className="space-y-4">
        <ExpandableSection
          title="What to bring to court"
          isOpen={openSection === 'bring'}
          onToggle={() => toggleSection('bring')}
        >
          <ul className="space-y-2 text-sm text-warm-muted">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Your filed answer (with court stamp or e-filing confirmation)
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              The debt validation letter and any response you received
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              All payment records and bank statements showing payments
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Any correspondence from the creditor or debt collector
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Account statements from the original creditor
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Photo ID
            </li>
          </ul>
        </ExpandableSection>

        <ExpandableSection
          title="How to present your defenses"
          isOpen={openSection === 'defenses'}
          onToggle={() => toggleSection('defenses')}
        >
          <ul className="space-y-2 text-sm text-warm-muted">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              <span>
                <strong className="text-warm-text">SOL defense:</strong> Show
                the court your last payment date and that 4+ years have passed
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              <span>
                <strong className="text-warm-text">Lack of standing:</strong>{' '}
                Ask the plaintiff to produce the chain of title showing they own
                the debt
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              <span>
                <strong className="text-warm-text">
                  Insufficient evidence:
                </strong>{' '}
                Ask the plaintiff to produce the original signed agreement
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              <span>
                <strong className="text-warm-text">Wrong amount:</strong>{' '}
                Present your records showing the correct amount or payments made
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              <span>
                <strong className="text-warm-text">FDCPA violations:</strong>{' '}
                Present your evidence of the violation (call logs, letters,
                etc.)
              </span>
            </li>
          </ul>
        </ExpandableSection>

        <ExpandableSection
          title="What to expect from the plaintiff's attorney"
          isOpen={openSection === 'attorney'}
          onToggle={() => toggleSection('attorney')}
        >
          <ul className="space-y-2 text-sm text-warm-muted">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              They may offer a settlement before the hearing &mdash; you
              don&apos;t have to accept
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              They may request a continuance (delay) &mdash; you can object
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              They must prove their case &mdash; the burden is on them, not you
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              If they can&apos;t produce proper documentation, the case may be
              dismissed
            </li>
          </ul>
        </ExpandableSection>

        <ExpandableSection
          title="Settlement considerations"
          isOpen={openSection === 'settlement'}
          onToggle={() => toggleSection('settlement')}
        >
          <ul className="space-y-2 text-sm text-warm-muted">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              If offered a settlement, you don&apos;t have to decide immediately
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Ask for any offer in writing
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Common settlements: reduced lump sum (30&ndash;50% of claimed
              amount) or payment plan
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Get any agreement in writing with a &ldquo;paid in full&rdquo;
              clause
            </li>
          </ul>
        </ExpandableSection>
      </div>
    </StepRunner>
  )
}
