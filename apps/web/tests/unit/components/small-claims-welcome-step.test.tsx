import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SmallClaimsWelcomeStep } from '@/components/step/small-claims-wizard-steps/small-claims-welcome-step'

describe('SmallClaimsWelcomeStep', () => {
  it('highlights what the user will do today', () => {
    render(<SmallClaimsWelcomeStep onContinue={() => {}} />)

    expect(screen.getByText(/What you will do today/i)).toBeInTheDocument()
    expect(screen.getByText('Draft petition details')).toBeInTheDocument()
  })
})
