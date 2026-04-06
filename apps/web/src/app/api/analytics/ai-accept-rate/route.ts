import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'

/**
 * AI Accept Rate API
 *
 * Queries case_analytics for AI generation events and returns
 * accept/reject/regenerate rates.
 *
 * Event types tracked via case_analytics:
 *   - ai_generation_used   → user accepted AI-generated content
 *   - ai_generation_edited  → user edited AI-generated content before accepting
 *
 * NOTE: There is currently no explicit "ai_generation_rejected" or
 * "ai_generation_regenerated" event type in the analytics schema.
 * Those events would need to be added to AnalyticsEvent in
 * src/lib/analytics/track.ts and emitted from the UI to get
 * full accept/reject/regenerate breakdowns.
 */

interface AiAcceptRateResponse {
  disputeType: string | null
  period: { days: number }
  totalGenerations: number
  accepted: number
  edited: number
  acceptRate: number
  editRate: number
  note: string | null
}

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase } = auth

    const { searchParams } = request.nextUrl
    const disputeType = searchParams.get('dispute_type')
    const days = parseInt(searchParams.get('days') ?? '30', 10)

    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)

    // If dispute_type is provided, first get case IDs of that type
    let caseIds: string[] | null = null
    if (disputeType) {
      const { data: cases, error: casesError } = await supabase
        .from('cases')
        .select('id')
        .eq('dispute_type', disputeType)

      if (casesError) {
        return NextResponse.json(
          { error: 'Failed to query cases', details: casesError.message },
          { status: 500 }
        )
      }
      caseIds = (cases ?? []).map((c: { id: string }) => c.id)

      if (caseIds.length === 0) {
        return NextResponse.json({
          disputeType,
          period: { days },
          totalGenerations: 0,
          accepted: 0,
          edited: 0,
          acceptRate: 0,
          editRate: 0,
          note: null,
        } satisfies AiAcceptRateResponse)
      }
    }

    // Query ai_generation_used events
    let acceptedQuery = supabase
      .from('case_analytics')
      .select('id', { count: 'exact', head: true })
      .eq('event_type', 'ai_generation_used')
      .gte('created_at', cutoff.toISOString())

    if (caseIds) {
      acceptedQuery = acceptedQuery.in('case_id', caseIds)
    }

    // Query ai_generation_edited events
    let editedQuery = supabase
      .from('case_analytics')
      .select('id', { count: 'exact', head: true })
      .eq('event_type', 'ai_generation_edited')
      .gte('created_at', cutoff.toISOString())

    if (caseIds) {
      editedQuery = editedQuery.in('case_id', caseIds)
    }

    const [acceptedResult, editedResult] = await Promise.all([
      acceptedQuery,
      editedQuery,
    ])

    if (acceptedResult.error || editedResult.error) {
      return NextResponse.json(
        {
          error: 'Failed to query analytics',
          details:
            acceptedResult.error?.message ?? editedResult.error?.message,
        },
        { status: 500 }
      )
    }

    const accepted = acceptedResult.count ?? 0
    const edited = editedResult.count ?? 0
    const totalGenerations = accepted + edited

    const acceptRate =
      totalGenerations > 0
        ? Math.round((accepted / totalGenerations) * 100)
        : 0
    const editRate =
      totalGenerations > 0
        ? Math.round((edited / totalGenerations) * 100)
        : 0

    // Check if reject/regenerate events are missing from the schema
    const missingEvents =
      'Reject and regenerate events are not yet tracked. ' +
      'Add "ai_generation_rejected" and "ai_generation_regenerated" to ' +
      'AnalyticsEvent in src/lib/analytics/track.ts and emit them from ' +
      'document generation UI components for full funnel visibility.'

    const response: AiAcceptRateResponse = {
      disputeType: disputeType ?? null,
      period: { days },
      totalGenerations,
      accepted,
      edited,
      acceptRate,
      editRate,
      note: missingEvents,
    }

    return NextResponse.json(response)
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
