import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SmallClaimsStepPreview } from '@/components/step/small-claims-wizard-steps/small-claims-step-preview'

const steps = [
  { id: 'parties', title: 'Parties', subtitle: 'Names and addresses' },
  { id: 'damages', title: 'Damages', subtitle: 'Totals and receipts' },
]

describe('SmallClaimsStepPreview', () => {
  it('shows a quick completion checklist', () => {
    render(
      <SmallClaimsStepPreview
        steps={steps}
        totalMinutes={15}
        onContinue={() => {}}
      />
    )

    expect(screen.getByText(/You will finish today/i)).toBeInTheDocument()
    expect(screen.getByText(/Filing checklist/i)).toBeInTheDocument()
  })
})
