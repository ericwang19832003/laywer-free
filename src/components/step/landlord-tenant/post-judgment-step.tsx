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

interface PostJudgmentStepProps {
  caseId: string
  taskId: string
}

export function PostJudgmentStep({
  caseId,
  taskId,
}: PostJudgmentStepProps) {
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
      title="After the Ruling"
      reassurance="The hearing is over. Here's what happens next, whether you won or lost."
      onConfirm={handleConfirm}
      skipReview
    >
      <div className="space-y-4">
        <ExpandableSection
          title="If you won"
          isOpen={openSection === 'won'}
          onToggle={() => toggleSection('won')}
        >
          <ul className="space-y-2 text-sm text-warm-muted">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              <span>
                <strong className="text-warm-text">Eviction:</strong> Request a
                writ of possession from the court (allows constable to remove
                tenant, usually 24-hour notice)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              <span>
                <strong className="text-warm-text">Money judgment:</strong> If
                they don&apos;t pay within 30 days, you can pursue enforcement:
              </span>
            </li>
            <li className="flex items-start gap-2 pl-5">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Abstract of judgment (creates a lien on property)
            </li>
            <li className="flex items-start gap-2 pl-5">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Wage garnishment
            </li>
            <li className="flex items-start gap-2 pl-5">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Bank account levy
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Record the judgment with the county clerk for enforcement
            </li>
          </ul>
          <p className="text-xs text-warm-muted mt-3">
            A judgment is only as good as your ability to collect. If the other
            party has no assets, collection may be difficult.
          </p>
        </ExpandableSection>

        <ExpandableSection
          title="If you lost"
          isOpen={openSection === 'lost'}
          onToggle={() => toggleSection('lost')}
        >
          <ul className="space-y-2 text-sm text-warm-muted">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              <span>
                <strong className="text-warm-text">Eviction appeal:</strong>{' '}
                Must file within 5 days (TRCP 510.9), must post appeal bond
                (usually equal to one month&apos;s rent)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              <span>
                <strong className="text-warm-text">Other appeals:</strong> Must
                file within 21 days in County Court
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              The appeal is a completely new trial (trial de novo)
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              You can also file a motion for new trial within 14 days
            </li>
          </ul>
          <p className="text-xs text-warm-muted mt-3">
            Appeals in eviction cases are time-sensitive. Missing the 5-day
            window means losing the right to appeal.
          </p>
        </ExpandableSection>

        <ExpandableSection
          title="Next steps"
          isOpen={openSection === 'next'}
          onToggle={() => toggleSection('next')}
        >
          <ul className="space-y-2 text-sm text-warm-muted">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Keep all your documents (you may need them for enforcement or
              appeal)
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              If you have a money judgment, consider recording it with the
              county clerk
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              For eviction: coordinate with the constable for the writ of
              possession
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              If the other party files for bankruptcy, collection may be stayed
            </li>
          </ul>
          <p className="text-xs text-warm-muted mt-3">
            If you need help enforcing a judgment or filing an appeal, consider
            consulting a local legal aid organization.
          </p>
        </ExpandableSection>
      </div>
    </StepRunner>
  )
}
