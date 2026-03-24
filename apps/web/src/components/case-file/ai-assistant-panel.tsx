'use client'

import { useState, useEffect } from 'react'
import { Lightbulb, X, ChevronRight, AlertCircle, Info, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const STORAGE_KEY = 'case-file-assistant-collapsed'

export type SuggestionPriority = 'urgent' | 'recommended' | 'nice_to_have'

export interface Suggestion {
  id: string
  title: string
  description: string
  priority: SuggestionPriority
  actionLabel?: string
}

interface AIAssistantPanelProps {
  caseId: string
  suggestions: Suggestion[]
  onAction: (suggestion: Suggestion) => void
  onDismiss: (suggestion: Suggestion) => void
  onRefresh: () => void
}

const priorityConfig: Record<
  SuggestionPriority,
  { bg: string; border: string; icon: typeof AlertCircle; iconColor: string }
> = {
  urgent: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: AlertCircle,
    iconColor: 'text-red-500',
  },
  recommended: {
    bg: 'bg-calm-indigo/5',
    border: 'border-calm-indigo/20',
    icon: Lightbulb,
    iconColor: 'text-calm-indigo',
  },
  nice_to_have: {
    bg: 'bg-warm-bg',
    border: 'border-warm-border',
    icon: Info,
    iconColor: 'text-warm-muted',
  },
}

export function AIAssistantPanel({
  caseId,
  suggestions,
  onAction,
  onDismiss,
  onRefresh,
}: AIAssistantPanelProps) {
  const [collapsed, setCollapsed] = useState(true)

  // Hydrate collapsed state from localStorage after mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored !== null) {
        setCollapsed(stored === 'true')
      }
    } catch {
      // localStorage unavailable — keep default
    }
  }, [])

  function toggleCollapsed() {
    const next = !collapsed
    setCollapsed(next)
    try {
      localStorage.setItem(STORAGE_KEY, String(next))
    } catch {
      // localStorage unavailable — ignore
    }
  }

  // ── Collapsed floating button ──────────────────────────────────
  if (collapsed) {
    return (
      <button
        onClick={toggleCollapsed}
        aria-label="Open AI Assistant"
        className={cn(
          'fixed bottom-6 right-6 z-50',
          'flex h-12 w-12 items-center justify-center rounded-full',
          'bg-calm-indigo text-white shadow-lg',
          'transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-calm-indigo/50 focus-visible:outline-none'
        )}
      >
        <Lightbulb className="h-5 w-5" />
      </button>
    )
  }

  // ── Expanded sidebar panel ─────────────────────────────────────
  return (
    <aside
      className="flex h-full w-[280px] shrink-0 flex-col border-l border-warm-border bg-white"
      data-case-id={caseId}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-warm-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-calm-indigo" />
          <h2 className="text-sm font-semibold text-warm-text">AI Assistant</h2>
        </div>
        <button
          onClick={toggleCollapsed}
          aria-label="Collapse AI Assistant"
          className="rounded p-1 text-warm-muted hover:bg-warm-bg focus-visible:ring-2 focus-visible:ring-calm-indigo/50 focus-visible:outline-none"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {suggestions.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <Lightbulb className="h-8 w-8 text-warm-border" />
            <p className="text-sm text-warm-muted">No suggestions right now</p>
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>
          </div>
        ) : (
          /* Suggestion cards */
          <div className="flex flex-col gap-2">
            {suggestions.map((suggestion) => {
              const config = priorityConfig[suggestion.priority]
              const Icon = config.icon

              return (
                <Card
                  key={suggestion.id}
                  className={cn(
                    'gap-0 py-0 shadow-none',
                    config.bg,
                    config.border
                  )}
                >
                  <CardContent className="px-3 py-3">
                    <div className="flex items-start gap-2">
                      <Icon
                        className={cn('mt-0.5 h-4 w-4 shrink-0', config.iconColor)}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-warm-text">
                          {suggestion.title}
                        </p>
                        <p className="mt-0.5 text-xs text-warm-muted">
                          {suggestion.description}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <Button
                            size="xs"
                            onClick={() => onAction(suggestion)}
                          >
                            {suggestion.actionLabel || 'Do it'}
                            <ChevronRight className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => onDismiss(suggestion)}
                            className="text-warm-muted"
                          >
                            Dismiss
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </aside>
  )
}
