import { describe, it, expect } from 'vitest'
import {
  generateRFP,
  generateROG,
  generateRFA,
  generateDiscoveryText,
  lintPromptText,
  hasLintErrors,
  PromptLintError,
} from '@/lib/discovery/templates'

// ============================================
// Individual generators
// ============================================

describe('generateRFP', () => {
  it('produces correct header', () => {
    const text = generateRFP(1, 'All contracts between the parties.')
    expect(text).toContain('REQUEST FOR PRODUCTION NO. 1')
  })

  it('uses the standard preamble', () => {
    const text = generateRFP(1, 'All contracts between the parties.')
    expect(text).toContain('Please produce copies of the following documents or materials:')
  })

  it('embeds prompt text verbatim', () => {
    const prompt = 'All email correspondence from January 2024 through December 2024.'
    const text = generateRFP(1, prompt)
    expect(text).toContain(prompt)
  })

  it('includes privilege log instruction', () => {
    const text = generateRFP(1, 'Any document.')
    expect(text).toContain('privilege log')
  })

  it('reflects the item number', () => {
    const text = generateRFP(17, 'Test.')
    expect(text).toContain('REQUEST FOR PRODUCTION NO. 17')
  })

  it('does not contain threats or sanctions language', () => {
    const text = generateRFP(1, 'All records of payment.')
    const lower = text.toLowerCase()
    expect(lower).not.toContain('sanction')
    expect(lower).not.toContain('penalty')
    expect(lower).not.toContain('compel')
    expect(lower).not.toContain('contempt')
  })
})

describe('generateROG', () => {
  it('produces correct header', () => {
    const text = generateROG(3, 'State your full legal name.')
    expect(text).toContain('INTERROGATORY NO. 3')
  })

  it('uses the standard preamble', () => {
    const text = generateROG(1, 'State your full legal name.')
    expect(text).toContain('Please answer the following question:')
  })

  it('embeds prompt text verbatim', () => {
    const prompt = 'Describe in detail the events of March 15, 2025.'
    const text = generateROG(1, prompt)
    expect(text).toContain(prompt)
  })

  it('includes oath and completeness instruction', () => {
    const text = generateROG(1, 'Any question.')
    expect(text).toContain('under oath')
    expect(text).toContain('must be complete')
  })

  it('includes persons with knowledge instruction', () => {
    const text = generateROG(1, 'Any question.')
    expect(text).toContain('Identify all persons with knowledge')
  })

  it('does not contain threats or sanctions language', () => {
    const text = generateROG(1, 'State your address.')
    const lower = text.toLowerCase()
    expect(lower).not.toContain('sanction')
    expect(lower).not.toContain('penalty')
    expect(lower).not.toContain('compel')
    expect(lower).not.toContain('contempt')
  })
})

describe('generateRFA', () => {
  it('produces correct header', () => {
    const text = generateRFA(5, 'You received the notice on January 1.')
    expect(text).toContain('REQUEST FOR ADMISSION NO. 5')
  })

  it('uses the standard preamble', () => {
    const text = generateRFA(1, 'You received the notice on January 1.')
    expect(text).toContain('Admit or deny the following statement:')
  })

  it('embeds prompt text verbatim', () => {
    const prompt = 'The contract was signed by both parties on February 10, 2024.'
    const text = generateRFA(1, prompt)
    expect(text).toContain(prompt)
  })

  it('includes partial admit/deny instruction', () => {
    const text = generateRFA(1, 'Any statement.')
    expect(text).toContain('admit or deny each part')
  })

  it('does not contain deemed-admitted threat', () => {
    const text = generateRFA(1, 'Any statement.')
    expect(text).not.toContain('deemed admitted')
  })

  it('does not contain threats or sanctions language', () => {
    const text = generateRFA(1, 'You signed the lease.')
    const lower = text.toLowerCase()
    expect(lower).not.toContain('sanction')
    expect(lower).not.toContain('penalty')
    expect(lower).not.toContain('compel')
    expect(lower).not.toContain('contempt')
  })
})

// ============================================
// Determinism
// ============================================

describe('determinism', () => {
  it('generateRFP returns identical output for same input', () => {
    const a = generateRFP(1, 'Produce all invoices.')
    const b = generateRFP(1, 'Produce all invoices.')
    expect(a).toBe(b)
  })

  it('generateROG returns identical output for same input', () => {
    const a = generateROG(2, 'State your name.')
    const b = generateROG(2, 'State your name.')
    expect(a).toBe(b)
  })

  it('generateRFA returns identical output for same input', () => {
    const a = generateRFA(3, 'You received the letter.')
    const b = generateRFA(3, 'You received the letter.')
    expect(a).toBe(b)
  })
})

// ============================================
// Lint
// ============================================

describe('lintPromptText', () => {
  it('returns empty array for clean prompt', () => {
    const results = lintPromptText('Produce all contracts between the parties from 2024.')
    expect(results).toEqual([])
  })

  it('returns error for prompt shorter than 10 characters', () => {
    const results = lintPromptText('Too short')
    expect(results).toHaveLength(1)
    expect(results[0].severity).toBe('error')
    expect(results[0].message).toContain('at least 10 characters')
  })

  it('returns error for empty prompt', () => {
    const results = lintPromptText('')
    expect(results.some((r) => r.severity === 'error')).toBe(true)
  })

  it('accepts exactly 10 characters', () => {
    const results = lintPromptText('1234567890')
    const errors = results.filter((r) => r.severity === 'error')
    expect(errors).toHaveLength(0)
  })

  it('warns on "sanction"', () => {
    const results = lintPromptText('Produce documents related to any sanction imposed.')
    expect(results).toHaveLength(1)
    expect(results[0].severity).toBe('warning')
    expect(results[0].message).toContain('sanction')
  })

  it('warns on "penalty"', () => {
    const results = lintPromptText('Describe any penalty assessed against you.')
    expect(results).toHaveLength(1)
    expect(results[0].severity).toBe('warning')
    expect(results[0].message).toContain('penalty')
  })

  it('warns on "sue"', () => {
    const results = lintPromptText('State whether you intend to sue the defendant.')
    expect(results).toHaveLength(1)
    expect(results[0].severity).toBe('warning')
    expect(results[0].message).toContain('sue')
  })

  it('warns on "lawsuit"', () => {
    const results = lintPromptText('Describe any prior lawsuit you have filed.')
    expect(results).toHaveLength(1)
    expect(results[0].severity).toBe('warning')
    expect(results[0].message).toContain('lawsuit')
  })

  it('warns on "criminal"', () => {
    const results = lintPromptText('State any criminal history or convictions.')
    expect(results).toHaveLength(1)
    expect(results[0].severity).toBe('warning')
    expect(results[0].message).toContain('criminal')
  })

  it('warns on "illegal"', () => {
    const results = lintPromptText('Describe any illegal activities you participated in.')
    expect(results).toHaveLength(1)
    expect(results[0].severity).toBe('warning')
    expect(results[0].message).toContain('illegal')
  })

  it('warns on "motion to compel"', () => {
    const results = lintPromptText('We will file a motion to compel if you do not respond.')
    expect(results).toHaveLength(1)
    expect(results[0].severity).toBe('warning')
    expect(results[0].message).toContain('motion to compel')
  })

  it('is case-insensitive for forbidden phrases', () => {
    const results = lintPromptText('Produce documents about the CRIMINAL investigation.')
    expect(results.some((r) => r.message.includes('criminal'))).toBe(true)
  })

  it('returns multiple warnings for multiple forbidden phrases', () => {
    const results = lintPromptText('Describe any criminal penalty you received in the lawsuit.')
    const warnings = results.filter((r) => r.severity === 'warning')
    expect(warnings.length).toBe(3) // criminal, penalty, lawsuit
  })

  it('can return both error and warnings simultaneously', () => {
    const results = lintPromptText('criminal') // too short + forbidden
    const errors = results.filter((r) => r.severity === 'error')
    const warnings = results.filter((r) => r.severity === 'warning')
    expect(errors.length).toBeGreaterThanOrEqual(1)
    expect(warnings.length).toBeGreaterThanOrEqual(1)
  })
})

describe('hasLintErrors', () => {
  it('returns false for empty array', () => {
    expect(hasLintErrors([])).toBe(false)
  })

  it('returns false for warnings only', () => {
    expect(hasLintErrors([{ severity: 'warning', message: 'test' }])).toBe(false)
  })

  it('returns true when errors present', () => {
    expect(hasLintErrors([{ severity: 'error', message: 'test' }])).toBe(true)
  })

  it('returns true when mixed errors and warnings', () => {
    expect(
      hasLintErrors([
        { severity: 'warning', message: 'w' },
        { severity: 'error', message: 'e' },
      ])
    ).toBe(true)
  })
})

// ============================================
// Dispatch (generateDiscoveryText)
// ============================================

describe('generateDiscoveryText', () => {
  it('dispatches to generateRFP', () => {
    const { generatedText } = generateDiscoveryText('rfp', 1, 'All contracts between the parties.')
    expect(generatedText).toContain('REQUEST FOR PRODUCTION NO. 1')
    expect(generatedText).toContain('Please produce copies')
  })

  it('dispatches to generateROG', () => {
    const { generatedText } = generateDiscoveryText('rog', 2, 'State your full legal name.')
    expect(generatedText).toContain('INTERROGATORY NO. 2')
    expect(generatedText).toContain('Please answer the following question')
  })

  it('dispatches to generateRFA', () => {
    const { generatedText } = generateDiscoveryText('rfa', 3, 'You signed the contract on March 1.')
    expect(generatedText).toContain('REQUEST FOR ADMISSION NO. 3')
    expect(generatedText).toContain('Admit or deny')
  })

  it('throws PromptLintError for too-short prompt', () => {
    expect(() => generateDiscoveryText('rfp', 1, 'short')).toThrow(PromptLintError)
  })

  it('PromptLintError contains issues array', () => {
    try {
      generateDiscoveryText('rfp', 1, 'short')
      expect.unreachable('should have thrown')
    } catch (err) {
      expect(err).toBeInstanceOf(PromptLintError)
      const lintErr = err as PromptLintError
      expect(lintErr.issues.length).toBeGreaterThanOrEqual(1)
      expect(lintErr.issues[0].severity).toBe('error')
    }
  })

  it('returns warnings for forbidden phrases but still generates text', () => {
    const { generatedText, warnings } = generateDiscoveryText(
      'rog',
      1,
      'Describe any criminal record you may have.'
    )
    expect(generatedText).toContain('INTERROGATORY NO. 1')
    expect(generatedText).toContain('Describe any criminal record')
    expect(warnings.length).toBe(1)
    expect(warnings[0].severity).toBe('warning')
    expect(warnings[0].message).toContain('criminal')
  })

  it('returns empty warnings for clean prompt', () => {
    const { warnings } = generateDiscoveryText('rfp', 1, 'All contracts between the parties.')
    expect(warnings).toEqual([])
  })
})
