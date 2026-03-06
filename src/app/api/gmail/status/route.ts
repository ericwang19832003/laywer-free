import { NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'

export async function GET() {
  const auth = await getAuthenticatedClient()
  if (!auth.ok) return auth.error
  const { supabase, user } = auth

  const { data: account } = await supabase
    .from('connected_accounts')
    .select('id, email, connected_at')
    .eq('user_id', user.id)
    .eq('provider', 'gmail')
    .is('revoked_at', null)
    .maybeSingle()

  return NextResponse.json({
    connected: !!account,
    email: account?.email ?? null,
    connectedAt: account?.connected_at ?? null,
  })
}
