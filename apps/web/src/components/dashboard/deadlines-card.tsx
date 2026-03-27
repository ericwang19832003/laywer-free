'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  daysUntil,
  formatDeadlineLabel,
  formatDateShort,
  formatCountdown,
} from '@/lib/deadline-utils'

interface Deadline {
  id: string
  key: string
  due_at: string
  source: string
  label: string | null
  consequence: string | null
}

interface DeadlinesCardProps {
  caseId: string
  deadlines: Deadline[]
}

/**
 * Filter deadlines: if a confirmed answer deadline exists,
 * hide the estimated one (confirmed supersedes it).
 * Returns the filtered list plus a map of superseded estimated deadlines
 * keyed by the base deadline type (e.g. "answer_deadline").
 */
function filterDeadlines(deadlines: Deadline[]): {
  visible: Deadline[]
  superseded: Map<string, Deadline>
} {
  const superseded = new Map<string, Deadline>()
  const hasConfirmed = deadlines.some((d) => d.key === 'answer_deadline_confirmed')
  if (!hasConfirmed) return { visible: deadlines, superseded }
  const estimated = deadlines.find((d) => d.key === 'answer_deadline_estimated')
  if (estimated) superseded.set('answer_deadline', estimated)
  return {
    visible: deadlines.filter((d) => d.key !== 'answer_deadline_estimated'),
    superseded,
  }
}

/** Derive the base deadline type from a key (strip _confirmed/_estimated suffix). */
function baseDeadlineType(key: string): string {
  return key.replace(/_confirmed$/, '').replace(/_estimated$/, '')
}

/** Whether a deadline source indicates it was confirmed by the user or court. */
function isConfirmedSource(source: string): boolean {
  return source === 'user_confirmed' || source === 'court_notice'
}

/** Source badge label for display. */
function sourceLabel(source: string): string {
  if (source === 'user_confirmed' || source === 'court_notice') return 'Confirmed'
  if (source === 'system' || source === 'ai_generated') return 'Estimated'
  return source.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function SourceBadge({ source }: { source: string }) {
  const confirmed = isConfirmedSource(source)
  const label = sourceLabel(source)
  return (
    <span
      data-testid="source-badge"
      className={`text-xs font-medium ${confirmed ? 'text-calm-green' : 'text-calm-amber'}`}
    >
      {label}
    </span>
  )
}

function CountdownBox({
  deadline,
  supersededEstimate,
}: {
  deadline: Deadline
  supersededEstimate?: Deadline | null
}) {
  const days = daysUntil(deadline.due_at)
  const isOverdue = days < 0
  const borderColor = isOverdue ? 'border-destructive' : days === 0 ? 'border-amber-500' : days <= 7 ? 'border-amber-500' : 'border-emerald-500'
  const bgColor = isOverdue ? 'bg-destructive/10' : 'bg-white'
  const textColor = isOverdue ? 'text-destructive' : days === 0 ? 'text-calm-amber' : days <= 7 ? 'text-amber-600' : 'text-emerald-600'

  return (
    <div className="flex items-start gap-4" data-testid={`countdown-box-${deadline.id}`}>
      <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-lg border-2 ${borderColor} ${bgColor} shrink-0`}>
        <span className={`text-2xl font-bold tabular-nums ${textColor}`}>
          {Math.abs(days)}
        </span>
        <span className="text-xs text-warm-muted">{isOverdue ? 'overdue' : 'days'}</span>
      </div>
      <div className="space-y-1 min-w-0">
        <p className="text-sm font-medium text-warm-text">
          {formatDeadlineLabel(deadline.key, deadline.label)}
          <span className="mx-1 text-warm-muted">·</span>
          <span className="text-xs font-normal text-warm-muted">{formatDateShort(deadline.due_at)}</span>
          <span className="mx-1 text-warm-muted">·</span>
          <SourceBadge source={deadline.source} />
        </p>
        {supersededEstimate && (
          <p className="text-xs text-warm-muted" data-testid="originally-estimated">
            Originally estimated: {formatDateShort(supersededEstimate.due_at)}
          </p>
        )}
        {isOverdue && (
          <p className="text-xs font-medium text-destructive">This deadline passed. Take action as soon as possible.</p>
        )}
        {deadline.consequence && (
          <p className="text-xs text-warm-muted line-clamp-2">{deadline.consequence}</p>
        )}
      </div>
    </div>
  )
}

export function DeadlinesCard({ caseId, deadlines }: DeadlinesCardProps) {
  const { visible, superseded } = filterDeadlines(deadlines)

  // Find the most urgent deadline: earliest future, or most recent overdue
  const sortedByUrgency = [...visible].sort((a, b) => {
    const daysA = daysUntil(a.due_at)
    const daysB = daysUntil(b.due_at)
    // Future deadlines first (ascending), then overdue (descending by recency)
    if (daysA >= 0 && daysB >= 0) return daysA - daysB
    if (daysA < 0 && daysB < 0) return daysB - daysA // most recent overdue first
    if (daysA >= 0) return -1 // future before overdue
    return 1
  })
  const heroDeadline = sortedByUrgency[0] ?? null
  const otherDeadlines = heroDeadline ? sortedByUrgency.slice(1) : []

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-warm-text">Upcoming Deadlines</CardTitle>
      </CardHeader>
      <CardContent>
        {visible.length === 0 ? (
          <p className="text-warm-muted text-sm">
            Deadlines will appear after you file your case with the court. Key deadlines include a 90-day service deadline and a 20-day estimated answer deadline.
          </p>
        ) : (
          <div className="space-y-4">
            {heroDeadline && (
              <CountdownBox
                deadline={heroDeadline}
                supersededEstimate={superseded.get(baseDeadlineType(heroDeadline.key))}
              />
            )}

            {otherDeadlines.length > 0 && (
              <ul className="space-y-3">
                {otherDeadlines.slice(0, 4).map((deadline) => {
                  const countdown = formatCountdown(deadline.due_at)
                  const days = daysUntil(deadline.due_at)
                  const isOverdue = days < 0
                  const isUrgent = days >= 0 && days <= 3

                  const estimateForThis = superseded.get(baseDeadlineType(deadline.key))

                  return (
                    <li key={deadline.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-warm-text">
                          {formatDeadlineLabel(deadline.key, deadline.label)}
                        </p>
                        <p
                          className={`text-xs ${
                            isOverdue ? 'text-destructive font-medium' : isUrgent ? 'text-calm-amber font-medium' : 'text-warm-muted'
                          }`}
                        >
                          {formatDateShort(deadline.due_at)}
                          {countdown && ` — ${countdown}`}
                        </p>
                        {estimateForThis && (
                          <p className="text-xs text-warm-muted" data-testid="originally-estimated">
                            Originally estimated: {formatDateShort(estimateForThis.due_at)}
                          </p>
                        )}
                      </div>
                      <SourceBadge source={deadline.source} />
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )}

        <div className="mt-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/case/${caseId}/deadlines`} className="text-calm-indigo">
              View all deadlines
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
