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

interface DebtPostJudgmentStepProps {
  caseId: string
  taskId: string
}

export function DebtPostJudgmentStep({
  caseId,
  taskId,
}: DebtPostJudgmentStepProps) {
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
      reassurance="Whatever the outcome, you have options."
      onConfirm={handleConfirm}
      skipReview
    >
      <div className="space-y-4">
        <ExpandableSection
          title="If the case was dismissed"
          isOpen={openSection === 'dismissed'}
          onToggle={() => toggleSection('dismissed')}
        >
          <ul className="space-y-2 text-sm text-warm-muted">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              The debt may still exist but can&apos;t be collected through the
              courts
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Request a copy of the dismissal order for your records
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              If a debt collector continues to contact you about this debt, they
              may be violating the FDCPA
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              The dismissal should be reflected on your credit report &mdash;
              dispute it if not
            </li>
          </ul>
        </ExpandableSection>

        <ExpandableSection
          title="If you lost (judgment for plaintiff)"
          isOpen={openSection === 'lost'}
          onToggle={() => toggleSection('lost')}
        >
          <ul className="space-y-2 text-sm text-warm-muted">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              You have the right to appeal within 30 days (county/district) or
              to request a new trial in JP court
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Filing an appeal requires a bond (usually the judgment amount)
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Texas generally prohibits wage garnishment for consumer debts
              (Tex. Const. Art. XVI, &sect; 28)
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Certain property is exempt from seizure under Tex. Prop. Code
              &sect; 42.001 (homestead, personal property up to $50,000 for
              individuals)
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              You can negotiate a payment plan with the plaintiff
            </li>
          </ul>
        </ExpandableSection>

        <ExpandableSection
          title="Your appeal rights"
          isOpen={openSection === 'appeal'}
          onToggle={() => toggleSection('appeal')}
        >
          <ul className="space-y-2 text-sm text-warm-muted">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              <span>
                <strong className="text-warm-text">JP Court:</strong> Appeal to
                County Court within 21 days &mdash; you get a completely new
                trial (de novo)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              <span>
                <strong className="text-warm-text">
                  County/District Court:
                </strong>{' '}
                Appeal to the Court of Appeals within 30 days
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              An appeal bond or cash deposit may be required
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Consider consulting with a legal aid organization about your
              appeal
            </li>
          </ul>
        </ExpandableSection>

        <ExpandableSection
          title="Protecting your assets"
          isOpen={openSection === 'assets'}
          onToggle={() => toggleSection('assets')}
        >
          <ul className="space-y-2 text-sm text-warm-muted">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Texas has strong debtor protections &mdash; your wages generally
              cannot be garnished for consumer debts
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Your homestead is protected (no forced sale of your primary
              residence for consumer debts)
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Personal property exemptions protect up to $50,000 for
              individuals, $100,000 for families
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Bank account garnishment is possible but subject to exemptions
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Social Security, disability, and retirement benefits are generally
              protected
            </li>
          </ul>
        </ExpandableSection>
      </div>
    </StepRunner>
  )
}
