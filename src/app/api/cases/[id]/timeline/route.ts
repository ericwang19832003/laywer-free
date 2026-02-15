import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { supabase, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    const { searchParams } = new URL(request.url)
    const cursor = searchParams.get('cursor')
    const limitParam = searchParams.get('limit')
    const limit = Math.min(Math.max(parseInt(limitParam || '20', 10) || 20, 1), 50)

    // Build query: fetch limit + 1 to determine has_more
    let query = supabase!
      .from('task_events')
      .select('id, case_id, task_id, kind, payload, created_at, tasks(title)')
      .eq('case_id', id)
      .order('created_at', { ascending: false })
      .limit(limit + 1)

    if (cursor) {
      // Cursor is a created_at timestamp — fetch events older than the cursor
      query = query.lt('created_at', cursor)
    }

    const { data: events, error } = await query

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch timeline', details: error.message },
        { status: 500 }
      )
    }

    const hasMore = (events?.length || 0) > limit
    const paginatedEvents = events?.slice(0, limit) || []

    // Flatten joined task title
    const formattedEvents = paginatedEvents.map((event) => {
      const { tasks, ...rest } = event as Record<string, unknown>
      return {
        ...rest,
        task_title: (tasks as { title: string } | null)?.title || null,
      }
    })

    const nextCursor = hasMore
      ? paginatedEvents[paginatedEvents.length - 1]?.created_at
      : null

    return NextResponse.json({
      events: formattedEvents,
      next_cursor: nextCursor,
      has_more: hasMore,
    })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
