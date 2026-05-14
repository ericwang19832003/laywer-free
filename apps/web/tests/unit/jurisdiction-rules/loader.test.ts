import { describe, it, expect } from 'vitest'
import { loadJurisdictionRules } from '@lawyer-free/shared/jurisdiction-rules'

describe('loadJurisdictionRules', () => {
  it('returns TX debt_collection config', () => {
    const config = loadJurisdictionRules('TX', 'debt_collection')
    expect(config).toBeDefined()
    expect(config!.state).toBe('TX')
    expect(config!.disputeType).toBe('debt_collection')
  })

  it('returns null for unsupported state/dispute combo', () => {
    const config = loadJurisdictionRules('TX', 'nonexistent_type')
    expect(config).toBeNull()
  })

  it('returns null for unsupported state', () => {
    const config = loadJurisdictionRules('XX' as any, 'debt_collection')
    expect(config).toBeNull()
  })
})
