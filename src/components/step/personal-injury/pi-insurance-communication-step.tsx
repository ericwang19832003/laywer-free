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

interface PIInsuranceCommunicationStepProps {
  caseId: string
  taskId: string
}

export function PIInsuranceCommunicationStep({
  caseId,
  taskId,
}: PIInsuranceCommunicationStepProps) {
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
      title="Communicate With Insurance"
      reassurance="Knowing how to handle insurance communications protects your rights and your claim's value."
      onConfirm={handleConfirm}
      skipReview
    >
      <div className="space-y-4">
        <ExpandableSection
          title="Filing your claim"
          isOpen={openSection === 'filing'}
          onToggle={() => toggleSection('filing')}
        >
          <ul className="space-y-2 text-sm text-warm-muted">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              File a claim with your own insurance company (first-party claim)
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              File a claim with the at-fault party&apos;s insurance company
              (third-party claim)
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Get a claim number for each and keep it handy
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Report the accident promptly &mdash; most policies require timely
              notice
            </li>
          </ul>
        </ExpandableSection>

        <ExpandableSection
          title="What to say (and not say) to adjusters"
          isOpen={openSection === 'adjusters'}
          onToggle={() => toggleSection('adjusters')}
        >
          <ul className="space-y-2 text-sm text-warm-muted">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              DO: Stick to basic facts (date, location, what happened)
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              DO: Say &ldquo;I&apos;m still treating&rdquo; if asked about your
              injuries
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              DON&apos;T: Speculate about who was at fault
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              DON&apos;T: Downplay your injuries or say &ldquo;I&apos;m
              fine&rdquo;
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              DON&apos;T: Agree to anything without thinking it over first
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              DON&apos;T: Give details about pre-existing conditions
            </li>
          </ul>
        </ExpandableSection>

        <ExpandableSection
          title="Recorded statements — your rights"
          isOpen={openSection === 'statements'}
          onToggle={() => toggleSection('statements')}
        >
          <ul className="space-y-2 text-sm text-warm-muted">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              You are NOT required to give a recorded statement to the other
              party&apos;s insurance
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Your own insurance policy may require you to cooperate, but be
              cautious
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              If you do give a statement, prepare your answers in advance
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              You can decline and say &ldquo;I prefer to communicate in
              writing&rdquo;
            </li>
          </ul>
        </ExpandableSection>

        <ExpandableSection
          title="Common adjuster tactics"
          isOpen={openSection === 'tactics'}
          onToggle={() => toggleSection('tactics')}
        >
          <ul className="space-y-2 text-sm text-warm-muted">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Offering a quick, lowball settlement before you know the full
              extent of injuries
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Calling frequently to pressure you into settling
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Requesting unnecessary medical authorizations to access your full
              history
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Disputing the reasonableness of your medical treatment
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
              Delaying responses to run out the statute of limitations
            </li>
          </ul>
        </ExpandableSection>

        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3">
          <p className="text-sm text-amber-800">
            Do not accept any settlement before completing medical treatment.
            Early settlements almost always undervalue your claim.
          </p>
        </div>
      </div>
    </StepRunner>
  )
}
