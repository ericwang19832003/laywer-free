import { describe, it, expect } from 'vitest'
import { validateStep } from '@lawyer-free/shared/validators'
import { txDebtCollection } from '@lawyer-free/shared/jurisdiction-rules/tx'

describe('validateStep', () => {
  it('returns no issues when all required fields present', () => {
    const result = validateStep(txDebtCollection, 'facts', {
      debt_origination_date: '2019-06-15',
    })
    expect(result.blocks).toHaveLength(0)
  })

  it('returns block when required field is missing', () => {
    const result = validateStep(txDebtCollection, 'facts', {})
    expect(result.blocks.length).toBeGreaterThan(0)
    expect(result.blocks[0].field).toBe('debt_origination_date')
  })

  it('returns block when required field is empty string', () => {
    const result = validateStep(txDebtCollection, 'facts', {
      debt_origination_date: '',
    })
    expect(result.blocks.length).toBeGreaterThan(0)
  })

  it('returns warnings from config', () => {
    const result = validateStep(txDebtCollection, 'facts', {
      debt_origination_date: '2019-06-15',
    })
    expect(result.warnings.length).toBeGreaterThan(0)
    expect(result.warnings[0].message).toBeDefined()
  })

  it('returns empty result for step with no validations', () => {
    const result = validateStep(txDebtCollection, 'preflight', {})
    expect(result.blocks).toHaveLength(0)
    expect(result.warnings).toHaveLength(0)
  })

  it('returns glossary terms found in field values', () => {
    const result = validateStep(txDebtCollection, 'facts', {
      debt_origination_date: '2019-06-15',
      description: 'The statute of limitations has expired on this debt.',
    })
    expect(result.glossaryHits.length).toBeGreaterThan(0)
    expect(result.glossaryHits[0].term).toBe('Statute of Limitations')
    expect(result.glossaryHits[0].plainEnglish).toBeDefined()
  })
})
