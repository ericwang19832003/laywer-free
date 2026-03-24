'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronDown } from 'lucide-react'
import {
  daysUntil,
  getUrgencyColor,
  formatDate,
  formatCountdownFull,
  formatDeadlineLabel,
  formatSource,
} from '@/lib/deadline-utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Deadline {
  id: string
  key: string
  due_at: string
  source: string
  rationale: string | null
  consequence: string | null
  label: string | null
  auto_generated: boolean
}

interface DeadlineTimelineProps {
  deadlines: Deadline[]
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Expandable "What happens if I miss this?" section for consequences. */
function ConsequenceExpander({ consequence }: { consequence: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="mt-2">
      <button
        type="button"
        className="flex items-center gap-1 text-xs text-calm-amber hover:underline"
        onClick={() => setOpen(!open)}
      >
        <span>What happens if I miss this?</span>
        <ChevronDown
          className={`h-3 w-3 shrink-0 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          open ? 'max-h-40 mt-1.5' : 'max-h-0'
        }`}
      >
        <p className="text-xs text-red-600 leading-relaxed">{consequence}</p>
      </div>
    </div>
  )
}

/** The "Today" marker rendered between past and future deadlines. */
function TodayMarker() {
  return (
    <div className="relative pb-6 flex items-center gap-3">
      {/* Dot on the timeline */}
      <div className="absolute left-[-22px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-calm-indigo ring-4 ring-white" />
      {/* Horizontal line + label */}
      <div className="flex items-center gap-2 w-full">
        <div className="h-px flex-1 bg-calm-indigo" />
        <span className="text-xs font-medium text-calm-indigo whitespace-nowrap">Today</span>
        <div className="h-px flex-1 bg-calm-indigo" />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function DeadlineTimeline({ deadlines }: DeadlineTimelineProps) {
  if (deadlines.length === 0) {
    return (
      <p className="text-warm-muted text-sm py-4">No deadlines to display.</p>
    )
  }

  // Sort ascending by due_at so earliest deadlines appear first.
  const sorted = [...deadlines].sort(
    (a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime(),
  )

  // Determine where to insert the "Today" marker.
  // It sits between the last past/today deadline and the first future deadline.
  const todayIndex = sorted.findIndex((d) => daysUntil(d.due_at) > 0)
  // -1 means all deadlines are in the past/today; we still render the marker at the end.
  const showTodayMarker = true
  const todayInsertIndex = todayIndex === -1 ? sorted.length : todayIndex

  // Build render list with interleaved today marker.
  const elements: React.ReactNode[] = []

  sorted.forEach((deadline, index) => {
    // Insert Today marker at the right position.
    if (showTodayMarker && index === todayInsertIndex) {
      elements.push(<TodayMarker key="today-marker" />)
    }

    const days = daysUntil(deadline.due_at)
    const color = getUrgencyColor(days)

    elements.push(
      <div key={deadline.id} className="relative pb-6">
        {/* Colored dot */}
        <div
          className={`absolute left-[-22px] top-4 w-3 h-3 rounded-full ${color.dot} ring-4 ring-white`}
        />

        {/* Card */}
        <Card className={`border-l-4 ${color.border} py-0`}>
          <CardContent className="py-4">
            {/* Header row: label + badges */}
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold text-warm-text leading-snug">
                {formatDeadlineLabel(deadline.key, deadline.label)}
              </h3>
              <div className="flex items-center gap-1.5 shrink-0">
                <Badge variant="outline" className="text-[11px]">
                  {formatSource(deadline.source)}
                </Badge>
                {deadline.auto_generated && (
                  <Badge variant="secondary" className="text-[11px]">
                    Auto
                  </Badge>
                )}
              </div>
            </div>

            {/* Date + countdown */}
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xs text-warm-muted">
                {formatDate(deadline.due_at)}
              </span>
              <span className={`text-xs font-medium ${color.text}`}>
                {formatCountdownFull(days)}
              </span>
            </div>

            {/* Rationale */}
            {deadline.rationale && (
              <p className="text-xs text-warm-muted mt-2 leading-relaxed">
                {deadline.rationale}
              </p>
            )}

            {/* Consequence expandable */}
            {deadline.consequence && (
              <ConsequenceExpander consequence={deadline.consequence} />
            )}
          </CardContent>
        </Card>
      </div>,
    )
  })

  // If all deadlines are in the past, the marker goes at the end.
  if (showTodayMarker && todayInsertIndex === sorted.length) {
    elements.push(<TodayMarker key="today-marker" />)
  }

  return (
    <div className="relative pl-8">
      {/* Vertical timeline line */}
      <div className="absolute left-3 top-0 bottom-0 w-px bg-warm-border" />

      {elements}
    </div>
  )
}
