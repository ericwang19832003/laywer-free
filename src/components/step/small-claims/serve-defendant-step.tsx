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

interface ServeDefendantStepProps {
  caseId: string
  taskId: string
}

export function ServeDefendantStep({
  caseId,
  taskId,
}: ServeDefendantStepProps) {
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
      title="Serve the Defendant"
      reassurance="The defendant must be officially notified about your lawsuit. Here are your options for small claims court."
      onConfirm={handleConfirm}
      skipReview
    >
      <div className="space-y-4">
        <ExpandableSection
          title="How to serve in small claims"
          isOpen={openSection === 'how'}
          onToggle={() => toggleSection('how')}
        >
          <ul className="space-y-2 text-sm text-warm-muted">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Certified mail, return receipt requested (cheapest option, ~$7&ndash;10)
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Constable or sheriff ($75&ndash;100, most reliable)
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Private process server ($50&ndash;150)
            </li>
          </ul>
          <p className="text-xs text-warm-muted mt-3">
            In Texas small claims court, certified mail is the most common and
            affordable option (TRCP 501.2).
          </p>
        </ExpandableSection>

        <ExpandableSection
          title="Service requirements"
          isOpen={openSection === 'requirements'}
          onToggle={() => toggleSection('requirements')}
        >
          <ul className="space-y-2 text-sm text-warm-muted">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Must be served at least 14 days before the hearing date (TRCP
              501.4)
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Service must include a copy of the petition and the citation
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Keep your proof of service (return receipt or officer&apos;s
              return)
            </li>
          </ul>
          <p className="text-xs text-warm-muted mt-3">
            If service by mail fails (unclaimed/refused), you&apos;ll need to
            use a constable or process server.
          </p>
        </ExpandableSection>

        <ExpandableSection
          title="What if they can't be found?"
          isOpen={openSection === 'notfound'}
          onToggle={() => toggleSection('notfound')}
        >
          <ul className="space-y-2 text-sm text-warm-muted">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Try alternative addresses (work, relatives)
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Consider a skip-tracing service
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Ask the court about substituted service
            </li>
          </ul>
          <p className="text-xs text-warm-muted mt-3">
            The court cannot hear your case until the defendant has been properly
            served.
          </p>
        </ExpandableSection>
      </div>
    </StepRunner>
  )
}
