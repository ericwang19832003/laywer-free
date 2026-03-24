'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'

interface BreachStepProps {
  breachDescription: string
  onBreachDescriptionChange: (v: string) => void
  discoveryDate: string
  onDiscoveryDateChange: (v: string) => void
  performedObligations: string
  onPerformedObligationsChange: (v: string) => void
  priorDemandSent: boolean
  onPriorDemandSentChange: (v: boolean) => void
}

export function BreachStep({
  breachDescription, onBreachDescriptionChange,
  discoveryDate, onDiscoveryDateChange,
  performedObligations, onPerformedObligationsChange,
  priorDemandSent, onPriorDemandSentChange,
}: BreachStepProps) {
  return (
    <div className="space-y-5">
      <p className="text-sm text-warm-muted">
        Describe what went wrong. Be specific about what the other party did or didn&apos;t do.
      </p>

      <div className="space-y-2">
        <Label htmlFor="breach-description">What did the other party fail to do?</Label>
        <Textarea
          id="breach-description"
          placeholder="Describe the specific obligations the other party failed to perform. Reference contract terms, dates, and deliverables if possible..."
          rows={4}
          value={breachDescription}
          onChange={(e) => onBreachDescriptionChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="discovery-date">When did you discover the breach?</Label>
        <Input
          id="discovery-date"
          type="date"
          value={discoveryDate}
          onChange={(e) => onDiscoveryDateChange(e.target.value)}
        />
        <p className="text-xs text-warm-muted">
          Sometimes you discover a breach after the fact. This date helps establish your timeline.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="performed-obligations">What did you do to hold up your end? (optional)</Label>
        <Textarea
          id="performed-obligations"
          placeholder="Describe what you did to fulfill your obligations under the contract..."
          rows={3}
          value={performedObligations}
          onChange={(e) => onPerformedObligationsChange(e.target.value)}
        />
        <p className="text-xs text-warm-muted">
          Showing you performed your obligations strengthens your claim.
        </p>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <Checkbox
          id="demand-sent"
          checked={priorDemandSent}
          onCheckedChange={(c) => onPriorDemandSentChange(c === true)}
        />
        <Label htmlFor="demand-sent" className="text-sm cursor-pointer">
          I already sent a demand letter to the other party
        </Label>
      </div>
    </div>
  )
}
