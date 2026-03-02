'use client'

import { useState } from 'react'
import { StepRunner } from './step-runner'
import { TRIAL_PREP_SECTIONS } from '@/lib/motions/trial-prep-config'

interface TrialPrepChecklistStepProps {
  caseId: string
  taskId: string
}

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

export function TrialPrepChecklistStep({
  caseId,
  taskId,
}: TrialPrepChecklistStepProps) {
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
      title="Trial Preparation Checklist"
      reassurance="Preparing for trial takes careful organization. This checklist covers the key areas to help you feel confident walking into the courtroom."
      onConfirm={handleConfirm}
      skipReview
    >
      <div className="space-y-4">
        <div className="rounded-lg border border-calm-indigo/20 bg-calm-indigo/5 p-4">
          <p className="text-sm text-warm-text">
            This checklist covers the most important areas of trial preparation.
            Every case is different — some items may not apply to your situation.
          </p>
        </div>

        {TRIAL_PREP_SECTIONS.map((section, index) => {
          const key = `section-${index}`
          return (
            <ExpandableSection
              key={key}
              title={section.title}
              isOpen={openSection === key}
              onToggle={() => toggleSection(key)}
            >
              <ul className="space-y-2 text-sm text-warm-muted">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start gap-2">
                    <span className="text-calm-indigo mt-0.5 shrink-0">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </ExpandableSection>
          )
        })}
      </div>
    </StepRunner>
  )
}
