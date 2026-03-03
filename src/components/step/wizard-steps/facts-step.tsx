'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { HelpTooltip } from '@/components/ui/help-tooltip'

interface FactsStepProps {
  description: string
  onDescriptionChange: (v: string) => void
  incidentDate: string
  onIncidentDateChange: (v: string) => void
  incidentLocation: string
  onIncidentLocationChange: (v: string) => void
  disputeType: string | null
}

function getExampleByDisputeType(disputeType: string | null): string {
  switch (disputeType) {
    case 'debt_collection':
      return 'Example: "On March 1, 2024, I loaned $3,000 to Jane Smith. She agreed to repay by June 1, 2024. Despite multiple requests, she has not paid any portion of the loan."'
    case 'landlord_tenant':
      return 'Example: "I rented an apartment at 123 Main St from ABC Properties starting January 2024. In March, the ceiling started leaking. I reported it multiple times, but the landlord never fixed it. I had to move out in May and lost my $1,500 deposit."'
    case 'personal_injury':
      return 'Example: "On April 15, 2024, I was rear-ended at the intersection of Main and Elm by a driver who was texting. I suffered neck and back injuries requiring physical therapy. My medical bills total $8,500."'
    case 'contract':
      return 'Example: "On January 10, 2024, I hired XYZ Contractors to remodel my kitchen for $15,000. I paid $10,000 upfront. They started work but abandoned the project half-done on February 20."'
    case 'property':
      return 'Example: "My neighbor built a fence that extends 3 feet onto my property at 456 Oak Lane. I had a survey done confirming the encroachment. They refused to move it after I showed them the survey."'
    default:
      return 'Example: "On [date], [what happened]. As a result, [what damages or harm occurred]. I tried to resolve this by [what you did], but [what happened]."'
  }
}

function getPlaceholder(disputeType: string | null): string {
  switch (disputeType) {
    case 'debt_collection':
      return 'Describe the debt: who owes what, the original agreement, and what happened...'
    case 'landlord_tenant':
      return 'Describe the lease issue: what went wrong, when, and how it affected you...'
    case 'personal_injury':
      return 'Describe what happened: the incident, your injuries, and your medical treatment...'
    case 'contract':
      return 'Describe the contract: what was agreed, how it was broken, and the impact...'
    case 'property':
      return 'Describe the property dispute: the property, your claim, and what happened...'
    default:
      return 'Describe what happened in your own words. Include dates, amounts, and key events...'
  }
}

export function FactsStep({
  description,
  onDescriptionChange,
  incidentDate,
  onIncidentDateChange,
  incidentLocation,
  onIncidentLocationChange,
  disputeType,
}: FactsStepProps) {
  const charCount = description.length
  const isTooShort = charCount > 0 && charCount < 50

  return (
    <div className="space-y-6">
      {/* Main description */}
      <div>
        <Label htmlFor="description" className="text-sm font-medium text-warm-text">
          In your own words, what happened?
        </Label>
        <HelpTooltip label="Tips for writing your story">
          <div className="space-y-2">
            <p>Focus on facts: what happened, when, where, and who was involved.</p>
            <p className="italic text-warm-muted">
              {getExampleByDisputeType(disputeType)}
            </p>
            <p>
              <strong>Don&apos;t worry about legal language.</strong> Write it the way you would
              explain it to a friend. We&apos;ll help format it for the court.
            </p>
          </div>
        </HelpTooltip>
        <textarea
          id="description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder={getPlaceholder(disputeType)}
          className="mt-2 w-full rounded-md border border-warm-border bg-white px-3 py-2 text-sm text-warm-text placeholder:text-warm-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
          style={{ minHeight: '150px' }}
          rows={6}
        />
        <div className="mt-1.5 flex items-center justify-between">
          <p
            className={`text-xs ${
              isTooShort ? 'text-red-500 font-medium' : 'text-warm-muted'
            }`}
          >
            {isTooShort
              ? `${charCount} characters -- At least 50 characters needed`
              : `${charCount} characters`}
            {!isTooShort && charCount > 0 && charCount < 200 && (
              <span className="text-warm-muted">
                {' '}-- Tip: More detail helps. Aim for at least a few sentences.
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Incident date */}
      <div>
        <Label htmlFor="incident-date" className="text-sm font-medium text-warm-text">
          When did this happen?
        </Label>
        <HelpTooltip label="What if it happened over time?">
          <p>
            If the issue happened over a period of time, pick the most important date &mdash;
            like when the contract was broken, when the injury happened, or when you first
            discovered the problem.
          </p>
        </HelpTooltip>
        <Input
          id="incident-date"
          type="date"
          value={incidentDate}
          onChange={(e) => onIncidentDateChange(e.target.value)}
          className="mt-2"
        />
      </div>

      {/* Incident location */}
      <div>
        <Label htmlFor="incident-location" className="text-sm font-medium text-warm-text">
          Where did this happen?
        </Label>
        <HelpTooltip label="How specific should I be?">
          <p>
            A city and state is usually enough. If it&apos;s relevant to your case (like a
            car accident at a specific intersection), include the exact location.
          </p>
        </HelpTooltip>
        <Input
          id="incident-location"
          value={incidentLocation}
          onChange={(e) => onIncidentLocationChange(e.target.value)}
          placeholder="e.g. Austin, Texas"
          className="mt-2"
        />
      </div>
    </div>
  )
}
