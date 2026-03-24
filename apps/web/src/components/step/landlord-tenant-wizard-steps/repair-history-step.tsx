'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { HelpTooltip } from '@/components/ui/help-tooltip'
import { Trash2 } from 'lucide-react'

interface RepairRequest {
  date: string
  issue: string
  response: string
  status: string
}

interface RepairHistoryStepProps {
  requests: RepairRequest[]
  onRequestsChange: (requests: RepairRequest[]) => void
}

const STATUS_OPTIONS = [
  { value: '', label: 'Select status...' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'ignored', label: 'Ignored' },
  { value: 'partial', label: 'Partially completed' },
]

const ISSUE_SUGGESTIONS = [
  'Plumbing leak',
  'HVAC not working',
  'Pest infestation',
  'Broken appliance',
  'Mold/moisture issue',
  'Electrical problem',
]

export function RepairHistoryStep({
  requests,
  onRequestsChange,
}: RepairHistoryStepProps) {
  function updateRequest(index: number, field: keyof RepairRequest, value: string) {
    const updated = [...requests]
    updated[index] = { ...updated[index], [field]: value }
    onRequestsChange(updated)
  }

  function addRequest() {
    onRequestsChange([
      ...requests,
      { date: '', issue: '', response: '', status: '' },
    ])
  }

  function removeRequest(index: number) {
    onRequestsChange(requests.filter((_, i) => i !== index))
  }

  function applySuggestion(issue: string) {
    const emptyIndex = requests.findIndex(
      (req) => !req.date && !req.issue && !req.response
    )

    if (emptyIndex >= 0) {
      const updated = [...requests]
      updated[emptyIndex] = { ...updated[emptyIndex], issue }
      onRequestsChange(updated)
      return
    }

    onRequestsChange([
      ...requests,
      { date: '', issue, response: '', status: '' },
    ])
  }

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-sm font-medium text-warm-text">
          Repair Request History
        </Label>
        <p className="text-sm text-warm-muted mt-1">
          List all repair requests you made to the landlord, including the date, issue,
          and how the landlord responded.
        </p>
        <HelpTooltip label="Why is repair history important?">
          <p>
            A documented history of repair requests shows the court that you notified the
            landlord about the issues and gave them a reasonable opportunity to fix them.
            Under Texas law (Tex. Prop. Code &sect; 92.0563), written notice is generally
            required before pursuing repair remedies.
          </p>
        </HelpTooltip>
      </div>

      {/* Issue suggestions */}
      <div className="rounded-lg border border-calm-indigo/20 bg-calm-indigo/5 p-3">
        <p className="text-xs font-medium text-warm-muted mb-1.5">Common repair issues:</p>
        <div className="flex flex-wrap gap-1.5">
          {ISSUE_SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => applySuggestion(suggestion)}
              className="rounded-full bg-white px-2.5 py-0.5 text-xs text-warm-text border border-warm-border transition hover:border-calm-indigo/40 hover:bg-calm-indigo/10"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Guidance callout */}
      <div className="rounded-lg bg-calm-indigo/5 border border-calm-indigo/20 p-3 text-xs text-warm-text">
        <strong>Tip:</strong> Always make repair requests in writing (email or text) so you
        have proof. If you made requests verbally, note the approximate date and what was said.
      </div>

      {/* Repair requests list */}
      <div className="space-y-4">
        {requests.map((request, i) => (
          <div
            key={i}
            className="rounded-lg border border-warm-border p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-warm-muted">
                Request {i + 1}
              </span>
              {requests.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRequest(i)}
                  className="text-xs text-warm-muted hover:text-warm-text flex items-center gap-1"
                >
                  <Trash2 className="h-3 w-3" />
                  Remove
                </button>
              )}
            </div>

            <div>
              <Label htmlFor={`request-date-${i}`} className="text-xs text-warm-muted">
                Date of request
              </Label>
              <Input
                id={`request-date-${i}`}
                type="date"
                value={request.date}
                onChange={(e) => updateRequest(i, 'date', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor={`request-issue-${i}`} className="text-xs text-warm-muted">
                What was the issue?
              </Label>
              <textarea
                id={`request-issue-${i}`}
                value={request.issue}
                onChange={(e) => updateRequest(i, 'issue', e.target.value)}
                placeholder="Describe the repair issue..."
                className="mt-1 w-full rounded-md border border-warm-border bg-white px-3 py-2 text-sm text-warm-text placeholder:text-warm-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                style={{ minHeight: '72px' }}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor={`request-response-${i}`} className="text-xs text-warm-muted">
                Landlord&apos;s response
              </Label>
              <Input
                id={`request-response-${i}`}
                value={request.response}
                onChange={(e) => updateRequest(i, 'response', e.target.value)}
                placeholder="e.g. No response, Sent repair person, Denied responsibility"
              />
            </div>

            <div>
              <Label htmlFor={`request-status-${i}`} className="text-xs text-warm-muted">
                Status
              </Label>
              <select
                id={`request-status-${i}`}
                value={request.status}
                onChange={(e) => updateRequest(i, 'status', e.target.value)}
                className="mt-1 w-full rounded-md border border-warm-border bg-white px-3 py-2 text-sm text-warm-text focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addRequest}
      >
        + Add repair request
      </Button>
    </div>
  )
}
