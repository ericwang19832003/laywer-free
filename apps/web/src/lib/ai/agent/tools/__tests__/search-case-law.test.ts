import { describe, it, expect, vi } from 'vitest'
import { createSearchCaseLawTool } from '../search-case-law'

vi.mock('@langchain/community/vectorstores/supabase', () => ({
  SupabaseVectorStore: vi.fn().mockImplementation(() => ({
    asRetriever: vi.fn().mockReturnValue({
      invoke: vi.fn().mockResolvedValue([
        {
          pageContent: 'Martinez v. Williams, 2019 TX App — landlord must return deposit within 30 days',
          metadata: { case_name: 'Martinez v. Williams', year: 2019, citation: '2019 TX App 1234' },
        },
      ]),
    }),
  })),
}))

describe('createSearchCaseLawTool', () => {
  it('returns a tool named search_case_law', () => {
    const tool = createSearchCaseLawTool({ disputeType: 'landlord_tenant', supabaseClient: {} as any })
    expect(tool.name).toBe('search_case_law')
  })

  it('returns formatted citations on invoke', async () => {
    const tool = createSearchCaseLawTool({ disputeType: 'landlord_tenant', supabaseClient: {} as any })
    const result = await tool.invoke('security deposit return')
    expect(result).toContain('Martinez v. Williams')
  })
})
