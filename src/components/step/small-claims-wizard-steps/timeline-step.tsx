'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { HelpTooltip } from '@/components/ui/help-tooltip'
import { Trash2 } from 'lucide-react'

interface TimelineEvent {
  date: string
  description: string
}

interface TimelineStepProps {
  events: TimelineEvent[]
  onEventsChange: (events: TimelineEvent[]) => void
}

const TIMELINE_SUGGESTIONS = [
  'Agreement made',
  'Payment made',
  'Problem discovered',
  'Attempted resolution',
  'Demand letter sent',
  'Decided to file',
]

export function TimelineStep({ events, onEventsChange }: TimelineStepProps) {
  function updateEvent(index: number, field: keyof TimelineEvent, value: string) {
    const updated = [...events]
    updated[index] = { ...updated[index], [field]: value }
    onEventsChange(updated)
  }

  function addEvent() {
    onEventsChange([...events, { date: '', description: '' }])
  }

  function removeEvent(index: number) {
    onEventsChange(events.filter((_, i) => i !== index))
  }

  function applySuggestion(description: string) {
    const emptyIndex = events.findIndex(
      (event) => !event.date && !event.description
    )

    if (emptyIndex >= 0) {
      const updated = [...events]
      updated[emptyIndex] = { ...updated[emptyIndex], description }
      onEventsChange(updated)
      return
    }

    onEventsChange([...events, { date: '', description }])
  }

  function sortByDate() {
    const sorted = [...events].sort((a, b) => {
      if (!a.date && !b.date) return 0
      if (!a.date) return 1
      if (!b.date) return -1
      return a.date.localeCompare(b.date)
    })

    onEventsChange(sorted)
  }

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-sm font-medium text-warm-text">
          Timeline of Events
        </Label>
        <p className="text-sm text-warm-muted mt-1">
          These events will help tell your story in chronological order. List the key dates and
          what happened on each date.
        </p>
        <HelpTooltip label="What events should I include?">
          <p>
            Include dates like when the agreement was made, when you paid, when the problem
            started, when you tried to resolve it, and when you decided to file. Judges
            appreciate a clear, organized timeline.
          </p>
        </HelpTooltip>
      </div>

      <div className="rounded-lg border border-calm-indigo/20 bg-calm-indigo/5 p-3">
        <p className="text-xs font-medium text-warm-muted mb-1.5">Quick add common events:</p>
        <div className="flex flex-wrap gap-1.5">
          {TIMELINE_SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => applySuggestion(suggestion)}
              className="rounded-full bg-white px-2.5 py-0.5 text-xs text-warm-text border border-warm-border transition hover:border-calm-indigo/40 hover:bg-calm-indigo/10"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {events.length > 1 && (
        <button
          type="button"
          onClick={sortByDate}
          className="text-xs text-calm-indigo hover:text-calm-indigo/80"
        >
          Sort by date
        </button>
      )}

      {/* Events list */}
      <div className="space-y-4">
        {events.map((event, i) => (
          <div
            key={i}
            className="rounded-lg border border-warm-border p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-warm-muted">
                Event {i + 1}
              </span>
              {events.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeEvent(i)}
                  className="text-xs text-warm-muted hover:text-warm-text flex items-center gap-1"
                >
                  <Trash2 className="h-3 w-3" />
                  Remove
                </button>
              )}
            </div>

            <div>
              <Label htmlFor={`event-date-${i}`} className="text-xs text-warm-muted">
                Date
              </Label>
              <Input
                id={`event-date-${i}`}
                type="date"
                value={event.date}
                onChange={(e) => updateEvent(i, 'date', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor={`event-description-${i}`} className="text-xs text-warm-muted">
                What happened?
              </Label>
              <textarea
                id={`event-description-${i}`}
                value={event.description}
                onChange={(e) => updateEvent(i, 'description', e.target.value)}
                placeholder="Describe what happened on this date..."
                className="mt-1 w-full rounded-md border border-warm-border bg-white px-3 py-2 text-sm text-warm-text placeholder:text-warm-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                style={{ minHeight: '72px' }}
                rows={3}
              />
            </div>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addEvent}
      >
        + Add event
      </Button>
    </div>
  )
}
