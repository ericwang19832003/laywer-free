import type { ApiClientConfig, BaseClient, HttpMethod } from './types'
import { casesApi } from './cases'
import { tasksApi } from './tasks'

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function createApiClient(config: ApiClientConfig) {
  async function request<T>(method: HttpMethod, path: string, body?: unknown): Promise<T> {
    const headers = await config.getHeaders()
    const res = await fetch(`${config.baseUrl}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...headers },
      body: body ? JSON.stringify(body) : undefined,
    })
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({ error: res.statusText })) as Record<string, unknown>
      throw new ApiError(res.status, (errBody.error as string) || 'Request failed')
    }
    return res.json() as Promise<T>
  }

  const client: BaseClient = {
    get: <T>(path: string) => request<T>('GET', path),
    post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
    patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
    put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
    delete: <T>(path: string) => request<T>('DELETE', path),
  }

  return {
    ...client,
    cases: casesApi(client),
    tasks: tasksApi(client),
  }
}

export type ApiClient = ReturnType<typeof createApiClient>

export * from './types'
export { casesApi } from './cases'
export type { CaseListResponse, CaseListParams } from './cases'
export { tasksApi } from './tasks'
