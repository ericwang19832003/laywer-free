import { describe, it, expect, vi } from 'vitest'
import { createSearchCaseLawTool } from '../search-case-law'

vi.stubEnv('OPENAI_API_KEY', 'test-key')

vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(function (this: { embeddings: unknown }) {
    this.embeddings = {
      create: vi.fn().mockResolvedValue({ data: [{ embedding: [0.1, 0.2, 0.3] }] }),
    }
  }),
}))

function makeSupabase(docs: unknown[], error: unknown = null) {
  return { rpc: vi.fn().mockResolvedValue({ data: docs, error }) } as any
}

describe('createSearchCaseLawTool', () => {
  it('returns a tool named search_case_law', () => {
    const tool = createSearchCaseLawTool({ disputeType: 'landlord_tenant', supabaseClient: makeSupabase([]) })
    expect(tool.name).toBe('search_case_law')
  })

  it('passes dispute_type filter to rpc', async () => {
    const supabaseClient = makeSupabase([
      { case_name: 'Martinez v. Williams', citation: '2019 TX App 1234', year: '2019', content: 'landlord must return deposit within 30 days' },
    ])
    const tool = createSearchCaseLawTool({ disputeType: 'landlord_tenant', supabaseClient })
    await tool.invoke({ query: 'security deposit return' })
    expect(supabaseClient.rpc).toHaveBeenCalledWith('match_case_law', expect.objectContaining({
      filter: { dispute_type: 'landlord_tenant' },
    }))
  })

  it('returns formatted citations on invoke', async () => {
    const tool = createSearchCaseLawTool({
      disputeType: 'landlord_tenant',
      supabaseClient: makeSupabase([
        { case_name: 'Martinez v. Williams', citation: '2019 TX App 1234', year: '2019', content: 'landlord must return deposit within 30 days' },
      ]),
    })
    const result = await tool.invoke({ query: 'security deposit return' })
    expect(result).toContain('Martinez v. Williams')
  })

  it('returns no-results message when docs array is empty', async () => {
    const tool = createSearchCaseLawTool({ disputeType: 'landlord_tenant', supabaseClient: makeSupabase([]) })
    const result = await tool.invoke({ query: 'something obscure' })
    expect(result).toBe('No relevant case law found for this query.')
  })

  it('handles docs with missing metadata gracefully', async () => {
    const tool = createSearchCaseLawTool({
      disputeType: 'landlord_tenant',
      supabaseClient: makeSupabase([{ content: 'Some relevant legal text' }]),
    })
    const result = await tool.invoke({ query: 'eviction notice' })
    expect(result).toContain('Unknown case')
    expect(result).toContain('Some relevant legal text')
  })
})
