import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'

export const runtime = 'nodejs'

// GET /api/discovery/examples?dispute_type=...&item_type=...
export async function GET(request: NextRequest) {
  try {
    const { supabase, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    const { searchParams } = request.nextUrl
    const disputeType = searchParams.get('dispute_type') || 'general'
    const itemType = searchParams.get('item_type')

    let query = supabase!
      .from('discovery_examples')
      .select('id, item_type, title, example_text')
      .eq('jurisdiction', 'TX')
      .eq('dispute_type', disputeType)
      .order('sort_order', { ascending: true })

    if (itemType) {
      query = query.eq('item_type', itemType)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch examples', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ examples: data ?? [] })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
