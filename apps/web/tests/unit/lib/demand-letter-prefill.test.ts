import { describe, it, expect } from 'vitest'
import { transformDemandLetterToFiling } from '@/lib/demand-letter-prefill'

describe('transformDemandLetterToFiling', () => {
  describe('small claims', () => {
    const key = 'prepare_small_claims_filing'

    it('maps plaintiff/defendant names to structured party objects', () => {
      const dl = {
        plaintiff_name: 'Jane Doe',
        plaintiff_address: '123 Main St',
        defendant_name: 'Acme Corp',
        defendant_address: '456 Oak Ave',
      }
      const result = transformDemandLetterToFiling(dl, key)
      expect(result.plaintiff).toEqual({
        full_name: 'Jane Doe',
        address: '123 Main St',
      })
      expect(result.defendant).toEqual({
        full_name: 'Acme Corp',
        address: '456 Oak Ave',
      })
    })

    it('maps damages_items to damage_items', () => {
      const dl = {
        damages_items: [{ category: 'Repair', amount: 500, description: 'Fix window' }],
      }
      const result = transformDemandLetterToFiling(dl, key)
      expect(result.damage_items).toEqual(dl.damages_items)
      expect(result.damages_items).toBeUndefined()
    })

    it('carries forward description, incident_date, deadline_days', () => {
      const dl = {
        description: 'Broken lease',
        incident_date: '2026-01-15',
        deadline_days: '14',
        preferred_resolution: 'Full refund',
      }
      const result = transformDemandLetterToFiling(dl, key)
      expect(result.description).toBe('Broken lease')
      expect(result.incident_date).toBe('2026-01-15')
      expect(result.deadline_days).toBe('14')
      expect(result.preferred_resolution).toBe('Full refund')
    })

    it('sets demand_letter_sent to true', () => {
      const result = transformDemandLetterToFiling({}, key)
      expect(result.demand_letter_sent).toBe(true)
    })

    it('excludes draft_text and final_text', () => {
      const dl = {
        draft_text: 'Dear Sir...',
        final_text: 'Dear Sir (final)...',
        plaintiff_name: 'Jane',
      }
      const result = transformDemandLetterToFiling(dl, key)
      expect(result.draft_text).toBeUndefined()
      expect(result.final_text).toBeUndefined()
    })
  })

  describe('landlord-tenant', () => {
    const key = 'prepare_landlord_tenant_filing'

    it('maps your_name/other_name to your_info/opposing_parties', () => {
      const dl = {
        your_name: 'Tenant Smith',
        your_address: '789 Elm St',
        other_name: 'Landlord Jones',
        other_address: '321 Pine St',
      }
      const result = transformDemandLetterToFiling(dl, key)
      expect(result.your_info).toEqual({
        full_name: 'Tenant Smith',
        address: '789 Elm St',
      })
      expect(result.opposing_parties).toEqual([{
        full_name: 'Landlord Jones',
        address: '321 Pine St',
      }])
    })

    it('carries forward property_address', () => {
      const dl = { property_address: '100 Rental Ave' }
      const result = transformDemandLetterToFiling(dl, key)
      expect(result.property_address).toBe('100 Rental Ave')
    })
  })

  describe('personal injury', () => {
    const key = 'prepare_pi_petition'

    it('maps party info to your_info/opposing_parties', () => {
      const dl = {
        your_name: 'Injured Party',
        your_address: '555 Hospital Dr',
        defendant_name: 'Bad Driver',
        defendant_address: '666 Road St',
      }
      const result = transformDemandLetterToFiling(dl, key)
      expect(result.your_info).toEqual({
        full_name: 'Injured Party',
        address: '555 Hospital Dr',
      })
      expect(result.opposing_parties).toEqual([{
        full_name: 'Bad Driver',
        address: '666 Road St',
      }])
    })

    it('maps incident details', () => {
      const dl = {
        incident_date: '2026-02-01',
        incident_location: 'I-35 and Hwy 290',
        incident_description: 'Rear-ended at red light',
      }
      const result = transformDemandLetterToFiling(dl, key)
      expect(result.incident_date).toBe('2026-02-01')
      expect(result.incident_location).toBe('I-35 and Hwy 290')
      expect(result.description).toBe('Rear-ended at red light')
    })

    it('maps injury and medical data', () => {
      const dl = {
        injuries_description: 'Whiplash, back pain',
        injury_severity: 'moderate',
        medical_providers: [{ name: 'Dr. Smith', type: 'Orthopedic', dates: '2026-02', amount: '5000' }],
        lost_wages: '3000',
        property_damage: '8000',
      }
      const result = transformDemandLetterToFiling(dl, key)
      expect(result.injuries_description).toBe('Whiplash, back pain')
      expect(result.injury_severity).toBe('moderate')
      expect(result.medical_providers).toEqual(dl.medical_providers)
      expect(result.lost_wages).toBe('3000')
      expect(result.property_damage).toBe('8000')
    })

    it('maps insurance details', () => {
      const dl = {
        insurance_carrier: 'State Farm',
        policy_number: 'POL-123',
        claim_number: 'CLM-456',
      }
      const result = transformDemandLetterToFiling(dl, key)
      expect(result.insurance_carrier).toBe('State Farm')
      expect(result.policy_number).toBe('POL-123')
      expect(result.claim_number).toBe('CLM-456')
    })

    it('maps total_demand_amount to amount_sought as string', () => {
      const dl = { total_demand_amount: 25000 }
      const result = transformDemandLetterToFiling(dl, key)
      expect(result.amount_sought).toBe('25000')
    })
  })

  describe('generic (contract, property, business, etc.)', () => {
    const genericKeys = [
      'contract_prepare_filing',
      'property_prepare_filing',
      're_prepare_filing',
      'biz_partnership_prepare_filing',
      'biz_employment_prepare_filing',
      'biz_b2b_prepare_filing',
      'other_prepare_filing',
      'prepare_filing',
    ]

    for (const key of genericKeys) {
      it(`maps party info for ${key}`, () => {
        const dl = {
          your_name: 'Plaintiff A',
          your_address: '100 Main St',
          defendant_name: 'Defendant B',
          defendant_address: '200 Oak St',
        }
        const result = transformDemandLetterToFiling(dl, key)
        expect(result.your_info).toEqual({
          full_name: 'Plaintiff A',
          address: '100 Main St',
        })
        expect(result.opposing_parties).toEqual([{
          full_name: 'Defendant B',
          address: '200 Oak St',
        }])
      })
    }

    it('falls back to plaintiff_name/plaintiff_address naming', () => {
      const dl = {
        plaintiff_name: 'Alt Plaintiff',
        plaintiff_address: '300 Elm St',
      }
      const result = transformDemandLetterToFiling(dl, 'contract_prepare_filing')
      expect(result.your_info).toEqual({
        full_name: 'Alt Plaintiff',
        address: '300 Elm St',
      })
    })

    it('falls back to other_name for opposing party', () => {
      const dl = {
        other_name: 'Other Party',
        other_address: '400 Pine St',
      }
      const result = transformDemandLetterToFiling(dl, 'property_prepare_filing')
      expect(result.opposing_parties).toEqual([{
        full_name: 'Other Party',
        address: '400 Pine St',
      }])
    })
  })

  describe('excluded fields', () => {
    it('never carries forward draft_text, final_text, annotations, _wizard_step', () => {
      const dl = {
        draft_text: 'Dear...',
        final_text: 'Final dear...',
        annotations: [{ section: 'Caption', text: 'The header' }],
        _wizard_step: 3,
        acknowledged: true,
        your_name: 'Test User',
      }
      const result = transformDemandLetterToFiling(dl, 'prepare_pi_petition')
      expect(result.draft_text).toBeUndefined()
      expect(result.final_text).toBeUndefined()
      expect(result.annotations).toBeUndefined()
      expect(result._wizard_step).toBeUndefined()
      expect(result.acknowledged).toBeUndefined()
      // But real data still comes through
      expect(result.your_info).toBeDefined()
    })
  })

  describe('empty demand letter', () => {
    it('returns minimal result for empty metadata', () => {
      const result = transformDemandLetterToFiling({}, 'prepare_filing')
      expect(Object.keys(result).length).toBe(0)
    })
  })
})
