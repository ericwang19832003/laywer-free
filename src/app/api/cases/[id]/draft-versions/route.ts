import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase } = auth

    const taskId = request.nextUrl.searchParams.get('taskId')
    if (!taskId) {
      return NextResponse.json({ error: 'taskId query param required' }, { status: 422 })
    }

    const { data: versions, error } = await supabase
      .from('draft_versions')
      .select('id, version_number, source, content, created_at')
      .eq('case_id', caseId)
      .eq('task_id', taskId)
      .order('version_number', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch versions' }, { status: 500 })
    }

    return NextResponse.json({ versions: versions ?? [] })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase } = auth

    const body = await request.json()
    const { taskId, content, source } = body as {
      taskId?: string
      content?: string
      source?: string
    }

    if (!taskId || !content) {
      return NextResponse.json(
        { error: 'taskId and content are required' },
        { status: 422 }
      )
    }

    const validSource = source === 'edited' ? 'edited' : 'generated'

    // Determine next version number
    const { data: latest } = await supabase
      .from('draft_versions')
      .select('version_number')
      .eq('case_id', caseId)
      .eq('task_id', taskId)
      .order('version_number', { ascending: false })
      .limit(1)
      .single()

    const nextVersion = (latest?.version_number ?? 0) + 1

    const { data: inserted, error } = await supabase
      .from('draft_versions')
      .insert({
        case_id: caseId,
        task_id: taskId,
        version_number: nextVersion,
        content,
        source: validSource,
      })
      .select('id, version_number, source, content, created_at')
      .single()

    if (error) {
      console.error('[draft-versions] Save failed', {
        caseId,
        taskId,
        versionNumber: nextVersion,
        source: validSource,
        dbError: error.message,
        dbCode: error.code,
      })
      return NextResponse.json(
        {
          saved: false,
          error: 'Your draft could not be saved. Please try again before regenerating.',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ saved: true, version: inserted })
  } catch (err) {
    console.error('[draft-versions] Unexpected error during save', {
      error: err instanceof Error ? err.message : String(err),
    })
    return NextResponse.json(
      {
        saved: false,
        error: 'Your draft could not be saved. Please try again before regenerating.',
      },
      { status: 500 }
    )
  }
}
