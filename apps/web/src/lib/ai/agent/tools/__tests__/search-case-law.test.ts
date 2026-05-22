import { describe, it, expect, vi } from 'vitest'
import { createSearchCaseLawTool } from '../search-case-law'

const mockInvoke = vi.fn().mockResolvedValue([
  {
    pageContent: 'Martinez v. Williams, 2019 TX App — landlord must return deposit within 30 days',
    metadata: { case_name: 'Martinez v. Williams', year: 2019, citation: '2019 TX App 1234' },
  },
])
const mockAsRetriever = vi.fn().mockReturnValue({ invoke: mockInvoke })

vi.mock('@langchain/community/vectorstores/supabase', () => ({
  SupabaseVectorStore: vi.fn().mockImplementation(function () {
    return { asRetriever: mockAsRetriever }
  }),
}))

describe('createSearchCaseLawTool', () => {
  it('returns a tool named search_case_law', () => {
    const tool = createSearchCaseLawTool({ disputeType: 'landlord_tenant', supabaseClient: {} as any })
    expect(tool.name).toBe('search_case_law')
  })

  it('passes dispute_type filter to retriever', () => {
    createSearchCaseLawTool({ disputeType: 'landlord_tenant', supabaseClient: {} as any })
    expect(mockAsRetriever).toHaveBeenCalledWith(expect.objectContaining({
      filter: { dispute_type: 'landlord_tenant' },
    }))
  })

  it('returns formatted citations on invoke', async () => {
    const tool = createSearchCaseLawTool({ disputeType: 'landlord_tenant', supabaseClient: {} as any })
    const result = await tool.invoke({ query: 'security deposit return' })
    expect(result).toContain('Martinez v. Williams')
  })

  it('returns no-results message when docs array is empty', async () => {
    mockInvoke.mockResolvedValueOnce([])
    const tool = createSearchCaseLawTool({ disputeType: 'landlord_tenant', supabaseClient: {} as any })
    const result = await tool.invoke({ query: 'something obscure' })
    expect(result).toBe('No relevant case law found for this query.')
  })

  it('handles docs with missing metadata gracefully', async () => {
    mockInvoke.mockResolvedValueOnce([
      { pageContent: 'Some relevant legal text', metadata: {} },
    ])
    const tool = createSearchCaseLawTool({ disputeType: 'landlord_tenant', supabaseClient: {} as any })
    const result = await tool.invoke({ query: 'eviction notice' })
    expect(result).toContain('Unknown case')
    expect(result).toContain('Some relevant legal text')
  })
})
