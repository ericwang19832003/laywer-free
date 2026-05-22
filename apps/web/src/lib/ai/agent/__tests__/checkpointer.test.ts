import { describe, it, expect, vi } from 'vitest'
import { loadCheckpoint, saveCheckpoint } from '../checkpointer'

function makeSupabase(returnData: any) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: returnData, error: null }),
    from: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockResolvedValue({ error: null }),
  }
  return { from: vi.fn(() => chain), ...chain } as any
}

describe('loadCheckpoint', () => {
  it('returns null when no thread exists', async () => {
    const supabase = makeSupabase(null)
    const result = await loadCheckpoint(supabase, 'case-1', 'user-1')
    expect(result).toBeNull()
  })

  it('returns checkpoint data when thread exists', async () => {
    const checkpoint = { messages: [], toolCallCount: 2 }
    const supabase = makeSupabase({ checkpoint })
    const result = await loadCheckpoint(supabase, 'case-1', 'user-1')
    expect(result).toEqual(checkpoint)
  })
})

describe('saveCheckpoint', () => {
  it('calls upsert with correct shape', async () => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null }),
      upsert: vi.fn().mockResolvedValue({ error: null }),
    }
    const supabase = { from: vi.fn(() => chain) } as any
    await saveCheckpoint(supabase, 'case-1', 'user-1', { messages: [], toolCallCount: 0 })
    expect(chain.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ case_id: 'case-1', user_id: 'user-1', thread_id: 'case-1:user-1' }),
      expect.objectContaining({ onConflict: 'case_id,user_id' })
    )
  })
})
