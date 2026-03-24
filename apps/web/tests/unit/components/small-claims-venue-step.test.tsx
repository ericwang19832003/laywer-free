import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { useState } from 'react'
import { SmallClaimsVenueStep } from '@/components/step/small-claims-wizard-steps/small-claims-venue-step'

function Wrapper() {
  const [defendantCounty, setDefendantCounty] = useState('')
  const [incidentCounty, setIncidentCounty] = useState('')
  const [precinct, setPrecinct] = useState('')

  return (
    <SmallClaimsVenueStep
      defendantCounty={defendantCounty}
      incidentCounty={incidentCounty}
      precinct={precinct}
      onFieldChange={(field, value) => {
        if (field === 'defendantCounty') setDefendantCounty(value)
        if (field === 'incidentCounty') setIncidentCounty(value)
        if (field === 'precinct') setPrecinct(value)
      }}
    />
  )
}

describe('SmallClaimsVenueStep', () => {
  it('confirms the recommended county in plain English', () => {
    render(<Wrapper />)

    fireEvent.change(screen.getByLabelText('What county does the defendant live or do business in?'), {
      target: { value: 'Harris' },
    })

    expect(screen.getByText(/Recommended: Harris County/)).toBeInTheDocument()
    expect(screen.getByText('Does this look right? You can edit the county above.')).toBeInTheDocument()
  })

  it('lets users copy the defendant county into the incident county', () => {
    render(<Wrapper />)

    fireEvent.change(screen.getByLabelText('What county does the defendant live or do business in?'), {
      target: { value: 'Travis' },
    })

    fireEvent.click(screen.getByRole('button', { name: /Use defendant county/i }))

    expect(screen.getByLabelText('Where did the events occur? (optional)')).toHaveValue('Travis')
  })

  it('highlights when two venue options are available', () => {
    render(<Wrapper />)

    fireEvent.change(screen.getByLabelText('What county does the defendant live or do business in?'), {
      target: { value: 'Harris' },
    })
    fireEvent.change(screen.getByLabelText('Where did the events occur? (optional)'), {
      target: { value: 'Travis' },
    })

    expect(screen.getByText(/Possible venues/i)).toBeInTheDocument()
    expect(screen.getByText('Harris County (defendant)')).toBeInTheDocument()
    expect(screen.getByText('Travis County (incident)')).toBeInTheDocument()
  })
})
