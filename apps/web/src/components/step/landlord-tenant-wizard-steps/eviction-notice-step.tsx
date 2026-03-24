'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { HelpTooltip } from '@/components/ui/help-tooltip'

interface EvictionNoticeStepProps {
  noticeDate: string
  noticeType: string
  reason: string
  tenantCured: string
  onFieldChange: (field: string, value: string) => void
}

const NOTICE_TYPES = [
  { value: '', label: 'Select notice type...' },
  { value: '3_day_pay_or_quit', label: '3-Day Pay or Quit' },
  { value: '30_day', label: '30-Day Notice' },
  { value: 'cure_or_quit', label: 'Cure or Quit' },
  { value: 'unconditional_quit', label: 'Unconditional Quit' },
]

const EVICTION_REASONS = [
  { value: '', label: 'Select reason...' },
  { value: 'nonpayment', label: 'Nonpayment of rent' },
  { value: 'lease_violation', label: 'Lease violation' },
  { value: 'holdover', label: 'Holdover (lease expired)' },
  { value: 'criminal_activity', label: 'Criminal activity' },
]

export function EvictionNoticeStep({
  noticeDate,
  noticeType,
  reason,
  tenantCured,
  onFieldChange,
}: EvictionNoticeStepProps) {
  return (
    <div className="space-y-6">
      {/* Info callout */}
      <div className="rounded-lg border border-calm-indigo/20 bg-calm-indigo/5 p-4">
        <p className="text-sm text-warm-text">
          <strong>Texas notice requirements:</strong> Under Tex. Prop. Code &sect; 24.005, a
          landlord must give a tenant at least 3 days&apos; written notice to vacate before
          filing an eviction suit, unless the lease provides for a shorter or longer period.
          The notice must be delivered in person, by mail, or by posting on the inside of the
          main entry door.
        </p>
      </div>

      {/* Notice date */}
      <div>
        <Label htmlFor="notice-date" className="text-sm font-medium text-warm-text">
          When was the notice given?
        </Label>
        <HelpTooltip label="Why does the date matter?">
          <p>
            The notice date is critical because Texas law requires the notice period to expire
            before an eviction suit can be filed. If the required waiting period has not passed,
            the court may dismiss the case.
          </p>
        </HelpTooltip>
        <Input
          id="notice-date"
          type="date"
          value={noticeDate}
          onChange={(e) => onFieldChange('noticeDate', e.target.value)}
          className="mt-2"
        />
      </div>

      {/* Notice type */}
      <div>
        <Label htmlFor="notice-type" className="text-sm font-medium text-warm-text">
          What type of notice was given?
        </Label>
        <HelpTooltip label="What are the different notice types?">
          <div className="space-y-2">
            <p><strong>3-Day Pay or Quit:</strong> Tenant has 3 days to pay overdue rent or leave.</p>
            <p><strong>30-Day Notice:</strong> Standard notice to end a month-to-month tenancy.</p>
            <p><strong>Cure or Quit:</strong> Tenant has a set period to fix a lease violation or leave.</p>
            <p><strong>Unconditional Quit:</strong> Tenant must leave with no option to fix the issue (e.g., criminal activity).</p>
          </div>
        </HelpTooltip>
        <select
          id="notice-type"
          value={noticeType}
          onChange={(e) => onFieldChange('noticeType', e.target.value)}
          className="mt-2 w-full rounded-md border border-warm-border bg-white px-3 py-2 text-sm text-warm-text focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          {NOTICE_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Reason */}
      <div>
        <Label htmlFor="eviction-reason" className="text-sm font-medium text-warm-text">
          Reason for eviction
        </Label>
        <HelpTooltip label="Why does the reason matter?">
          <p>
            The reason for eviction determines what notice is required, what defenses the
            tenant may have, and how the court will evaluate the case. Be specific and
            accurate about the reason.
          </p>
        </HelpTooltip>
        <select
          id="eviction-reason"
          value={reason}
          onChange={(e) => onFieldChange('reason', e.target.value)}
          className="mt-2 w-full rounded-md border border-warm-border bg-white px-3 py-2 text-sm text-warm-text focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          {EVICTION_REASONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      {/* Tenant cured — only for cure_or_quit notices */}
      {noticeType === 'cure_or_quit' && (
        <div>
          <Label className="text-sm font-medium text-warm-text">
            Did the tenant cure (fix) the violation?
          </Label>
          <HelpTooltip label="What does 'cure' mean?">
            <p>
              Curing means the tenant fixed the lease violation within the notice period.
              For example, if the notice was about an unauthorized pet, the tenant removed
              the pet. If the tenant cured the violation, you generally cannot proceed
              with the eviction for that specific violation.
            </p>
          </HelpTooltip>
          <div className="mt-2 space-y-2">
            <label className="flex items-start gap-3 cursor-pointer rounded-lg border border-warm-border p-3 transition-colors hover:bg-warm-bg/50">
              <input
                type="radio"
                name="tenantCured"
                value="yes"
                checked={tenantCured === 'yes'}
                onChange={(e) => onFieldChange('tenantCured', e.target.value)}
                className="mt-0.5 h-4 w-4 shrink-0 border-warm-border text-calm-indigo focus:ring-calm-indigo"
              />
              <span className="text-sm text-warm-text">Yes, they fixed the issue</span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer rounded-lg border border-warm-border p-3 transition-colors hover:bg-warm-bg/50">
              <input
                type="radio"
                name="tenantCured"
                value="no"
                checked={tenantCured === 'no'}
                onChange={(e) => onFieldChange('tenantCured', e.target.value)}
                className="mt-0.5 h-4 w-4 shrink-0 border-warm-border text-calm-indigo focus:ring-calm-indigo"
              />
              <span className="text-sm text-warm-text">No, the issue was not fixed</span>
            </label>
          </div>

          {tenantCured === 'yes' && (
            <div className="mt-2 rounded-lg border border-calm-amber/40 bg-calm-amber/5 p-3 text-sm text-warm-text">
              If the tenant cured the violation within the notice period, you may not be able to
              proceed with an eviction based on that violation. Consult with a legal professional
              about your options.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
