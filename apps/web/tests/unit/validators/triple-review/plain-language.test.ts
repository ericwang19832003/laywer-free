import { describe, it, expect } from 'vitest'
import { buildPlainLanguagePrompt, parsePlainLanguageResponse } from '@lawyer-free/shared/validators/triple-review/plain-language'
import { txDebtCollection } from '@lawyer-free/shared/jurisdiction-rules/tx'

describe('buildPlainLanguagePrompt', () => {
  it('includes glossary terms from config', () => {
    const { user } = buildPlainLanguagePrompt(txDebtCollection, 'MOCK DRAFT')
    for (const g of txDebtCollection.glossary) {
      expect(user).toContain(g.term)
    }
  })

  it('asks for jargon detection', () => {
    const { system } = buildPlainLanguagePrompt(txDebtCollection, 'draft')
    expect(system).toContain('jargon')
  })
})

describe('parsePlainLanguageResponse', () => {
  it('parses check results', () => {
    const raw = `glossary_coverage: YES — All legal terms have plain English equivalents available
unexplained_jargon: NO — "res judicata" used without explanation in paragraph 3
next_steps_clear: YES — Filing instructions are clear`

    const results = parsePlainLanguageResponse(raw)
    expect(results.length).toBe(3)
    expect(results[1].passed).toBe(false)
    expect(results[1].reason).toContain('res judicata')
  })
})
