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
}

const COURT_TYPES = [
  { value: 'jp', label: 'Justice of the Peace (JP)' },
  { value: 'county', label: 'County Court' },
  { value: 'district', label: 'District Court' },
  { value: 'unsure', label: "I'm not sure" },
]

function formatCourtType(value: string): string {
  const found = COURT_TYPES.find((ct) => ct.value === value)
  return found ? found.label : value
}

export function IntakeStep({
  caseId,
  taskId,
  existingMetadata,
}: IntakeStepProps) {
  const [county, setCounty] = useState(
    (existingMetadata?.county as string) || ''
  )
  const [courtType, setCourtType] = useState(
    (existingMetadata?.court_type as string) || ''
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

    // Transition: todo -> in_progress (with metadata)
    await patchTask('in_progress', metadata)

    // Transition: in_progress -> completed
    await patchTask('completed')
  }

  async function handleSave() {
    const metadata = buildMetadata()

    // Transition: todo -> in_progress (with metadata saved)
    await patchTask('in_progress', metadata)
  }

  const reviewContent = (
    <dl className="space-y-4">
      <div>
        <dt className="text-sm font-medium text-warm-muted">County</dt>
        <dd className="text-warm-text mt-0.5">
          {county.trim() || 'Not provided'}
        </dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-warm-muted">Court type</dt>
        <dd className="text-warm-text mt-0.5">
          {courtType ? formatCourtType(courtType) : 'Not provided'}
        </dd>
      </div>
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
