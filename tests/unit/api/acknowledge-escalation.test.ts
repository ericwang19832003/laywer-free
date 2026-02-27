import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock supabase route-handler before importing route
const mockUpdate = vi.fn()
const mockEq = vi.fn()

vi.mock('@/lib/supabase/route-handler', () => ({
  getAuthenticatedClient: vi.fn().mockResolvedValue({
    supabase: {
      from: vi.fn().mockReturnValue({
        update: vi.fn().mockImplementation((data) => {
          mockUpdate(data)
          return {
            eq: vi.fn().mockImplementation((col, val) => {
              mockEq(col, val)
              return {
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { id: 'esc-001', acknowledged: true },
                    error: null,
                  }),
                }),
              }
            }),
          }
        }),
      }),
    },
    user: { id: 'user-001' },
    error: null,
  }),
}))

import { PATCH } from '@/app/api/reminder-escalations/[id]/acknowledge/route'

describe('PATCH /api/reminder-escalations/[id]/acknowledge', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 200 and sets acknowledged=true', async () => {
    const request = new Request('http://localhost/api/reminder-escalations/esc-001/acknowledge', {
      method: 'PATCH',
    })

    const response = await PATCH(request, { params: Promise.resolve({ id: 'esc-001' }) })
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(mockUpdate).toHaveBeenCalledWith({ acknowledged: true })
    expect(mockEq).toHaveBeenCalledWith('id', 'esc-001')
  })
})
