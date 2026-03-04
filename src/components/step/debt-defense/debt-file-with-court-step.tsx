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

interface DebtFileWithCourtStepProps {
  caseId: string
  taskId: string
}

export function DebtFileWithCourtStep({
  caseId,
  taskId,
}: DebtFileWithCourtStepProps) {
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
      title="File Your Answer With the Court"
      reassurance="We'll walk you through exactly how to file."
      onConfirm={handleConfirm}
      skipReview
    >
      <div className="space-y-4">
        <ExpandableSection
          title="Where to file your answer"
          isOpen={openSection === 'where'}
          onToggle={() => toggleSection('where')}
        >
          <ul className="space-y-2 text-sm text-warm-muted">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              File at the same court listed on your court papers
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Justice Court: file at the JP court in the precinct listed on your
              citation
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              County/District Court: file at the county clerk&apos;s office
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Many courts accept e-filing through eFileTexas.gov
            </li>
          </ul>
        </ExpandableSection>

        <ExpandableSection
          title="Filing fees"
          isOpen={openSection === 'fees'}
          onToggle={() => toggleSection('fees')}
        >
          <ul className="space-y-2 text-sm text-warm-muted">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Justice Court: typically $0&ndash;$50 for an answer
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              County/District Court: varies by county, usually $25&ndash;$50
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Fee waiver: If you can&apos;t afford the fee, ask for a
              &ldquo;Statement of Inability to Afford Payment of Court
              Costs&rdquo; (TRCP Rule 145)
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Keep your receipt
            </li>
          </ul>
        </ExpandableSection>

        <ExpandableSection
          title="E-filing options"
          isOpen={openSection === 'efiling'}
          onToggle={() => toggleSection('efiling')}
        >
          <ul className="space-y-2 text-sm text-warm-muted">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Most Texas courts now require e-filing through eFileTexas.gov
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Create an account, upload your answer as a PDF
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Justice Courts may still accept in-person filing
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              E-filing confirmation counts as your proof of filing
            </li>
          </ul>
        </ExpandableSection>

        <ExpandableSection
          title="Filing deadline — critical!"
          isOpen={openSection === 'deadline'}
          onToggle={() => toggleSection('deadline')}
        >
          <ul className="space-y-2 text-sm text-warm-muted">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              <span>
                <strong className="text-warm-text">JP Court:</strong> Answer is
                due by the trial date listed on your citation (usually
                10&ndash;14 days)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              <span>
                <strong className="text-warm-text">
                  County/District Court:
                </strong>{' '}
                Answer is due by 10:00 AM on the first Monday after 20 days from
                service (TRCP Rule 99)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Missing the deadline can result in a default judgment against you
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              If you need more time, you can file a Motion for Extension of Time
            </li>
          </ul>
        </ExpandableSection>

        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3">
          <p className="text-sm text-amber-800">
            Your answer deadline is critical. If you miss it, the court may
            enter a default judgment against you &mdash; meaning the plaintiff
            wins automatically.
          </p>
        </div>
      </div>
    </StepRunner>
  )
}
