'use client'

import { useState } from 'react'
import { CheckCircle2, Circle, RefreshCw, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export interface ChecklistItem {
  id: string
  label: string
  category: string | null
  checked: boolean
  matched_evidence_id: string | null
}

interface EvidenceChecklistProps {
  caseId: string
  disputeType: string
  items: ChecklistItem[]
  onItemToggle: (itemId: string, checked: boolean) => void
  onRefresh: () => void
}

export function EvidenceChecklist({
  caseId,
  disputeType,
  items,
  onItemToggle,
  onRefresh,
}: EvidenceChecklistProps) {
  const [refreshing, setRefreshing] = useState(false)

  function isItemChecked(item: ChecklistItem): boolean {
    return item.checked || item.matched_evidence_id !== null
  }

  const checkedCount = items.filter(isItemChecked).length

  // Sort: unchecked first, checked at bottom
  const sortedItems = [...items].sort((a, b) => {
    const aChecked = isItemChecked(a) ? 1 : 0
    const bChecked = isItemChecked(b) ? 1 : 0
    return aChecked - bChecked
  })

  async function handleRefresh() {
    setRefreshing(true)
    try {
      await Promise.resolve(onRefresh())
    } finally {
      setRefreshing(false)
      toast('Checklist refreshed')
    }
  }

  return (
    <Card className="bg-white">
      <CardContent className="space-y-4 px-6 py-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">
                Evidence Checklist
              </h3>
              <span className="text-xs text-warm-muted tabular-nums">
                {checkedCount}/{items.length}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Based on your {disputeType} case, you should collect:
            </p>
          </div>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleRefresh}
            disabled={refreshing}
            aria-label="Refresh checklist"
          >
            {refreshing ? (
              <Loader2 className="size-4 animate-spin text-warm-muted" />
            ) : (
              <RefreshCw className="size-4 text-warm-muted" />
            )}
          </Button>
        </div>

        {/* Checklist items */}
        <div className="flex flex-col gap-1.5">
          {sortedItems.map((item) => {
            const checked = isItemChecked(item)

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onItemToggle(item.id, !checked)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                  checked
                    ? 'bg-calm-green/5'
                    : 'hover:bg-warm-bg'
                )}
              >
                {checked ? (
                  <CheckCircle2
                    className="size-5 shrink-0 text-calm-green"
                    aria-hidden="true"
                  />
                ) : (
                  <Circle
                    className="size-5 shrink-0 text-warm-border"
                    aria-hidden="true"
                  />
                )}

                <span
                  className={cn(
                    'leading-snug',
                    checked
                      ? 'text-warm-muted line-through'
                      : 'text-foreground'
                  )}
                >
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
