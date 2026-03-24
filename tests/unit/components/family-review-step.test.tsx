import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FamilyReviewStep } from '@/components/step/family-wizard-steps/family-review-step'

describe('FamilyReviewStep', () => {
  it('shows a "We will include" checklist', () => {
    render(
      <FamilyReviewStep
        familySubType="divorce"
        formData={{
          petitioner: { full_name: 'Alex Doe' },
          respondent: { full_name: 'Jamie Doe' },
          children: [],
        }}
        onEditStep={() => {}}
      />
    )

    expect(screen.getByText('We will include')).toBeInTheDocument()
    expect(screen.getByText(/Caption/)).toBeInTheDocument()
  })
})
