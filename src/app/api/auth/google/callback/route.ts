import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { encryptToken } from '@/lib/crypto/tokens'

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo'

export async function GET(request: NextRequest) {
  const auth = await getAuthenticatedClient()
  if (!auth.ok) return auth.error
  const { supabase, user } = auth

  const code = request.nextUrl.searchParams.get('code')
  const state = request.nextUrl.searchParams.get('state')
  const error = request.nextUrl.searchParams.get('error')

  if (error) {
    const params = new URLSearchParams({ gmail_error: error })
    return NextResponse.redirect(new URL(`/settings?${params}`, request.url))
  }

  if (!code || state !== user.id) {
    return NextResponse.redirect(new URL('/settings?gmail_error=invalid_request', request.url))
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenRes.ok) {
      return NextResponse.redirect(new URL('/settings?gmail_error=token_exchange_failed', request.url))
    }

    const tokens = await tokenRes.json()

    // Get user's Gmail address
    const profileRes = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })
    const profile = await profileRes.json()

    // Revoke any existing connection for this user
    await supabase
      .from('connected_accounts')
      .update({ revoked_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('provider', 'gmail')
      .is('revoked_at', null)

    // Store encrypted tokens
    const { error: insertError } = await supabase
      .from('connected_accounts')
      .insert({
        user_id: user.id,
        provider: 'gmail',
        email: profile.email,
        access_token_encrypted: encryptToken(tokens.access_token),
        refresh_token_encrypted: encryptToken(tokens.refresh_token),
        token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        scopes: ['https://www.googleapis.com/auth/gmail.readonly'],
      })

    if (insertError) {
      console.error('[gmail-oauth] Failed to store tokens:', insertError.message)
      return NextResponse.redirect(new URL('/settings?gmail_error=storage_failed', request.url))
    }

    return NextResponse.redirect(new URL('/settings?gmail_connected=true', request.url))
  } catch (err) {
    console.error('[gmail-oauth] Unexpected error:', err)
    return NextResponse.redirect(new URL('/settings?gmail_error=unexpected', request.url))
  }
}
