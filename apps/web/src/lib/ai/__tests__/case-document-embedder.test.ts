import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.stubEnv('OPENAI_API_KEY', 'test-key')
vi.stubEnv('ANTHROPIC_API_KEY', 'test-key')

vi.mock('../embeddings', () => ({
  generateDocumentEmbeddings: vi.fn().mockResolvedValue([new Array(1536).fill(0.1)]),
}))

vi.mock('@/lib/extraction/pdf-text', () => ({
  extractTextFromPdf: vi.fn().mockResolvedValue('extracted pdf text content that is long enough to chunk'),
}))

vi.mock('@/lib/extraction/ocr', () => ({
  extractTextFromImage: vi.fn().mockResolvedValue('extracted image text content'),
}))

import { embedCaseDocument, type EmbedCaseDocumentParams } from '../case-document-embedder'

function makeSupabase() {
  const deleteChain = { eq: vi.fn() }
  deleteChain.eq.mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) })

  return {
    storage: {
      from: vi.fn().mockReturnValue({
        download: vi.fn().mockResolvedValue({
          data: new Blob([new Uint8Array([1, 2, 3])]),
          error: null,
        }),
      }),
    },
    from: vi.fn().mockReturnValue({
      delete: vi.fn().mockReturnValue(deleteChain),
      insert: vi.fn().mockResolvedValue({ error: null }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    }),
  } as any
}

describe('embedCaseDocument', () => {
  it('returns done status for a PDF court document', async () => {
    const supabase = makeSupabase()
    const params: EmbedCaseDocumentParams = {
      caseId: 'case-1',
      sourceType: 'court_document',
      sourceId: 'doc-1',
      storagePath: 'cases/case-1/court-docs/doc-1',
      mimeType: 'application/pdf',
      supabase,
    }
    const result = await embedCaseDocument(params)
    expect(result.status).toBe('done')
    expect(result.chunksInserted).toBeGreaterThan(0)
  })

  it('returns done status for an image evidence item', async () => {
    const supabase = makeSupabase()
    const params: EmbedCaseDocumentParams = {
      caseId: 'case-1',
      sourceType: 'evidence_item',
      sourceId: 'ev-1',
      storagePath: 'cases/case-1/evidence/ev-1',
      mimeType: 'image/jpeg',
      supabase,
    }
    const result = await embedCaseDocument(params)
    expect(result.status).toBe('done')
  })

  it('accepts contentText directly for generated_document without fetching storage', async () => {
    const supabase = makeSupabase()
    const params: EmbedCaseDocumentParams = {
      caseId: 'case-1',
      sourceType: 'generated_document',
      sourceId: 'gen-1',
      storagePath: '',
      mimeType: 'text/plain',
      supabase,
      contentText: 'This is the demand letter content that was already generated.',
    }
    const result = await embedCaseDocument(params)
    expect(result.status).toBe('done')
    // Storage should NOT have been called
    expect(supabase.storage.from).not.toHaveBeenCalled()
  })

  it('returns failed status when storage download fails', async () => {
    const supabase = makeSupabase()
    supabase.storage.from = vi.fn().mockReturnValue({
      download: vi.fn().mockResolvedValue({ data: null, error: new Error('not found') }),
    })
    const params: EmbedCaseDocumentParams = {
      caseId: 'case-1',
      sourceType: 'court_document',
      sourceId: 'doc-1',
      storagePath: 'cases/case-1/court-docs/doc-1',
      mimeType: 'application/pdf',
      supabase,
    }
    const result = await embedCaseDocument(params)
    expect(result.status).toBe('failed')
  })
})
