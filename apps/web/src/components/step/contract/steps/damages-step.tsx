'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2 } from 'lucide-react'

export interface DamageLineItem {
  description: string
  amount: string
}

function fmt$(n: number): string {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

interface DamagesStepProps {
  damageLineItems: DamageLineItem[]
  onAddLineItem: () => void
  onRemoveLineItem: (index: number) => void
  onUpdateLineItem: (index: number, field: keyof DamageLineItem, value: string) => void
  consequentialDamages: string
  onConsequentialDamagesChange: (v: string) => void
  costToCure: string
  onCostToCureChange: (v: string) => void
  mitigationEfforts: string
  onMitigationEffortsChange: (v: string) => void
  lineItemTotal: number
  grandTotal: number
}

export function DamagesStep({
  damageLineItems, onAddLineItem, onRemoveLineItem, onUpdateLineItem,
  consequentialDamages, onConsequentialDamagesChange,
  costToCure, onCostToCureChange,
  mitigationEfforts, onMitigationEffortsChange,
  lineItemTotal, grandTotal,
}: DamagesStepProps) {
  return (
    <div className="space-y-5">
      <p className="text-sm text-warm-muted">
        List what you lost because of the breach. This helps us calculate the right amount for your petition.
      </p>

      {damageLineItems.map((item, index) => (
        <div key={index} className="rounded-lg border border-warm-border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-warm-text">Item {index + 1}</span>
            {damageLineItems.length > 1 && (
              <button
                type="button"
                onClick={() => onRemoveLineItem(index)}
                className="text-warm-muted hover:text-calm-amber transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1">
              <Label htmlFor={`item-desc-${index}`} className="text-xs">Description</Label>
              <Input
                id={`item-desc-${index}`}
                placeholder="e.g., Unpaid invoice #1234"
                value={item.description}
                onChange={(e) => onUpdateLineItem(index, 'description', e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`item-amount-${index}`} className="text-xs">Amount ($)</Label>
              <Input
                id={`item-amount-${index}`}
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={item.amount}
                onChange={(e) => onUpdateLineItem(index, 'amount', e.target.value)}
              />
            </div>
          </div>
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={onAddLineItem} className="w-full">
        <Plus className="h-4 w-4 mr-1" />
        Add Another Item
      </Button>

      <div className="space-y-2">
        <Label htmlFor="consequential-damages">Consequential Damages ($)</Label>
        <Input
          id="consequential-damages"
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          value={consequentialDamages}
          onChange={(e) => onConsequentialDamagesChange(e.target.value)}
        />
        <p className="text-xs text-warm-muted">
          Additional losses caused by the breach &mdash; lost business, additional expenses, or other financial impact.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cost-to-cure">Cost to Fix or Complete ($)</Label>
        <Input
          id="cost-to-cure"
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          value={costToCure}
          onChange={(e) => onCostToCureChange(e.target.value)}
        />
        <p className="text-xs text-warm-muted">
          The cost to hire someone else to finish the work or fix what was done wrong.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="mitigation-efforts">What have you done to reduce your losses? (optional)</Label>
        <Textarea
          id="mitigation-efforts"
          placeholder="Describe steps you took to minimize damages, such as hiring a replacement or seeking alternative services..."
          rows={2}
          value={mitigationEfforts}
          onChange={(e) => onMitigationEffortsChange(e.target.value)}
        />
        <p className="text-xs text-warm-muted">
          Courts look favorably on parties who take reasonable steps to limit their damages.
        </p>
      </div>

      {/* Grand total */}
      <div className="rounded-lg bg-warm-surface p-4 border border-warm-border">
        <div className="space-y-1 text-sm">
          <div className="flex justify-between text-warm-muted">
            <span>Direct damages</span>
            <span>{fmt$(lineItemTotal)}</span>
          </div>
          <div className="flex justify-between text-warm-muted">
            <span>Consequential damages</span>
            <span>{fmt$(parseFloat(consequentialDamages) || 0)}</span>
          </div>
          <div className="flex justify-between text-warm-muted">
            <span>Cost to fix / complete</span>
            <span>{fmt$(parseFloat(costToCure) || 0)}</span>
          </div>
          <div className="border-t border-warm-border pt-2 mt-2 flex justify-between font-semibold text-warm-text">
            <span>Grand Total</span>
            <span>{fmt$(grandTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
