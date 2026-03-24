import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChildSupportStep } from '@/components/step/family-wizard-steps/child-support-step'

describe('ChildSupportStep', () => {
  it('shows a TBD notice when income details are not available', () => {
    render(
      <ChildSupportStep
        grossIncome=""
        federalTax=""
        stateTax=""
        socialSecurity=""
        healthInsurance=""
        unionDues=""
        numberOfChildren={1}
        otherChildrenCount={0}
        useGuidelineAmount={true}
        customAmount=""
        customReasoning=""
        incomeUnknown={true}
        onFieldChange={vi.fn()}
      />
    )

    expect(screen.getByText(/Income details pending/)).toBeInTheDocument()
  })
})
