import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { updateExhibitSchema } from '@/lib/schemas/exhibits'

export const runtime = 'nodejs'

// PATCH /api/exhibits/:exhibitId — update exhibit title/description
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ exhibitId: string }> }
) {
  try {
    const { exhibitId } = await params
    const { supabase, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    const body = await request.json()
    const parsed = updateExhibitSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 422 }
      )
    }

    const { data: exhibit, error: updateError } = await supabase!
      .from('exhibits')
      .update(parsed.data)
      .eq('id', exhibitId)
      .select()
      .single()

    if (updateError || !exhibit) {
      if (updateError?.code === 'PGRST116') {
        return NextResponse.json({ error: 'Exhibit not found' }, { status: 404 })
      }
      return NextResponse.json(
        { error: 'Failed to update exhibit', details: updateError?.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ exhibit })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/exhibits/:exhibitId — remove an exhibit
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ exhibitId: string }> }
) {
  try {
    const { exhibitId } = await params
    const { supabase, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    // Fetch exhibit + case_id for timeline event (RLS ensures ownership)
    const { data: exhibit, error: fetchError } = await supabase!
      .from('exhibits')
      .select('id, exhibit_set_id, exhibit_no, evidence_item_id')
      .eq('id', exhibitId)
      .single()

    if (fetchError || !exhibit) {
      return NextResponse.json({ error: 'Exhibit not found' }, { status: 404 })
    }

    // Look up case_id via exhibit_set
    const { data: setData } = await supabase!
      .from('exhibit_sets')
      .select('case_id')
      .eq('id', exhibit.exhibit_set_id)
      .single()

    // Delete the exhibit row
    const { error: deleteError } = await supabase!
      .from('exhibits')
      .delete()
      .eq('id', exhibitId)

    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to remove exhibit', details: deleteError.message },
        { status: 500 }
      )
    }

    // Write timeline event
    if (setData) {
      await supabase!.from('task_events').insert({
        case_id: setData.case_id,
        kind: 'exhibit_removed',
        payload: {
          exhibit_set_id: exhibit.exhibit_set_id,
          exhibit_id: exhibitId,
          exhibit_no: exhibit.exhibit_no,
          evidence_item_id: exhibit.evidence_item_id,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
