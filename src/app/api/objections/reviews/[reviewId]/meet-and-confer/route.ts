import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { generateMeetAndConferNote } from '@/lib/templates/meet-and-confer-note'
import type { MeetAndConferItem } from '@/lib/templates/meet-and-confer-note'

export const runtime = 'nodejs'

// POST /api/objections/reviews/:reviewId/meet-and-confer/generate
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const { reviewId } = await params
    const { supabase, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    // Fetch review (RLS ensures ownership)
    const { data: review, error: reviewError } = await supabase!
      .from('objection_reviews')
      .select('id, case_id, pack_id, response_id, status')
      .eq('id', reviewId)
      .single()

    if (reviewError || !review) {
      return NextResponse.json(
        { error: 'Objection review not found' },
        { status: 404 }
      )
    }

    // Guard: review must be completed
    if (review.status !== 'completed') {
      return NextResponse.json(
        { error: 'Review must be confirmed before generating a meet-and-confer note', current_status: review.status },
        { status: 409 }
      )
    }

    // Load follow-up items
    const { data: followUpItems, error: itemsError } = await supabase!
      .from('objection_items')
      .select('item_type, item_no, labels, neutral_summary')
      .eq('review_id', reviewId)
      .eq('follow_up_flag', true)
      .order('item_type')
      .order('item_no')

    if (itemsError) {
      return NextResponse.json(
        { error: 'Failed to load objection items', details: itemsError.message },
        { status: 500 }
      )
    }

    if (!followUpItems || followUpItems.length === 0) {
      return NextResponse.json(
        { error: 'No items flagged for follow-up. Flag at least one item before generating a note.' },
        { status: 422 }
      )
    }

    // Load discovery pack title
    const { data: pack } = await supabase!
      .from('discovery_packs')
      .select('title')
      .eq('id', review.pack_id)
      .single()

    // Load discovery response date
    const { data: response } = await supabase!
      .from('discovery_responses')
      .select('received_at')
      .eq('id', review.response_id)
      .single()

    // Generate the note
    const templateItems: MeetAndConferItem[] = followUpItems.map((item) => ({
      item_type: item.item_type,
      item_no: item.item_no,
      labels: item.labels ?? [],
      neutral_summary: item.neutral_summary ?? '',
    }))

    const { subject, body } = generateMeetAndConferNote({
      pack_title: pack?.title ?? 'Discovery Pack',
      response_date: response?.received_at ?? null,
      items: templateItems,
    })

    // Compute sha256
    const sha256 = createHash('sha256').update(body, 'utf8').digest('hex')

    // Insert meet_and_confer_drafts row
    const { data: draft, error: insertError } = await supabase!
      .from('meet_and_confer_drafts')
      .insert({
        case_id: review.case_id,
        pack_id: review.pack_id,
        review_id: reviewId,
        status: 'draft',
        content_text: body,
        sha256,
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json(
        { error: 'Failed to save draft', details: insertError.message },
        { status: 500 }
      )
    }

    // Write timeline event
    const { error: eventError } = await supabase!.from('task_events').insert({
      case_id: review.case_id,
      kind: 'meet_and_confer_generated',
      payload: {
        review_id: reviewId,
        draft_id: draft.id,
        items_count: followUpItems.length,
      },
    })
    if (eventError) console.error('Failed to write timeline event:', eventError.message)

    return NextResponse.json(
      { draft: { ...draft, subject } },
      { status: 201 }
    )
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
