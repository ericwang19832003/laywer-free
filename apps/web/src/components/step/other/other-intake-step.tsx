'use client'

import { useState } from 'react'
import { StepRunner } from '../step-runner'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface OtherIntakeStepProps {
  caseId: string
  taskId: string
  existingMetadata?: Record<string, unknown>
}

const OTHER_PARTY_TYPES = [
  { value: 'individual', label: 'Individual' },
  { value: 'business', label: 'Business' },
  { value: 'government', label: 'Government entity' },
]

const URGENCY_OPTIONS = [
  { value: 'routine', label: 'Routine — no immediate deadline' },
  { value: 'time_sensitive', label: 'Time-sensitive — deadline within weeks' },
  { value: 'urgent', label: 'Urgent — deadline within days' },
]

const CASE_STAGE_OPTIONS = [
  { value: 'start', label: 'Just starting — have not taken action yet' },
  { value: 'demand_sent', label: 'Sent a demand letter already' },
  { value: 'filed', label: 'Already filed with the court' },
  { value: 'served', label: 'Filed and served the other party' },
]

function formatOtherPartyType(value: string): string {
  const labels: Record<string, string> = {
    individual: 'Individual',
    business: 'Business',
    government: 'Government entity',
  }
  return labels[value] ?? value
}

function formatUrgency(value: string): string {
  const labels: Record<string, string> = {
    routine: 'Routine',
    time_sensitive: 'Time-sensitive',
    urgent: 'Urgent',
  }
  return labels[value] ?? value
}

function formatCaseStage(value: string): string {
  const labels: Record<string, string> = {
    start: 'Just starting',
    demand_sent: 'Demand letter sent',
    filed: 'Filed with court',
    served: 'Filed and served',
  }
  return labels[value] ?? value
}

export function OtherIntakeStep({
  caseId,
  taskId,
  existingMetadata,
}: OtherIntakeStepProps) {
  const [county, setCounty] = useState(
    (existingMetadata?.county as string) || ''
  )
  const [otherPartyName, setOtherPartyName] = useState(
    (existingMetadata?.other_party_name as string) || ''
  )
  const [otherPartyType, setOtherPartyType] = useState(
    (existingMetadata?.other_party_type as string) || ''
  )
  const [disputeDescription, setDisputeDescription] = useState(
    (existingMetadata?.dispute_description as string) || ''
  )
  const [damagesSought, setDamagesSought] = useState(
    (existingMetadata?.damages_sought as string) || ''
  )
  const [urgency, setUrgency] = useState(
    (existingMetadata?.urgency as string) || ''
  )
  const [hasPriorDemand, setHasPriorDemand] = useState(
    (existingMetadata?.has_prior_demand as boolean) || false
  )
  const [caseStage, setCaseStage] = useState(
    (existingMetadata?.case_stage as string) || ''
  )

  function buildMetadata() {
    return {
      county: county.trim() || null,
      other_party_name: otherPartyName.trim() || null,
      other_party_type: otherPartyType || null,
      dispute_description: disputeDescription.trim() || null,
      damages_sought: damagesSought ? parseFloat(damagesSought) || null : null,
      urgency: urgency || null,
      has_prior_demand: hasPriorDemand,
      case_stage: caseStage || null,
      guided_answers: {
        case_stage: caseStage || null,
      },
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

  const reviewContent = (
    <dl className="space-y-4">
      <div>
        <dt className="text-sm font-medium text-warm-muted">County</dt>
        <dd className="text-warm-text mt-0.5">
          {county.trim() || 'Not provided'}
        </dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-warm-muted">Other party</dt>
        <dd className="text-warm-text mt-0.5">
          {otherPartyName.trim() || 'Not provided'}
          {otherPartyType && (
            <span className="text-warm-muted"> ({formatOtherPartyType(otherPartyType)})</span>
          )}
        </dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-warm-muted">Description</dt>
        <dd className="text-warm-text mt-0.5">
          {disputeDescription.trim() || 'Not provided'}
        </dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-warm-muted">Damages sought</dt>
        <dd className="text-warm-text mt-0.5">
          {damagesSought
            ? `$${parseFloat(damagesSought).toLocaleString()}`
            : 'Not provided'}
        </dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-warm-muted">Urgency</dt>
        <dd className="text-warm-text mt-0.5">
          {urgency ? formatUrgency(urgency) : 'Not provided'}
        </dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-warm-muted">Prior demand letter</dt>
        <dd className="text-warm-text mt-0.5">
          {hasPriorDemand ? 'Yes' : 'No'}
        </dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-warm-muted">Case stage</dt>
        <dd className="text-warm-text mt-0.5">
          {caseStage ? formatCaseStage(caseStage) : 'Not provided'}
        </dd>
      </div>
    </dl>
  )

  return (
    <StepRunner
      caseId={caseId}
      taskId={taskId}
      title="Tell Us About Your Situation"
      reassurance="Even if your situation feels unique, the legal process follows clear steps we can guide you through."
      onConfirm={handleConfirm}
      onSave={handleSave}
      reviewContent={reviewContent}
    >
      <div className="space-y-5">
        {/* County */}
        <div className="space-y-2">
          <Label htmlFor="county">County</Label>
          <Input
            id="county"
            placeholder="e.g. Travis, Harris, Dallas"
            value={county}
            onChange={(e) => setCounty(e.target.value)}
          />
          <p className="text-xs text-warm-muted">
            The county where the dispute occurred or where you plan to file.
          </p>
        </div>

        {/* Other party name */}
        <div className="space-y-2">
          <Label htmlFor="other-party-name">Other party&apos;s name</Label>
          <Input
            id="other-party-name"
            placeholder="Person, company, or organization name"
            value={otherPartyName}
            onChange={(e) => setOtherPartyName(e.target.value)}
          />
        </div>

        {/* Other party type */}
        <div className="space-y-2">
          <Label htmlFor="other-party-type">Other party type</Label>
          <Select value={otherPartyType} onValueChange={setOtherPartyType}>
            <SelectTrigger id="other-party-type" className="w-full">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {OTHER_PARTY_TYPES.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Dispute description */}
        <div className="space-y-2">
          <Label htmlFor="dispute-description">
            Describe your situation
          </Label>
          <Textarea
            id="dispute-description"
            placeholder="What happened? Include key facts, dates, and how it affected you..."
            value={disputeDescription}
            onChange={(e) => setDisputeDescription(e.target.value)}
            rows={5}
          />
          <p className="text-xs text-warm-muted">
            Focus on facts: what happened, when, and who was involved.
          </p>
        </div>

        {/* Damages sought */}
        <div className="space-y-2">
          <Label htmlFor="damages-sought">
            Approximate damages sought ($){' '}
            <span className="font-normal text-warm-muted">(optional)</span>
          </Label>
          <Input
            id="damages-sought"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={damagesSought}
            onChange={(e) => setDamagesSought(e.target.value)}
          />
          <p className="text-xs text-warm-muted">
            An estimate is fine. You can refine this later.
          </p>
        </div>

        {/* Urgency */}
        <div className="space-y-2">
          <Label htmlFor="urgency">Urgency level</Label>
          <Select value={urgency} onValueChange={setUrgency}>
            <SelectTrigger id="urgency" className="w-full">
              <SelectValue placeholder="How urgent is this?" />
            </SelectTrigger>
            <SelectContent>
              {URGENCY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Prior demand */}
        <div className="flex items-start gap-3 rounded-lg border border-warm-border p-4">
          <Checkbox
            id="has-prior-demand"
            checked={hasPriorDemand}
            onCheckedChange={(checked) =>
              setHasPriorDemand(checked === true)
            }
          />
          <div className="space-y-0.5">
            <Label
              htmlFor="has-prior-demand"
              className="text-sm font-medium text-warm-text cursor-pointer"
            >
              I have already sent a demand letter
            </Label>
            <p className="text-xs text-warm-muted">
              A demand letter is a formal written request to the other party before filing a lawsuit.
            </p>
          </div>
        </div>

        {/* Case stage */}
        <div className="space-y-2">
          <Label htmlFor="case-stage">Where are you in this process?</Label>
          <Select value={caseStage} onValueChange={setCaseStage}>
            <SelectTrigger id="case-stage" className="w-full">
              <SelectValue placeholder="Select your current stage" />
            </SelectTrigger>
            <SelectContent>
              {CASE_STAGE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-warm-muted">
            This helps us skip steps you&apos;ve already completed.
          </p>
        </div>

        {/* Contextual reassurance */}
        {caseStage === 'start' && (
          <div className="rounded-lg bg-calm-indigo/5 border border-calm-indigo/10 px-4 py-3">
            <p className="text-sm text-calm-indigo">
              Starting fresh is completely normal. We will walk you through each step from the beginning.
            </p>
          </div>
        )}
      </div>
    </StepRunner>
  )
}
