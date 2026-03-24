import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { randomUUID } from 'crypto'
import { getSubscription } from '@/lib/subscription/check'

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
      .select('share_token, share_enabled, share_expires_at')
      .eq('id', caseId)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    const expired = data.share_expires_at && new Date(data.share_expires_at) < new Date()
    const effectiveEnabled = data.share_enabled && !expired

    return NextResponse.json({
      share_enabled: effectiveEnabled,
      share_token: effectiveEnabled ? data.share_token : null,
      share_expires_at: effectiveEnabled ? data.share_expires_at : null,
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
    const { supabase, user } = auth

    // Subscription gate: caseSharing
    const sub = await getSubscription(supabase, user.id)
    if (!sub.canAccess('caseSharing')) {
      return NextResponse.json(
        {
          error: 'upgrade_required',
          message: 'Case sharing requires an Essentials plan.',
          feature: 'caseSharing',
          currentTier: sub.tier,
          upgradeUrl: '/pricing',
        },
        { status: 403 }
      )
    }

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
      updates.share_expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }

    const { data, error } = await supabase
      .from('cases')
      .update(updates)
      .eq('id', caseId)
      .select('share_token, share_enabled, share_expires_at')
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Failed to update sharing' }, { status: 500 })
    }

    return NextResponse.json({
      share_enabled: data.share_enabled,
      share_token: data.share_enabled ? data.share_token : null,
      share_expires_at: data.share_enabled ? data.share_expires_at : null,
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
