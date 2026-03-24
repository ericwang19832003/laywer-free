import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import {
  generateStaticSuggestions,
  type PipelineState,
} from '@/lib/ai/case-file-suggestions'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase } = auth

    const now = new Date()
    const in14Days = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)

    // ── Gather pipeline state with parallel queries ──────────────

    const [
      caseResult,
      evidenceCountResult,
      exhibitCountResult,
      discoveryResult,
      binderResult,
      flaggedResult,
      deadlineResult,
    ] = await Promise.all([
      // Case (dispute_type)
      supabase
        .from('cases')
        .select('dispute_type')
        .eq('id', caseId)
        .single(),

      // Evidence count
      supabase
        .from('evidence_items')
        .select('id', { count: 'exact', head: true })
        .eq('case_id', caseId),

      // Exhibit count via exhibit_sets → exhibits join
      supabase
        .from('exhibit_sets')
        .select('exhibits(id)', { count: 'exact', head: true })
        .eq('case_id', caseId),

      // Discovery packs (id, status)
      supabase
        .from('discovery_packs')
        .select('id, status')
        .eq('case_id', caseId),

      // Latest trial binder
      supabase
        .from('trial_binders')
        .select('id, created_at')
        .eq('case_id', caseId)
        .order('created_at', { ascending: false })
        .limit(1),

      // Flagged objection items (follow_up_flag = true) via objection_reviews
      supabase
        .from('objection_items')
        .select('id, objection_reviews!inner(case_id)', {
          count: 'exact',
          head: true,
        })
        .eq('objection_reviews.case_id', caseId)
        .eq('follow_up_flag', true),

      // Approaching deadlines (next 14 days)
      supabase
        .from('deadlines')
        .select('id', { count: 'exact', head: true })
        .eq('case_id', caseId)
        .gte('due_at', now.toISOString())
        .lte('due_at', in14Days.toISOString()),
    ])

    // ── Validate case exists ─────────────────────────────────────

    if (caseResult.error || !caseResult.data) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    // ── Compute exhibit count properly ───────────────────────────
    // The join-based count above counts exhibit_sets rows, not exhibits.
    // Query exhibits through exhibit_sets for this case instead.

    const { data: exhibitSets } = await supabase
      .from('exhibit_sets')
      .select('id')
      .eq('case_id', caseId)

    let exhibitCount = 0
    if (exhibitSets && exhibitSets.length > 0) {
      const setIds = exhibitSets.map((s) => s.id)
      const { count } = await supabase
        .from('exhibits')
        .select('id', { count: 'exact', head: true })
        .in('exhibit_set_id', setIds)
      exhibitCount = count ?? 0
    }

    // ── Derive evidence_changed_since_binder ─────────────────────

    const evidenceCount = evidenceCountResult.count ?? 0
    const discoveryPacks = discoveryResult.data ?? []
    const binders = binderResult.data ?? []
    const latestBinder = binders[0] ?? null

    let evidenceChangedSinceBinder = false
    if (latestBinder && evidenceCount > 0) {
      const { count: newerCount } = await supabase
        .from('evidence_items')
        .select('id', { count: 'exact', head: true })
        .eq('case_id', caseId)
        .gt('created_at', latestBinder.created_at)
      evidenceChangedSinceBinder = (newerCount ?? 0) > 0
    }

    // ── Build PipelineState ──────────────────────────────────────

    const state: PipelineState = {
      dispute_type: caseResult.data.dispute_type ?? 'unknown',
      evidence_count: evidenceCount,
      exhibited_count: exhibitCount,
      unexhibited_count: Math.max(0, evidenceCount - exhibitCount),
      discovery_pack_count: discoveryPacks.length,
      discovery_packs_complete:
        discoveryPacks.length > 0 &&
        discoveryPacks.every(
          (p) => p.status === 'served' || p.status === 'response_received'
        ),
      binder_count: binders.length,
      latest_binder_at: latestBinder?.created_at ?? null,
      evidence_changed_since_binder: evidenceChangedSinceBinder,
      flagged_objections: flaggedResult.count ?? 0,
      approaching_deadlines: deadlineResult.count ?? 0,
    }

    // ── Generate suggestions ─────────────────────────────────────

    const suggestions = generateStaticSuggestions(state)

    // ── Delete old non-dismissed suggestions for this case ───────

    await supabase
      .from('case_file_suggestions')
      .delete()
      .eq('case_id', caseId)
      .eq('dismissed', false)

    // ── Insert new suggestions ───────────────────────────────────

    if (suggestions.length > 0) {
      const rows = suggestions.map((s) => ({
        case_id: caseId,
        suggestion_type: 'next_step' as const,
        priority: s.priority,
        title: s.title,
        description: s.description,
        action_type: s.action_type,
        action_payload: s.action_payload,
      }))

      const { error: insertError } = await supabase
        .from('case_file_suggestions')
        .insert(rows)

      if (insertError) {
        return NextResponse.json(
          { error: 'Failed to insert suggestions', details: insertError.message },
          { status: 500 }
        )
      }
    }

    // ── Fetch and return fresh suggestions ───────────────────────

    const { data: fresh, error: fetchError } = await supabase
      .from('case_file_suggestions')
      .select('*')
      .eq('case_id', caseId)
      .eq('dismissed', false)
      .order('created_at', { ascending: false })
      .limit(5)

    if (fetchError) {
      return NextResponse.json(
        { error: 'Failed to fetch suggestions', details: fetchError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ suggestions: fresh })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
