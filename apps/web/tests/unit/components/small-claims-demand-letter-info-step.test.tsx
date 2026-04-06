import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DemandLetterInfoStep } from '@/components/step/small-claims-wizard-steps/demand-letter-info-step'

describe('DemandLetterInfoStep', () => {
  it('sets a deadline when a quick button is clicked', () => {
    const onFieldChange = vi.fn()

    render(
      <DemandLetterInfoStep
        demandLetterSent={false}
        demandLetterDate=""
        deadlineDays=""
        preferredResolution=""
        onFieldChange={onFieldChange}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /14 days/i }))

    expect(onFieldChange).toHaveBeenCalledWith('deadlineDays', '14')
  })

  it('adds a preferred resolution template when clicked', () => {
    const onFieldChange = vi.fn()

    render(
      <DemandLetterInfoStep
        demandLetterSent={false}
        demandLetterDate=""
        deadlineDays=""
        preferredResolution=""
        onFieldChange={onFieldChange}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /Full refund/i }))

    const call = onFieldChange.mock.calls.find(([field]) => field === 'preferredResolution')
    expect(call?.[1]).toMatch(/full refund/i)
  })

  it('adds a response template when demand letter was sent', () => {
    const onFieldChange = vi.fn()

    render(
      <DemandLetterInfoStep
        demandLetterSent={true}
        demandLetterDate="2026-02-01"
        deadlineDays=""
        preferredResolution=""
        onFieldChange={onFieldChange}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /No response/i }))

    const call = onFieldChange.mock.calls.find(([field]) => field === 'preferredResolution')
    expect(call?.[1]).toMatch(/no response/i)
  })

  it('shows a suggested deadline sentence when a deadline is selected', () => {
    render(
      <DemandLetterInfoStep
        demandLetterSent={false}
        demandLetterDate=""
        deadlineDays="14"
        preferredResolution=""
        onFieldChange={vi.fn()}
      />
    )

    expect(screen.getByText(/Please respond within 14 days/i)).toBeInTheDocument()
  })
})
