import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TimelineStep } from '@/components/step/small-claims-wizard-steps/timeline-step'

const baseEvents = [{ date: '', description: '' }]

describe('TimelineStep', () => {
  it('adds a suggested timeline event', () => {
    const onEventsChange = vi.fn()

    render(<TimelineStep events={baseEvents} onEventsChange={onEventsChange} />)

    fireEvent.click(screen.getByRole('button', { name: /Agreement made/i }))

    expect(onEventsChange).toHaveBeenCalled()
    const nextEvents = onEventsChange.mock.calls[0]?.[0]
    expect(nextEvents).toHaveLength(1)
    expect(nextEvents[0].description).toMatch(/Agreement made/i)
  })

  it('sorts timeline events by date', () => {
    const onEventsChange = vi.fn()

    render(
      <TimelineStep
        events={[
          { date: '2026-02-10', description: 'Later event' },
          { date: '2026-01-05', description: 'Earlier event' },
        ]}
        onEventsChange={onEventsChange}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /Sort by date/i }))

    const nextEvents = onEventsChange.mock.calls[0]?.[0]
    expect(nextEvents[0].date).toBe('2026-01-05')
    expect(nextEvents[1].date).toBe('2026-02-10')
  })
})
