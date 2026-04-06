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

    const { data: insights } = await supabase
      .from('case_insights')
      .select('id, insight_type, title, body, priority, created_at')
      .eq('case_id', caseId)
      .eq('dismissed', false)
      .order('created_at', { ascending: false })
      .limit(5)

    return NextResponse.json({ insights: insights ?? [] })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase } = auth

    const { insightId } = await request.json()
    if (!insightId) return NextResponse.json({ error: 'insightId required' }, { status: 422 })

    await supabase
      .from('case_insights')
      .update({ dismissed: true })
      .eq('id', insightId)
      .eq('case_id', caseId)

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
