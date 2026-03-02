'use client'

import { useState } from 'react'
import { StepRunner } from './step-runner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Rule26fPrepStepProps {
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

export function Rule26fPrepStep({
  caseId,
  taskId,
}: Rule26fPrepStepProps) {
  const [openSection, setOpenSection] = useState<string | null>(null)
  const [conferenceDate, setConferenceDate] = useState('')
  const [error, setError] = useState<string | null>(null)

  function toggleSection(key: string) {
    setOpenSection((prev) => (prev === key ? null : key))
  }

  async function handleConfirm() {
    if (!conferenceDate) {
      setError('Please enter the scheduled conference date.')
      throw new Error('Missing conference date')
    }
    setError(null)

    // Save metadata and transition task
    await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'in_progress',
        metadata: { conference_date: conferenceDate },
      }),
    })

    // Create Rule 26(f) conference deadline
    await fetch(`/api/cases/${caseId}/deadlines`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: 'rule_26f_conference',
        due_at: new Date(conferenceDate).toISOString(),
        source: 'user_entered',
        rationale: 'Rule 26(f) conference date scheduled by court or parties.',
      }),
    })

    // Create mandatory disclosures deadline (14 days after conference)
    const confDate = new Date(conferenceDate)
    const disclosureDeadline = new Date(confDate.getTime() + 14 * 24 * 60 * 60 * 1000)
    await fetch(`/api/cases/${caseId}/deadlines`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: 'mandatory_disclosures_deadline',
        due_at: disclosureDeadline.toISOString(),
        source: 'system',
        rationale: 'Mandatory initial disclosures due within 14 days of Rule 26(f) conference (FRCP 26(a)(1)).',
      }),
    })

    // Complete task
    await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' }),
    })

    // Run gatekeeper
    await fetch(`/api/cases/${caseId}/rules/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
  }

  return (
    <StepRunner
      caseId={caseId}
      taskId={taskId}
      title="Prepare for Rule 26(f) Conference"
      reassurance="Before formal discovery begins in federal court, both sides must meet to discuss the case. Here's how to prepare."
      onConfirm={handleConfirm}
      skipReview
    >
      <div className="space-y-4">
        <div className="rounded-lg border border-calm-indigo/20 bg-calm-indigo/5 p-4">
          <p className="text-sm text-warm-text">
            The Rule 26(f) conference is an informal meeting between the parties
            (usually by phone) to plan discovery. The court requires this before
            any formal discovery can begin.
          </p>
        </div>

        <ExpandableSection
          title="What to Prepare"
          isOpen={openSection === 'prepare'}
          onToggle={() => toggleSection('prepare')}
        >
          <div className="space-y-2 text-sm text-warm-muted">
            <ul className="list-disc pl-5 space-y-1">
              <li>A list of your claims and defenses</li>
              <li>A draft of your initial disclosures (witnesses, documents, damages)</li>
              <li>Ideas about what discovery you&apos;ll need (documents, depositions, interrogatories)</li>
              <li>Thoughts on a discovery timeline</li>
              <li>Any issues about electronically stored information (ESI)</li>
            </ul>
          </div>
        </ExpandableSection>

        <ExpandableSection
          title="What to Expect"
          isOpen={openSection === 'expect'}
          onToggle={() => toggleSection('expect')}
        >
          <div className="space-y-2 text-sm text-warm-muted">
            <p>
              The conference is usually informal — a phone call or video meeting
              between the parties (not the judge). You&apos;ll discuss:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>The nature of your claims and defenses</li>
              <li>Possibilities for settlement</li>
              <li>What discovery each side needs</li>
              <li>A proposed discovery timeline</li>
            </ul>
            <p>
              After the conference, you may need to file a joint discovery plan
              (Rule 26(f) report) with the court.
            </p>
          </div>
        </ExpandableSection>

        <ExpandableSection
          title="Discovery Plan Topics"
          isOpen={openSection === 'topics'}
          onToggle={() => toggleSection('topics')}
        >
          <div className="space-y-2 text-sm text-warm-muted">
            <p>The discovery plan should address:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Timing</strong> — When discovery opens and closes</li>
              <li><strong>Scope</strong> — What subjects discovery will cover</li>
              <li><strong>ESI</strong> — How electronic documents will be produced (format, search terms)</li>
              <li><strong>Privilege</strong> — How privilege disputes will be handled (privilege log requirements)</li>
              <li><strong>Trial date</strong> — Preferences for trial scheduling</li>
            </ul>
          </div>
        </ExpandableSection>

        <div className="space-y-2 pt-2">
          <Label htmlFor="conference-date">Scheduled conference date *</Label>
          <Input
            id="conference-date"
            type="date"
            value={conferenceDate}
            onChange={(e) => setConferenceDate(e.target.value)}
          />
          <p className="text-xs text-warm-muted">
            When is your Rule 26(f) conference scheduled? Check the court&apos;s scheduling order.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-calm-amber bg-calm-amber/5 p-3">
            <p className="text-sm text-warm-text">{error}</p>
          </div>
        )}
      </div>
    </StepRunner>
  )
}
