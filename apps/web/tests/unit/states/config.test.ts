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
    it('contains FL', () => {
      expect(STATE_CODES).toContain('FL')
    })
    it('contains PA', () => {
      expect(STATE_CODES).toContain('PA')
    })
    it('has exactly 5 entries', () => {
      expect(STATE_CODES).toHaveLength(5)
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
    it('returns FL config', () => {
      const config = getStateConfig('FL')
      expect(config.code).toBe('FL')
      expect(config.name).toBe('Florida')
    })
    it('FL has fl_small_claims, fl_county, fl_circuit court types', () => {
      const config = getStateConfig('FL')
      const values = config.courtTypes.map((c) => c.value)
      expect(values).toEqual(['fl_small_claims', 'fl_county', 'fl_circuit'])
    })
    it('FL small claims max is 8000', () => {
      expect(getStateConfig('FL').thresholds.smallClaimsMax).toBe(8_000)
    })
    it('FL SOL personalInjury is 2', () => {
      expect(getStateConfig('FL').statuteOfLimitations.personalInjury).toBe(2)
    })
    it('FL SOL writtenContract is 5', () => {
      expect(getStateConfig('FL').statuteOfLimitations.writtenContract).toBe(5)
    })
    it('FL SOL oralContract is 4', () => {
      expect(getStateConfig('FL').statuteOfLimitations.oralContract).toBe(4)
    })
    it('FL SOL propertyDamage is 4', () => {
      expect(getStateConfig('FL').statuteOfLimitations.propertyDamage).toBe(4)
    })
    it('FL has 4 amount ranges', () => {
      expect(getStateConfig('FL').amountRanges).toHaveLength(4)
    })
    it('returns PA config', () => {
      const config = getStateConfig('PA')
      expect(config.code).toBe('PA')
      expect(config.name).toBe('Pennsylvania')
    })
    it('PA has pa_magisterial, pa_common_pleas court types', () => {
      const config = getStateConfig('PA')
      const values = config.courtTypes.map((c) => c.value)
      expect(values).toEqual(['pa_magisterial', 'pa_common_pleas'])
    })
    it('PA small claims max is 12000', () => {
      expect(getStateConfig('PA').thresholds.smallClaimsMax).toBe(12_000)
    })
    it('PA SOL personalInjury is 2', () => {
      expect(getStateConfig('PA').statuteOfLimitations.personalInjury).toBe(2)
    })
    it('PA SOL writtenContract is 4', () => {
      expect(getStateConfig('PA').statuteOfLimitations.writtenContract).toBe(4)
    })
    it('PA SOL oralContract is 4', () => {
      expect(getStateConfig('PA').statuteOfLimitations.oralContract).toBe(4)
    })
    it('PA SOL propertyDamage is 2', () => {
      expect(getStateConfig('PA').statuteOfLimitations.propertyDamage).toBe(2)
    })
    it('PA has 3 amount ranges', () => {
      expect(getStateConfig('PA').amountRanges).toHaveLength(3)
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
    it('returns Small Claims Court label for FL fl_small_claims', () => {
      expect(getCourtLabel('FL', 'fl_small_claims')).toBe('Small Claims Court')
    })
    it('returns County Court label for FL fl_county', () => {
      expect(getCourtLabel('FL', 'fl_county')).toBe('County Court')
    })
    it('returns Circuit Court label for FL fl_circuit', () => {
      expect(getCourtLabel('FL', 'fl_circuit')).toBe('Circuit Court')
    })
    it('returns Federal Court for FL federal', () => {
      expect(getCourtLabel('FL', 'federal')).toBe('Federal Court')
    })
    it('returns Magisterial District Court label for PA pa_magisterial', () => {
      expect(getCourtLabel('PA', 'pa_magisterial')).toBe('Magisterial District Court')
    })
    it('returns Court of Common Pleas label for PA pa_common_pleas', () => {
      expect(getCourtLabel('PA', 'pa_common_pleas')).toBe('Court of Common Pleas')
    })
    it('returns Federal Court for PA federal', () => {
      expect(getCourtLabel('PA', 'federal')).toBe('Federal Court')
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
    it('returns 8000 for FL', () => {
      expect(getSmallClaimsMax('FL')).toBe(8_000)
    })
    it('returns 12000 for PA', () => {
      expect(getSmallClaimsMax('PA')).toBe(12_000)
    })
  })
})
