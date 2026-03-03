import { NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'

export async function POST() {
  try {
    const { supabase, user, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    const { error } = await supabase!
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user!.id)
      .eq('read', false)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
