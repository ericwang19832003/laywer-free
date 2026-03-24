'use client'

import { useState, useEffect } from 'react'
import { Info, X } from 'lucide-react'

const MAX_VIEWS = 3

interface BackfillBannerProps {
  caseId: string
  skippedCount: number
}

export function BackfillBanner({ caseId, skippedCount }: BackfillBannerProps) {
  const [dismissed, setDismissed] = useState(true) // default hidden to avoid flash

  useEffect(() => {
    const key = `banner_backfill_views_${caseId}`
    const views = parseInt(localStorage.getItem(key) || '0', 10)
    if (views >= MAX_VIEWS) {
      setDismissed(true)
      return
    }
    localStorage.setItem(key, String(views + 1))
    setDismissed(false)
  }, [caseId])

  if (skippedCount <= 0 || dismissed) return null

  function handleDismiss() {
    localStorage.setItem(`banner_backfill_views_${caseId}`, String(MAX_VIEWS))
    setDismissed(true)
  }

  return (
    <div className="relative rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 mb-4">
      <div className="flex gap-3">
        <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-warm-text">
            Imported case &mdash; {skippedCount} earlier step{skippedCount !== 1 ? 's' : ''} were skipped
          </p>
          <p className="text-xs text-warm-muted mt-0.5">
            You can go back and fill in details from earlier steps anytime to get better recommendations and risk scoring.
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="shrink-0 rounded p-1 hover:bg-primary/10 transition-colors"
          aria-label="Dismiss banner"
        >
          <X className="h-3.5 w-3.5 text-warm-muted" />
        </button>
      </div>
    </div>
  )
}
