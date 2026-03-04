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

interface ServeOtherPartyStepProps {
  caseId: string
  taskId: string
}

export function ServeOtherPartyStep({
  caseId,
  taskId,
}: ServeOtherPartyStepProps) {
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
      title="Serve the Other Party"
      reassurance="The other party must be officially notified about your lawsuit. Here are your options for landlord-tenant cases."
      onConfirm={handleConfirm}
      skipReview
    >
      <div className="space-y-4">
        <ExpandableSection
          title="How to serve in landlord-tenant cases"
          isOpen={openSection === 'how'}
          onToggle={() => toggleSection('how')}
        >
          <ul className="space-y-2 text-sm text-warm-muted">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Certified mail, return receipt requested (~$7&ndash;10)
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Constable or sheriff ($75&ndash;100, most reliable)
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Private process server ($50&ndash;150)
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              For eviction: posting on door is allowed if other methods fail
              (TRCP 510.4)
            </li>
          </ul>
          <p className="text-xs text-warm-muted mt-3">
            In Texas, eviction cases have special service rules under TRCP
            510.4. The citation may be posted on the door if the tenant cannot be
            personally served.
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
              Must be served before the hearing date (at least 6 days for
              eviction, 14 days for other LT cases)
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
          title="Special rules for eviction service"
          isOpen={openSection === 'eviction'}
          onToggle={() => toggleSection('eviction')}
        >
          <ul className="space-y-2 text-sm text-warm-muted">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Posting on door allowed for eviction cases (TRCP 510.4)
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Certified mail to last known address AND posting required
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              At least 6 days before hearing date
            </li>
          </ul>
          <p className="text-xs text-warm-muted mt-3">
            Door posting is only available for eviction (forcible entry and
            detainer) cases. Other landlord-tenant disputes follow standard
            service rules.
          </p>
        </ExpandableSection>
      </div>
    </StepRunner>
  )
}
