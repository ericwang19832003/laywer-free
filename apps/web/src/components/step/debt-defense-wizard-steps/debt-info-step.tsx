'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { HelpTooltip } from '@/components/ui/help-tooltip'

interface DebtInfoStepProps {
  creditorName: string
  debtBuyerName: string
  hasDifferentPlaintiff: boolean
  originalAmount: string
  currentAmountClaimed: string
  accountLast4: string
  onFieldChange: (field: string, value: string) => void
  onHasDifferentPlaintiffChange: (v: boolean) => void
}

export function DebtInfoStep({
  creditorName,
  debtBuyerName,
  hasDifferentPlaintiff,
  originalAmount,
  currentAmountClaimed,
  accountLast4,
  onFieldChange,
  onHasDifferentPlaintiffChange,
}: DebtInfoStepProps) {
  return (
    <div className="space-y-6">
      {/* Original creditor name */}
      <div>
        <Label htmlFor="creditor-name" className="text-sm font-medium text-warm-text">
          Original creditor name
        </Label>
        <HelpTooltip label="Why does this matter?">
          <p>
            The original creditor is the company that initially issued the debt (e.g., the
            credit card company or medical provider). This may be different from the company
            suing you if the debt was sold to a debt buyer.
          </p>
        </HelpTooltip>
        <Input
          id="creditor-name"
          value={creditorName}
          onChange={(e) => onFieldChange('creditorName', e.target.value)}
          placeholder="e.g. Capital One, Chase, or St. David's Medical Center"
          className="mt-2"
        />
      </div>

      {/* Different plaintiff checkbox */}
      <div>
        <label className="flex items-start gap-3 cursor-pointer rounded-lg border border-warm-border p-3 transition-colors hover:bg-warm-bg/50">
          <input
            type="checkbox"
            checked={hasDifferentPlaintiff}
            onChange={(e) => onHasDifferentPlaintiffChange(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-warm-border text-calm-indigo focus:ring-calm-indigo"
          />
          <div>
            <span className="text-sm text-warm-text">
              The plaintiff suing me is different from the original creditor
            </span>
            <p className="text-xs text-warm-muted mt-0.5">
              Check this if a debt buyer or collection agency filed the lawsuit
            </p>
          </div>
        </label>
      </div>

      {/* Conditional: Debt buyer / plaintiff name */}
      {hasDifferentPlaintiff && (
        <div>
          <Label htmlFor="debt-buyer-name" className="text-sm font-medium text-warm-text">
            Plaintiff / debt buyer name
          </Label>
          <HelpTooltip label="Why does this matter?">
            <p>
              The plaintiff is the company actually suing you. If the debt was sold, this is
              the debt buyer &mdash; not the original creditor. This distinction matters because
              debt buyers must prove they have the legal right (&quot;standing&quot;) to collect.
            </p>
          </HelpTooltip>
          <Input
            id="debt-buyer-name"
            value={debtBuyerName}
            onChange={(e) => onFieldChange('debtBuyerName', e.target.value)}
            placeholder="e.g. Midland Credit Management, Portfolio Recovery Associates"
            className="mt-2"
          />
        </div>
      )}

      {/* Original debt amount */}
      <div>
        <Label htmlFor="original-amount" className="text-sm font-medium text-warm-text">
          Original debt amount
        </Label>
        <HelpTooltip label="Why does this matter?">
          <p>
            The original amount is what was owed when the account first defaulted. Comparing
            this to the amount they&apos;re suing for can reveal excessive fees, interest, or
            errors in their calculations.
          </p>
        </HelpTooltip>
        <div className="relative mt-2">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-warm-muted">
            $
          </span>
          <Input
            id="original-amount"
            type="text"
            inputMode="decimal"
            value={originalAmount}
            onChange={(e) => onFieldChange('originalAmount', e.target.value)}
            placeholder="0.00"
            className="pl-7"
          />
        </div>
      </div>

      {/* Amount they're suing for */}
      <div>
        <Label htmlFor="current-amount" className="text-sm font-medium text-warm-text">
          Amount they&apos;re suing for
        </Label>
        <HelpTooltip label="Why does this matter?">
          <p>
            This is the current claimed amount, which may include interest, fees, and
            attorney&apos;s costs added to the original debt. If this amount seems inflated or
            incorrect, it can be a basis for your defense.
          </p>
        </HelpTooltip>
        <div className="relative mt-2">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-warm-muted">
            $
          </span>
          <Input
            id="current-amount"
            type="text"
            inputMode="decimal"
            value={currentAmountClaimed}
            onChange={(e) => onFieldChange('currentAmountClaimed', e.target.value)}
            placeholder="0.00"
            className="pl-7"
          />
        </div>
      </div>

      {/* Account last 4 digits */}
      <div>
        <Label htmlFor="account-last4" className="text-sm font-medium text-warm-text">
          Account number (last 4 digits)
        </Label>
        <HelpTooltip label="Why does this matter?">
          <p>
            The last 4 digits help identify the specific account in dispute. This is
            optional but helpful if you had multiple accounts with the same creditor.
          </p>
        </HelpTooltip>
        <Input
          id="account-last4"
          value={accountLast4}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, '').slice(0, 4)
            onFieldChange('accountLast4', val)
          }}
          placeholder="e.g. 1234"
          maxLength={4}
          className="mt-2 w-32"
        />
        <p className="text-xs text-warm-muted mt-1">Optional &mdash; helps identify the account</p>
      </div>
    </div>
  )
}
