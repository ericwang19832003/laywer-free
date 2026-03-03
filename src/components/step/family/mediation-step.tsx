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

interface MediationStepProps {
  caseId: string
  taskId: string
}

export function MediationStep({ caseId, taskId }: MediationStepProps) {
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
      title="Mediation"
      reassurance="Mediation helps both sides reach an agreement with a neutral mediator. It's less stressful and less expensive than going to trial."
      onConfirm={handleConfirm}
      skipReview
    >
      <div className="space-y-4">
        <ExpandableSection
          title="What is mediation?"
          isOpen={openSection === 'what'}
          onToggle={() => toggleSection('what')}
        >
          <div className="space-y-3 text-sm text-warm-muted">
            <p>
              Mediation is a process where a trained neutral third party (the
              mediator) helps both sides negotiate and reach agreements. The
              mediator doesn&apos;t make decisions &mdash; they help you and the
              other party find common ground.
            </p>
            <p>
              Most Texas family courts require mediation before trial.
            </p>
          </div>
        </ExpandableSection>

        <ExpandableSection
          title="How to prepare for mediation"
          isOpen={openSection === 'prepare'}
          onToggle={() => toggleSection('prepare')}
        >
          <ul className="space-y-2 text-sm text-warm-muted">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Bring all relevant documents (financial records, custody proposals)
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Know what you want and what you&apos;re willing to compromise on
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Be prepared to listen to the other side&apos;s perspective
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Dress professionally (business casual)
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Bring snacks and water &mdash; mediation can take several hours
            </li>
          </ul>
        </ExpandableSection>

        <ExpandableSection
          title="What if mediation doesn't work?"
          isOpen={openSection === 'fail'}
          onToggle={() => toggleSection('fail')}
        >
          <div className="space-y-3 text-sm text-warm-muted">
            <p>
              If you can&apos;t reach an agreement in mediation, your case will
              proceed to trial. The judge will make the final decisions.
            </p>
            <p>
              Reaching an agreement in mediation gives you more control over the
              outcome.
            </p>
          </div>
        </ExpandableSection>

        {/* Confidentiality info card */}
        <div className="rounded-lg border border-calm-indigo/20 bg-calm-indigo/5 p-4">
          <p className="text-sm text-warm-text">
            Mediation is <strong>confidential</strong>. What&apos;s said in
            mediation can&apos;t be used against you in court.
          </p>
          <p className="text-xs text-warm-muted mt-2">
            Tex. Civ. Prac. &amp; Rem. Code &sect; 154.073
          </p>
        </div>
      </div>
    </StepRunner>
  )
}
