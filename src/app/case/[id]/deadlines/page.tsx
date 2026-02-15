import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SupportiveHeader } from '@/components/layout/supportive-header'
import { LegalDisclaimer } from '@/components/layout/legal-disclaimer'
import { DeadlineFormDialog } from '@/components/deadlines/deadline-form'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Reminder {
  id: string
  send_at: string
  status: string
  channel: string
}

interface Deadline {
  id: string
  key: string
  due_at: string
  source: string
  rationale: string | null
  reminders: Reminder[]
}

/**
 * Format a deadline key into a human-readable name.
 * "answer_deadline" -> "Answer Deadline"
 * "hearing_date" -> "Hearing Date"
 * Other keys are returned as-is.
 */
const KEY_LABELS: Record<string, string> = {
  answer_deadline: 'Answer Deadline',
  hearing_date: 'Hearing Date',
}

function formatDeadlineKey(key: string): string {
  return KEY_LABELS[key] ?? key
}

/**
 * Format a date string into a friendly, readable format.
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Format a datetime string for reminders (includes time).
 */
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

/**
 * Check if a date is within a given number of days from now.
 */
function isWithinDays(dateStr: string, days: number): boolean {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  return diffDays >= 0 && diffDays <= days
}

/**
 * Format a source value into a friendly label.
 */
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

/**
 * Format a reminder status into a friendly label.
 */
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

export default async function DeadlinesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: deadlines, error } = await supabase
    .from('deadlines')
    .select('*, reminders(*)')
    .eq('case_id', id)
    .order('due_at', { ascending: true })

  if (error) {
    return (
      <div className="min-h-screen bg-warm-bg">
        <main className="mx-auto max-w-2xl px-4 py-10">
          <SupportiveHeader
            title="Something went wrong"
            subtitle="We couldn't load your deadlines right now. Please try again in a moment."
          />
        </main>
      </div>
    )
  }

  const deadlineList = (deadlines || []) as Deadline[]

  return (
    <div className="min-h-screen bg-warm-bg">
      <main className="mx-auto max-w-2xl px-4 py-10">
        <SupportiveHeader
          title="Your Deadlines"
          subtitle="We'll help you stay on top of every important date."
        />

        <div className="mb-6 flex items-center justify-between">
          <DeadlineFormDialog caseId={id} />
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/case/${id}`} className="text-calm-indigo">
              Back to dashboard
            </Link>
          </Button>
        </div>

        {deadlineList.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-warm-muted">
                No deadlines yet. When you have important dates to track, add them here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {deadlineList.map((deadline) => (
              <Card key={deadline.id}>
                <CardContent className="py-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <h3 className="font-medium text-warm-text">
                        {formatDeadlineKey(deadline.key)}
                      </h3>
                      <p
                        className={`text-sm ${
                          isWithinDays(deadline.due_at, 7)
                            ? 'text-calm-amber font-medium'
                            : 'text-warm-muted'
                        }`}
                      >
                        {formatDate(deadline.due_at)}
                        {isWithinDays(deadline.due_at, 7) && ' — coming up soon'}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {formatSource(deadline.source)}
                    </Badge>
                  </div>

                  {deadline.rationale && (
                    <p className="mt-3 text-sm text-warm-muted">
                      {deadline.rationale}
                    </p>
                  )}

                  {deadline.reminders && deadline.reminders.length > 0 && (
                    <div className="mt-4 border-t border-warm-border pt-3">
                      <p className="text-xs font-medium text-warm-muted mb-2">
                        Reminders
                      </p>
                      <ul className="space-y-1">
                        {deadline.reminders
                          .sort(
                            (a: Reminder, b: Reminder) =>
                              new Date(a.send_at).getTime() -
                              new Date(b.send_at).getTime()
                          )
                          .map((reminder: Reminder) => (
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
        )}

        <LegalDisclaimer />
      </main>
    </div>
  )
}
