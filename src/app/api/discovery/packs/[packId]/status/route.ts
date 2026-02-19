import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import {
  updatePackStatusSchema,
  VALID_STATUS_TRANSITIONS,
  type DiscoveryPackStatus,
} from '@/lib/schemas/discovery'

export const runtime = 'nodejs'

// PATCH /api/discovery/packs/:packId/status — update pack status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ packId: string }> }
) {
  try {
    const { packId } = await params
    const { supabase, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    const body = await request.json()
    const parsed = updatePackStatusSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 422 }
      )
    }

    // Fetch current pack (RLS handles ownership)
    const { data: pack, error: packError } = await supabase!
      .from('discovery_packs')
      .select('id, case_id, status')
      .eq('id', packId)
      .single()

    if (packError || !pack) {
      return NextResponse.json({ error: 'Discovery pack not found' }, { status: 404 })
    }

    const currentStatus = pack.status as DiscoveryPackStatus
    const targetStatus = parsed.data.status
    const allowed = VALID_STATUS_TRANSITIONS[currentStatus]

    if (!allowed.includes(targetStatus)) {
      return NextResponse.json(
        {
          error: 'Invalid status transition',
          details: `Cannot transition from '${currentStatus}' to '${targetStatus}'. Allowed: [${allowed.join(', ')}]`,
        },
        { status: 409 }
      )
    }

    const { data: updated, error: updateError } = await supabase!
      .from('discovery_packs')
      .update({ status: targetStatus })
      .eq('id', packId)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update status', details: updateError.message },
        { status: 500 }
      )
    }

    // Write timeline event
    await supabase!.from('task_events').insert({
      case_id: pack.case_id,
      kind: 'discovery_pack_status_changed',
      payload: {
        pack_id: packId,
        from: currentStatus,
        to: targetStatus,
      },
    })

    return NextResponse.json({ pack: updated })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
