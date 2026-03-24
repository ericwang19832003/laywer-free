import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { useState } from 'react'
import { ChildrenStep } from '@/components/step/family-wizard-steps/children-step'

function Wrapper() {
  const [children, setChildren] = useState([
    { name: 'Emily Rose Garcia', date_of_birth: '2016-05-10', relationship: 'biological' as const },
  ])
  const [residenceSummary, setResidenceSummary] = useState('')

  return (
    <ChildrenStep
      children={children}
      onChildrenChange={setChildren}
      familySubType="custody"
      residenceSummary={residenceSummary}
      onResidenceSummaryChange={setResidenceSummary}
    />
  )
}

describe('ChildrenStep', () => {
  it('asks where the children have lived and captures a summary', () => {
    render(<Wrapper />)

    fireEvent.change(
      screen.getByLabelText('Where have the children lived most of the last 6 months?'),
      { target: { value: 'Travis County' } }
    )

    expect(screen.getByDisplayValue('Travis County')).toBeInTheDocument()
  })
})
