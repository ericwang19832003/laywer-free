'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { describeEvent, relativeTime } from '@/components/dashboard/timeline-card'

interface TimelineEvent {
  id: string
  kind: string
  payload: Record<string, unknown>
  created_at: string
  task_title?: string
}

interface ActivityFeedProps {
  caseId: string
  initialEvents: TimelineEvent[]
  initialCursor: string | null
  initialHasMore: boolean
}

const EVENT_CATEGORIES: Record<string, string[]> = {
  all: [],
  tasks: ['task_status_changed', 'task_unlocked', 'gatekeeper_run', 'case_created'],
  deadlines: ['deadline_created', 'answer_deadline_confirmed', 'deadlines_generated', 'discovery_response_deadline_set'],
  documents: [
    'document_uploaded', 'court_document_uploaded', 'extraction_completed',
    'filing_draft_generated', 'preservation_letter_draft_generated',
    'preservation_letter_draft_saved', 'preservation_letter_sent',
    'disclaimer_acknowledged',
  ],
  discovery: [
    'discovery_pack_created', 'discovery_pack_status_changed', 'discovery_template_acknowledged',
    'discovery_item_added', 'discovery_pack_served', 'discovery_packet_exported',
    'discovery_response_received',
    'objection_review_created', 'objection_text_extracted', 'objection_classified',
    'objection_review_confirmed', 'meet_and_confer_generated', 'meet_and_confer_sent',
  ],
  evidence: ['evidence_uploaded', 'evidence_exported'],
  motions: ['motion_created'],
  exhibits: ['exhibit_set_created', 'exhibit_added', 'exhibits_reordered', 'exhibit_list_exported', 'exhibit_removed', 'trial_binder_generated', 'trial_binder_failed', 'trial_binder_downloaded'],
  system: ['health_alert_triggered', 'reminder_escalated', 'strategy_generated', 'note_added', 'service_facts_confirmed'],
}

const CATEGORY_LABELS: Record<string, string> = {
  all: 'All Events',
  tasks: 'Tasks',
  deadlines: 'Deadlines',
  documents: 'Documents',
  discovery: 'Discovery',
  evidence: 'Evidence',
  motions: 'Motions',
  exhibits: 'Exhibits & Binders',
  system: 'System',
}

export function ActivityFeed({ caseId, initialEvents, initialCursor, initialHasMore }: ActivityFeedProps) {
  const [allEvents, setAllEvents] = useState(initialEvents)
  const [cursor, setCursor] = useState(initialCursor)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all')

  const filteredEvents = filter === 'all'
    ? allEvents
    : allEvents.filter((e) => EVENT_CATEGORIES[filter]?.includes(e.kind))

  const loadMore = useCallback(async () => {
    if (!cursor || loading) return
    setLoading(true)
    try {
      const res = await fetch(`/api/cases/${caseId}/timeline?cursor=${encodeURIComponent(cursor)}&limit=20`)
      if (res.ok) {
        const data = await res.json()
        const newEvents = data.events as TimelineEvent[]
        setAllEvents((prev) => [...prev, ...newEvents])
        setHasMore(data.has_more)
        setCursor(data.next_cursor)
      }
    } catch { /* silent */ }
    setLoading(false)
  }, [caseId, cursor, loading])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-warm-muted">{filteredEvents.length} events</p>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="pt-6">
          {filteredEvents.length === 0 ? (
            <p className="text-sm text-warm-muted text-center py-8">
              {filter === 'all' ? 'No activity recorded yet.' : 'No events match this filter.'}
            </p>
          ) : (
            <ul className="space-y-4">
              {filteredEvents.map((event) => (
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
          {hasMore && (
            <div className="mt-4 text-center">
              <Button variant="ghost" size="sm" onClick={loadMore} disabled={loading}>
                {loading ? 'Loading...' : 'Load more events'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
