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

interface FinalOrdersStepProps {
  caseId: string
  taskId: string
}

export function FinalOrdersStep({
  caseId,
  taskId,
}: FinalOrdersStepProps) {
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
      title="Final Orders"
      reassurance="The final hearing is the last step. Here's what to expect and how to prepare."
      onConfirm={handleConfirm}
      skipReview
    >
      <div className="space-y-4">
        <ExpandableSection
          title="What happens at the final hearing?"
          isOpen={openSection === 'hearing'}
          onToggle={() => toggleSection('hearing')}
        >
          <div className="space-y-3 text-sm text-warm-muted">
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
                If you reached an agreement (through mediation or negotiation),
                the judge will review it and sign off
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
                If contested, both sides present evidence and testimony, and the
                judge decides
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
                For agreed divorces, the hearing may only take 10&ndash;15 minutes
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
                For contested matters, it could take hours or days
              </li>
            </ul>
          </div>
        </ExpandableSection>

        <ExpandableSection
          title="What to bring"
          isOpen={openSection === 'bring'}
          onToggle={() => toggleSection('bring')}
        >
          <ul className="space-y-2 text-sm text-warm-muted">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Valid photo ID
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              All agreed orders and settlement documents
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Financial records if support is contested
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Witness list and any witnesses
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Evidence you want the court to consider
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              The final decree or order prepared for the judge&apos;s signature
            </li>
          </ul>
        </ExpandableSection>

        <ExpandableSection
          title="After the final order"
          isOpen={openSection === 'after'}
          onToggle={() => toggleSection('after')}
        >
          <div className="space-y-3 text-sm text-warm-muted">
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
                The order is effective immediately once signed
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
                You&apos;ll receive certified copies
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
                Follow all terms of the order &mdash; violations can result in
                contempt
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
                If you need to change the order later, you can file a
                modification
              </li>
            </ul>
          </div>
        </ExpandableSection>

        {/* Completion / encouragement card */}
        <div className="rounded-lg border border-calm-indigo/20 bg-calm-indigo/5 p-4">
          <p className="text-sm font-medium text-warm-text">
            Congratulations on completing this journey.
          </p>
          <p className="text-sm text-warm-muted mt-1">
            Remember, you can always return to modify orders if circumstances
            change. You&apos;ve taken an important step in protecting yourself
            and your family.
          </p>
        </div>
      </div>
    </StepRunner>
  )
}
