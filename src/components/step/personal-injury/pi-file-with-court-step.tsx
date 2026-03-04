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

interface PIFileWithCourtStepProps {
  caseId: string
  taskId: string
}

export function PIFileWithCourtStep({
  caseId,
  taskId,
}: PIFileWithCourtStepProps) {
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
      title="File With the Court"
      reassurance="Filing your petition formally begins your lawsuit. We'll walk you through the process."
      onConfirm={handleConfirm}
      skipReview
    >
      <div className="space-y-4">
        <ExpandableSection
          title="How to e-file in Texas"
          isOpen={openSection === 'efile'}
          onToggle={() => toggleSection('efile')}
        >
          <ul className="space-y-2 text-sm text-warm-muted">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Go to eFileTexas.gov and create an account
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Select your court and county
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Upload your petition as a PDF
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Pay the filing fee online
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              You&apos;ll receive a confirmation with your cause number
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
              Justice Court (JP): approximately $75
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              County Court at Law: approximately $250&ndash;350
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              District Court: approximately $300&ndash;400
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              If you can&apos;t afford the fee, you can file an &ldquo;Affidavit
              of Inability to Pay&rdquo;
            </li>
          </ul>
        </ExpandableSection>

        <ExpandableSection
          title="Which court to file in"
          isOpen={openSection === 'court'}
          onToggle={() => toggleSection('court')}
        >
          <ul className="space-y-2 text-sm text-warm-muted">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Under $20,000 in damages &rarr; Justice Court (JP)
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              $20,000 to $200,000 &rarr; County Court at Law
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Over $200,000 &rarr; District Court
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              File in the county where the incident occurred or where the
              defendant lives
            </li>
          </ul>
        </ExpandableSection>

        <ExpandableSection
          title="Statute of limitations deadline"
          isOpen={openSection === 'deadline'}
          onToggle={() => toggleSection('deadline')}
        >
          <ul className="space-y-2 text-sm text-warm-muted">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              The 2-year statute of limitations (Tex. Civ. Prac. &amp; Rem. Code
              &sect; 16.003) is a HARD deadline
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              If you miss it, your case is permanently barred &mdash; no
              exceptions
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Count exactly 2 years from the date of the incident
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              File well before the deadline to account for any processing delays
            </li>
          </ul>
        </ExpandableSection>

        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3">
          <p className="text-sm text-amber-800">
            The 2-year statute of limitations (Tex. Civ. Prac. &amp; Rem. Code
            &sect; 16.003) is a HARD deadline. If you miss it, your case is
            permanently barred &mdash; no exceptions.
          </p>
        </div>
      </div>
    </StepRunner>
  )
}
