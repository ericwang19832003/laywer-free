import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { randomUUID } from 'crypto'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase } = auth

    const { data, error } = await supabase
      .from('cases')
      .select('share_token, share_enabled')
      .eq('id', caseId)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    return NextResponse.json({
      share_enabled: data.share_enabled,
      share_token: data.share_enabled ? data.share_token : null,
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase } = auth

    const body = await request.json()
    const enabled = Boolean(body.enabled)

    // If enabling, generate token if none exists
    let updates: Record<string, unknown> = { share_enabled: enabled }

    if (enabled) {
      const { data: existing } = await supabase
        .from('cases')
        .select('share_token')
        .eq('id', caseId)
        .single()

      if (!existing?.share_token) {
        updates.share_token = randomUUID()
      }
    }

    const { data, error } = await supabase
      .from('cases')
      .update(updates)
      .eq('id', caseId)
      .select('share_token, share_enabled')
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Failed to update sharing' }, { status: 500 })
    }

    return NextResponse.json({
      share_enabled: data.share_enabled,
      share_token: data.share_enabled ? data.share_token : null,
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
