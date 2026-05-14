import { describe, it, expect } from 'vitest'
import { buildLegalCorrectnessPrompt, parseLegalCorrectnessResponse } from '@lawyer-free/shared/validators/triple-review/legal-correctness'
import { txDebtCollection } from '@lawyer-free/shared/jurisdiction-rules/tx'

describe('buildLegalCorrectnessPrompt', () => {
  it('includes all legal elements from config in the prompt', () => {
    const { system, user } = buildLegalCorrectnessPrompt(txDebtCollection, 'MOCK PETITION DRAFT TEXT')
    expect(system).toContain('legal elements')
    expect(user).toContain('MOCK PETITION DRAFT TEXT')
    const affDef = txDebtCollection.requiredSections.find(s => s.id === 'affirmative_defenses')
    for (const element of affDef?.legalElements ?? []) {
      expect(user).toContain(element)
    }
  })

  it('asks for YES/NO per element', () => {
    const { system } = buildLegalCorrectnessPrompt(txDebtCollection, 'draft')
    expect(system).toContain('YES')
    expect(system).toContain('NO')
  })
})

describe('parseLegalCorrectnessResponse', () => {
  it('parses YES/NO lines into structured results', () => {
    const raw = `caption > court name: YES — Present in line 1
caption > plaintiff name: YES — Named as "Min Wang"
affirmative_defenses > statute of limitations: NO — Not mentioned in the draft
verification > signed under penalty: YES — Verification paragraph present`

    const results = parseLegalCorrectnessResponse(raw)
    expect(results.length).toBe(4)
    expect(results[0].passed).toBe(true)
    expect(results[2].passed).toBe(false)
    expect(results[2].element).toContain('statute of limitations')
    expect(results[2].reason).toContain('Not mentioned')
  })

  it('returns empty array for unparseable response', () => {
    const results = parseLegalCorrectnessResponse('This is garbage')
    expect(results).toHaveLength(0)
  })
})
