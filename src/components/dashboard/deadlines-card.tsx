'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Deadline {
  id: string
  key: string
  due_at: string
  source: string
}

interface DeadlinesCardProps {
  caseId: string
  deadlines: Deadline[]
}

const KEY_LABELS: Record<string, string> = {
  answer_deadline_estimated: 'Answer Deadline (Estimated)',
  answer_deadline_confirmed: 'Answer Deadline',
  check_docket_after_answer_deadline: 'Check Docket',
  default_earliest_info: 'Earliest Default Info',
}

function formatKeyLabel(key: string): string {
  return KEY_LABELS[key] ?? key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
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

function formatHeroCountdown(dateStr: string): string {
  const days = daysUntil(dateStr)
  if (days < 0) return 'This deadline has passed'
  if (days === 0) return 'Due today'
  if (days === 1) return '1 day remaining'
  return `${days} days remaining`
}

/**
 * Filter deadlines: if a confirmed answer deadline exists,
 * hide the estimated one (confirmed supersedes it).
 */
function filterDeadlines(deadlines: Deadline[]): Deadline[] {
  const hasConfirmed = deadlines.some((d) => d.key === 'answer_deadline_confirmed')
  if (!hasConfirmed) return deadlines
  return deadlines.filter((d) => d.key !== 'answer_deadline_estimated')
}

function AnswerDeadlineHero({
  deadline,
  isConfirmed,
  caseId,
}: {
  deadline: Deadline
  isConfirmed: boolean
  caseId: string
}) {
  const days = daysUntil(deadline.due_at)
  const isPast = days < 0

  return (
    <div
      className={`min-h-[4.5rem] rounded-lg border-l-4 px-4 py-3 ${
        isConfirmed
          ? 'border-l-calm-indigo bg-calm-indigo/5'
          : 'border-l-calm-amber bg-calm-amber/5'
      }`}
    >
      <p className="text-sm font-medium text-warm-text">
        {isConfirmed
          ? `Answer deadline: ${formatDate(deadline.due_at)}`
          : `Estimated answer deadline: ${formatDate(deadline.due_at)}`}
      </p>
      <p
        className={`text-sm mt-0.5 ${
          isConfirmed
            ? isPast
              ? 'text-calm-amber'
              : 'text-warm-muted'
            : 'text-warm-muted'
        }`}
      >
        {isConfirmed
          ? formatHeroCountdown(deadline.due_at)
          : 'Please confirm the exact date from your citation'}
      </p>
      {!isConfirmed && (
        <Button variant="outline" size="sm" className="mt-3" asChild>
          <Link href={`/case/${caseId}/deadlines`}>Confirm Deadline</Link>
        </Button>
      )}
    </div>
  )
}

export function DeadlinesCard({ caseId, deadlines }: DeadlinesCardProps) {
  const visible = filterDeadlines(deadlines)

  // Extract answer deadline for hero treatment
  const confirmedAnswer = deadlines.find((d) => d.key === 'answer_deadline_confirmed')
  const estimatedAnswer = deadlines.find((d) => d.key === 'answer_deadline_estimated')
  const heroDeadline = confirmedAnswer ?? estimatedAnswer
  const isConfirmed = !!confirmedAnswer

  // Other deadlines (everything except the hero)
  const heroKey = heroDeadline?.key
  const otherDeadlines = visible.filter((d) => d.key !== heroKey)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-warm-text">Upcoming Deadlines</CardTitle>
      </CardHeader>
      <CardContent>
        {visible.length === 0 ? (
          <p className="text-warm-muted text-sm">
            No deadlines yet. That&apos;s okay — we&apos;ll add them as your case develops.
          </p>
        ) : (
          <div className="space-y-4">
            {heroDeadline && (
              <AnswerDeadlineHero
                deadline={heroDeadline}
                isConfirmed={isConfirmed}
                caseId={caseId}
              />
            )}

            {otherDeadlines.length > 0 && (
              <ul className="space-y-3">
                {otherDeadlines.slice(0, 4).map((deadline) => {
                  const countdown = formatCountdown(deadline.due_at)
                  const days = daysUntil(deadline.due_at)
                  const isUrgent = days >= 0 && days <= 3

                  return (
                    <li key={deadline.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-warm-text">
                          {formatKeyLabel(deadline.key)}
                        </p>
                        <p
                          className={`text-xs ${
                            isUrgent ? 'text-calm-amber font-medium' : 'text-warm-muted'
                          }`}
                        >
                          {formatDateShort(deadline.due_at)}
                          {countdown && ` — ${countdown}`}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {deadline.source === 'user_confirmed'
                          ? 'Confirmed'
                          : deadline.source === 'system'
                            ? 'Estimated'
                            : deadline.source}
                      </Badge>
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
