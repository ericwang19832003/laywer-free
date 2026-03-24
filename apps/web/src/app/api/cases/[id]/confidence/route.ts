import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { computeAndStoreConfidence } from '@/lib/confidence/compute'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase } = auth

    const { data: caseData } = await supabase
      .from('cases').select('id').eq('id', caseId).single()
    if (!caseData) return NextResponse.json({ error: 'Case not found' }, { status: 404 })

    const { data: existing } = await supabase
      .from('case_confidence_scores')
      .select('score, breakdown, computed_at')
      .eq('case_id', caseId)
      .order('computed_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    return NextResponse.json({ confidence: existing })
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

    const { data: caseData } = await supabase
      .from('cases').select('id').eq('id', caseId).single()
    if (!caseData) return NextResponse.json({ error: 'Case not found' }, { status: 404 })

    const result = await computeAndStoreConfidence(supabase, caseId)
    return NextResponse.json({ confidence: result })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
