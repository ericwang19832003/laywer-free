import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
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
        pinned,
        folder_id,
        tags,
        added_at,
        cl_case_clusters (
          case_name,
          court_id,
          court_name,
          date_filed,
          citations,
          snippet
        ),
        authority_folders (
          id,
          name
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

    // Enqueue background processing job
    const { error: jobError } = await supabase
      .from('cl_authority_jobs')
      .upsert({
        case_id: caseId,
        cluster_id,
        status: 'pending',
        attempts: 0,
        last_error: null,
        next_run_at: new Date().toISOString(),
      }, { onConflict: 'case_id,cluster_id' })

    if (jobError) {
      safeError('research/authority', jobError)
    }

    return NextResponse.json({ authority }, { status: 202 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH: Update authority metadata (pinned, folder, tags)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase } = auth

    const body = await request.json()
    const { cluster_id, pinned, folder_id, tags } = body as {
      cluster_id?: number
      pinned?: boolean
      folder_id?: string | null
      tags?: string[]
    }

    if (!cluster_id || typeof cluster_id !== 'number') {
      return NextResponse.json({ error: 'cluster_id is required' }, { status: 400 })
    }

    const update: Record<string, unknown> = {}
    if (typeof pinned === 'boolean') update.pinned = pinned
    if (typeof folder_id === 'string' || folder_id === null) update.folder_id = folder_id
    if (Array.isArray(tags)) update.tags = tags

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('case_authorities')
      .update(update)
      .eq('case_id', caseId)
      .eq('cluster_id', cluster_id)
      .select(`
        id,
        cluster_id,
        status,
        pinned,
        folder_id,
        tags,
        added_at,
        cl_case_clusters (
          case_name,
          court_id,
          court_name,
          date_filed,
          citations,
          snippet
        ),
        authority_folders (
          id,
          name
        )
      `)
      .maybeSingle()

    if (error || !data) {
      return NextResponse.json({ error: 'Failed to update authority' }, { status: 500 })
    }

    return NextResponse.json({ authority: data })
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
