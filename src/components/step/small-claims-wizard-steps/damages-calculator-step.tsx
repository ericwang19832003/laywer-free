'use client'

import { useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { HelpTooltip } from '@/components/ui/help-tooltip'
import { Trash2, AlertTriangle } from 'lucide-react'
import {
  calculateDamages,
  type DamageItem,
} from '@/lib/small-claims/damages-calculator'

interface DamagesCalculatorStepProps {
  items: DamageItem[]
  onItemsChange: (items: DamageItem[]) => void
  claimSubType: string
}

function getCategorySuggestions(claimSubType: string): string[] {
  switch (claimSubType) {
    case 'security_deposit':
      return ['Security deposit', 'Cleaning charges', 'Repair charges', 'Lost interest', 'Moving costs']
    case 'breach_of_contract':
      return ['Contract payment', 'Cost to hire replacement', 'Lost revenue', 'Additional expenses']
    case 'consumer_refund':
      return ['Purchase price', 'Shipping costs', 'Replacement cost', 'Service charges']
    case 'property_damage':
      return ['Repair costs', 'Replacement value', 'Loss of use', 'Cleanup costs']
    case 'car_accident':
      return ['Vehicle repair', 'Rental car', 'Medical expenses', 'Lost wages', 'Towing fees']
    case 'neighbor_dispute':
      return ['Property repair', 'Property value loss', 'Cleanup costs', 'Professional services']
    case 'unpaid_loan':
      return ['Principal owed', 'Interest owed', 'Late fees']
    case 'other':
    default:
      return ['Damages', 'Out-of-pocket expenses', 'Lost income']
  }
}

function getAmountPresets(claimSubType: string): number[] {
  switch (claimSubType) {
    case 'security_deposit':
      return [250, 500, 1000, 1500]
    case 'car_accident':
      return [250, 500, 1000, 2500]
    case 'property_damage':
      return [300, 750, 1500, 3000]
    case 'breach_of_contract':
      return [500, 1000, 2500, 5000]
    case 'consumer_refund':
      return [100, 250, 500, 1000]
    case 'neighbor_dispute':
      return [200, 500, 1000, 2000]
    case 'unpaid_loan':
      return [200, 500, 1000, 2000]
    case 'other':
    default:
      return [100, 250, 500, 1000]
  }
}

export function DamagesCalculatorStep({
  items,
  onItemsChange,
  claimSubType,
}: DamagesCalculatorStepProps) {
  const suggestions = getCategorySuggestions(claimSubType)
  const amountPresets = getAmountPresets(claimSubType)

  const result = useMemo(
    () => calculateDamages({ items }),
    [items]
  )

  function updateItem(index: number, field: keyof DamageItem, value: string | number) {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: value }
    onItemsChange(updated)
  }

  function addItem() {
    onItemsChange([
      ...items,
      { category: '', amount: 0, description: '' },
    ])
  }

  function removeItem(index: number) {
    onItemsChange(items.filter((_, i) => i !== index))
  }

  function applySuggestion(category: string) {
    const emptyIndex = items.findIndex(
      (item) => !item.category && !item.amount && !item.description
    )

    if (emptyIndex >= 0) {
      const updated = [...items]
      updated[emptyIndex] = { ...updated[emptyIndex], category }
      onItemsChange(updated)
      return
    }

    onItemsChange([
      ...items,
      { category, amount: 0, description: '' },
    ])
  }

  function applyAmountPreset(amount: number) {
    const emptyIndex = items.findIndex(
      (item) => !item.amount && !item.category && !item.description
    )

    if (emptyIndex >= 0) {
      const updated = [...items]
      updated[emptyIndex] = { ...updated[emptyIndex], amount }
      onItemsChange(updated)
      return
    }

    const firstIndex = items.findIndex((item) => !item.amount)
    if (firstIndex >= 0) {
      const updated = [...items]
      updated[firstIndex] = { ...updated[firstIndex], amount }
      onItemsChange(updated)
      return
    }

    onItemsChange([
      ...items,
      { category: '', amount, description: '' },
    ])
  }

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-sm font-medium text-warm-text">
          What are your damages?
        </Label>
        <HelpTooltip label="What counts as damages?">
          <p>
            Damages are the money you lost or the cost to fix what went wrong. List each expense
            separately with the amount. Include receipts, estimates, or other proof for each item
            if possible.
          </p>
        </HelpTooltip>
      </div>

      {/* Category suggestions */}
      <div className="rounded-lg border border-calm-indigo/20 bg-calm-indigo/5 p-3">
        <p className="text-xs font-medium text-warm-muted mb-1.5">Common categories for this type of claim:</p>
        <div className="flex flex-wrap gap-1.5">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => applySuggestion(s)}
              className="rounded-full bg-white px-2.5 py-0.5 text-xs text-warm-text border border-warm-border transition hover:border-calm-indigo/40 hover:bg-calm-indigo/10"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-calm-indigo/20 bg-calm-indigo/5 p-3">
        <p className="text-xs font-medium text-warm-muted mb-1.5">Quick amounts (edit later):</p>
        <div className="flex flex-wrap gap-1.5">
          {amountPresets.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => applyAmountPreset(amount)}
              className="rounded-full bg-white px-2.5 py-0.5 text-xs text-warm-text border border-warm-border transition hover:border-calm-indigo/40 hover:bg-calm-indigo/10"
            >
              ${amount.toLocaleString('en-US')}
            </button>
          ))}
        </div>
      </div>

      {/* Damage items list */}
      <div className="space-y-4">
        {items.map((item, i) => (
          <div
            key={i}
            className="rounded-lg border border-warm-border p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-warm-muted">
                Item {i + 1}
              </span>
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  className="text-xs text-warm-muted hover:text-warm-text flex items-center gap-1"
                >
                  <Trash2 className="h-3 w-3" />
                  Remove
                </button>
              )}
            </div>

            <div>
              <Label htmlFor={`damage-category-${i}`} className="text-xs text-warm-muted">
                Category
              </Label>
              <Input
                id={`damage-category-${i}`}
                value={item.category}
                onChange={(e) => updateItem(i, 'category', e.target.value)}
                placeholder="e.g. Security deposit"
              />
            </div>

            <div>
              <Label htmlFor={`damage-amount-${i}`} className="text-xs text-warm-muted">
                Amount
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-warm-muted">$</span>
                <Input
                  id={`damage-amount-${i}`}
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.amount || ''}
                  onChange={(e) => updateItem(i, 'amount', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="pl-7"
                />
              </div>
            </div>

            <div>
              <Label htmlFor={`damage-description-${i}`} className="text-xs text-warm-muted">
                Description (optional)
              </Label>
              <Input
                id={`damage-description-${i}`}
                value={item.description ?? ''}
                onChange={(e) => updateItem(i, 'description', e.target.value)}
                placeholder="Brief description of this expense"
              />
            </div>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addItem}
      >
        + Add another item
      </Button>

      {/* Running total */}
      <div className="rounded-lg border border-warm-border bg-warm-bg/30 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-warm-text">Total Damages</span>
          <span className="text-lg font-semibold text-warm-text">
            ${result.totalDamages.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <p className="text-xs text-warm-muted mt-1">
          {result.itemCount} item{result.itemCount === 1 ? '' : 's'} &middot; Small claims limit: ${result.capAmount.toLocaleString('en-US')}
        </p>
      </div>

      <div className="rounded-lg border border-calm-indigo/20 bg-calm-indigo/5 p-3 text-xs text-warm-text">
        <strong>Receipts tip:</strong> List each receipt or estimate as its own item. This makes it easier to prove each amount.
      </div>

      {/* Nearing cap warning */}
      {result.nearingCap && (
        <div className="rounded-lg border border-calm-amber/40 bg-calm-amber/5 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-calm-amber shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-warm-text">Approaching the Limit</p>
              <p className="text-sm text-warm-muted mt-1">
                Your claim total is approaching the $20,000 small claims limit. If your total
                exceeds this amount, you may need to reduce your claim or file in County Court.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Exceeds cap warning */}
      {result.exceedsCap && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-warm-text">Exceeds Small Claims Limit</p>
              <p className="text-sm text-warm-muted mt-1">
                Your claim total exceeds the $20,000 limit by{' '}
                <span className="font-medium text-red-700">
                  ${result.overCapBy.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>.
                You may need to reduce your claim or file in County Court instead of JP Court.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
