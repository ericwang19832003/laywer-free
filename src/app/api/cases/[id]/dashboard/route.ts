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

    const { data, error } = await supabase!.rpc('get_case_dashboard', {
      p_case_id: id,
    })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch dashboard', details: error.message },
        { status: 500 }
      )
    }

    if (data === null) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
