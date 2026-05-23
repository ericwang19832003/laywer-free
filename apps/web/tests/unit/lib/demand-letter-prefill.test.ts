import { describe, expect, it } from 'vitest'
import { transformDemandLetterToFiling } from '@/lib/demand-letter-prefill'

describe('transformDemandLetterToFiling', () => {
  it('marks completed demand-letter metadata as sent even if source metadata says false', () => {
    const result = transformDemandLetterToFiling(
      {
        demand_letter_sent: false,
        sent_date: '2026-05-01',
      },
      'prepare_small_claims_filing'
    )

    expect(result.demand_letter_sent).toBe(true)
    expect(result.demand_letter_date).toBe('2026-05-01')
  })

  it('maps landlord-tenant amount fields to claim_amount', () => {
    const result = transformDemandLetterToFiling(
      {
        total_damages: 1200,
      },
      'prepare_landlord_tenant_filing'
    )

    expect(result.claim_amount).toBe(1200)
  })

  it('maps personal injury facts to incident_description', () => {
    const result = transformDemandLetterToFiling(
      {
        facts: 'Driver ran a red light.',
      },
      'prepare_pi_petition'
    )

    expect(result.incident_description).toBe('Driver ran a red light.')
  })

  it('preserves distinct amount_claimed and damages_sought values when both are present', () => {
    const result = transformDemandLetterToFiling(
      {
        amount_claimed: 500,
        damages_sought: 750,
      },
      'prepare_small_claims_filing'
    )

    expect(result.amount_claimed).toBe(500)
    expect(result.damages_sought).toBe(750)
  })

  it('does not infer damages_sought from amount_claimed alone', () => {
    const result = transformDemandLetterToFiling(
      {
        amount_claimed: 500,
      },
      'prepare_small_claims_filing'
    )

    expect(result.amount_claimed).toBe(500)
    expect(result.damages_sought).toBeUndefined()
  })
})
