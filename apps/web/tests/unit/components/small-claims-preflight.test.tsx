import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SmallClaimsPreflight } from '@/components/step/small-claims-wizard-steps/small-claims-preflight'

describe('SmallClaimsPreflight', () => {
  it('marks all optional items as get later', () => {
    render(<SmallClaimsPreflight claimSubType="security_deposit" onReady={() => {}} />)

    fireEvent.click(screen.getByRole('button', { name: /Get all later/i }))

    expect(screen.getByText(/Saved for later:/i)).toBeInTheDocument()
  })

  it('clears the saved for later list', () => {
    render(<SmallClaimsPreflight claimSubType="security_deposit" onReady={() => {}} />)

    fireEvent.click(screen.getByRole('button', { name: /Get all later/i }))
    fireEvent.click(screen.getByRole('button', { name: /Clear later list/i }))

    expect(screen.queryByText(/Saved for later:/i)).not.toBeInTheDocument()
  })
})
