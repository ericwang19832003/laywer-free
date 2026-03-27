import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; suggestionId: string }> }
) {
  try {
    const { suggestionId } = await params
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase } = auth

    const { data, error } = await supabase
      .from('case_file_suggestions')
      .update({ dismissed: true })
      .eq('id', suggestionId)
      .select()
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Suggestion not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ suggestion: data })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
