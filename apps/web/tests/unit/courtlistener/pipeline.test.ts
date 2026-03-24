import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock all dependencies before imports
vi.mock('@/lib/courtlistener/client', () => ({
  getCourtListenerClient: vi.fn().mockReturnValue({
    getCluster: vi.fn(),
    getOpinion: vi.fn(),
  }),
}))

vi.mock('@/lib/courtlistener/embeddings', () => ({
  generateEmbeddings: vi.fn().mockResolvedValue([new Array(3072).fill(0.1)]),
}))

import { processClusterOpinions } from '@/lib/courtlistener/pipeline'
import { getCourtListenerClient } from '@/lib/courtlistener/client'

function mockSupabase() {
  const chainable = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: null }),
    single: vi.fn().mockResolvedValue({ data: { id: 'opinion-uuid' }, error: null }),
    insert: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: { id: 'opinion-uuid' }, error: null }),
      }),
      error: null,
    }),
  }
  return {
    from: vi.fn().mockReturnValue(chainable),
    _chainable: chainable,
  } as unknown as Parameters<typeof processClusterOpinions>[0]
}

describe('processClusterOpinions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches cluster and processes primary opinion', async () => {
    const client = getCourtListenerClient() as { getCluster: ReturnType<typeof vi.fn>; getOpinion: ReturnType<typeof vi.fn> }
    client.getCluster.mockResolvedValue({
      id: 123,
      case_name: 'Test v. Case',
      sub_opinions: [{ id: 456, type: '010combined' }],
    })
    client.getOpinion.mockResolvedValue({
      id: 456, cluster_id: 123, type: '010combined',
      plain_text: 'A'.repeat(500),
    })

    const supabase = mockSupabase()
    const result = await processClusterOpinions(supabase, 123)
    expect(result.opinion_count).toBe(1)
    expect(client.getOpinion).toHaveBeenCalledWith(456)
  })

  it('limits to 2 opinions per cluster', async () => {
    const client = getCourtListenerClient() as { getCluster: ReturnType<typeof vi.fn>; getOpinion: ReturnType<typeof vi.fn> }
    client.getCluster.mockResolvedValue({
      id: 123,
      sub_opinions: [
        { id: 1, type: '010combined' },
        { id: 2, type: '030concurrence' },
        { id: 3, type: '040dissent' },
      ],
    })
    client.getOpinion.mockResolvedValue({
      id: 1, cluster_id: 123, type: '010combined', plain_text: 'A'.repeat(500),
    })

    const supabase = mockSupabase()
    const result = await processClusterOpinions(supabase, 123)
    expect(result.opinion_count).toBe(2)
  })

  it('skips opinions with < 50 chars of text', async () => {
    const client = getCourtListenerClient() as { getCluster: ReturnType<typeof vi.fn>; getOpinion: ReturnType<typeof vi.fn> }
    client.getCluster.mockResolvedValue({
      id: 123,
      sub_opinions: [{ id: 456, type: '010combined' }],
    })
    client.getOpinion.mockResolvedValue({
      id: 456, cluster_id: 123, type: '010combined', plain_text: 'Short.',
    })

    const supabase = mockSupabase()
    const result = await processClusterOpinions(supabase, 123)
    expect(result.chunk_count).toBe(0)
  })

  it('skips already-cached opinions', async () => {
    const client = getCourtListenerClient() as { getCluster: ReturnType<typeof vi.fn>; getOpinion: ReturnType<typeof vi.fn> }
    client.getCluster.mockResolvedValue({
      id: 123,
      sub_opinions: [{ id: 456, type: '010combined' }],
    })

    const supabase = mockSupabase()
    ;(supabase as unknown as { _chainable: { maybeSingle: ReturnType<typeof vi.fn> } })._chainable.maybeSingle.mockResolvedValue({ data: { id: 'exists' } })

    const result = await processClusterOpinions(supabase, 123)
    expect(client.getOpinion).not.toHaveBeenCalled()
  })

  it('prioritizes majority/combined opinions', async () => {
    const client = getCourtListenerClient() as { getCluster: ReturnType<typeof vi.fn>; getOpinion: ReturnType<typeof vi.fn> }
    client.getCluster.mockResolvedValue({
      id: 123,
      sub_opinions: [
        { id: 3, type: '040dissent' },
        { id: 1, type: '010combined' },
        { id: 2, type: '030concurrence' },
      ],
    })
    client.getOpinion.mockResolvedValue({
      id: 1, cluster_id: 123, type: '010combined', plain_text: 'A'.repeat(500),
    })

    const supabase = mockSupabase()
    await processClusterOpinions(supabase, 123)
    expect(client.getOpinion).toHaveBeenNthCalledWith(1, 1)
  })
})
