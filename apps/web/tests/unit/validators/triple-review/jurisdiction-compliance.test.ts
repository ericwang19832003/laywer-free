import { describe, it, expect } from 'vitest'
import { buildJurisdictionCompliancePrompt, parseJurisdictionComplianceResponse } from '@lawyer-free/shared/validators/triple-review/jurisdiction-compliance'
import { txDebtCollection } from '@lawyer-free/shared/jurisdiction-rules/tx'

describe('buildJurisdictionCompliancePrompt', () => {
  it('includes required sections from config', () => {
    const { user } = buildJurisdictionCompliancePrompt(txDebtCollection, 'MOCK DRAFT')
    for (const section of txDebtCollection.requiredSections) {
      expect(user).toContain(section.id)
    }
  })

  it('includes filing rules', () => {
    const { user } = buildJurisdictionCompliancePrompt(txDebtCollection, 'MOCK DRAFT')
    expect(user).toContain(txDebtCollection.filingRules.courtName)
  })
})

describe('parseJurisdictionComplianceResponse', () => {
  it('parses YES/NO lines for sections and rules', () => {
    const raw = `caption: YES — Present with correct court name
certificate_of_service: NO — Missing entirely
court_name_correct: YES — Matches Harris County JP Court`

    const results = parseJurisdictionComplianceResponse(raw)
    expect(results.length).toBe(3)
    expect(results[1].passed).toBe(false)
  })
})
