import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { processClusterOpinions } from '@/lib/courtlistener/pipeline'
import { safeError } from '@/lib/security/safe-log'

export const runtime = 'nodejs'
export const maxDuration = 60  // opinion processing can take time

// GET: List saved authorities for this case
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase } = auth

    // Verify case
    const { error: caseError } = await supabase
      .from('cases').select('id').eq('id', caseId).single()
    if (caseError) return NextResponse.json({ error: 'Case not found' }, { status: 404 })

    const { data: authorities, error } = await supabase
      .from('case_authorities')
      .select(`
        id,
        cluster_id,
        status,
        added_at,
        cl_case_clusters (
          case_name,
          court_id,
          court_name,
          date_filed,
          citations,
          snippet
        )
      `)
      .eq('case_id', caseId)
      .order('added_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch authorities' }, { status: 500 })
    }

    return NextResponse.json({ authorities: authorities ?? [] })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: Save a cluster as authority + trigger opinion processing
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase } = auth

    // Verify case
    const { error: caseError } = await supabase
      .from('cases').select('id').eq('id', caseId).single()
    if (caseError) return NextResponse.json({ error: 'Case not found' }, { status: 404 })

    const body = await request.json()
    const { cluster_id } = body as { cluster_id?: number }

    if (!cluster_id || typeof cluster_id !== 'number') {
      return NextResponse.json({ error: 'cluster_id is required' }, { status: 400 })
    }

    // Check cluster exists in our cache
    const { data: cluster } = await supabase
      .from('cl_case_clusters')
      .select('cluster_id')
      .eq('cluster_id', cluster_id)
      .maybeSingle()

    if (!cluster) {
      return NextResponse.json({ error: 'Cluster not found. Search for it first.' }, { status: 404 })
    }

    // Upsert authority link
    const { data: authority, error: upsertError } = await supabase
      .from('case_authorities')
      .upsert({
        case_id: caseId,
        cluster_id,
        status: 'pending',
      }, { onConflict: 'case_id,cluster_id' })
      .select('id, status')
      .single()

    if (upsertError) {
      return NextResponse.json({ error: 'Failed to save authority' }, { status: 500 })
    }

    // Process opinions (fetch, chunk, embed) — inline for now
    try {
      await processClusterOpinions(supabase, cluster_id)

      // Mark as ready
      await supabase
        .from('case_authorities')
        .update({ status: 'ready' })
        .eq('case_id', caseId)
        .eq('cluster_id', cluster_id)
    } catch (err) {
      safeError('research/authority', err)
      await supabase
        .from('case_authorities')
        .update({ status: 'failed' })
        .eq('case_id', caseId)
        .eq('cluster_id', cluster_id)
    }

    return NextResponse.json({ authority }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE: Remove authority
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase } = auth

    const body = await request.json()
    const { cluster_id } = body as { cluster_id?: number }

    if (!cluster_id) {
      return NextResponse.json({ error: 'cluster_id is required' }, { status: 400 })
    }

    await supabase
      .from('case_authorities')
      .delete()
      .eq('case_id', caseId)
      .eq('cluster_id', cluster_id)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
