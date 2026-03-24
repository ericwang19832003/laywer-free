import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { useState } from 'react'
import { FamilyVenueStep } from '@/components/step/family-wizard-steps/family-venue-step'

function Wrapper() {
  const [petitionerCounty, setPetitionerCounty] = useState('Travis')
  const [childrenCounty, setChildrenCounty] = useState('')

  return (
    <FamilyVenueStep
      familySubType="custody"
      county={null}
      petitionerCounty={petitionerCounty}
      childrenCounty={childrenCounty}
      onPetitionerCountyChange={setPetitionerCounty}
      onChildrenCountyChange={setChildrenCounty}
    />
  )
}

describe('FamilyVenueStep', () => {
  it('shows a plain-English confirmation when recommending a county', () => {
    render(<Wrapper />)

    expect(screen.getByText(/Recommended: Travis County/)).toBeInTheDocument()
    expect(screen.getByText('Does this look right? You can edit the county above.')).toBeInTheDocument()
  })
})
