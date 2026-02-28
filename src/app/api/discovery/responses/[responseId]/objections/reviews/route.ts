import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { createObjectionReviewSchema } from '@/lib/schemas/objection-reviews'

export const runtime = 'nodejs'

// POST /api/discovery/responses/:responseId/objections/reviews — create an objection review
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ responseId: string }> }
) {
  try {
    const { responseId } = await params
    const { supabase, user, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    const body = await request.json()
    const parsed = createObjectionReviewSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 422 }
      )
    }

    const { pack_id } = parsed.data

    // Fetch discovery_response by responseId (RLS ensures ownership)
    const { data: response, error: responseError } = await supabase!
      .from('discovery_responses')
      .select('id, pack_id')
      .eq('id', responseId)
      .single()

    if (responseError || !response) {
      return NextResponse.json(
        { error: 'Discovery response not found' },
        { status: 404 }
      )
    }

    // Verify provided pack_id matches the response's pack_id
    if (response.pack_id !== pack_id) {
      return NextResponse.json(
        { error: 'pack_id does not match the response\'s pack' },
        { status: 422 }
      )
    }

    // Get case_id from discovery_packs via the pack_id
    const { data: pack, error: packError } = await supabase!
      .from('discovery_packs')
      .select('id, case_id')
      .eq('id', pack_id)
      .single()

    if (packError || !pack) {
      return NextResponse.json(
        { error: 'Discovery pack not found' },
        { status: 404 }
      )
    }

    // Insert objection_reviews row
    const { data: review, error: insertError } = await supabase!
      .from('objection_reviews')
      .insert({
        case_id: pack.case_id,
        pack_id,
        response_id: responseId,
        status: 'queued',
        created_by: user!.id,
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json(
        { error: 'Failed to create objection review', details: insertError.message },
        { status: 500 }
      )
    }

    // Write timeline event
    await supabase!.from('task_events').insert({
      case_id: pack.case_id,
      kind: 'objection_review_created',
      payload: {
        review_id: review.id,
        pack_id,
        response_id: responseId,
      },
    })

    return NextResponse.json({ review }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
