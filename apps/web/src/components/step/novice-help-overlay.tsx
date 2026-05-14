'use client'

import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NoviceExplanation } from '@lawyer-free/shared/guided-steps/types'

export interface NoviceHelpOverlayProps {
  taskKey: string
  explanation: NoviceExplanation
}

export function NoviceHelpOverlay({ taskKey, explanation }: NoviceHelpOverlayProps) {
  const storageKey = `novice-overlay-collapsed-${taskKey}`

  // Default expanded; read persisted preference after mount to avoid SSR mismatch
  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem(storageKey)
    if (stored !== null) {
      setCollapsed(stored === 'true')
    }
  }, [storageKey])

  function toggle() {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem(storageKey, String(next))
  }

  const hasGlossary =
    explanation.glossaryTerms !== undefined && explanation.glossaryTerms.length > 0

  return (
    <div className="rounded-lg border border-calm-indigo/20 bg-calm-indigo/5 overflow-hidden">
      {/* Header button */}
      <button
        type="button"
        onClick={toggle}
        aria-expanded={mounted ? !collapsed : true}
        className={cn(
          'flex w-full items-center gap-2 px-4 py-3 text-left',
          'text-calm-indigo font-medium text-sm',
          'hover:bg-calm-indigo/10 transition-colors'
        )}
      >
        <Lightbulb className="h-4 w-4 shrink-0" />
        <span className="flex-1">What&apos;s happening here?</span>
        {mounted && collapsed ? (
          <ChevronDown className="h-4 w-4 shrink-0" />
        ) : (
          <ChevronUp className="h-4 w-4 shrink-0" />
        )}
      </button>

      {/* Expandable body */}
      {(!mounted || !collapsed) && (
        <div className="px-4 pb-4 space-y-3 border-t border-calm-indigo/20">
          {/* Why this step */}
          <div className="pt-3 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-calm-indigo">
              Why this step:
            </p>
            <p className="text-sm text-warm-text">{explanation.why}</p>
          </div>

          {/* What's next */}
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-calm-indigo">
              What&apos;s next:
            </p>
            <p className="text-sm text-warm-text">{explanation.whatNext}</p>
          </div>

          {/* Legal terms */}
          {hasGlossary && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-calm-indigo">
                Legal terms explained:
              </p>
              <ul className="space-y-1.5">
                {explanation.glossaryTerms!.map(({ term, plain }) => (
                  <li key={term} className="flex gap-2 text-sm">
                    <span className="font-medium text-warm-text shrink-0">{term}:</span>
                    <span className="text-warm-muted">{plain}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
