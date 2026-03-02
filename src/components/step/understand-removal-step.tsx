'use client'

import { useState } from 'react'
import { StepRunner } from './step-runner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface UnderstandRemovalStepProps {
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

export function UnderstandRemovalStep({
  caseId,
  taskId,
}: UnderstandRemovalStepProps) {
  const [openSection, setOpenSection] = useState<string | null>(null)
  const [removalDate, setRemovalDate] = useState('')
  const [federalCaseNumber, setFederalCaseNumber] = useState('')
  const [error, setError] = useState<string | null>(null)

  function toggleSection(key: string) {
    setOpenSection((prev) => (prev === key ? null : key))
  }

  async function handleConfirm() {
    if (!removalDate) {
      setError('Please enter the date the case was removed.')
      throw new Error('Missing removal date')
    }
    setError(null)

    // Save metadata and transition task
    await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'in_progress',
        metadata: {
          removal_date: removalDate,
          federal_case_number: federalCaseNumber || null,
        },
      }),
    })

    // Update court type to federal
    const courtRes = await fetch(`/api/cases/${caseId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ court_type: 'federal' }),
    })

    if (courtRes.ok) {
      // Log audit event
      await fetch(`/api/cases/${caseId}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'court_type_changed',
          payload: { from: 'state', to: 'federal', removal_date: removalDate },
        }),
      })
    }

    // Create remand motion deadline (30 days from removal)
    const removalDateObj = new Date(removalDate)
    const remandDeadline = new Date(removalDateObj.getTime() + 30 * 24 * 60 * 60 * 1000)
    await fetch(`/api/cases/${caseId}/deadlines`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: 'remand_motion_deadline',
        due_at: remandDeadline.toISOString(),
        source: 'system',
        rationale: 'Motion to remand must be filed within 30 days of removal (28 U.S.C. § 1447(c)).',
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
      title="Understand the Removal"
      reassurance="The defendant has moved your case to federal court. This is a common procedural move — here's what it means and what you can do."
      onConfirm={handleConfirm}
      skipReview
    >
      <div className="space-y-4">
        <ExpandableSection
          title="What is Removal?"
          isOpen={openSection === 'what'}
          onToggle={() => toggleSection('what')}
        >
          <div className="space-y-2 text-sm text-warm-muted">
            <p>
              Under 28 U.S.C. &sect; 1441, a defendant can &quot;remove&quot; a case
              from state court to federal court if the federal court would have
              had jurisdiction over the case originally.
            </p>
            <p>
              Common reasons for removal include diversity of citizenship (the
              parties are from different states and the amount exceeds $75,000)
              or the case involves a federal question (federal law).
            </p>
          </div>
        </ExpandableSection>

        <ExpandableSection
          title="What Happens to My Case?"
          isOpen={openSection === 'happens'}
          onToggle={() => toggleSection('happens')}
        >
          <div className="space-y-2 text-sm text-warm-muted">
            <p>
              Your case now proceeds in federal court under the Federal Rules
              of Civil Procedure (FRCP) instead of Texas state rules. Your
              claims stay the same, but the procedures are different.
            </p>
            <p>
              Key changes: You&apos;ll file through PACER/CM-ECF (federal electronic
              filing), discovery follows FRCP Rules 26-37, and you&apos;ll need to
              participate in a Rule 26(f) conference before formal discovery begins.
            </p>
          </div>
        </ExpandableSection>

        <ExpandableSection
          title="Your Options"
          isOpen={openSection === 'options'}
          onToggle={() => toggleSection('options')}
        >
          <div className="space-y-2 text-sm text-warm-muted">
            <p>You have three main options:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Accept the removal</strong> — File a First Amended
                Complaint in federal court and proceed with the case there.
              </li>
              <li>
                <strong>Motion to remand</strong> — Ask the federal judge to
                send the case back to state court (must be filed within 30 days).
              </li>
              <li>
                <strong>Both</strong> — File the motion to remand and prepare
                your amended complaint as a backup.
              </li>
            </ul>
            <p>
              In the next step, you&apos;ll choose which path to take.
            </p>
          </div>
        </ExpandableSection>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="removal-date">Date of removal *</Label>
            <Input
              id="removal-date"
              type="date"
              value={removalDate}
              onChange={(e) => setRemovalDate(e.target.value)}
            />
            <p className="text-xs text-warm-muted">
              The date the Notice of Removal was filed. Check the court docket.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="federal-case-number">Federal case number (optional)</Label>
            <Input
              id="federal-case-number"
              value={federalCaseNumber}
              onChange={(e) => setFederalCaseNumber(e.target.value)}
              placeholder="e.g. 4:26-cv-01234"
            />
          </div>
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
