import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { useState } from 'react'
import { ExistingOrdersStep } from '@/components/step/family-wizard-steps/existing-orders-step'

function Wrapper() {
  const [changeDescription, setChangeDescription] = useState('')
  return (
    <ExistingOrdersStep
      court=""
      causeNumber=""
      whatToModify={[]}
      changeDescription={changeDescription}
      onCourtChange={() => {}}
      onCauseNumberChange={() => {}}
      onWhatToModifyChange={() => {}}
      onChangeDescriptionChange={setChangeDescription}
    />
  )
}

describe('ExistingOrdersStep', () => {
  it('lets the user add a common change with one click', () => {
    render(<Wrapper />)

    fireEvent.click(screen.getByRole('button', { name: 'Income change' }))

    expect(screen.getByDisplayValue(/Income has changed/i)).toBeInTheDocument()
  })
})
