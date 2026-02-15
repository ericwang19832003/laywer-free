import { NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { supabase, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    // Verify case exists (RLS handles ownership)
    const { data: caseData, error: caseError } = await supabase!
      .from('cases')
      .select('id')
      .eq('id', id)
      .single()

    if (caseError || !caseData) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      )
    }

    // Fetch ALL task_events for the case
    const { data: events, error: eventsError } = await supabase!
      .from('task_events')
      .select('id, case_id, task_id, kind, payload, created_at, tasks(title)')
      .eq('case_id', id)
      .order('created_at', { ascending: true })

    if (eventsError) {
      return NextResponse.json(
        { error: 'Failed to export timeline', details: eventsError.message },
        { status: 500 }
      )
    }

    // Flatten joined task title
    const formattedEvents = (events || []).map((event) => {
      const { tasks, ...rest } = event as Record<string, unknown>
      return {
        ...rest,
        task_title: (tasks as { title: string } | null)?.title || null,
      }
    })

    return NextResponse.json({
      case_id: id,
      exported_at: new Date().toISOString(),
      events: formattedEvents,
    })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
