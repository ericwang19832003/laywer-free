import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FamilyPreflight } from '@/components/step/family-wizard-steps/family-preflight'

describe('FamilyPreflight', () => {
  it('splits items into minimum required and nice to have sections', () => {
    render(<FamilyPreflight familySubType="divorce" onReady={() => {}} />)

    expect(screen.getByText('Minimum required to start')).toBeInTheDocument()
    expect(screen.getByText('Nice to have')).toBeInTheDocument()
  })

  it('allows deferring an optional item', () => {
    render(<FamilyPreflight familySubType="divorce" onReady={() => {}} />)

    const deferButtons = screen.getAllByRole('button', { name: 'Get later' })
    fireEvent.click(deferButtons[0])

    expect(screen.getByText(/Saved for later: 1 item/)).toBeInTheDocument()
  })
})
