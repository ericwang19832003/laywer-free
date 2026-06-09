import { describe, it, expect } from 'vitest'
import { buildDemandDraftPrompt, validateDemandIntake, type DemandIntake } from '@/lib/ai/litigation-legal/demand-draft'

const BASE_INTAKE: DemandIntake = {
  role: 'plaintiff',
  opposingParty: 'Jones Corp',
  reliefSought: '$5,000 unpaid invoice',
  keyFacts: 'Contract signed Jan 15. Invoice sent Feb 1. Payment due Feb 28. Not received.',
  tone: 'measured',
  responseDeadlineDays: 14,
  caseContext: '## Case Context\nCase: Smith v. Jones\nState: TX',
}

describe('validateDemandIntake', () => {
  it('passes with valid intake', () => {
    const result = validateDemandIntake(BASE_INTAKE)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('fails when keyFacts is empty', () => {
    const result = validateDemandIntake({ ...BASE_INTAKE, keyFacts: '' })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Key facts are required')
  })

  it('fails when reliefSought is empty', () => {
    const result = validateDemandIntake({ ...BASE_INTAKE, reliefSought: '' })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Relief sought is required')
  })
})

describe('buildDemandDraftPrompt', () => {
  it('includes case context, facts, and tone in the prompt', () => {
    const { systemPrompt, userPrompt } = buildDemandDraftPrompt(BASE_INTAKE)
    expect(systemPrompt).toContain('self-represented')
    expect(userPrompt).toContain('Jones Corp')
    expect(userPrompt).toContain('$5,000 unpaid invoice')
    expect(userPrompt).toContain('measured')
    expect(userPrompt).toContain('14 days')
  })

  it('never includes attorney-advice language in system prompt', () => {
    const { systemPrompt } = buildDemandDraftPrompt(BASE_INTAKE)
    expect(systemPrompt.toLowerCase()).not.toContain('as your attorney')
    expect(systemPrompt.toLowerCase()).not.toContain('legal advice')
  })
})
