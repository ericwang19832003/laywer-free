import { NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { isGmailMcpConfigured, getGmailProfile } from '@/lib/mcp/gmail-client'

export async function GET() {
  const auth = await getAuthenticatedClient()
  if (!auth.ok) return auth.error

  if (!isGmailMcpConfigured()) {
    return NextResponse.json({ connected: false, email: null, configured: false })
  }

  const profile = await getGmailProfile()

  return NextResponse.json({
    connected: !!profile,
    email: profile?.email ?? null,
    configured: true,
  })
}
