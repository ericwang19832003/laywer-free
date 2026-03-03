'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { HelpTooltip } from '@/components/ui/help-tooltip'
import { AlertTriangle } from 'lucide-react'

interface ReliefStepProps {
  amountSought: string
  onAmountChange: (v: string) => void
  otherRelief: string
  onOtherReliefChange: (v: string) => void
  requestAttorneyFees: boolean
  onAttorneyFeesChange: (v: boolean) => void
  requestCourtCosts: boolean
  onCourtCostsChange: (v: boolean) => void
  courtType: string
  isOutOfState?: boolean
  jurisdictionWarning?: string | null
}

export function ReliefStep({
  amountSought,
  onAmountChange,
  otherRelief,
  onOtherReliefChange,
  requestAttorneyFees,
  onAttorneyFeesChange,
  requestCourtCosts,
  onCourtCostsChange,
  jurisdictionWarning,
}: ReliefStepProps) {
  return (
    <div className="space-y-6">
      {/* Amount sought */}
      <div>
        <Label htmlFor="amount" className="text-sm font-medium text-warm-text">
          How much money are you asking for?
        </Label>
        <HelpTooltip label="How do I calculate the right amount?">
          <div className="space-y-2">
            <p>
              Add up everything you lost because of what happened:
            </p>
            <ul className="list-disc list-inside space-y-1 text-warm-muted">
              <li>Money owed to you (loans, unpaid wages, deposits)</li>
              <li>Cost of repairs or replacements</li>
              <li>Medical bills</li>
              <li>Lost income or wages</li>
              <li>Other out-of-pocket expenses</li>
            </ul>
            <p className="font-medium">
              Tip: If you&apos;re not sure, estimate on the higher side. You can always
              ask for less at trial, but you can&apos;t ask for more.
            </p>
          </div>
        </HelpTooltip>
        <div className="relative mt-2">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-warm-muted">$</span>
          <Input
            id="amount"
            type="number"
            value={amountSought}
            onChange={(e) => onAmountChange(e.target.value)}
            placeholder="0.00"
            className="pl-7"
            min="0"
            step="0.01"
          />
        </div>

        {/* Jurisdiction warning */}
        {jurisdictionWarning && (
          <div className="mt-3 rounded-lg border border-calm-amber/40 bg-calm-amber/5 p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-calm-amber shrink-0 mt-0.5" />
              <p className="text-sm text-warm-text">{jurisdictionWarning}</p>
            </div>
          </div>
        )}
      </div>

      {/* Other relief */}
      <div>
        <Label htmlFor="other-relief" className="text-sm font-medium text-warm-text">
          Is there anything else you want besides money?
        </Label>
        <HelpTooltip label="What kind of things can I ask for?">
          <div className="space-y-2">
            <p>Besides money, courts can order the other party to:</p>
            <ul className="list-disc list-inside space-y-1 text-warm-muted">
              <li>Return your property</li>
              <li>Stop doing something (injunction)</li>
              <li>Follow through on a contract (specific performance)</li>
              <li>Make repairs</li>
              <li>Vacate a property</li>
            </ul>
          </div>
        </HelpTooltip>
        <textarea
          id="other-relief"
          value={otherRelief}
          onChange={(e) => onOtherReliefChange(e.target.value)}
          placeholder="e.g. Return of my property, order to stop construction, completion of contracted work..."
          className="mt-2 w-full rounded-md border border-warm-border bg-white px-3 py-2 text-sm text-warm-text placeholder:text-warm-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
          rows={3}
        />
      </div>

      {/* Court costs checkbox */}
      <div className="rounded-lg border border-warm-border p-4 space-y-4">
        <div className="flex items-start gap-3">
          <Checkbox
            id="court-costs"
            checked={requestCourtCosts}
            onCheckedChange={(c) => onCourtCostsChange(c === true)}
          />
          <div className="flex-1 min-w-0">
            <Label htmlFor="court-costs" className="text-sm font-medium text-warm-text cursor-pointer">
              Ask the court to make them pay your filing costs?
            </Label>
            <HelpTooltip label="What are court costs?">
              <p>
                Court costs include the filing fee you pay to start the case (usually $50-$350)
                and the cost of serving the other party. If you win, the judge can order the
                other side to reimburse you for these costs. Most people check this box.
              </p>
            </HelpTooltip>
          </div>
        </div>

        {/* Attorney fees checkbox */}
        <div className="flex items-start gap-3">
          <Checkbox
            id="attorney-fees"
            checked={requestAttorneyFees}
            onCheckedChange={(c) => onAttorneyFeesChange(c === true)}
          />
          <div className="flex-1 min-w-0">
            <Label htmlFor="attorney-fees" className="text-sm font-medium text-warm-text cursor-pointer">
              Ask the court to make them pay reasonable attorney fees?
            </Label>
            <HelpTooltip label="Can I ask for attorney fees if I don't have a lawyer?">
              <p>
                Even if you are representing yourself (pro se), some Texas statutes allow
                recovery of &quot;reasonable attorney fees.&quot; Courts have sometimes awarded
                a reasonable amount to pro se litigants for the value of their time. However,
                this is not guaranteed. It does not hurt to ask.
              </p>
            </HelpTooltip>
          </div>
        </div>
      </div>
    </div>
  )
}
