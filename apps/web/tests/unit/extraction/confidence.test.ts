import { computeConfidence, deriveStatus } from '@/lib/extraction/confidence'
import type { RosFields } from '@/lib/schemas/document-extraction'

describe('computeConfidence', () => {
  it('returns 1.0 when all fields present', () => {
    const fields: RosFields = {
      served_at: 'January 15, 2026',
      return_filed_at: 'January 20, 2026',
      service_method: 'personal',
      served_to: 'John Doe',
      server_name: 'Jane Smith',
    }
    expect(computeConfidence(fields)).toBe(1.0)
  })

  it('returns 0.0 when no fields present', () => {
    const fields: RosFields = {
      served_at: null,
      return_filed_at: null,
      service_method: null,
      served_to: null,
      server_name: null,
    }
    expect(computeConfidence(fields)).toBe(0.0)
  })

  it('returns 0.75 for core fields only (served_at + service_method + served_to)', () => {
    const fields: RosFields = {
      served_at: 'January 15, 2026',
      return_filed_at: null,
      service_method: 'personal',
      served_to: 'John Doe',
      server_name: null,
    }
    // 0.30 + 0.25 + 0.20 = 0.75
    expect(computeConfidence(fields)).toBe(0.75)
  })

  it('returns 0.30 for served_at only', () => {
    const fields: RosFields = {
      served_at: 'January 15, 2026',
      return_filed_at: null,
      service_method: null,
      served_to: null,
      server_name: null,
    }
    expect(computeConfidence(fields)).toBe(0.30)
  })

  it('returns 0.10 for return_filed_at only', () => {
    const fields: RosFields = {
      served_at: null,
      return_filed_at: 'January 20, 2026',
      service_method: null,
      served_to: null,
      server_name: null,
    }
    expect(computeConfidence(fields)).toBe(0.10)
  })
})

describe('deriveStatus', () => {
  it('returns succeeded for confidence >= 0.6', () => {
    expect(deriveStatus(0.6)).toBe('succeeded')
    expect(deriveStatus(0.75)).toBe('succeeded')
    expect(deriveStatus(1.0)).toBe('succeeded')
  })

  it('returns needs_review for 0 < confidence < 0.6', () => {
    expect(deriveStatus(0.1)).toBe('needs_review')
    expect(deriveStatus(0.3)).toBe('needs_review')
    expect(deriveStatus(0.55)).toBe('needs_review')
  })

  it('returns failed for confidence === 0', () => {
    expect(deriveStatus(0)).toBe('failed')
  })
})
