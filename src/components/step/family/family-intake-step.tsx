'use client'

import { useState } from 'react'
import { StepRunner } from '../step-runner'
import { HelpTooltip } from '@/components/ui/help-tooltip'

interface FamilyIntakeStepProps {
  caseId: string
  taskId: string
  existingMetadata?: Record<string, unknown>
}

export function FamilyIntakeStep({
  caseId,
  taskId,
  existingMetadata,
}: FamilyIntakeStepProps) {
  const [county, setCounty] = useState(
    (existingMetadata?.county as string) || ''
  )
  const [narrative, setNarrative] = useState(
    (existingMetadata?.narrative as string) || ''
  )
  const [militaryInvolved, setMilitaryInvolved] = useState(
    (existingMetadata?.military_involved as boolean) || false
  )

  function buildMetadata() {
    return {
      county: county.trim() || null,
      narrative: narrative.trim() || null,
      military_involved: militaryInvolved,
    }
  }

  async function patchTask(
    status: string,
    metadata?: Record<string, unknown>
  ) {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, ...(metadata ? { metadata } : {}) }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Failed to update task')
    }
  }

  async function handleConfirm() {
    const metadata = buildMetadata()
    await patchTask('in_progress', metadata)
    await patchTask('completed')
  }

  async function handleSave() {
    const metadata = buildMetadata()
    await patchTask('in_progress', metadata)
  }

  const reviewContent = (
    <dl className="space-y-4">
      <div>
        <dt className="text-sm font-medium text-warm-muted">Filing county</dt>
        <dd className="text-warm-text mt-0.5">
          {county.trim() || 'Not provided'}
        </dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-warm-muted">
          Description of situation
        </dt>
        <dd className="text-warm-text mt-0.5">
          {narrative.trim() || 'Not provided'}
        </dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-warm-muted">
          Military service involved
        </dt>
        <dd className="text-warm-text mt-0.5">
          {militaryInvolved ? 'Yes' : 'No'}
        </dd>
      </div>
    </dl>
  )

  return (
    <StepRunner
      caseId={caseId}
      taskId={taskId}
      title="Family Case Information"
      reassurance="This helps us tailor the process to your family matter. You can skip anything you're unsure about."
      onConfirm={handleConfirm}
      onSave={handleSave}
      reviewContent={reviewContent}
    >
      <div className="space-y-5">
        {/* Read-only info card showing case type */}
        <div className="rounded-lg border border-warm-border bg-white p-4 space-y-2">
          <p className="text-xs font-medium text-warm-muted uppercase tracking-wide">
            Case type
          </p>
          <p className="text-sm text-warm-text">Family Matter</p>
        </div>

        {/* County */}
        <div className="space-y-2">
          <label
            htmlFor="family-county"
            className="text-sm font-medium text-warm-text"
          >
            What county will you file in?
          </label>
          <input
            id="family-county"
            type="text"
            placeholder="e.g. Travis, Harris, Dallas"
            value={county}
            onChange={(e) => setCounty(e.target.value)}
            className="flex h-9 w-full rounded-md border border-warm-border bg-transparent px-3 py-1 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo"
          />
          <p className="text-xs text-warm-muted">
            Usually the county where you or the other party live.
          </p>
        </div>

        {/* Narrative */}
        <div className="space-y-2">
          <label
            htmlFor="family-narrative"
            className="text-sm font-medium text-warm-text"
          >
            Brief description of your situation{' '}
            <span className="font-normal text-warm-muted">(optional)</span>
          </label>
          <textarea
            id="family-narrative"
            placeholder="A few sentences about your situation..."
            value={narrative}
            onChange={(e) => setNarrative(e.target.value)}
            rows={4}
            className="flex min-h-[60px] w-full rounded-md border border-warm-border bg-transparent px-3 py-2 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo"
          />
          <p className="text-xs text-warm-muted">
            This is just for your own reference. You can always update it later.
          </p>
        </div>

        {/* Military service */}
        <div className="space-y-2">
          <label className="flex items-start gap-3 cursor-pointer rounded-lg border border-warm-border p-3 transition-colors hover:bg-warm-bg/50">
            <input
              type="checkbox"
              checked={militaryInvolved}
              onChange={(e) => setMilitaryInvolved(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-warm-border text-calm-indigo focus:ring-calm-indigo"
            />
            <span className="text-sm text-warm-text">
              Does anyone in this case serve in the military?
            </span>
          </label>
          <HelpTooltip label="Why does military service matter?">
            Military service can affect timelines and procedures. The
            Servicemembers Civil Relief Act (SCRA) provides protections for
            active duty service members, including the ability to postpone court
            proceedings and limit default judgments.
          </HelpTooltip>
        </div>
      </div>
    </StepRunner>
  )
}
