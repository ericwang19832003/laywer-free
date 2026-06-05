import { describe, expect, it } from 'vitest'
import {
  buildFilingServiceMetadata,
  validateFilingServiceFacts,
} from '@/lib/filing-service-confirmation'

describe('filing service confirmation', () => {
  const validFacts = {
    petition_filed_date: '2026-06-02',
    court_case_number: 'CC-26-04821',
    service_completed_date: '2026-06-04',
    service_method: 'process_server',
    defendant_name_served: 'Acme Logistics LLC',
  }

  it('requires all five post-filing and service facts', () => {
    const result = validateFilingServiceFacts({
      ...validFacts,
      court_case_number: '',
      defendant_name_served: '  ',
    })

    expect(result.valid).toBe(false)
    expect(result.errors).toEqual({
      court_case_number: 'Enter the court case number.',
      defendant_name_served: 'Enter the defendant name shown on the return of service.',
    })
  })

  it('rejects invalid dates', () => {
    const result = validateFilingServiceFacts({
      ...validFacts,
      petition_filed_date: 'not-a-date',
    })

    expect(result.valid).toBe(false)
    expect(result.errors.petition_filed_date).toBe('Enter a valid petition filed date.')
  })

  it('rejects a service date before the petition filed date', () => {
    const result = validateFilingServiceFacts({
      ...validFacts,
      petition_filed_date: '2026-06-10',
      service_completed_date: '2026-06-04',
    })

    expect(result.valid).toBe(false)
    expect(result.errors.service_completed_date).toBe(
      'Service date cannot be before petition filed date.'
    )
  })

  it('normalizes metadata for task persistence', () => {
    const metadata = buildFilingServiceMetadata({
      petition_filed_date: '2026-06-02',
      court_case_number: '  CC-26-04821  ',
      service_completed_date: '2026-06-04',
      service_method: 'process_server',
      defendant_name_served: '  Acme Logistics LLC  ',
    })

    expect(metadata.guided_answers).toEqual({
      petition_filed_date: '2026-06-02',
      court_case_number: 'CC-26-04821',
      service_completed_date: '2026-06-04',
      service_method: 'process_server',
      defendant_name_served: 'Acme Logistics LLC',
      filing_service_confirmed: 'yes',
    })
    expect(metadata.filing_service_facts).toEqual(metadata.guided_answers)
    expect(metadata.service_completed_date).toBe('2026-06-04')
    expect(metadata.court_case_number).toBe('CC-26-04821')
  })
})
