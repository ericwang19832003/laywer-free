import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { addExhibitSchema } from '@/lib/schemas/exhibits'

export const runtime = 'nodejs'

// POST /api/exhibit-sets/:setId/exhibits — add an exhibit via RPC
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ setId: string }> }
) {
  try {
    const { setId } = await params
    const { supabase, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    const body = await request.json()
    const parsed = addExhibitSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 422 }
      )
    }

    // Call the atomic RPC — handles locking, numbering, and insert
    const { data, error: rpcError } = await supabase!
      .rpc('assign_next_exhibit_number', {
        p_exhibit_set_id: setId,
        p_evidence_item_id: parsed.data.evidence_item_id,
        p_title: parsed.data.title ?? null,
        p_description: parsed.data.description ?? null,
      })

    if (rpcError) {
      // Map Postgres error codes to HTTP responses
      if (rpcError.message.includes('already in the exhibit set')) {
        return NextResponse.json(
          { error: 'This evidence item is already in the exhibit set' },
          { status: 409 }
        )
      }
      if (rpcError.message.includes('limited to 26 exhibits')) {
        return NextResponse.json(
          { error: 'Alpha exhibit numbering is limited to 26 exhibits (A–Z). Consider switching to numeric numbering.' },
          { status: 422 }
        )
      }
      if (rpcError.message.includes('not found')) {
        return NextResponse.json(
          { error: 'Exhibit set not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to add exhibit', details: rpcError.message },
        { status: 500 }
      )
    }

    // RPC returns an array (SETOF); take the first row
    const exhibit = Array.isArray(data) ? data[0] : data

    if (!exhibit) {
      return NextResponse.json(
        { error: 'Failed to add exhibit' },
        { status: 500 }
      )
    }

    // Look up case_id for the timeline event
    const { data: setData } = await supabase!
      .from('exhibit_sets')
      .select('case_id')
      .eq('id', setId)
      .single()

    if (setData) {
      await supabase!.from('task_events').insert({
        case_id: setData.case_id,
        kind: 'exhibit_added',
        payload: {
          exhibit_set_id: setId,
          exhibit_id: exhibit.id,
          exhibit_no: exhibit.exhibit_no,
          evidence_item_id: parsed.data.evidence_item_id,
        },
      })
    }

    return NextResponse.json({ exhibit }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
