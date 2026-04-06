'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { HelpTooltip } from '@/components/ui/help-tooltip'
import { Trash2, AlertTriangle } from 'lucide-react'
import { useMemo } from 'react'

interface Deduction {
  amount: number
  reason: string
}

interface DepositDeductionsStepProps {
  deductions: Deduction[]
  onDeductionsChange: (deductions: Deduction[]) => void
  depositAmount: string
}

const DEDUCTION_SUGGESTIONS = [
  'Cleaning',
  'Carpet replacement',
  'Wall repair/painting',
  'Broken fixtures',
  'Unpaid rent',
  'Unpaid utilities',
]

export function DepositDeductionsStep({
  deductions,
  onDeductionsChange,
  depositAmount,
}: DepositDeductionsStepProps) {
  const depositNum = parseFloat(depositAmount) || 0

  const totalDeductions = useMemo(
    () => deductions.reduce((sum, d) => sum + (d.amount || 0), 0),
    [deductions]
  )

  const amountReturnable = depositNum - totalDeductions
  const exceedsDeposit = totalDeductions > depositNum && depositNum > 0

  function updateDeduction(index: number, field: keyof Deduction, value: string | number) {
    const updated = [...deductions]
    updated[index] = { ...updated[index], [field]: value }
    onDeductionsChange(updated)
  }

  function addDeduction() {
    onDeductionsChange([
      ...deductions,
      { amount: 0, reason: '' },
    ])
  }

  function removeDeduction(index: number) {
    onDeductionsChange(deductions.filter((_, i) => i !== index))
  }

  function applySuggestion(reason: string) {
    const emptyIndex = deductions.findIndex(
      (d) => !d.amount && !d.reason
    )

    if (emptyIndex >= 0) {
      const updated = [...deductions]
      updated[emptyIndex] = { ...updated[emptyIndex], reason }
      onDeductionsChange(updated)
      return
    }

    onDeductionsChange([
      ...deductions,
      { amount: 0, reason },
    ])
  }

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-sm font-medium text-warm-text">
          Deposit Deductions
        </Label>
        <p className="text-sm text-warm-muted mt-1">
          List each deduction the landlord made from your security deposit, including the
          amount and reason given.
        </p>
        <HelpTooltip label="What does Texas law say about deductions?">
          <p>
            Under Tex. Prop. Code &sect; 92.104, a landlord must return the security deposit
            within 30 days of the tenant moving out, along with an itemized list of any
            deductions. Deductions can only be made for damages beyond normal wear and tear,
            unpaid rent, or other charges allowed by the lease.
          </p>
        </HelpTooltip>
      </div>

      {/* Info callout */}
      <div className="rounded-lg border border-calm-indigo/20 bg-calm-indigo/5 p-4">
        <p className="text-sm text-warm-text">
          <strong>30-day rule:</strong> Under Tex. Prop. Code &sect; 92.104, if the landlord
          does not return the deposit or provide an itemized list of deductions within 30 days
          of move-out, the landlord forfeits the right to retain any portion of the deposit
          and may owe you additional damages.
        </p>
      </div>

      {/* Deduction suggestions */}
      <div className="rounded-lg border border-calm-indigo/20 bg-calm-indigo/5 p-3">
        <p className="text-xs font-medium text-warm-muted mb-1.5">Common deduction reasons:</p>
        <div className="flex flex-wrap gap-1.5">
          {DEDUCTION_SUGGESTIONS.map((suggestion) => (
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

      {/* Deduction items list */}
      <div className="space-y-4">
        {deductions.map((deduction, i) => (
          <div
            key={i}
            className="rounded-lg border border-warm-border p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-warm-muted">
                Deduction {i + 1}
              </span>
              {deductions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDeduction(i)}
                  className="text-xs text-warm-muted hover:text-warm-text flex items-center gap-1"
                >
                  <Trash2 className="h-3 w-3" />
                  Remove
                </button>
              )}
            </div>

            <div>
              <Label htmlFor={`deduction-reason-${i}`} className="text-xs text-warm-muted">
                Reason
              </Label>
              <Input
                id={`deduction-reason-${i}`}
                value={deduction.reason}
                onChange={(e) => updateDeduction(i, 'reason', e.target.value)}
                placeholder="e.g. Carpet cleaning"
              />
            </div>

            <div>
              <Label htmlFor={`deduction-amount-${i}`} className="text-xs text-warm-muted">
                Amount
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-warm-muted">$</span>
                <Input
                  id={`deduction-amount-${i}`}
                  type="number"
                  min="0"
                  step="0.01"
                  value={deduction.amount || ''}
                  onChange={(e) => updateDeduction(i, 'amount', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="pl-7"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addDeduction}
      >
        + Add deduction
      </Button>

      {/* Running total vs deposit */}
      <div className="rounded-lg border border-warm-border bg-warm-bg/30 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-warm-muted">Deposit paid</span>
          <span className="text-sm font-medium text-warm-text">
            ${depositNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-warm-muted">Total deductions</span>
          <span className="text-sm font-medium text-warm-text">
            -${totalDeductions.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="border-t border-warm-border pt-2 flex items-center justify-between">
          <span className="text-sm font-semibold text-warm-text">Amount returnable</span>
          <span className="text-lg font-semibold text-warm-text">
            ${Math.max(0, amountReturnable).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Exceeds deposit warning */}
      {exceedsDeposit && (
        <div className="rounded-lg border border-calm-amber/40 bg-calm-amber/5 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-calm-amber shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-warm-text">Deductions exceed deposit</p>
              <p className="text-sm text-warm-muted mt-1">
                The total deductions (${totalDeductions.toLocaleString('en-US', { minimumFractionDigits: 2 })})
                exceed the deposit amount (${depositNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}).
                Double-check the amounts or note that the landlord may be claiming additional damages beyond the deposit.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
