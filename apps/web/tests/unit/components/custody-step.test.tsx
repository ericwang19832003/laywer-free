import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CustodyStep } from '@/components/step/family-wizard-steps/custody-step'

describe('CustodyStep', () => {
  it('hides the reasoning field for the recommended joint arrangement', () => {
    render(
      <CustodyStep
        arrangement="joint_managing"
        reasoning=""
        onArrangementChange={vi.fn()}
        onReasoningChange={vi.fn()}
      />
    )

    expect(screen.queryByLabelText('Why do you believe this arrangement is best?')).not.toBeInTheDocument()
  })
})
