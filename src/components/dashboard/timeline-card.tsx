'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface TimelineEvent {
  id: string
  kind: string
  payload: Record<string, unknown>
  created_at: string
  task_title?: string
}

interface TimelineCardProps {
  events: TimelineEvent[]
}

function relativeTime(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSeconds < 60) return 'just now'
  if (diffMinutes === 1) return '1 minute ago'
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`
  if (diffHours === 1) return '1 hour ago'
  if (diffHours < 24) return `${diffHours} hours ago`
  if (diffDays === 1) return '1 day ago'
  if (diffDays < 30) return `${diffDays} days ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function describeEvent(event: TimelineEvent): string {
  switch (event.kind) {
    case 'case_created':
      return 'Case started'
    case 'task_status_changed': {
      const to = event.payload?.to as string | undefined
      const title = event.task_title ?? 'a step'
      if (to === 'done') return `Completed: ${title}`
      if (to === 'in_progress') return `Started: ${title}`
      return `Updated: ${title}`
    }
    case 'task_unlocked':
      return `New step available: ${event.task_title ?? 'a step'}`
    case 'deadline_created':
      return `Deadline added: ${(event.payload?.key as string) ?? 'a deadline'}`
    default:
      return event.kind.replace(/_/g, ' ')
  }
}

export function TimelineCard({ events }: TimelineCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-warm-text">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="text-warm-muted text-sm">
            No activity yet. Complete your first step to see it here.
          </p>
        ) : (
          <ul className="space-y-3">
            {events.slice(0, 10).map((event) => (
              <li key={event.id} className="flex items-start gap-3">
                <span
                  className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-calm-indigo"
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-warm-text">{describeEvent(event)}</p>
                  <p className="text-xs text-warm-muted">{relativeTime(event.created_at)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
