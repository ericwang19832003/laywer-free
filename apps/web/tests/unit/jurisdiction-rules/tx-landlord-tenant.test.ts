import { describe, it, expect } from 'vitest'
import { jurisdictionRuleConfigSchema } from '@lawyer-free/shared/jurisdiction-rules/schema'
import { txLandlordTenant } from '@lawyer-free/shared/jurisdiction-rules/tx/landlord_tenant'

describe('TX landlord_tenant config', () => {
  it('passes schema validation', () => {
    const result = jurisdictionRuleConfigSchema.safeParse(txLandlordTenant)
    expect(result.success).toBe(true)
  })
  it('has state TX and disputeType landlord_tenant', () => {
    expect(txLandlordTenant.state).toBe('TX')
    expect(txLandlordTenant.disputeType).toBe('landlord_tenant')
  })
  it('has at least 5 required sections', () => {
    expect(txLandlordTenant.requiredSections.length).toBeGreaterThanOrEqual(5)
  })
  it('has at least 7 glossary entries', () => {
    expect(txLandlordTenant.glossary.length).toBeGreaterThanOrEqual(7)
  })
  it('has step validations for facts', () => {
    expect(txLandlordTenant.stepValidations.facts).toBeDefined()
  })
  it('maps rejectionReasons to valid wizard steps', () => {
    const validSteps = ['preflight','parties','venue','facts','claims','relief','how_to_file','review']
    for (const r of txLandlordTenant.rejectionReasons) {
      expect(validSteps).toContain(r.wizardStep)
    }
  })
})
