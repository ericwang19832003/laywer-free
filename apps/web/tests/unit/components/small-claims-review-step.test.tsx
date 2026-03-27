import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SmallClaimsReviewStep } from '@/components/step/small-claims-wizard-steps/small-claims-review-step'

const baseParty = {
  full_name: 'Alex Plaintiff',
  address: '123 Main St',
  city: 'Austin',
  state: 'TX',
  zip: '78701',
}

describe('SmallClaimsReviewStep', () => {
  it('shows a we-will-include checklist', () => {
    render(
      <SmallClaimsReviewStep
        claimSubType="breach_of_contract"
        plaintiff={baseParty}
        defendant={{ ...baseParty, full_name: 'Jordan Defendant' }}
        defendantIsBusiness={false}
        defendantBusinessName=""
        claimDetails={{}}
        damageItems={[]}
        totalDamages={0}
        timelineEvents={[]}
        demandLetterSent={false}
        demandLetterDate=""
        deadlineDays=""
        preferredResolution=""
        defendantCounty="Travis"
        incidentCounty=""
        precinct=""
        onEdit={vi.fn()}
      />
    )

    expect(screen.getByText(/We will include/i)).toBeInTheDocument()
    expect(screen.getByText(/Damages total and line items/i)).toBeInTheDocument()
  })

  it('highlights missing sections when information is incomplete', () => {
    render(
      <SmallClaimsReviewStep
        claimSubType="breach_of_contract"
        plaintiff={{ ...baseParty, full_name: '' }}
        defendant={{ ...baseParty, full_name: '' }}
        defendantIsBusiness={false}
        defendantBusinessName=""
        claimDetails={{}}
        damageItems={[]}
        totalDamages={0}
        timelineEvents={[]}
        demandLetterSent={false}
        demandLetterDate=""
        deadlineDays=""
        preferredResolution=""
        defendantCounty=""
        incidentCounty=""
        precinct=""
        onEdit={vi.fn()}
      />
    )

    expect(screen.getByText(/Some sections look incomplete/i)).toBeInTheDocument()
    expect(screen.getAllByText('Damages total').length).toBeGreaterThan(0)
  })

  it('shows key totals and counts', () => {
    render(
      <SmallClaimsReviewStep
        claimSubType="breach_of_contract"
        plaintiff={baseParty}
        defendant={{ ...baseParty, full_name: 'Jordan Defendant' }}
        defendantIsBusiness={false}
        defendantBusinessName=""
        claimDetails={{}}
        damageItems={[{ category: 'Repairs', amount: 500, description: '' }]}
        totalDamages={500}
        timelineEvents={[
          { date: '2026-01-01', description: 'Agreement made' },
          { date: '2026-02-01', description: 'Problem discovered' },
        ]}
        demandLetterSent={true}
        demandLetterDate="2026-02-10"
        deadlineDays=""
        preferredResolution=""
        defendantCounty="Travis"
        incidentCounty=""
        precinct=""
        onEdit={vi.fn()}
      />
    )

    expect(screen.getByText(/Key totals/i)).toBeInTheDocument()
    expect(screen.getByText(/Timeline events/i)).toBeInTheDocument()
    expect(screen.getByText(/2 events/i)).toBeInTheDocument()
  })
})
