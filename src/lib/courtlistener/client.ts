import type {
  CLSearchFilters,
  CLSearchResult,
  CLClusterDetail,
  CLOpinionDetail,
} from './types'

const BASE_URL = 'https://www.courtlistener.com/api/rest/v4'
const MAX_RETRIES = 3
const INITIAL_BACKOFF_MS = 1000

export class CourtListenerClient {
  private token: string | undefined

  constructor(token?: string) {
    this.token = token ?? process.env.COURTLISTENER_API_TOKEN
  }

  private async fetchWithRetry(
    path: string,
    params?: Record<string, string>
  ): Promise<unknown> {
    const url = new URL(`${BASE_URL}${path}`)
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value)
      }
    }

    const headers: Record<string, string> = {}
    if (this.token) {
      headers['Authorization'] = `Token ${this.token}`
    }

    let lastError: Error | null = null

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      if (attempt > 0) {
        const backoff = INITIAL_BACKOFF_MS * Math.pow(2, attempt - 1)
        await new Promise((resolve) => setTimeout(resolve, backoff))
      }

      try {
        const response = await fetch(url.toString(), { headers })

        if (response.ok) {
          return await response.json()
        }

        if (response.status === 429) {
          lastError = new Error(`Rate limited (429)`)
          continue
        }

        if (response.status >= 500) {
          lastError = new Error(`Server error (${response.status})`)
          continue
        }

        // Client errors (4xx except 429) should not be retried
        throw new Error(
          `CourtListener API error: ${response.status} ${response.statusText}`
        )
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.startsWith('CourtListener API error')
        ) {
          throw error
        }
        lastError = error instanceof Error ? error : new Error(String(error))
      }
    }

    throw lastError ?? new Error('CourtListener API request failed')
  }

  async search(
    query: string,
    filters?: CLSearchFilters
  ): Promise<CLSearchResult[]> {
    const params: Record<string, string> = {
      q: query,
      type: 'o',
      order_by: 'score desc',
      format: 'json',
    }

    if (filters) {
      if (filters.jurisdiction) params.jurisdiction = filters.jurisdiction
      if (filters.court) params.court = filters.court
      if (filters.filed_after) params.filed_after = filters.filed_after
      if (filters.filed_before) params.filed_before = filters.filed_before
    }

    const data = (await this.fetchWithRetry('/search/', params)) as {
      results: Array<{
        cluster_id: number
        caseName: string
        court_id: string
        court: string
        dateFiled: string
        citation: string[]
        snippet: string
      }>
    }

    return data.results.slice(0, 10).map((r) => ({
      cluster_id: r.cluster_id,
      case_name: r.caseName,
      court_id: r.court_id,
      court_name: r.court,
      date_filed: r.dateFiled,
      citations: r.citation ?? [],
      snippet: r.snippet,
    }))
  }

  async getCluster(clusterId: number): Promise<CLClusterDetail> {
    const data = (await this.fetchWithRetry(`/clusters/${clusterId}/`, {
      format: 'json',
    })) as {
      id: number
      case_name: string
      court_id: string
      court: string
      date_filed: string
      citations: Array<{ volume: number; reporter: string; page: number }>
      sub_opinions: Array<{ id: number; type: string }>
    }

    return {
      id: data.id,
      case_name: data.case_name,
      court_id: data.court_id,
      court: data.court,
      date_filed: data.date_filed,
      citations: data.citations.map(
        (c) => `${c.volume} ${c.reporter} ${c.page}`
      ),
      sub_opinions: data.sub_opinions,
    }
  }

  async getOpinion(opinionId: number): Promise<CLOpinionDetail> {
    const data = (await this.fetchWithRetry(`/opinions/${opinionId}/`, {
      format: 'json',
    })) as {
      id: number
      cluster_id: number
      type: string
      plain_text: string
      html_with_citations: string
    }

    return {
      id: data.id,
      cluster_id: data.cluster_id,
      type: data.type,
      plain_text: data.plain_text,
      html_with_citations: data.html_with_citations,
    }
  }
}

let clientInstance: CourtListenerClient | null = null

export function getCourtListenerClient(): CourtListenerClient {
  if (!clientInstance) {
    clientInstance = new CourtListenerClient()
  }
  return clientInstance
}
