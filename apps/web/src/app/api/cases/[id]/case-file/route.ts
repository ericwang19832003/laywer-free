import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'

export const runtime = 'nodejs'

// GET /api/cases/:caseId/case-file — aggregated hub for all pipeline data
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase } = auth

    // Run all queries in parallel
    const [
      caseResult,
      evidenceResult,
      exhibitSetResult,
      discoveryResult,
      bindersResult,
      suggestionsResult,
      checklistResult,
    ] = await Promise.all([
      // 1. Case details
      supabase
        .from('cases')
        .select('id, dispute_type, state, role, county, status')
        .eq('id', caseId)
        .single(),

      // 2. Evidence items (with count)
      supabase
        .from('evidence_items')
        .select('id, label', { count: 'exact' })
        .eq('case_id', caseId),

      // 3. Exhibit set (one per case)
      supabase
        .from('exhibit_sets')
        .select('id, numbering_style, next_number')
        .eq('case_id', caseId)
        .maybeSingle(),

      // 5. Discovery packs
      supabase
        .from('discovery_packs')
        .select('id, title, status')
        .eq('case_id', caseId)
        .order('created_at', { ascending: false }),

      // 6. Trial binders
      supabase
        .from('trial_binders')
        .select('id, title, status, version, created_at')
        .eq('case_id', caseId)
        .order('created_at', { ascending: false }),

      // 7. Active suggestions (not dismissed)
      supabase
        .from('case_file_suggestions')
        .select('*')
        .eq('case_id', caseId)
        .eq('dismissed', false)
        .order('created_at', { ascending: false })
        .limit(5),

      // 8. Checklist with nested items
      supabase
        .from('case_file_checklists')
        .select('*, case_file_checklist_items(*)')
        .eq('case_id', caseId)
        .maybeSingle(),
    ])

    // 404 if case not found
    if (caseResult.error || !caseResult.data) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    // Count exhibits via the exhibit set (exhibits belong to exhibit_sets, not cases)
    let exhibitsCount = 0
    if (exhibitSetResult.data) {
      const { count } = await supabase
        .from('exhibits')
        .select('id', { count: 'exact', head: true })
        .eq('exhibit_set_id', exhibitSetResult.data.id)

      exhibitsCount = count ?? 0
    }

    const evidenceCount = evidenceResult.count ?? 0
    const discoveryPacks = discoveryResult.data ?? []
    const binders = bindersResult.data ?? []

    return NextResponse.json({
      case: caseResult.data,
      pipeline: {
        collect: { evidence_count: evidenceCount },
        organize: {
          exhibit_set: exhibitSetResult.data ?? null,
          exhibits_count: exhibitsCount,
        },
        discover: { discovery_packs_count: discoveryPacks.length },
        prepare: { trial_binders_count: binders.length },
      },
      suggestions: suggestionsResult.data ?? [],
      checklist: checklistResult.data ?? null,
    })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
