import { describe, it, expect } from 'vitest'
import {
  buildContinuancePrompt,
  continuanceFactsSchema,
  continuanceConfig,
  type ContinuanceFacts,
} from '@lawyer-free/shared/motions/configs/motion-continuance'

describe('buildContinuancePrompt', () => {
  const baseFacts: ContinuanceFacts = {
    your_info: {
      full_name: 'Jane Smith',
      address: '100 Main St',
      city: 'Houston',
      state: 'TX',
      zip: '77001',
    },
    opposing_parties: [{ full_name: 'ACME Corp', address: '200 Corp Ave' }],
    court_type: 'district',
    county: 'Harris',
    cause_number: '2026-CI-01234',
    hearing_or_trial_date: '2026-04-15',
    event_type: 'trial',
    reason: 'medical',
    explanation:
      'I am scheduled for surgery on April 10, 2026 and will need at least 4 weeks to recover before I can appear in court.',
    proposed_new_date: '2026-06-15',
    opposing_position: 'agrees',
    previous_continuances: 0,
  }

  it('returns { system, user } object', () => {
    const result = buildContinuancePrompt(baseFacts)
    expect(result).toHaveProperty('system')
    expect(result).toHaveProperty('user')
  })

  it('system includes DRAFT disclaimer', () => {
    const result = buildContinuancePrompt(baseFacts)
    expect(result.system).toContain('DRAFT')
    expect(result.system).toContain('NOT LEGAL ADVICE')
  })

  it('user includes reason for continuance', () => {
    const result = buildContinuancePrompt(baseFacts)
    expect(result.user).toContain('medical')
  })

  it('user includes event type', () => {
    const result = buildContinuancePrompt(baseFacts)
    expect(result.user).toContain('trial')
  })

  it('user includes opposing position', () => {
    const result = buildContinuancePrompt(baseFacts)
    expect(result.user).toContain('agrees')
  })

  it('user includes proposed new date when provided', () => {
    const result = buildContinuancePrompt(baseFacts)
    expect(result.user).toContain('2026-06-15')
  })

  it('user omits proposed date section when not provided', () => {
    const { proposed_new_date, ...factsWithoutDate } = baseFacts
    const result = buildContinuancePrompt(
      factsWithoutDate as ContinuanceFacts
    )
    expect(result.user).not.toContain('Proposed new date')
  })

  it('user includes previous continuances count', () => {
    const result = buildContinuancePrompt(baseFacts)
    expect(result.user).toContain('0')
  })

  it('user includes party names', () => {
    const result = buildContinuancePrompt(baseFacts)
    expect(result.user).toContain('Jane Smith')
    expect(result.user).toContain('ACME Corp')
  })

  it('user includes hearing/trial date', () => {
    const result = buildContinuancePrompt(baseFacts)
    expect(result.user).toContain('2026-04-15')
  })
})

describe('continuanceFactsSchema', () => {
  const validFacts = {
    your_info: { full_name: 'Jane Smith' },
    opposing_parties: [{ full_name: 'ACME Corp' }],
    court_type: 'district',
    county: 'Harris',
    hearing_or_trial_date: '2026-04-15',
    event_type: 'trial',
    reason: 'medical',
    explanation:
      'I am scheduled for surgery and need time to recover before trial.',
    opposing_position: 'agrees',
    previous_continuances: 0,
  }

  it('accepts valid facts', () => {
    const result = continuanceFactsSchema.safeParse(validFacts)
    expect(result.success).toBe(true)
  })

  it('rejects invalid reason enum value', () => {
    const result = continuanceFactsSchema.safeParse({
      ...validFacts,
      reason: 'vacation',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid event_type', () => {
    const result = continuanceFactsSchema.safeParse({
      ...validFacts,
      event_type: 'deposition',
    })
    expect(result.success).toBe(false)
  })
})

describe('continuanceConfig', () => {
  it('has correct key', () => {
    expect(continuanceConfig.key).toBe('motion_continuance')
  })

  it('has correct category', () => {
    expect(continuanceConfig.category).toBe('pretrial')
  })

  it('has fields array', () => {
    expect(Array.isArray(continuanceConfig.fields)).toBe(true)
    expect(continuanceConfig.fields.length).toBeGreaterThan(0)
  })

  it('has buildPrompt function', () => {
    expect(typeof continuanceConfig.buildPrompt).toBe('function')
  })

  it('has title and description', () => {
    expect(continuanceConfig.title).toBe('Motion for Continuance')
    expect(continuanceConfig.description).toBeTruthy()
  })

  it('has reassurance text', () => {
    expect(continuanceConfig.reassurance).toBeTruthy()
  })
})
