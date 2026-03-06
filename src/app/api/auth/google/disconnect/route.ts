import { NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { decryptToken } from '@/lib/crypto/tokens'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST() {
  const auth = await getAuthenticatedClient()
  if (!auth.ok) return auth.error
  const { user } = auth
  const admin = createAdminClient()

  const { data: account } = await admin
    .from('connected_accounts')
    .select('id, access_token_encrypted')
    .eq('user_id', user.id)
    .eq('provider', 'gmail')
    .is('revoked_at', null)
    .single()

  if (!account) {
    return NextResponse.json({ error: 'No Gmail connection found' }, { status: 404 })
  }

  try {
    const token = decryptToken(account.access_token_encrypted)
    await fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, {
      method: 'POST',
    })
  } catch {
    // Non-fatal: continue even if Google revocation fails
  }

  await admin
    .from('connected_accounts')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', account.id)

  return NextResponse.json({ success: true })
}
