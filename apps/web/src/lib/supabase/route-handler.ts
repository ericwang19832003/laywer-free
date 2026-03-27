import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { SupabaseClient, User } from '@supabase/supabase-js'

type AuthSuccess = { ok: true; supabase: SupabaseClient; user: User }
type AuthFailure = { ok: false; error: NextResponse }
export type AuthResult = AuthSuccess | AuthFailure

export async function getAuthenticatedClient(): Promise<AuthResult> {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignore - this happens when trying to set cookies in a Server Component
          }
        },
      },
    }
  )

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return { ok: false, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  return { ok: true, supabase, user }
}
