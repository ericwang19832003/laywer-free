import { describe, it, expect } from 'vitest'
import {
  buildLtDemandLetterPrompt,
  ltDemandLetterFactsSchema,
  type LtDemandLetterFacts,
} from '@/lib/rules/landlord-tenant-demand-letter-prompts'

function makeFacts(overrides: Partial<LtDemandLetterFacts> = {}): LtDemandLetterFacts {
  return ltDemandLetterFactsSchema.parse({
    party_role: 'tenant',
    your_info: { full_name: 'Jane Tenant' },
    other_party: { full_name: 'John Landlord' },
    landlord_tenant_sub_type: 'security_deposit',
    property_address: '123 Main St, Austin, TX 78701',
    claim_amount: 2500,
    damages_breakdown: [{ category: 'Security deposit', amount: 2500 }],
    description: 'Landlord failed to return security deposit within 30 days of move-out.',
    deadline_days: 14,
    ...overrides,
  })
}

describe('buildLtDemandLetterPrompt', () => {
  it('returns system and user strings', () => {
    const result = buildLtDemandLetterPrompt(makeFacts())
    expect(result.system).toBeTruthy()
    expect(result.user).toBeTruthy()
  })

  it('includes DRAFT disclaimer', () => {
    const result = buildLtDemandLetterPrompt(makeFacts())
    expect(result.system).toContain('DRAFT')
  })

  it('includes property address in user prompt', () => {
    const result = buildLtDemandLetterPrompt(makeFacts())
    expect(result.user).toContain('123 Main St')
  })

  it('includes deadline days', () => {
    const result = buildLtDemandLetterPrompt(makeFacts({ deadline_days: 21 }))
    expect(result.user).toContain('21')
  })

  it('includes consequence language about filing in court', () => {
    const result = buildLtDemandLetterPrompt(makeFacts())
    expect(result.system.toLowerCase()).toContain('court')
  })

  it('labels sender as TENANT when party_role is tenant', () => {
    const result = buildLtDemandLetterPrompt(makeFacts({ party_role: 'tenant' }))
    expect(result.user).toContain('TENANT')
  })

  it('labels sender as LANDLORD when party_role is landlord', () => {
    const result = buildLtDemandLetterPrompt(makeFacts({
      party_role: 'landlord',
      your_info: { full_name: 'John Landlord' },
      other_party: { full_name: 'Jane Tenant' },
      landlord_tenant_sub_type: 'nonpayment',
    }))
    expect(result.user).toContain('LANDLORD')
  })

  it('includes Tex. Prop. Code § 92.104 for security deposit', () => {
    const result = buildLtDemandLetterPrompt(makeFacts({ landlord_tenant_sub_type: 'security_deposit' }))
    expect(result.system).toContain('92.104')
  })

  it('includes Tex. Prop. Code § 92.052 for habitability', () => {
    const result = buildLtDemandLetterPrompt(makeFacts({ landlord_tenant_sub_type: 'habitability' }))
    expect(result.system).toContain('92.052')
  })

  it('includes notice-to-vacate for nonpayment', () => {
    const result = buildLtDemandLetterPrompt(makeFacts({ landlord_tenant_sub_type: 'nonpayment' }))
    const combined = result.system + result.user
    expect(combined.toLowerCase()).toContain('notice to vacate')
  })

  it('includes damages breakdown', () => {
    const result = buildLtDemandLetterPrompt(makeFacts({
      damages_breakdown: [
        { category: 'Security deposit', amount: 2000 },
        { category: 'Cleaning fee overcharge', amount: 500 },
      ],
    }))
    expect(result.user).toContain('Security deposit')
    expect(result.user).toContain('Cleaning fee overcharge')
  })
})

describe('ltDemandLetterFactsSchema', () => {
  it('accepts valid facts', () => {
    const result = ltDemandLetterFactsSchema.safeParse({
      party_role: 'tenant',
      your_info: { full_name: 'Jane Tenant' },
      other_party: { full_name: 'John Landlord' },
      landlord_tenant_sub_type: 'security_deposit',
      property_address: '123 Main St, Austin, TX 78701',
      claim_amount: 2500,
      damages_breakdown: [{ category: 'Deposit', amount: 2500 }],
      description: 'Failed to return deposit within 30 days.',
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing property_address', () => {
    const result = ltDemandLetterFactsSchema.safeParse({
      party_role: 'tenant',
      your_info: { full_name: 'Jane' },
      other_party: { full_name: 'John' },
      landlord_tenant_sub_type: 'security_deposit',
      claim_amount: 2500,
      damages_breakdown: [{ category: 'Deposit', amount: 2500 }],
      description: 'Failed to return deposit.',
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing party_role', () => {
    const result = ltDemandLetterFactsSchema.safeParse({
      your_info: { full_name: 'Jane' },
      other_party: { full_name: 'John' },
      landlord_tenant_sub_type: 'security_deposit',
      property_address: '123 Main St, Austin, TX 78701',
      claim_amount: 2500,
      damages_breakdown: [{ category: 'Deposit', amount: 2500 }],
      description: 'Failed to return deposit within 30 days.',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty damages', () => {
    const result = ltDemandLetterFactsSchema.safeParse({
      party_role: 'tenant',
      your_info: { full_name: 'Jane' },
      other_party: { full_name: 'John' },
      landlord_tenant_sub_type: 'security_deposit',
      property_address: '123 Main St, Austin, TX 78701',
      claim_amount: 2500,
      damages_breakdown: [],
      description: 'Failed to return deposit within 30 days.',
    })
    expect(result.success).toBe(false)
  })
})
