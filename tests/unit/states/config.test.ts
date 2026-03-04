import { describe, it, expect } from 'vitest'
import { getStateConfig, getCourtLabel, getSmallClaimsMax, STATE_CODES } from '@/lib/states'

describe('State Config System', () => {
  describe('STATE_CODES', () => {
    it('contains TX and CA', () => {
      expect(STATE_CODES).toContain('TX')
      expect(STATE_CODES).toContain('CA')
    })
    it('contains NY', () => {
      expect(STATE_CODES).toContain('NY')
    })
    it('has exactly 3 entries', () => {
      expect(STATE_CODES).toHaveLength(3)
    })
  })

  describe('getStateConfig', () => {
    it('returns TX config', () => {
      const config = getStateConfig('TX')
      expect(config.code).toBe('TX')
      expect(config.name).toBe('Texas')
    })
    it('returns CA config', () => {
      const config = getStateConfig('CA')
      expect(config.code).toBe('CA')
      expect(config.name).toBe('California')
    })
    it('TX has jp, county, district court types', () => {
      const config = getStateConfig('TX')
      const values = config.courtTypes.map((c) => c.value)
      expect(values).toEqual(['jp', 'county', 'district'])
    })
    it('CA has small_claims, limited_civil, unlimited_civil court types', () => {
      const config = getStateConfig('CA')
      const values = config.courtTypes.map((c) => c.value)
      expect(values).toEqual(['small_claims', 'limited_civil', 'unlimited_civil'])
    })
    it('TX small claims max is 20000', () => {
      expect(getStateConfig('TX').thresholds.smallClaimsMax).toBe(20_000)
    })
    it('CA small claims max is 12500', () => {
      expect(getStateConfig('CA').thresholds.smallClaimsMax).toBe(12_500)
    })
    it('TX SOL personalInjury is 2', () => {
      expect(getStateConfig('TX').statuteOfLimitations.personalInjury).toBe(2)
    })
    it('CA SOL oralContract is 2', () => {
      expect(getStateConfig('CA').statuteOfLimitations.oralContract).toBe(2)
    })
    it('TX SOL oralContract is 4', () => {
      expect(getStateConfig('TX').statuteOfLimitations.oralContract).toBe(4)
    })
    it('CA SOL propertyDamage is 3', () => {
      expect(getStateConfig('CA').statuteOfLimitations.propertyDamage).toBe(3)
    })
    it('TX has 5 amount ranges', () => {
      expect(getStateConfig('TX').amountRanges).toHaveLength(5)
    })
    it('CA has 4 amount ranges', () => {
      expect(getStateConfig('CA').amountRanges).toHaveLength(4)
    })
    it('returns NY config', () => {
      const config = getStateConfig('NY')
      expect(config.code).toBe('NY')
      expect(config.name).toBe('New York')
    })
    it('NY has ny_small_claims, ny_civil, ny_supreme court types', () => {
      const config = getStateConfig('NY')
      const values = config.courtTypes.map((c) => c.value)
      expect(values).toEqual(['ny_small_claims', 'ny_civil', 'ny_supreme'])
    })
    it('NY small claims max is 10000', () => {
      expect(getStateConfig('NY').thresholds.smallClaimsMax).toBe(10_000)
    })
    it('NY SOL personalInjury is 3', () => {
      expect(getStateConfig('NY').statuteOfLimitations.personalInjury).toBe(3)
    })
    it('NY SOL writtenContract is 6', () => {
      expect(getStateConfig('NY').statuteOfLimitations.writtenContract).toBe(6)
    })
    it('NY SOL oralContract is 6', () => {
      expect(getStateConfig('NY').statuteOfLimitations.oralContract).toBe(6)
    })
    it('NY SOL propertyDamage is 3', () => {
      expect(getStateConfig('NY').statuteOfLimitations.propertyDamage).toBe(3)
    })
    it('NY has 4 amount ranges', () => {
      expect(getStateConfig('NY').amountRanges).toHaveLength(4)
    })
  })

  describe('getCourtLabel', () => {
    it('returns JP Court label for TX jp', () => {
      expect(getCourtLabel('TX', 'jp')).toBe('JP Court (Small Claims)')
    })
    it('returns Small Claims Court label for CA small_claims', () => {
      expect(getCourtLabel('CA', 'small_claims')).toBe('Small Claims Court')
    })
    it('returns Federal Court for any state', () => {
      expect(getCourtLabel('TX', 'federal')).toBe('Federal Court')
      expect(getCourtLabel('CA', 'federal')).toBe('Federal Court')
    })
    it('returns Small Claims Court label for NY ny_small_claims', () => {
      expect(getCourtLabel('NY', 'ny_small_claims')).toBe('Small Claims Court')
    })
    it('returns Civil Court label for NY ny_civil', () => {
      expect(getCourtLabel('NY', 'ny_civil')).toBe('Civil Court')
    })
    it('returns Supreme Court label for NY ny_supreme', () => {
      expect(getCourtLabel('NY', 'ny_supreme')).toBe('Supreme Court')
    })
    it('returns Federal Court for NY federal', () => {
      expect(getCourtLabel('NY', 'federal')).toBe('Federal Court')
    })
    it('returns raw value for unknown court type', () => {
      expect(getCourtLabel('TX', 'supreme')).toBe('supreme')
    })
  })

  describe('getSmallClaimsMax', () => {
    it('returns 20000 for TX', () => {
      expect(getSmallClaimsMax('TX')).toBe(20_000)
    })
    it('returns 12500 for CA', () => {
      expect(getSmallClaimsMax('CA')).toBe(12_500)
    })
    it('returns 10000 for NY', () => {
      expect(getSmallClaimsMax('NY')).toBe(10_000)
    })
  })
})
