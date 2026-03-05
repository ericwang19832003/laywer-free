'use client'

import { Button } from '@/components/ui/button'

export interface CatchUpData {
  caseNumber: string
  opposingParty: string
  filingDate: string
  serviceDate: string
  upcomingDeadlineLabel: string
  upcomingDeadlineDate: string
}

interface CatchUpStepProps {
  value: CatchUpData
  onChange: (data: CatchUpData) => void
  onContinue: () => void
}

const inputClasses =
  'w-full rounded-md border border-warm-border bg-background px-3 py-2 text-sm text-warm-text placeholder:text-warm-muted/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'

export function CatchUpStep({ value, onChange, onContinue }: CatchUpStepProps) {
  function update(field: keyof CatchUpData, v: string) {
    onChange({ ...value, [field]: v })
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-warm-text">Quick catch-up</p>
        <p className="text-xs text-warm-muted mt-1">
          Fill in what you know &mdash; all fields are optional. You can add more
          details later.
        </p>
      </div>

      {/* Case / cause number */}
      <div>
        <label className="text-xs font-medium text-warm-text mb-1 block">
          Case / cause number
        </label>
        <input
          type="text"
          className={inputClasses}
          placeholder="e.g. 2026-CV-12345"
          value={value.caseNumber}
          onChange={(e) => update('caseNumber', e.target.value)}
        />
      </div>

      {/* Opposing party name */}
      <div>
        <label className="text-xs font-medium text-warm-text mb-1 block">
          Opposing party name
        </label>
        <input
          type="text"
          className={inputClasses}
          placeholder="e.g. John Smith or Acme Corp"
          value={value.opposingParty}
          onChange={(e) => update('opposingParty', e.target.value)}
        />
      </div>

      {/* Filing date + Service date */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-warm-text mb-1 block">
            Filing date
          </label>
          <input
            type="date"
            className={inputClasses}
            value={value.filingDate}
            onChange={(e) => update('filingDate', e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-warm-text mb-1 block">
            Service date
          </label>
          <input
            type="date"
            className={inputClasses}
            value={value.serviceDate}
            onChange={(e) => update('serviceDate', e.target.value)}
          />
        </div>
      </div>

      {/* Next upcoming deadline */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-warm-text mb-1 block">
            Next deadline label
          </label>
          <input
            type="text"
            className={inputClasses}
            placeholder="e.g. Answer due"
            value={value.upcomingDeadlineLabel}
            onChange={(e) => update('upcomingDeadlineLabel', e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-warm-text mb-1 block">
            Deadline date
          </label>
          <input
            type="date"
            className={inputClasses}
            value={value.upcomingDeadlineDate}
            onChange={(e) => update('upcomingDeadlineDate', e.target.value)}
          />
        </div>
      </div>

      <Button type="button" className="w-full" onClick={onContinue}>
        Continue
      </Button>
    </div>
  )
}
