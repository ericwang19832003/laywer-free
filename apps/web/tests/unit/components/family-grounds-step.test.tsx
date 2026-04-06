import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FamilyGroundsStep } from '@/components/step/family-wizard-steps/family-grounds-step'

describe('FamilyGroundsStep', () => {
  it('shows a plain-English example for protective orders', () => {
    render(
      <FamilyGroundsStep
        familySubType="protective_order"
        grounds=""
        additionalFacts=""
        divorceGroundsType="insupportability"
        onGroundsChange={vi.fn()}
        onAdditionalFactsChange={vi.fn()}
        onDivorceGroundsTypeChange={vi.fn()}
      />
    )

    expect(
      screen.getByText(/On January 10, 2026/)
    ).toBeInTheDocument()
  })
})
