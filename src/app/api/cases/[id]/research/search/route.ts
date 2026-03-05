import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { getCourtListenerClient } from '@/lib/courtlistener/client'
import type { CLSearchFilters } from '@/lib/courtlistener/types'

export const runtime = 'nodejs'
export const maxDuration = 30

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const { supabase, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    // Verify case exists and user owns it
    const { data: caseData, error: caseError } = await supabase!
      .from('cases')
      .select('id, jurisdiction, dispute_type, court_type')
      .eq('id', caseId)
      .single()

    if (caseError || !caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    const body = await request.json()
    const { query, filters } = body as { query?: string; filters?: CLSearchFilters }

    if (!query || query.trim().length < 3) {
      return NextResponse.json({ error: 'Query must be at least 3 characters' }, { status: 400 })
    }

    // Build enriched query with case context
    const enrichedQuery = query.trim()

    // Check search cache
    const queryHash = createHash('sha256')
      .update(JSON.stringify({ query: enrichedQuery, filters: filters ?? {} }))
      .digest('hex')

    const { data: cached } = await supabase!
      .from('cl_search_cache')
      .select('results, expires_at')
      .eq('query_hash', queryHash)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle()

    if (cached) {
      return NextResponse.json({ results: cached.results, _meta: { source: 'cache' } })
    }

    // Call CourtListener Search API
    const client = getCourtListenerClient()
    const results = await client.search(enrichedQuery, filters)

    // Cache results (24h TTL)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    await supabase!
      .from('cl_search_cache')
      .upsert({
        query_hash: queryHash,
        query_text: enrichedQuery,
        results,
        expires_at: expiresAt,
      }, { onConflict: 'query_hash' })

    // Upsert cluster metadata for each result
    for (const r of results) {
      await supabase!
        .from('cl_case_clusters')
        .upsert({
          cluster_id: r.cluster_id,
          case_name: r.case_name,
          court_id: r.court_id,
          court_name: r.court_name,
          date_filed: r.date_filed || null,
          citations: JSON.stringify(r.citations),
          snippet: r.snippet,
          last_used_at: new Date().toISOString(),
        }, { onConflict: 'cluster_id' })
    }

    return NextResponse.json({ results, _meta: { source: 'courtlistener' } })
  } catch (err) {
    console.error('[research/search] Error:', err)
    return NextResponse.json({ error: 'Search failed. Please try again.' }, { status: 500 })
  }
}
