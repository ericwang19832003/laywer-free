'use client'

import { useState } from 'react'
import { StepRunner } from '../step-runner'
import Link from 'next/link'

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

interface TemporaryOrdersStepProps {
  caseId: string
  taskId: string
}

export function TemporaryOrdersStep({
  caseId,
  taskId,
}: TemporaryOrdersStepProps) {
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
      title="Temporary Orders"
      reassurance="Temporary orders protect you and your children while the case is pending. They are common and don't affect the final outcome."
      onConfirm={handleConfirm}
      skipReview
    >
      <div className="space-y-4">
        <ExpandableSection
          title="What are temporary orders?"
          isOpen={openSection === 'what'}
          onToggle={() => toggleSection('what')}
        >
          <div className="space-y-3 text-sm text-warm-muted">
            <p>
              Temporary orders are court orders that stay in effect while your
              case is pending. They can cover custody, child support, property
              use, and behavior restrictions.
            </p>
            <p>
              They are{' '}
              <strong className="text-warm-text">NOT the final order</strong>.
              They simply maintain order and protect everyone involved until the
              court makes a final decision.
            </p>
          </div>
        </ExpandableSection>

        <ExpandableSection
          title="Types of temporary orders"
          isOpen={openSection === 'types'}
          onToggle={() => toggleSection('types')}
        >
          <ul className="space-y-2 text-sm text-warm-muted">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Temporary custody and visitation schedule
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Temporary child support
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Temporary spousal support
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Property restraints (preventing sale or destruction of property)
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Temporary injunctions (behavior orders)
            </li>
          </ul>
        </ExpandableSection>

        <ExpandableSection
          title="Do I need temporary orders?"
          isOpen={openSection === 'need'}
          onToggle={() => toggleSection('need')}
        >
          <div className="space-y-3 text-sm text-warm-muted">
            <p>You may want temporary orders if:</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
                You need immediate custody arrangements
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
                You need financial support while the case is pending
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
                You&apos;re worried the other party will hide or destroy property
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
                You need protection from harassment
              </li>
            </ul>
          </div>
        </ExpandableSection>

        {/* Link to motions page */}
        <div className="pt-2">
          <Link
            href={`/case/${caseId}/motions`}
            className="text-sm text-calm-indigo hover:underline"
          >
            File a Motion for Temporary Orders from the Motions page &rarr;
          </Link>
        </div>
      </div>
    </StepRunner>
  )
}
