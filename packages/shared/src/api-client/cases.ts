import type { BaseClient } from './types'
import type { CreateCaseInput } from '../schemas/case'

export interface CaseListResponse {
  cases: any[]
  nextCursor: string | null
  hasMore: boolean
  totalCount: number
}

export interface CaseListParams {
  limit?: number
  cursor?: string
}

export function casesApi(client: BaseClient) {
  return {
    list: (params?: CaseListParams) => {
      const search = new URLSearchParams()
      if (params?.limit) search.set('limit', String(params.limit))
      if (params?.cursor) search.set('cursor', params.cursor)
      const qs = search.toString()
      return client.get<CaseListResponse>(`/api/cases${qs ? `?${qs}` : ''}`)
    },
    get: (id: string) => client.get<{ case: any }>(`/api/cases/${id}`),
    create: (data: CreateCaseInput) =>
      client.post<{ case: any; tasks: any[] }>('/api/cases', data),
    update: (id: string, data: Record<string, unknown>) =>
      client.patch<{ case: any }>(`/api/cases/${id}`, data),
    delete: (id: string) => client.delete<{ success: boolean }>(`/api/cases/${id}`),
  }
}
