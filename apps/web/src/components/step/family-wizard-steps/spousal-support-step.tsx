'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { HelpTooltip } from '@/components/ui/help-tooltip'
import { Scale } from 'lucide-react'

interface SpousalSupportStepProps {
  requestingSpousalSupport: boolean
  amount: string
  durationMonths: string
  onRequestingChange: (v: boolean) => void
  onAmountChange: (v: string) => void
  onDurationChange: (v: string) => void
}

export function SpousalSupportStep({
  requestingSpousalSupport,
  amount,
  durationMonths,
  onRequestingChange,
  onAmountChange,
  onDurationChange,
}: SpousalSupportStepProps) {
  return (
    <div className="space-y-6">
      {/* Request checkbox */}
      <div>
        <label className="flex items-start gap-3 cursor-pointer rounded-lg border border-warm-border p-4 transition-colors hover:bg-warm-bg/50">
          <input
            type="checkbox"
            checked={requestingSpousalSupport}
            onChange={(e) => onRequestingChange(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-warm-border text-calm-indigo focus:ring-calm-indigo"
          />
          <div>
            <span className="text-sm font-medium text-warm-text">
              Are you requesting spousal maintenance?
            </span>
            <p className="text-xs text-warm-muted mt-0.5">
              Spousal maintenance (sometimes called alimony) is periodic support from
              one spouse to the other after divorce.
            </p>
          </div>
        </label>

        <HelpTooltip label="Is spousal maintenance available to me?">
          <p>
            Spousal maintenance in Texas is limited and has strict eligibility
            requirements, unlike some other states. You must meet specific criteria
            under Texas Family Code &sect; 8.051 to qualify.
          </p>
        </HelpTooltip>
      </div>

      {requestingSpousalSupport && (
        <>
          {/* Amount and duration */}
          <div className="rounded-lg border border-warm-border p-4 space-y-4">
            <div>
              <Label htmlFor="ss-amount" className="text-sm font-medium text-warm-text">
                Monthly amount requested
              </Label>
              <div className="relative mt-2">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-warm-muted">$</span>
                <Input
                  id="ss-amount"
                  type="number"
                  min={0}
                  step="0.01"
                  value={amount}
                  onChange={(e) => onAmountChange(e.target.value)}
                  placeholder="0.00"
                  className="pl-7"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="ss-duration" className="text-sm font-medium text-warm-text">
                Duration (months)
              </Label>
              <Input
                id="ss-duration"
                type="number"
                min={0}
                value={durationMonths}
                onChange={(e) => onDurationChange(e.target.value)}
                placeholder="e.g. 60"
                className="mt-2"
              />
            </div>
          </div>

          {/* Eligibility info */}
          <div className="rounded-lg border border-calm-indigo/20 bg-calm-indigo/5 p-4">
            <div className="flex items-start gap-3">
              <Scale className="h-5 w-5 text-calm-indigo shrink-0 mt-0.5" />
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-warm-text">
                    Eligibility Under &sect; 8.051
                  </p>
                  <p className="text-sm text-warm-muted mt-1">
                    You may be eligible for spousal maintenance if:
                  </p>
                  <ul className="mt-2 space-y-1.5 text-sm text-warm-muted">
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
                      Marriage lasted 10+ years AND you cannot earn enough to meet
                      your minimum reasonable needs
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
                      Your spouse committed family violence within 2 years of filing
                      or during the divorce
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
                      You have a disability that prevents you from earning enough to
                      support yourself
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
                      You are caring for a child of the marriage who has a physical
                      or mental disability
                    </li>
                  </ul>
                </div>

                {/* Duration limits table */}
                <div>
                  <p className="text-sm font-medium text-warm-text">Duration Limits</p>
                  <div className="mt-2 rounded-md border border-calm-indigo/10 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-calm-indigo/5">
                          <th className="px-3 py-2 text-left text-xs font-medium text-warm-muted">
                            Marriage Length
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-warm-muted">
                            Max Duration
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-calm-indigo/10">
                        <tr>
                          <td className="px-3 py-2 text-warm-text">10-20 years</td>
                          <td className="px-3 py-2 text-warm-text">Up to 5 years</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 text-warm-text">20-30 years</td>
                          <td className="px-3 py-2 text-warm-text">Up to 7 years</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 text-warm-text">30+ years</td>
                          <td className="px-3 py-2 text-warm-text">Up to 10 years</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Maximum amount note */}
                <p className="text-xs text-warm-muted">
                  <strong>Maximum:</strong> The lesser of $5,000/month or 20% of
                  the obligor&apos;s average monthly gross income.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
