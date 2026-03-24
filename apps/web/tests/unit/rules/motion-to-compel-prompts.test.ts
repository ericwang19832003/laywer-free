import { describe, it, expect } from 'vitest'
import {
  buildMotionToCompelPrompt,
  motionToCompelFactsSchema,
  motionToCompelConfig,
  type MotionToCompelFacts,
} from '@/lib/motions/configs/motion-to-compel'

describe('buildMotionToCompelPrompt', () => {
  const baseFacts: MotionToCompelFacts = {
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
    discovery_type: 'interrogatories',
    date_served: '2026-01-10',
    response_deadline: '2026-02-10',
    deficiency_description:
      'Opposing party failed to respond to any of the interrogatories within the 30-day deadline.',
    good_faith_conference_date: '2026-02-20',
    good_faith_outcome:
      'Opposing counsel stated they had no intention of responding to the discovery requests.',
    specific_requests_at_issue:
      'Interrogatories 1 through 15 regarding contract terms and performance history.',
    relief_requested: 'Request sanctions of $500 for discovery abuse.',
  }

  it('returns { system, user } object', () => {
    const result = buildMotionToCompelPrompt(baseFacts)
    expect(result).toHaveProperty('system')
    expect(result).toHaveProperty('user')
  })

  it('system includes DRAFT disclaimer', () => {
    const result = buildMotionToCompelPrompt(baseFacts)
    expect(result.system).toContain('DRAFT')
    expect(result.system).toContain('NOT LEGAL ADVICE')
  })

  it('system includes "legal document formatting assistant"', () => {
    const result = buildMotionToCompelPrompt(baseFacts)
    expect(result.system).toContain('legal document formatting assistant')
  })

  it('system mentions certificate of conference', () => {
    const result = buildMotionToCompelPrompt(baseFacts)
    expect(result.system).toContain('Certificate of Conference')
  })

  it('user includes party names', () => {
    const result = buildMotionToCompelPrompt(baseFacts)
    expect(result.user).toContain('Jane Smith')
    expect(result.user).toContain('ACME Corp')
  })

  it('user includes court info with correct label for district', () => {
    const result = buildMotionToCompelPrompt(baseFacts)
    expect(result.user).toContain('District Court of Harris County, Texas')
  })

  it('user includes correct label for JP court', () => {
    const result = buildMotionToCompelPrompt({
      ...baseFacts,
      court_type: 'jp',
    })
    expect(result.user).toContain('Justice Court')
  })

  it('user includes correct label for county court', () => {
    const result = buildMotionToCompelPrompt({
      ...baseFacts,
      court_type: 'county',
    })
    expect(result.user).toContain('County Court')
  })

  it('user includes correct label for federal court', () => {
    const result = buildMotionToCompelPrompt({
      ...baseFacts,
      court_type: 'federal',
    })
    expect(result.user).toContain('United States District Court')
  })

  it('user includes discovery type', () => {
    const result = buildMotionToCompelPrompt(baseFacts)
    expect(result.user).toContain('interrogatories')
  })

  it('user includes served date and response deadline', () => {
    const result = buildMotionToCompelPrompt(baseFacts)
    expect(result.user).toContain('2026-01-10')
    expect(result.user).toContain('2026-02-10')
  })

  it('user includes deficiency description', () => {
    const result = buildMotionToCompelPrompt(baseFacts)
    expect(result.user).toContain(
      'Opposing party failed to respond to any of the interrogatories'
    )
  })

  it('user includes good faith conference details', () => {
    const result = buildMotionToCompelPrompt(baseFacts)
    expect(result.user).toContain('2026-02-20')
    expect(result.user).toContain('no intention of responding')
  })

  it('user includes specific requests at issue', () => {
    const result = buildMotionToCompelPrompt(baseFacts)
    expect(result.user).toContain('Interrogatories 1 through 15')
  })

  it('user includes relief requested when provided', () => {
    const result = buildMotionToCompelPrompt(baseFacts)
    expect(result.user).toContain('sanctions of $500')
  })

  it('user omits relief section when not provided', () => {
    const { relief_requested, ...factsWithoutRelief } = baseFacts
    const result = buildMotionToCompelPrompt(
      factsWithoutRelief as MotionToCompelFacts
    )
    expect(result.user).not.toContain('Additional relief')
  })

  it('user includes county', () => {
    const result = buildMotionToCompelPrompt(baseFacts)
    expect(result.user).toContain('Harris')
  })

  it('user includes cause number when provided', () => {
    const result = buildMotionToCompelPrompt(baseFacts)
    expect(result.user).toContain('2026-CI-01234')
  })

  it('user omits cause number when not provided', () => {
    const { cause_number, ...factsWithoutCause } = baseFacts
    const result = buildMotionToCompelPrompt(
      factsWithoutCause as MotionToCompelFacts
    )
    expect(result.user).not.toContain('Cause number')
  })

  it('user includes filing party address', () => {
    const result = buildMotionToCompelPrompt(baseFacts)
    expect(result.user).toContain('100 Main St')
    expect(result.user).toContain('Houston')
    expect(result.user).toContain('TX')
    expect(result.user).toContain('77001')
  })
})

describe('motionToCompelFactsSchema', () => {
  const validFacts = {
    your_info: { full_name: 'Jane Smith' },
    opposing_parties: [{ full_name: 'ACME Corp' }],
    court_type: 'district',
    county: 'Harris',
    discovery_type: 'interrogatories',
    date_served: '2026-01-10',
    response_deadline: '2026-02-10',
    deficiency_description:
      'Opposing party failed to respond to the interrogatories.',
    good_faith_conference_date: '2026-02-20',
    good_faith_outcome:
      'Opposing counsel refused to cooperate or respond.',
    specific_requests_at_issue:
      'Interrogatories 1 through 15 regarding contract terms.',
  }

  it('accepts valid facts', () => {
    const result = motionToCompelFactsSchema.safeParse(validFacts)
    expect(result.success).toBe(true)
  })

  it('rejects missing discovery_type', () => {
    const { discovery_type, ...withoutDiscoveryType } = validFacts
    const result = motionToCompelFactsSchema.safeParse(withoutDiscoveryType)
    expect(result.success).toBe(false)
  })

  it('rejects short deficiency_description (< 10 chars)', () => {
    const result = motionToCompelFactsSchema.safeParse({
      ...validFacts,
      deficiency_description: 'Short',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty opposing_parties', () => {
    const result = motionToCompelFactsSchema.safeParse({
      ...validFacts,
      opposing_parties: [],
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid court_type', () => {
    const result = motionToCompelFactsSchema.safeParse({
      ...validFacts,
      court_type: 'supreme',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid discovery_type', () => {
    const result = motionToCompelFactsSchema.safeParse({
      ...validFacts,
      discovery_type: 'subpoena',
    })
    expect(result.success).toBe(false)
  })

  it('rejects short good_faith_outcome (< 10 chars)', () => {
    const result = motionToCompelFactsSchema.safeParse({
      ...validFacts,
      good_faith_outcome: 'Refused',
    })
    expect(result.success).toBe(false)
  })

  it('rejects short specific_requests_at_issue (< 10 chars)', () => {
    const result = motionToCompelFactsSchema.safeParse({
      ...validFacts,
      specific_requests_at_issue: 'Req 1',
    })
    expect(result.success).toBe(false)
  })

  it('accepts valid facts with optional relief_requested', () => {
    const result = motionToCompelFactsSchema.safeParse({
      ...validFacts,
      relief_requested: 'Request sanctions.',
    })
    expect(result.success).toBe(true)
  })
})

describe('motionToCompelConfig', () => {
  it('has correct key', () => {
    expect(motionToCompelConfig.key).toBe('motion_to_compel')
  })

  it('has correct category', () => {
    expect(motionToCompelConfig.category).toBe('discovery')
  })

  it('has correct documentType', () => {
    expect(motionToCompelConfig.documentType).toBe('motion_to_compel')
  })

  it('has fields array', () => {
    expect(Array.isArray(motionToCompelConfig.fields)).toBe(true)
    expect(motionToCompelConfig.fields.length).toBeGreaterThan(0)
  })

  it('has buildPrompt function', () => {
    expect(typeof motionToCompelConfig.buildPrompt).toBe('function')
  })

  it('has schema', () => {
    expect(motionToCompelConfig.schema).toBeDefined()
  })

  it('has taskKey', () => {
    expect(motionToCompelConfig.taskKey).toBe('motion_to_compel')
  })

  it('has title and description', () => {
    expect(motionToCompelConfig.title).toBe('Motion to Compel Discovery')
    expect(motionToCompelConfig.description).toBeTruthy()
  })

  it('has reassurance text', () => {
    expect(motionToCompelConfig.reassurance).toBeTruthy()
  })
})
