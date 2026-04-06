import { createApiClient } from '@lawyer-free/shared/api-client'
import { supabase } from './supabase'

const API_URL = process.env.EXPO_PUBLIC_API_URL!

export const api = createApiClient({
  baseUrl: API_URL,
  getHeaders: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return {
      Authorization: `Bearer ${session?.access_token ?? ''}`,
    }
  },
})
