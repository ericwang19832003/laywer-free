'use client'

import { useState } from 'react'
import { DeadlineTimeline } from './deadline-timeline'
import { DeadlineCalendar } from './deadline-calendar'
import { Calendar, Clock, List } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

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
  reminders: { id: string; send_at: string; status: string; channel: string }[]
}

interface DeadlineViewsProps {
  deadlines: Deadline[]
}

// ---------------------------------------------------------------------------
// View configuration
// ---------------------------------------------------------------------------

const views = [
  { key: 'timeline', label: 'Timeline', icon: Clock },
  { key: 'calendar', label: 'Calendar', icon: Calendar },
  { key: 'list', label: 'List', icon: List },
] as const

type ViewKey = (typeof views)[number]['key']

// ---------------------------------------------------------------------------
// List view helpers (ported from original page.tsx)
// ---------------------------------------------------------------------------

const KEY_LABELS: Record<string, string> = {
  answer_deadline: 'Answer Deadline',
  answer_deadline_estimated: 'Answer Deadline (Estimated)',
  answer_deadline_confirmed: 'Answer Deadline (Confirmed)',
  check_docket_after_answer_deadline: 'Check Docket',
  default_earliest_info: 'Earliest Default Info',
  hearing_date: 'Hearing Date',
}

function formatDeadlineKey(key: string, label?: string | null): string {
  if (label) return label
  return KEY_LABELS[key] ?? key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function daysUntil(dateStr: string): number {
  const date = new Date(dateStr)
  const now = new Date()
  return Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function formatCountdown(dateStr: string): string | null {
  const days = daysUntil(dateStr)
  if (days < 0) return 'Past due'
  if (days === 0) return 'Due today'
  if (days === 1) return 'Due tomorrow'
  if (days <= 14) return `${days} days left`
  return null
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function isWithinDays(dateStr: string, days: number): boolean {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  return diffDays >= 0 && diffDays <= days
}

function formatSource(source: string): string {
  switch (source) {
    case 'user_confirmed':
      return 'You confirmed'
    case 'court_notice':
      return 'Court notice'
    case 'system':
      return 'System'
    default:
      return source
  }
}

function formatReminderStatus(status: string): string {
  switch (status) {
    case 'scheduled':
      return 'Scheduled'
    case 'sent':
      return 'Sent'
    case 'failed':
      return 'Failed'
    default:
      return status
  }
}

// ---------------------------------------------------------------------------
// List view sub-component
// ---------------------------------------------------------------------------

function DeadlineListView({ deadlines }: { deadlines: Deadline[] }) {
  const sorted = [...deadlines].sort(
    (a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime(),
  )

  return (
    <div className="space-y-4">
      {sorted.map((deadline) => (
        <Card key={deadline.id}>
          <CardContent className="py-5">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <h3 className="font-medium text-warm-text">
                  {formatDeadlineKey(deadline.key, deadline.label)}
                </h3>
                <p
                  className={`text-sm ${
                    isWithinDays(deadline.due_at, 7)
                      ? 'text-calm-amber font-medium'
                      : 'text-warm-muted'
                  }`}
                >
                  {formatDate(deadline.due_at)}
                  {(() => {
                    const countdown = formatCountdown(deadline.due_at)
                    return countdown ? ` \u2014 ${countdown}` : ''
                  })()}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {deadline.auto_generated && (
                  <Badge variant="outline" className="text-xs">
                    Auto
                  </Badge>
                )}
                <Badge variant="secondary" className="text-xs">
                  {formatSource(deadline.source)}
                </Badge>
              </div>
            </div>

            {deadline.rationale && (
              <p className="mt-3 text-sm text-warm-muted">
                {deadline.rationale}
              </p>
            )}

            {deadline.consequence && (
              <details className="mt-3">
                <summary className="text-sm font-medium text-warm-text cursor-pointer hover:text-calm-indigo">
                  What happens if I miss this?
                </summary>
                <p className="mt-2 text-sm text-warm-muted pl-4 border-l-2 border-calm-amber">
                  {deadline.consequence}
                </p>
              </details>
            )}

            {deadline.reminders && deadline.reminders.length > 0 && (
              <div className="mt-4 border-t border-warm-border pt-3">
                <p className="text-xs font-medium text-warm-muted mb-2">
                  Reminders
                </p>
                <ul className="space-y-1">
                  {deadline.reminders
                    .sort(
                      (a, b) =>
                        new Date(a.send_at).getTime() -
                        new Date(b.send_at).getTime()
                    )
                    .map((reminder) => (
                      <li
                        key={reminder.id}
                        className="text-xs text-warm-muted"
                      >
                        Reminder: {formatDateTime(reminder.send_at)}{' '}
                        <span className="text-warm-muted/70">
                          &middot; {formatReminderStatus(reminder.status)}
                        </span>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function DeadlineViews({ deadlines }: DeadlineViewsProps) {
  const [view, setView] = useState<ViewKey>('timeline')

  if (deadlines.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-warm-muted">
            No deadlines yet. Deadlines will appear automatically as you
            progress through your case steps, or you can add them manually.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Segment control */}
      <div className="inline-flex rounded-lg border border-warm-border bg-white p-1">
        {views.map((v) => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              view === v.key
                ? 'bg-calm-indigo text-white'
                : 'text-warm-muted hover:text-warm-text'
            }`}
          >
            <v.icon className="w-4 h-4" />
            {v.label}
          </button>
        ))}
      </div>

      {/* Active view */}
      {view === 'timeline' && <DeadlineTimeline deadlines={deadlines} />}
      {view === 'calendar' && <DeadlineCalendar deadlines={deadlines} />}
      {view === 'list' && <DeadlineListView deadlines={deadlines} />}
    </div>
  )
}
