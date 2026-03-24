import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FamilyPartiesStep } from '@/components/step/family-wizard-steps/family-parties-step'

const baseParty = { full_name: '' }

describe('FamilyPartiesStep', () => {
  it('shows a plain-English explanation of party roles', () => {
    render(
      <FamilyPartiesStep
        petitioner={baseParty}
        respondent={baseParty}
        onPetitionerChange={vi.fn()}
        onRespondentChange={vi.fn()}
      />
    )

    expect(
      screen.getByText('Petitioner = the person filing. Respondent = the other person.')
    ).toBeInTheDocument()
  })

  it('allows deferring respondent address', () => {
    render(
      <FamilyPartiesStep
        petitioner={baseParty}
        respondent={baseParty}
        onPetitionerChange={vi.fn()}
        onRespondentChange={vi.fn()}
      />
    )

    fireEvent.click(screen.getByLabelText("I don't know their address yet"))

    expect(screen.queryByTestId('respondent-address')).not.toBeInTheDocument()
    expect(screen.getByText('You can add a work or last known address later.')).toBeInTheDocument()
  })
})
