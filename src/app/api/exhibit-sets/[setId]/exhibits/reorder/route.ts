import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { reorderExhibitsSchema } from '@/lib/schemas/exhibits'

export const runtime = 'nodejs'

// PATCH /api/exhibit-sets/:setId/exhibits/reorder — reorder exhibits
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ setId: string }> }
) {
  try {
    const { setId } = await params
    const { supabase, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    const body = await request.json()
    const parsed = reorderExhibitsSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 422 }
      )
    }

    const { ordered_exhibit_ids } = parsed.data

    // Verify exhibit set exists and get case_id (RLS handles ownership)
    const { data: setData, error: setError } = await supabase!
      .from('exhibit_sets')
      .select('id, case_id')
      .eq('id', setId)
      .single()

    if (setError || !setData) {
      return NextResponse.json({ error: 'Exhibit set not found' }, { status: 404 })
    }

    // Verify all exhibit IDs belong to this set
    const { data: existing, error: fetchError } = await supabase!
      .from('exhibits')
      .select('id')
      .eq('exhibit_set_id', setId)

    if (fetchError) {
      return NextResponse.json(
        { error: 'Failed to verify exhibits', details: fetchError.message },
        { status: 500 }
      )
    }

    const existingIds = new Set(existing?.map((e) => e.id) ?? [])
    const invalid = ordered_exhibit_ids.filter((id) => !existingIds.has(id))

    if (invalid.length > 0) {
      return NextResponse.json(
        { error: 'Some exhibit IDs do not belong to this set', details: { invalid_ids: invalid } },
        { status: 422 }
      )
    }

    // Update sort_order sequentially (1..N)
    // Use individual updates — exhibit count is small (≤26 for alpha, typically <50)
    for (let i = 0; i < ordered_exhibit_ids.length; i++) {
      const { error: updateError } = await supabase!
        .from('exhibits')
        .update({ sort_order: i + 1 })
        .eq('id', ordered_exhibit_ids[i])
        .eq('exhibit_set_id', setId) // belt-and-suspenders

      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to update sort order', details: updateError.message },
          { status: 500 }
        )
      }
    }

    // Write timeline event
    await supabase!.from('task_events').insert({
      case_id: setData.case_id,
      kind: 'exhibits_reordered',
      payload: {
        exhibit_set_id: setId,
        ordered_exhibit_ids,
      },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
