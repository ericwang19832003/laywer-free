import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { createPackSchema } from '@/lib/schemas/discovery'
import { getSubscription } from '@/lib/subscription/check'

export const runtime = 'nodejs'

// POST /api/cases/:caseId/discovery/packs — create a new pack
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase, user } = auth

    // Subscription gate: discovery
    const sub = await getSubscription(supabase, user.id)
    if (!sub.canAccess('discovery')) {
      return NextResponse.json(
        {
          error: 'upgrade_required',
          message: 'Discovery tools require a Pro plan.',
          feature: 'discovery',
          currentTier: sub.tier,
          upgradeUrl: '/pricing',
        },
        { status: 403 }
      )
    }

    const body = await request.json()
    const parsed = createPackSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 422 }
      )
    }

    // Verify case exists (RLS handles ownership)
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('id')
      .eq('id', caseId)
      .single()

    if (caseError || !caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    const title = parsed.data.title || 'Untitled Discovery Pack'

    const { data: pack, error: insertError } = await supabase
      .from('discovery_packs')
      .insert({
        case_id: caseId,
        title,
        created_by: user.id,
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json(
        { error: 'Failed to create discovery pack', details: insertError.message },
        { status: 500 }
      )
    }

    // Write timeline event
    await supabase.from('task_events').insert({
      case_id: caseId,
      kind: 'discovery_pack_created',
      payload: { pack_id: pack.id, title },
    })

    return NextResponse.json({ pack }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/cases/:caseId/discovery/packs — list packs for a case
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase } = auth

    const { data, error } = await supabase
      .from('discovery_packs')
      .select('*')
      .eq('case_id', caseId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch discovery packs', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ packs: data })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
