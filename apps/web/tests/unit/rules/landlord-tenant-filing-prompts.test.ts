import { describe, it, expect } from 'vitest'
import {
  buildLandlordTenantFilingPrompt,
  getDocumentTitle,
} from '@/lib/rules/landlord-tenant-filing-prompts'
import { landlordTenantFilingFactsSchema } from '@lawyer-free/shared/schemas/landlord-tenant-filing'
import type { LandlordTenantFilingFacts } from '@lawyer-free/shared/schemas/landlord-tenant-filing'

function makeFacts(overrides: Partial<LandlordTenantFilingFacts> = {}): LandlordTenantFilingFacts {
  return landlordTenantFilingFactsSchema.parse({
    party_role: 'tenant',
    your_info: { full_name: 'Jane Tenant' },
    other_party: { full_name: 'John Landlord' },
    court_type: 'jp',
    county: 'Travis',
    landlord_tenant_sub_type: 'security_deposit',
    property_address: '123 Main St, Austin, TX 78701',
    claim_amount: 2500,
    damages_breakdown: [{ category: 'Security deposit', amount: 2500 }],
    description: 'Landlord failed to return security deposit within 30 days.',
    demand_letter_sent: true,
    ...overrides,
  })
}

describe('buildLandlordTenantFilingPrompt', () => {
  it('returns system and user strings', () => {
    const result = buildLandlordTenantFilingPrompt(makeFacts())
    expect(result.system).toBeTruthy()
    expect(result.user).toBeTruthy()
  })

  it('includes DRAFT disclaimer', () => {
    const result = buildLandlordTenantFilingPrompt(makeFacts())
    expect(result.system).toContain('DRAFT')
  })

  it('includes Justice Court caption for JP court_type', () => {
    const result = buildLandlordTenantFilingPrompt(makeFacts({ court_type: 'jp', county: 'Travis' }))
    expect(result.user).toContain('Justice Court')
    expect(result.user).toContain('Travis County')
  })

  it('includes County Court caption for county court_type', () => {
    const result = buildLandlordTenantFilingPrompt(makeFacts({ court_type: 'county', county: 'Harris' }))
    expect(result.user).toContain('County Court')
    expect(result.user).toContain('Harris County')
  })

  it('includes District Court caption for district court_type', () => {
    const result = buildLandlordTenantFilingPrompt(makeFacts({ court_type: 'district', county: 'Dallas' }))
    expect(result.user).toContain('District Court')
    expect(result.user).toContain('Dallas County')
  })

  it('uses Landlord/Tenant terminology', () => {
    const result = buildLandlordTenantFilingPrompt(makeFacts())
    const combined = result.system + result.user
    expect(combined).toContain('Landlord')
    expect(combined).toContain('Tenant')
  })

  it('includes property address', () => {
    const result = buildLandlordTenantFilingPrompt(makeFacts())
    expect(result.user).toContain('123 Main St')
  })

  it('includes damages itemization', () => {
    const result = buildLandlordTenantFilingPrompt(makeFacts({
      damages_breakdown: [
        { category: 'Security deposit', amount: 2000 },
        { category: 'Cleaning fee overcharge', amount: 500 },
      ],
    }))
    expect(result.user).toContain('Security deposit')
    expect(result.user).toContain('Cleaning fee overcharge')
  })

  it('includes verification section guidance', () => {
    const result = buildLandlordTenantFilingPrompt(makeFacts())
    expect(result.system.toLowerCase()).toContain('verification')
  })
})

describe('getDocumentTitle', () => {
  it('returns FORCIBLE ENTRY AND DETAINER for eviction', () => {
    expect(getDocumentTitle('eviction', 'landlord')).toContain('FORCIBLE ENTRY AND DETAINER')
  })

  it('returns NONPAYMENT OF RENT for nonpayment', () => {
    expect(getDocumentTitle('nonpayment', 'landlord')).toContain('NONPAYMENT OF RENT')
  })

  it('returns RETURN OF SECURITY DEPOSIT for security_deposit', () => {
    expect(getDocumentTitle('security_deposit', 'tenant')).toContain('RETURN OF SECURITY DEPOSIT')
  })

  it('returns PROPERTY DAMAGES for property_damage', () => {
    expect(getDocumentTitle('property_damage', 'tenant')).toContain('PROPERTY DAMAGES')
  })

  it('returns REPAIR AND REMEDY for repair_maintenance', () => {
    expect(getDocumentTitle('repair_maintenance', 'tenant')).toContain('REPAIR AND REMEDY')
  })

  it('returns BREACH OF LEASE for lease_termination', () => {
    expect(getDocumentTitle('lease_termination', 'tenant')).toContain('BREACH OF LEASE')
  })

  it('returns WARRANTY OF HABITABILITY for habitability', () => {
    expect(getDocumentTitle('habitability', 'tenant')).toContain('WARRANTY OF HABITABILITY')
  })

  it('returns LANDLORD-TENANT DISPUTE for other', () => {
    expect(getDocumentTitle('other', 'tenant')).toContain('LANDLORD-TENANT DISPUTE')
  })
})

describe('landlordTenantFilingFactsSchema', () => {
  it('accepts valid facts', () => {
    const result = landlordTenantFilingFactsSchema.safeParse({
      party_role: 'tenant',
      your_info: { full_name: 'Jane' },
      other_party: { full_name: 'John' },
      court_type: 'jp',
      county: 'Travis',
      landlord_tenant_sub_type: 'security_deposit',
      property_address: '123 Main St, Austin, TX 78701',
      claim_amount: 2500,
      damages_breakdown: [{ category: 'Deposit', amount: 2500 }],
      description: 'Failed to return deposit within 30 days.',
      demand_letter_sent: true,
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing property_address', () => {
    const result = landlordTenantFilingFactsSchema.safeParse({
      party_role: 'tenant',
      your_info: { full_name: 'Jane' },
      other_party: { full_name: 'John' },
      court_type: 'jp',
      county: 'Travis',
      landlord_tenant_sub_type: 'security_deposit',
      claim_amount: 2500,
      damages_breakdown: [{ category: 'Deposit', amount: 2500 }],
      description: 'Failed to return deposit within 30 days.',
      demand_letter_sent: true,
    })
    expect(result.success).toBe(false)
  })
})
