'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { HelpTooltip } from '@/components/ui/help-tooltip'

interface ExistingOrdersStepProps {
  court: string
  causeNumber: string
  whatToModify: string[]
  changeDescription: string
  onCourtChange: (v: string) => void
  onCauseNumberChange: (v: string) => void
  onWhatToModifyChange: (v: string[]) => void
  onChangeDescriptionChange: (v: string) => void
}

const modifyOptions = [
  { value: 'custody', label: 'Custody' },
  { value: 'visitation', label: 'Visitation' },
  { value: 'child_support', label: 'Child Support' },
  { value: 'spousal_support', label: 'Spousal Support' },
]

const commonChanges = [
  { label: 'Income change', value: 'Income has changed significantly.' },
  { label: 'Schedule change', value: 'Work or school schedules have changed.' },
  { label: 'Relocation', value: 'Someone has moved to a new county or city.' },
  { label: 'Safety concern', value: 'There are new safety or stability concerns.' },
]

export function ExistingOrdersStep({
  court,
  causeNumber,
  whatToModify,
  changeDescription,
  onCourtChange,
  onCauseNumberChange,
  onWhatToModifyChange,
  onChangeDescriptionChange,
}: ExistingOrdersStepProps) {
  function toggleModifyOption(value: string) {
    if (whatToModify.includes(value)) {
      onWhatToModifyChange(whatToModify.filter((v) => v !== value))
    } else {
      onWhatToModifyChange([...whatToModify, value])
    }
  }

  function appendChange(value: string) {
    if (!changeDescription.includes(value)) {
      const next = changeDescription.trim()
        ? `${changeDescription.trim()} ${value}`
        : value
      onChangeDescriptionChange(next)
    }
  }

  return (
    <div className="space-y-6">
      {/* Court */}
      <div>
        <Label htmlFor="eo-court" className="text-sm font-medium text-warm-text">
          What court issued the original order?
        </Label>
        <HelpTooltip label="Where do I find this?">
          <p>
            Look at the top of your existing court order. It will say something like
            &quot;In the 311th Judicial District Court of Harris County, Texas.&quot; Include
            the full court name and county.
          </p>
        </HelpTooltip>
        <Input
          id="eo-court"
          value={court}
          onChange={(e) => onCourtChange(e.target.value)}
          placeholder="e.g. 311th Judicial District Court, Harris County"
          className="mt-2"
        />
      </div>

      {/* Cause number */}
      <div>
        <Label htmlFor="eo-cause-number" className="text-sm font-medium text-warm-text">
          Cause number
        </Label>
        <HelpTooltip label="Where do I find the cause number?">
          <p>
            The cause number is at the top of your existing court order. It looks something
            like &quot;2023-12345&quot; or &quot;FC-2023-0001.&quot; This number connects your
            modification request to the original case.
          </p>
        </HelpTooltip>
        <Input
          id="eo-cause-number"
          value={causeNumber}
          onChange={(e) => onCauseNumberChange(e.target.value)}
          placeholder="e.g. 2023-12345"
          className="mt-2"
        />
      </div>

      {/* What to modify */}
      <div>
        <Label className="text-sm font-medium text-warm-text">
          What do you want to change?
        </Label>
        <p className="text-xs text-warm-muted mt-0.5">Select all that apply.</p>

        <div className="space-y-2 mt-3">
          {modifyOptions.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-3 cursor-pointer rounded-lg border border-warm-border p-3 transition-colors hover:bg-warm-bg/50"
            >
              <input
                type="checkbox"
                checked={whatToModify.includes(option.value)}
                onChange={() => toggleModifyOption(option.value)}
                className="h-4 w-4 shrink-0 rounded border-warm-border text-calm-indigo focus:ring-calm-indigo"
              />
              <span className="text-sm text-warm-text">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Change description */}
      <div>
        <Label htmlFor="eo-change-description" className="text-sm font-medium text-warm-text">
          Why has the situation changed?
        </Label>
        <HelpTooltip label="What is a 'material and substantial change'?">
          <p>
            To modify a court order, you must show a &quot;material and substantial change in
            circumstances.&quot; Examples: job loss or significant change in income, relocation,
            child&apos;s needs have changed (new medical or educational needs), safety concerns,
            or the current arrangement is no longer working for the child.
          </p>
        </HelpTooltip>
        <textarea
          id="eo-change-description"
          value={changeDescription}
          onChange={(e) => onChangeDescriptionChange(e.target.value)}
          placeholder="Explain what has changed since the last order was issued..."
          className="mt-2 w-full rounded-md border border-warm-border bg-white px-3 py-2 text-sm text-warm-text placeholder:text-warm-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
          style={{ minHeight: '120px' }}
          rows={5}
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {commonChanges.map((change) => (
            <button
              key={change.label}
              type="button"
              onClick={() => appendChange(change.value)}
              className="rounded-full border border-warm-border px-3 py-1 text-xs text-warm-text hover:bg-warm-bg/60"
            >
              {change.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
