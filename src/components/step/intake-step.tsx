'use client'

import { useState } from 'react'
import { StepRunner } from './step-runner'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface IntakeStepProps {
  caseId: string
  taskId: string
  existingMetadata?: Record<string, unknown>
  caseData?: {
    county: string | null
    court_type: string | null
    dispute_type: string | null
  }
}

const COURT_TYPE_LABELS: Record<string, string> = {
  jp: 'JP Court (Small Claims)',
  county: 'County Court',
  district: 'District Court',
  federal: 'Federal Court',
  unknown: 'Not determined',
}

const DISPUTE_TYPE_LABELS: Record<string, string> = {
  debt_collection: 'Money owed (debt/contract)',
  landlord_tenant: 'Landlord-tenant issue',
  personal_injury: 'Property damage or personal injury',
  contract: 'Business or contract dispute',
  property: 'Property or real estate',
  family: 'Family matter',
  other: 'Other',
}

const COURT_TYPES = [
  { value: 'jp', label: 'Justice of the Peace (JP)' },
  { value: 'county', label: 'County Court' },
  { value: 'district', label: 'District Court' },
  { value: 'federal', label: 'Federal Court' },
  { value: 'unsure', label: "I'm not sure" },
]

function formatCourtType(value: string): string {
  return COURT_TYPE_LABELS[value] ?? value
}

function formatDisputeType(value: string): string {
  return DISPUTE_TYPE_LABELS[value] ?? value
}

export function IntakeStep({
  caseId,
  taskId,
  existingMetadata,
  caseData,
}: IntakeStepProps) {
  // Fields already captured by the wizard (from case record)
  const hasCounty = Boolean(caseData?.county)
  const hasCourtType = Boolean(caseData?.court_type && caseData.court_type !== 'unknown')
  const hasDisputeType = Boolean(caseData?.dispute_type)

  // Only show editable county/court fields if the wizard didn't capture them
  const [county, setCounty] = useState(
    (existingMetadata?.county as string) || caseData?.county || ''
  )
  const [courtType, setCourtType] = useState(
    (existingMetadata?.court_type as string) || caseData?.court_type || ''
  )
  const [narrative, setNarrative] = useState(
    (existingMetadata?.narrative as string) || ''
  )

  function buildMetadata() {
    return {
      county: county.trim() || null,
      court_type: courtType || null,
      narrative: narrative.trim() || null,
    }
  }

  async function patchTask(status: string, metadata?: Record<string, unknown>) {
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

  // Read-only summary of wizard-captured fields
  const wizardSummary = (hasCounty || hasCourtType || hasDisputeType) ? (
    <div className="rounded-lg border border-warm-border bg-white p-4 space-y-2 mb-2">
      <p className="text-xs font-medium text-warm-muted uppercase tracking-wide">
        From your case setup
      </p>
      <dl className="space-y-1.5">
        {hasCourtType && (
          <div className="flex gap-2">
            <dt className="text-sm text-warm-muted">Court:</dt>
            <dd className="text-sm text-warm-text">{formatCourtType(caseData!.court_type!)}</dd>
          </div>
        )}
        {hasDisputeType && (
          <div className="flex gap-2">
            <dt className="text-sm text-warm-muted">Dispute:</dt>
            <dd className="text-sm text-warm-text">{formatDisputeType(caseData!.dispute_type!)}</dd>
          </div>
        )}
        {hasCounty && (
          <div className="flex gap-2">
            <dt className="text-sm text-warm-muted">County:</dt>
            <dd className="text-sm text-warm-text">{caseData!.county}</dd>
          </div>
        )}
      </dl>
    </div>
  ) : null

  const reviewContent = (
    <dl className="space-y-4">
      {hasCourtType && (
        <div>
          <dt className="text-sm font-medium text-warm-muted">Court type</dt>
          <dd className="text-warm-text mt-0.5">{formatCourtType(caseData!.court_type!)}</dd>
        </div>
      )}
      {hasDisputeType && (
        <div>
          <dt className="text-sm font-medium text-warm-muted">Dispute type</dt>
          <dd className="text-warm-text mt-0.5">{formatDisputeType(caseData!.dispute_type!)}</dd>
        </div>
      )}
      <div>
        <dt className="text-sm font-medium text-warm-muted">County</dt>
        <dd className="text-warm-text mt-0.5">
          {county.trim() || (hasCounty ? caseData!.county : 'Not provided')}
        </dd>
      </div>
      {!hasCourtType && (
        <div>
          <dt className="text-sm font-medium text-warm-muted">Court type</dt>
          <dd className="text-warm-text mt-0.5">
            {courtType ? formatCourtType(courtType) : 'Not provided'}
          </dd>
        </div>
      )}
      <div>
        <dt className="text-sm font-medium text-warm-muted">Description</dt>
        <dd className="text-warm-text mt-0.5">
          {narrative.trim() || 'Not provided'}
        </dd>
      </div>
    </dl>
  )

  return (
    <StepRunner
      caseId={caseId}
      taskId={taskId}
      title="Basic Case Information"
      reassurance="This helps us tailor the process to your situation. You can skip anything you're unsure about."
      onConfirm={handleConfirm}
      onSave={handleSave}
      reviewContent={reviewContent}
    >
      <div className="space-y-5">
        {wizardSummary}

        {/* Only show county field if wizard didn't capture it */}
        {!hasCounty && (
          <div className="space-y-2">
            <Label htmlFor="county">County</Label>
            <Input
              id="county"
              placeholder="e.g. Travis, Harris, Dallas"
              value={county}
              onChange={(e) => setCounty(e.target.value)}
            />
            <p className="text-xs text-warm-muted">
              The county where your case was filed or will be filed.
            </p>
          </div>
        )}

        {/* Only show court type field if wizard didn't capture it */}
        {!hasCourtType && (
          <div className="space-y-2">
            <Label htmlFor="court-type">Court type</Label>
            <Select value={courtType} onValueChange={setCourtType}>
              <SelectTrigger id="court-type" className="w-full">
                <SelectValue placeholder="Select court type" />
              </SelectTrigger>
              <SelectContent>
                {COURT_TYPES.map((ct) => (
                  <SelectItem key={ct.value} value={ct.value}>
                    {ct.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-warm-muted">
              Not sure? That&apos;s okay — select &quot;I&apos;m not
              sure&quot; and we&apos;ll help figure it out.
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="narrative">
            Brief description of your situation{' '}
            <span className="font-normal text-warm-muted">(optional)</span>
          </Label>
          <Textarea
            id="narrative"
            placeholder="A few sentences about what happened..."
            value={narrative}
            onChange={(e) => setNarrative(e.target.value)}
            rows={4}
          />
          <p className="text-xs text-warm-muted">
            This is just for your own reference. You can always update it
            later.
          </p>
        </div>
      </div>
    </StepRunner>
  )
}
