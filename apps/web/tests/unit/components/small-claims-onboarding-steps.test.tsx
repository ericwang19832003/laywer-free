import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SmallClaimsWelcomeStep } from '@/components/step/small-claims-wizard-steps/small-claims-welcome-step'
import { SmallClaimsStepPreview } from '@/components/step/small-claims-wizard-steps/small-claims-step-preview'

const steps = [
  { id: 'preflight', title: 'Before You Start', subtitle: 'Gather what you need.' },
  { id: 'parties', title: 'Who Is Involved?', subtitle: 'Tell us about both parties.' },
]

describe('SmallClaimsWelcomeStep', () => {
  it('renders welcome copy and continues', () => {
    const onContinue = vi.fn()
    render(<SmallClaimsWelcomeStep onContinue={onContinue} />)

    expect(screen.getByText('Welcome to Texas Small Claims')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: "I'm ready" }))
    expect(onContinue).toHaveBeenCalledTimes(1)
  })
})

describe('SmallClaimsStepPreview', () => {
  it('shows step list and time estimate', () => {
    const onContinue = vi.fn()
    render(
      <SmallClaimsStepPreview
        steps={steps}
        totalMinutes={20}
        onContinue={onContinue}
      />
    )

    expect(screen.getByText('What to expect')).toBeInTheDocument()
    expect(screen.getByText('Before You Start')).toBeInTheDocument()
    expect(screen.getByText('Who Is Involved?')).toBeInTheDocument()
    expect(screen.getByText(/about 20 minutes/i)).toBeInTheDocument()
  })
})
