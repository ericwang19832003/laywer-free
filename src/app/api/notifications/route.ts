import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'

export async function GET(request: NextRequest) {
  try {
    const { supabase, user, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    const url = new URL(request.url)
    const limit = Math.min(Number(url.searchParams.get('limit') ?? 20), 50)
    const unreadOnly = url.searchParams.get('unread') === 'true'

    let query = supabase!
      .from('notifications')
      .select('id, case_id, type, title, body, read, link, created_at')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (unreadOnly) {
      query = query.eq('read', false)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Also get unread count
    const { count } = await supabase!
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user!.id)
      .eq('read', false)

    return NextResponse.json({ notifications: data ?? [], unread_count: count ?? 0 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
