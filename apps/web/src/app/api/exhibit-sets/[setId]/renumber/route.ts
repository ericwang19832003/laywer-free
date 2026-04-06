import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'

export const runtime = 'nodejs'

// POST /api/exhibit-sets/:setId/renumber — renumber exhibits in a set
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ setId: string }> }
) {
  try {
    const { setId } = await params
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase } = auth

    // Call the renumber RPC
    const { error: rpcError } = await supabase
      .rpc('renumber_exhibits', { p_exhibit_set_id: setId })

    if (rpcError) {
      return NextResponse.json(
        { error: 'Failed to renumber exhibits', details: rpcError.message },
        { status: 500 }
      )
    }

    // Look up case_id for the timeline event
    const { data: setData } = await supabase
      .from('exhibit_sets')
      .select('case_id')
      .eq('id', setId)
      .single()

    if (setData) {
      await supabase.from('task_events').insert({
        case_id: setData.case_id,
        kind: 'exhibits_renumbered',
        payload: {
          exhibit_set_id: setId,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
