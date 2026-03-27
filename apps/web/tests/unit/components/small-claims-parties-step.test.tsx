import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SmallClaimsPartiesStep } from '@/components/step/small-claims-wizard-steps/small-claims-parties-step'

const emptyParty = { full_name: '' }

describe('SmallClaimsPartiesStep', () => {
  it('allows deferring the defendant address', () => {
    render(
      <SmallClaimsPartiesStep
        plaintiff={emptyParty}
        defendant={emptyParty}
        defendantIsBusiness={false}
        defendantBusinessName=""
        onPlaintiffChange={vi.fn()}
        onDefendantChange={vi.fn()}
        onDefendantIsBusinessChange={vi.fn()}
        onDefendantBusinessNameChange={vi.fn()}
      />
    )

    fireEvent.click(screen.getByLabelText("I don't know their address yet"))

    expect(screen.queryByTestId('defendant-address')).not.toBeInTheDocument()
    expect(screen.getByText('You can add a work or last known address later.')).toBeInTheDocument()
  })

  it('allows deferring the business legal name', () => {
    render(
      <SmallClaimsPartiesStep
        plaintiff={emptyParty}
        defendant={emptyParty}
        defendantIsBusiness={true}
        defendantBusinessName=""
        onPlaintiffChange={vi.fn()}
        onDefendantChange={vi.fn()}
        onDefendantIsBusinessChange={vi.fn()}
        onDefendantBusinessNameChange={vi.fn()}
      />
    )

    fireEvent.click(screen.getByLabelText("I don't know the legal business name yet"))

    const businessInput = screen.getByLabelText("What is the business's legal name?")
    expect(businessInput).toBeDisabled()
    expect(screen.getByText('We will remind you to add it before filing.')).toBeInTheDocument()
  })
})
