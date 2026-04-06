import { describe, it, expect, vi, beforeEach } from 'vitest'
import { lookupBusinessEntity } from '@/lib/entity-lookup/opencorporates'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

beforeEach(() => {
  mockFetch.mockReset()
})

describe('lookupBusinessEntity', () => {
  it('returns entity details when found', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        results: {
          companies: [{
            company: {
              name: 'ACME PROPERTIES LLC',
              company_type: 'Limited Liability Company',
              current_status: 'Active',
              agent_name: 'John Doe',
              agent_address: '123 Main St, Houston, TX 77001',
              opencorporates_url: 'https://opencorporates.com/companies/us_tx/123',
              incorporation_date: '2020-01-15',
            },
          }],
        },
      }),
    })

    const result = await lookupBusinessEntity('Acme Properties', 'TX')
    expect(result).not.toBeNull()
    expect(result!.legalName).toBe('ACME PROPERTIES LLC')
    expect(result!.entityType).toBe('Limited Liability Company')
    expect(result!.status).toBe('Active')
    expect(result!.registeredAgent).toEqual({ name: 'John Doe', address: '123 Main St, Houston, TX 77001' })
  })

  it('passes state as jurisdiction code', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ results: { companies: [] } }),
    })

    await lookupBusinessEntity('Test Corp', 'CA')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('jurisdiction_code=us_ca'),
      expect.any(Object),
    )
  })

  it('returns null when no results', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ results: { companies: [] } }),
    })

    const result = await lookupBusinessEntity('Nonexistent Corp', 'TX')
    expect(result).toBeNull()
  })

  it('returns null on API error', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 429 })

    const result = await lookupBusinessEntity('Acme', 'TX')
    expect(result).toBeNull()
  })

  it('returns null on network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const result = await lookupBusinessEntity('Acme', 'TX')
    expect(result).toBeNull()
  })

  it('handles missing agent gracefully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        results: {
          companies: [{
            company: {
              name: 'NO AGENT LLC',
              company_type: 'LLC',
              current_status: 'Active',
              opencorporates_url: 'https://opencorporates.com/companies/us_tx/456',
            },
          }],
        },
      }),
    })

    const result = await lookupBusinessEntity('No Agent', 'TX')
    expect(result).not.toBeNull()
    expect(result!.registeredAgent).toBeNull()
  })
})
