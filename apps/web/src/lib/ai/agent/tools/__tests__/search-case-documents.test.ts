import { describe, it, expect, vi } from 'vitest'

vi.stubEnv('OPENAI_API_KEY', 'test-key')

vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(function (this: { embeddings: unknown }) {
    this.embeddings = {
      create: vi.fn().mockResolvedValue({ data: [{ embedding: new Array(1536).fill(0.1) }] }),
    }
  }),
}))

function makeSupabase(rows: unknown[] = [], error: unknown = null) {
  return {
    rpc: vi.fn().mockResolvedValue({ data: rows, error }),
  } as any
}

import { createSearchCaseDocumentsTool } from '../search-case-documents'

describe('createSearchCaseDocumentsTool', () => {
  it('returns a tool named search_case_documents', () => {
    const tool = createSearchCaseDocumentsTool({ caseId: 'case-1', supabaseClient: makeSupabase() })
    expect(tool.name).toBe('search_case_documents')
  })

  it('passes p_case_id to the RPC', async () => {
    const supabase = makeSupabase([])
    const tool = createSearchCaseDocumentsTool({ caseId: 'case-1', supabaseClient: supabase })
    await tool.invoke({ query: 'breach of contract' })
    expect(supabase.rpc).toHaveBeenCalledWith('match_case_documents', expect.objectContaining({
      p_case_id: 'case-1',
    }))
  })

  it('returns formatted chunks when results are found', async () => {
    const rows = [
      { source_type: 'court_document', source_id: 'doc-1', content: 'The contract was signed on January 1.', similarity: 0.92 },
    ]
    const supabase = makeSupabase(rows)
    const tool = createSearchCaseDocumentsTool({ caseId: 'case-1', supabaseClient: supabase })
    const result = await tool.invoke({ query: 'contract date' })
    expect(result).toContain('court_document')
    expect(result).toContain('The contract was signed on January 1.')
  })

  it('returns not-indexed message when no chunks found', async () => {
    const tool = createSearchCaseDocumentsTool({ caseId: 'case-1', supabaseClient: makeSupabase([]) })
    const result = await tool.invoke({ query: 'anything' })
    expect(result).toContain('not yet indexed')
  })

  it('passes source_types filter when provided', async () => {
    const supabase = makeSupabase([])
    const tool = createSearchCaseDocumentsTool({ caseId: 'case-1', supabaseClient: supabase })
    await tool.invoke({ query: 'evidence', source_types: ['evidence_item'] })
    expect(supabase.rpc).toHaveBeenCalledWith('match_case_documents', expect.objectContaining({
      source_types: ['evidence_item'],
    }))
  })
})
