export interface ApiClientConfig {
  baseUrl: string
  getHeaders: () => Promise<Record<string, string>>
}

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'

/** Low-level HTTP methods exposed by createApiClient — used by domain modules */
export interface BaseClient {
  get: <T>(path: string) => Promise<T>
  post: <T>(path: string, body?: unknown) => Promise<T>
  patch: <T>(path: string, body?: unknown) => Promise<T>
  put: <T>(path: string, body?: unknown) => Promise<T>
  delete: <T>(path: string) => Promise<T>
}
