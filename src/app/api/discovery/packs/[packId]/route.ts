import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'

export const runtime = 'nodejs'

// GET /api/discovery/packs/:packId — pack detail with items, service logs, responses
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ packId: string }> }
) {
  try {
    const { packId } = await params
    const { supabase, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    // Fetch pack (RLS ensures ownership via cases join)
    const { data: pack, error: packError } = await supabase!
      .from('discovery_packs')
      .select('*')
      .eq('id', packId)
      .single()

    if (packError || !pack) {
      return NextResponse.json({ error: 'Discovery pack not found' }, { status: 404 })
    }

    // Fetch related data in parallel
    const [itemsResult, logsResult, responsesResult] = await Promise.all([
      supabase!
        .from('discovery_items')
        .select('*')
        .eq('pack_id', packId)
        .order('item_type')
        .order('item_no'),
      supabase!
        .from('discovery_service_logs')
        .select('*')
        .eq('pack_id', packId)
        .order('served_at', { ascending: false }),
      supabase!
        .from('discovery_responses')
        .select('*')
        .eq('pack_id', packId)
        .order('received_at', { ascending: false }),
    ])

    // Check for query errors on related data
    if (itemsResult.error || logsResult.error || responsesResult.error) {
      return NextResponse.json(
        { error: 'Failed to load pack details' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      pack,
      items: itemsResult.data ?? [],
      service_logs: logsResult.data ?? [],
      responses: responsesResult.data ?? [],
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
