import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Mock Supabase ──────────────────────────────────────────────────────────

const mockInsert = vi.fn()
const mockSelectAfterInsert = vi.fn()
const mockSingleAfterInsert = vi.fn()
const mockSelectVersions = vi.fn()
const mockOrderVersions = vi.fn()
const mockLimitVersions = vi.fn()
const mockSingleVersions = vi.fn()

function buildFromMock() {
  return vi.fn().mockImplementation((table: string) => {
    if (table !== 'draft_versions') throw new Error(`Unexpected table: ${table}`)
    return {
      insert: mockInsert.mockReturnValue({
        select: mockSelectAfterInsert.mockReturnValue({
          single: mockSingleAfterInsert,
        }),
      }),
      select: mockSelectVersions.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: mockOrderVersions.mockReturnValue({
              limit: mockLimitVersions.mockReturnValue({
                single: mockSingleVersions,
              }),
            }),
          }),
        }),
      }),
    }
  })
}

let mockFrom = buildFromMock()

vi.mock('@/lib/supabase/route-handler', () => ({
  getAuthenticatedClient: vi.fn().mockImplementation(async () => ({
    ok: true,
    supabase: { from: (...args: unknown[]) => mockFrom(...args) },
    user: { id: 'user-001' },
  })),
}))

import { POST } from '@/app/api/cases/[id]/draft-versions/route'

// ── Helpers ────────────────────────────────────────────────────────────────

function makeRequest(body: Record<string, unknown>) {
  return new Request('http://localhost/api/cases/case-001/draft-versions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

const routeParams = { params: Promise.resolve({ id: 'case-001' }) }

// ── Tests ──────────────────────────────────────────────────────────────────

describe('POST /api/cases/[id]/draft-versions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFrom = buildFromMock()
  })

  it('returns saved:true with version data on success', async () => {
    mockSingleVersions.mockResolvedValue({
      data: { version_number: 2 },
      error: null,
    })
    mockSingleAfterInsert.mockResolvedValue({
      data: {
        id: 'ver-003',
        version_number: 3,
        source: 'edited',
        content: 'draft text',
        created_at: '2026-01-01T00:00:00Z',
      },
      error: null,
    })

    const res = await POST(
      makeRequest({ taskId: 'task-001', content: 'draft text', source: 'edited' }),
      routeParams,
    )
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.saved).toBe(true)
    expect(body.version.id).toBe('ver-003')
    expect(body.version.version_number).toBe(3)
  })

  it('returns saved:false with error message on DB insert failure', async () => {
    mockSingleVersions.mockResolvedValue({
      data: { version_number: 1 },
      error: null,
    })
    mockSingleAfterInsert.mockResolvedValue({
      data: null,
      error: { message: 'disk full', code: '53100' },
    })

    const res = await POST(
      makeRequest({ taskId: 'task-001', content: 'draft text' }),
      routeParams,
    )
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body.saved).toBe(false)
    expect(body.error).toMatch(/could not be saved/i)
  })

  it('returns 422 when taskId is missing', async () => {
    const res = await POST(
      makeRequest({ content: 'draft text' }),
      routeParams,
    )
    const body = await res.json()

    expect(res.status).toBe(422)
    expect(body.error).toMatch(/required/i)
  })

  it('returns 422 when content is missing', async () => {
    const res = await POST(
      makeRequest({ taskId: 'task-001' }),
      routeParams,
    )
    const body = await res.json()

    expect(res.status).toBe(422)
    expect(body.error).toMatch(/required/i)
  })

  it('returns saved:false on unexpected exception', async () => {
    // Force an unexpected throw by making from() throw
    mockFrom = vi.fn().mockImplementation(() => {
      throw new Error('connection reset')
    })

    const res = await POST(
      makeRequest({ taskId: 'task-001', content: 'draft text' }),
      routeParams,
    )
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body.saved).toBe(false)
    expect(body.error).toMatch(/could not be saved/i)
  })

  it('defaults source to "generated" when not provided', async () => {
    mockSingleVersions.mockResolvedValue({
      data: null,
      error: null,
    })
    mockSingleAfterInsert.mockResolvedValue({
      data: {
        id: 'ver-001',
        version_number: 1,
        source: 'generated',
        content: 'text',
        created_at: '2026-01-01T00:00:00Z',
      },
      error: null,
    })

    await POST(
      makeRequest({ taskId: 'task-001', content: 'text' }),
      routeParams,
    )

    // The insert call should have source='generated'
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ source: 'generated' }),
    )
  })
})
