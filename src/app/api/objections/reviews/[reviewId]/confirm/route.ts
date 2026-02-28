import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { confirmReviewSchema } from '@/lib/schemas/objection-classification'

// POST /api/objections/reviews/:reviewId/confirm — confirm reviewed items and complete the review
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const { reviewId } = await params
    const { supabase, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    // Fetch review (RLS ensures ownership)
    const { data: review, error: reviewError } = await supabase!
      .from('objection_reviews')
      .select('id, case_id, status')
      .eq('id', reviewId)
      .single()

    if (reviewError || !review) {
      return NextResponse.json(
        { error: 'Objection review not found' },
        { status: 404 }
      )
    }

    // Guard: status must be 'needs_review'
    if (review.status !== 'needs_review') {
      return NextResponse.json(
        { error: 'Review is not ready for confirmation', current_status: review.status },
        { status: 409 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const parsed = confirmReviewSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 422 }
      )
    }

    // Fetch all items for this review to verify completeness
    const { data: allItems, error: fetchItemsError } = await supabase!
      .from('objection_items')
      .select('id')
      .eq('review_id', reviewId)

    if (fetchItemsError) {
      return NextResponse.json(
        { error: 'Failed to fetch review items', details: fetchItemsError.message },
        { status: 500 }
      )
    }

    // Verify all items are accounted for (unless there are zero items)
    const expectedIds = new Set((allItems ?? []).map((i: { id: string }) => i.id))
    const submittedIds = new Set(parsed.data.items.map((i) => i.id))

    if (expectedIds.size > 0 && expectedIds.size !== submittedIds.size) {
      const missing = [...expectedIds].filter((id) => !submittedIds.has(id))
      return NextResponse.json(
        { error: 'All items must be included to confirm the review', missing_item_ids: missing },
        { status: 422 }
      )
    }

    // Update each item
    for (const item of parsed.data.items) {
      const { error: itemError } = await supabase!
        .from('objection_items')
        .update({
          labels: item.labels,
          neutral_summary: item.neutral_summary,
          follow_up_flag: item.follow_up_flag,
          status: 'reviewed',
        })
        .eq('id', item.id)
        .eq('review_id', reviewId)

      if (itemError) {
        return NextResponse.json(
          { error: 'Failed to update item', details: itemError.message, item_id: item.id },
          { status: 500 }
        )
      }
    }

    // Update review status to completed
    const { data: updatedReview, error: updateError } = await supabase!
      .from('objection_reviews')
      .update({ status: 'completed', error: null })
      .eq('id', reviewId)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update review status', details: updateError.message },
        { status: 500 }
      )
    }

    // Write timeline event
    const { error: eventError } = await supabase!.from('task_events').insert({
      case_id: review.case_id,
      kind: 'objection_review_confirmed',
      payload: {
        review_id: reviewId,
        items_confirmed: parsed.data.items.length,
        follow_ups: parsed.data.items.filter((i) => i.follow_up_flag).length,
      },
    })
    if (eventError) console.error('Failed to write timeline event:', eventError.message)

    // Fetch updated items
    const { data: items } = await supabase!
      .from('objection_items')
      .select('*')
      .eq('review_id', reviewId)
      .order('item_type')
      .order('item_no')

    return NextResponse.json({ review: updatedReview, items })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
