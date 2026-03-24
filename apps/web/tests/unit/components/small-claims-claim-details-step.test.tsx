import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ClaimDetailsStep } from '@/components/step/small-claims-wizard-steps/claim-details-step'

describe('ClaimDetailsStep', () => {
  it('shows a plain-English example for breach of contract', () => {
    render(
      <ClaimDetailsStep
        claimSubType="breach_of_contract"
        formValues={{}}
        onFieldChange={vi.fn()}
      />
    )

    expect(screen.getByText(/Example: The contractor agreed/)).toBeInTheDocument()
  })

  it('fills a breach of contract template when requested', () => {
    const onFieldChange = vi.fn()

    render(
      <ClaimDetailsStep
        claimSubType="breach_of_contract"
        formValues={{}}
        onFieldChange={onFieldChange}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /Use template/i }))

    const call = onFieldChange.mock.calls.find(([field]) => field === 'whatWasPromised')
    expect(call?.[1]).toMatch(/agreed/i)
  })
})
