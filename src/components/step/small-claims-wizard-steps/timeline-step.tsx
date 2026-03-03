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
