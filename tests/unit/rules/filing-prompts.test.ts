import { describe, it, expect } from 'vitest'
import { buildFilingPrompt } from '@/lib/rules/filing-prompts'
import type { FilingFacts } from '@/lib/schemas/filing'

function makeFacts(overrides: Partial<FilingFacts> = {}): FilingFacts {
  return {
    your_info: { full_name: 'John Doe' },
    opposing_parties: [{ full_name: 'Jane Smith' }],
    court_type: 'district',
    description: 'Defendant breached a written contract for services.',
    role: 'plaintiff',
    request_attorney_fees: false,
    request_court_costs: true,
    ...overrides,
  }
}

describe('buildFilingPrompt', () => {
  it('returns system and user messages', () => {
    const result = buildFilingPrompt(makeFacts())
    expect(result.system).toBeDefined()
    expect(result.user).toBeDefined()
    expect(result.system.length).toBeGreaterThan(50)
    expect(result.user.length).toBeGreaterThan(50)
  })

  it('includes JP small claims format for jp court', () => {
    const result = buildFilingPrompt(makeFacts({ court_type: 'jp' }))
    expect(result.system).toContain('small claims')
  })

  it('includes formal petition format for district court', () => {
    const result = buildFilingPrompt(makeFacts({ court_type: 'district' }))
    expect(result.system).toContain('Original Petition')
  })

  it('includes federal complaint format for federal court', () => {
    const result = buildFilingPrompt(makeFacts({ court_type: 'federal' }))
    expect(result.system).toContain('Complaint')
    expect(result.system).toContain('jurisdiction')
  })

  it('uses answer format for defendant role', () => {
    const result = buildFilingPrompt(makeFacts({ role: 'defendant' }))
    expect(result.system).toContain('Answer')
  })

  it('includes general denial for defendant with is_general_denial', () => {
    const result = buildFilingPrompt(makeFacts({ role: 'defendant', is_general_denial: true }))
    expect(result.system).toContain('General Denial')
  })

  it('includes party names in user message', () => {
    const result = buildFilingPrompt(makeFacts())
    expect(result.user).toContain('John Doe')
    expect(result.user).toContain('Jane Smith')
  })

  it('includes DRAFT disclaimer instruction in system prompt', () => {
    const result = buildFilingPrompt(makeFacts())
    expect(result.system).toContain('DRAFT')
  })
})
