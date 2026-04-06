import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FamilyWelcomeStep } from '@/components/step/family-wizard-steps/family-welcome-step'
import { FamilyStepPreview } from '@/components/step/family-wizard-steps/family-step-preview'

const steps = [
  { id: 'preflight', title: 'Before You Start', subtitle: 'Get your documents ready.' },
  { id: 'parties', title: 'Who Is Involved?', subtitle: 'Tell us about both parties.' },
]

describe('FamilyWelcomeStep', () => {
  it('renders welcome copy and continues', () => {
    const onContinue = vi.fn()
    render(<FamilyWelcomeStep onContinue={onContinue} />)

    expect(screen.getByText('Welcome to Family Cases')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: "I'm ready" }))
    expect(onContinue).toHaveBeenCalledTimes(1)
  })
})

describe('FamilyStepPreview', () => {
  it('shows step list and time estimate', () => {
    const onContinue = vi.fn()
    render(
      <FamilyStepPreview
        steps={steps}
        totalMinutes={25}
        onContinue={onContinue}
      />
    )

    expect(screen.getByText('What to expect')).toBeInTheDocument()
    expect(screen.getByText('Before You Start')).toBeInTheDocument()
    expect(screen.getByText('Who Is Involved?')).toBeInTheDocument()
    expect(screen.getByText(/about 25 minutes/i)).toBeInTheDocument()
  })

  it('continues when the user is ready', () => {
    const onContinue = vi.fn()
    render(
      <FamilyStepPreview
        steps={steps}
        totalMinutes={25}
        onContinue={onContinue}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    expect(onContinue).toHaveBeenCalledTimes(1)
  })
})
