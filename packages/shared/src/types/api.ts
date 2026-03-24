// Generic API response shapes used by both web and mobile clients

/** Standard API response wrapper */
export interface ApiResponse<T> {
  data?: T
  error?: string
}

/** Paginated list response */
export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
}

/** Supabase-style error shape returned by edge functions */
export interface ApiError {
  message: string
  code?: string
  status?: number
}
