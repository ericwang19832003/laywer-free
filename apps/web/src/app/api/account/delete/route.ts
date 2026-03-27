import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { user } = auth

    const body = await request.json()
    if (body.confirmation !== 'DELETE') {
      return NextResponse.json(
        { error: 'Must confirm with "DELETE"' },
        { status: 422 }
      )
    }

    // Use admin client to delete user (cascades to all data via FK constraints)
    const adminSupabase = createAdminClient()
    const { error } = await adminSupabase.auth.admin.deleteUser(user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
