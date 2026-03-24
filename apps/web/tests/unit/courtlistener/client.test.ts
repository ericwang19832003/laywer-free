import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { CourtListenerClient } from '@/lib/courtlistener/client'

function mockResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function makeCLSearchResult(overrides: Record<string, unknown> = {}) {
  return {
    cluster_id: 12345,
    caseName: 'Smith v. Jones',
    court_id: 'scotus',
    court: 'Supreme Court of the United States',
    dateFiled: '2023-06-15',
    citation: ['600 U.S. 100'],
    snippet: 'The court held that...',
    ...overrides,
  }
}

describe('CourtListenerClient', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, 'fetch')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // Test 1: search returns mapped results from CL API
  it('search returns mapped results from CL API', async () => {
    const clResult = makeCLSearchResult()
    fetchSpy.mockResolvedValueOnce(
      mockResponse({ results: [clResult] })
    )

    const client = new CourtListenerClient('test-token')
    const results = await client.search('employment discrimination')

    expect(results).toHaveLength(1)
    expect(results[0]).toEqual({
      cluster_id: 12345,
      case_name: 'Smith v. Jones',
      court_id: 'scotus',
      court_name: 'Supreme Court of the United States',
      date_filed: '2023-06-15',
      citations: ['600 U.S. 100'],
      snippet: 'The court held that...',
    })

    const calledUrl = new URL(fetchSpy.mock.calls[0][0] as string)
    expect(calledUrl.pathname).toBe('/api/rest/v4/search/')
    expect(calledUrl.searchParams.get('q')).toBe('employment discrimination')
    expect(calledUrl.searchParams.get('type')).toBe('o')
    expect(calledUrl.searchParams.get('order_by')).toBe('score desc')
    expect(calledUrl.searchParams.get('format')).toBe('json')
  })

  // Test 2: search limits results to 10
  it('search limits results to 10', async () => {
    const results = Array.from({ length: 15 }, (_, i) =>
      makeCLSearchResult({ cluster_id: i + 1 })
    )
    fetchSpy.mockResolvedValueOnce(mockResponse({ results }))

    const client = new CourtListenerClient('test-token')
    const mapped = await client.search('test query')

    expect(mapped).toHaveLength(10)
  })

  // Test 3: search passes filters as query params
  it('search passes filters as query params', async () => {
    fetchSpy.mockResolvedValueOnce(mockResponse({ results: [] }))

    const client = new CourtListenerClient('test-token')
    await client.search('test', {
      jurisdiction: 'federal',
      court: 'scotus',
      filed_after: '2020-01-01',
      filed_before: '2023-12-31',
    })

    const calledUrl = new URL(fetchSpy.mock.calls[0][0] as string)
    expect(calledUrl.searchParams.get('jurisdiction')).toBe('federal')
    expect(calledUrl.searchParams.get('court')).toBe('scotus')
    expect(calledUrl.searchParams.get('filed_after')).toBe('2020-01-01')
    expect(calledUrl.searchParams.get('filed_before')).toBe('2023-12-31')
  })

  // Test 4: search includes auth header when token provided
  it('search includes auth header when token provided', async () => {
    fetchSpy.mockResolvedValueOnce(mockResponse({ results: [] }))

    const client = new CourtListenerClient('my-secret-token')
    await client.search('test')

    const callOptions = fetchSpy.mock.calls[0][1] as RequestInit
    expect(callOptions.headers).toEqual({
      Authorization: 'Token my-secret-token',
    })
  })

  // Test 5: retries on 429 with backoff
  it('retries on 429 with backoff', async () => {
    vi.useFakeTimers()

    const rateLimitResponse = new Response('Too Many Requests', { status: 429 })
    const successResponse = mockResponse({ results: [] })

    fetchSpy
      .mockResolvedValueOnce(rateLimitResponse)
      .mockResolvedValueOnce(successResponse)

    const client = new CourtListenerClient('test-token')
    const searchPromise = client.search('test')

    // Advance past the 1s backoff for retry 1
    await vi.advanceTimersByTimeAsync(1500)

    const results = await searchPromise
    expect(results).toEqual([])
    expect(fetchSpy).toHaveBeenCalledTimes(2)

    vi.useRealTimers()
  })

  // Test 6: throws after max retries on 500
  it('throws after max retries on 500', async () => {
    vi.useFakeTimers()

    fetchSpy.mockImplementation(async () => {
      return new Response('Internal Server Error', { status: 500 })
    })

    const client = new CourtListenerClient('test-token')
    const searchPromise = client.search('test')

    // Attach catch handler immediately to prevent unhandled rejection
    let caughtError: Error | null = null
    searchPromise.catch((err) => {
      caughtError = err
    })

    // Advance through all retry backoffs: 1s + 2s + 4s
    await vi.advanceTimersByTimeAsync(10000)

    // Wait for the promise to settle
    await searchPromise.catch(() => {})

    expect(caughtError).toBeInstanceOf(Error)
    expect((caughtError as Error).message).toBe('Server error (500)')
    // Initial attempt + 3 retries = 4 calls
    expect(fetchSpy).toHaveBeenCalledTimes(4)

    vi.useRealTimers()
  })

  // Test 7: getCluster returns cluster detail with sub_opinions
  it('getCluster returns cluster detail with sub_opinions', async () => {
    const clusterData = {
      id: 99999,
      case_name: 'Doe v. Roe',
      court_id: 'ca9',
      court: 'Court of Appeals for the Ninth Circuit',
      date_filed: '2022-03-10',
      citations: [
        { volume: 42, reporter: 'F.4th', page: 101 },
      ],
      sub_opinions: [
        { id: 1001, type: '010combined' },
        { id: 1002, type: '040dissent' },
      ],
    }

    fetchSpy.mockResolvedValueOnce(mockResponse(clusterData))

    const client = new CourtListenerClient('test-token')
    const cluster = await client.getCluster(99999)

    expect(cluster).toEqual({
      id: 99999,
      case_name: 'Doe v. Roe',
      court_id: 'ca9',
      court: 'Court of Appeals for the Ninth Circuit',
      date_filed: '2022-03-10',
      citations: ['42 F.4th 101'],
      sub_opinions: [
        { id: 1001, type: '010combined' },
        { id: 1002, type: '040dissent' },
      ],
    })

    const calledUrl = new URL(fetchSpy.mock.calls[0][0] as string)
    expect(calledUrl.pathname).toBe('/api/rest/v4/clusters/99999/')
    expect(calledUrl.searchParams.get('format')).toBe('json')
  })

  // Test 8: getOpinion returns opinion with plain_text
  it('getOpinion returns opinion with plain_text', async () => {
    const opinionData = {
      id: 5001,
      cluster_id: 99999,
      type: '010combined',
      plain_text: 'The majority opinion holds that...',
      html_with_citations: '<p>The majority opinion holds that...</p>',
    }

    fetchSpy.mockResolvedValueOnce(mockResponse(opinionData))

    const client = new CourtListenerClient('test-token')
    const opinion = await client.getOpinion(5001)

    expect(opinion).toEqual({
      id: 5001,
      cluster_id: 99999,
      type: '010combined',
      plain_text: 'The majority opinion holds that...',
      html_with_citations: '<p>The majority opinion holds that...</p>',
    })

    const calledUrl = new URL(fetchSpy.mock.calls[0][0] as string)
    expect(calledUrl.pathname).toBe('/api/rest/v4/opinions/5001/')
    expect(calledUrl.searchParams.get('format')).toBe('json')
  })
})
