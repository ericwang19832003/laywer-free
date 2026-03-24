'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { HelpTooltip } from '@/components/ui/help-tooltip'

interface LtLeaseStepProps {
  leaseStartDate: string
  leaseEndDate: string
  leaseType: string
  monthlyRent: string
  onFieldChange: (field: string, value: string) => void
}

const LEASE_TYPES = [
  { value: 'fixed_term', label: 'Fixed-term lease (e.g., 12 months)' },
  { value: 'month_to_month', label: 'Month-to-month' },
  { value: 'oral', label: 'Oral (verbal) agreement' },
]

export function LtLeaseStep({
  leaseStartDate,
  leaseEndDate,
  leaseType,
  monthlyRent,
  onFieldChange,
}: LtLeaseStepProps) {
  return (
    <div className="space-y-6">
      {/* Lease type */}
      <div>
        <Label className="text-sm font-medium text-warm-text">
          What type of lease do you have?
        </Label>
        <HelpTooltip label="What's the difference?">
          <p>
            A <strong>fixed-term lease</strong> has a set start and end date (e.g., 12 months).
            A <strong>month-to-month</strong> lease renews automatically each month.
            An <strong>oral agreement</strong> is a verbal understanding with no written lease.
          </p>
        </HelpTooltip>
        <div className="mt-2 space-y-2">
          {LEASE_TYPES.map((type) => (
            <label
              key={type.value}
              className="flex items-start gap-3 cursor-pointer rounded-lg border border-warm-border p-3 transition-colors hover:bg-warm-bg/50"
            >
              <input
                type="radio"
                name="leaseType"
                value={type.value}
                checked={leaseType === type.value}
                onChange={(e) => onFieldChange('leaseType', e.target.value)}
                className="mt-0.5 h-4 w-4 shrink-0 border-warm-border text-calm-indigo focus:ring-calm-indigo"
              />
              <span className="text-sm text-warm-text">{type.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Info callout for oral leases */}
      {leaseType === 'oral' && (
        <div className="rounded-lg border border-calm-indigo/20 bg-calm-indigo/5 p-3 text-sm text-warm-text">
          <strong>Oral leases:</strong> Oral agreements are enforceable in Texas, but they can
          be harder to prove. Text messages, emails, or witnesses can help establish the terms
          of your agreement. Write down the terms as you understood them.
        </div>
      )}

      {/* Lease start date */}
      <div>
        <Label htmlFor="lease-start-date" className="text-sm font-medium text-warm-text">
          When did the lease start?
        </Label>
        <Input
          id="lease-start-date"
          type="date"
          value={leaseStartDate}
          onChange={(e) => onFieldChange('leaseStartDate', e.target.value)}
          className="mt-2"
        />
      </div>

      {/* Lease end date */}
      <div>
        <Label htmlFor="lease-end-date" className="text-sm font-medium text-warm-text">
          When does (or did) the lease end?
        </Label>
        <HelpTooltip label="What if I'm month-to-month?">
          <p>
            For month-to-month leases, you can leave this blank or enter the date your
            tenancy ended (or is expected to end). For oral agreements, enter the date
            you moved out or plan to move out.
          </p>
        </HelpTooltip>
        <Input
          id="lease-end-date"
          type="date"
          value={leaseEndDate}
          onChange={(e) => onFieldChange('leaseEndDate', e.target.value)}
          className="mt-2"
        />
      </div>

      {/* Monthly rent */}
      <div>
        <Label htmlFor="monthly-rent" className="text-sm font-medium text-warm-text">
          Monthly rent amount
        </Label>
        <HelpTooltip label="What amount should I enter?">
          <p>
            Enter the base monthly rent amount before any utilities, fees, or other charges.
            This is the amount specified in your lease agreement.
          </p>
        </HelpTooltip>
        <div className="relative mt-2">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-warm-muted">$</span>
          <Input
            id="monthly-rent"
            type="number"
            min="0"
            step="0.01"
            value={monthlyRent}
            onChange={(e) => onFieldChange('monthlyRent', e.target.value)}
            placeholder="0.00"
            className="pl-7"
          />
        </div>
      </div>
    </div>
  )
}
