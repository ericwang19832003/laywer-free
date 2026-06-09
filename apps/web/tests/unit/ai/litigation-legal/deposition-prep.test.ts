import { describe, it, expect } from 'vitest'
import { buildDepoPrompt, type DepoInput } from '@/lib/ai/litigation-legal/deposition-prep'

const BASE_INPUT: DepoInput = {
  witnessName: 'Robert Jones',
  witnessRole: 'opposing_party',
  depositionPerspective: 'deposing',
  caseContext: '## Case Context\nState: TX\nRole: plaintiff',
  keyFacts: 'Contract signed Jan 15. Payment withheld without cause.',
  evidenceSummary: 'Contract (Exhibit A), Invoice (Exhibit B)',
}

describe('buildDepoPrompt', () => {
  it('includes witness name and role', () => {
    const { userPrompt } = buildDepoPrompt(BASE_INPUT)
    expect(userPrompt).toContain('Robert Jones')
    expect(userPrompt).toContain('opposing party')
  })

  it('frames as "your own deposition" when perspective is defending', () => {
    const { systemPrompt } = buildDepoPrompt({ ...BASE_INPUT, depositionPerspective: 'defending' })
    expect(systemPrompt).toContain('defending')
  })

  it('system prompt never contains legal advice language', () => {
    const { systemPrompt } = buildDepoPrompt(BASE_INPUT)
    expect(systemPrompt.toLowerCase()).not.toContain('legal advice')
    expect(systemPrompt.toLowerCase()).not.toContain('i recommend')
  })
})
