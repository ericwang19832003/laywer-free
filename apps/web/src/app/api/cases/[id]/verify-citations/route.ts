import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { verifyCitations } from '@/lib/ai/citation-verifier'

const FOCUS_TYPES = new Set([
  'personal_injury',
  'debt_collection',
  'landlord_tenant',
])

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase } = auth

    // Verify the case exists and belongs to the user (RLS enforces ownership)
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('id, dispute_type')
      .eq('id', id)
      .single()

    if (caseError || !caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    if (!FOCUS_TYPES.has(caseData.dispute_type)) {
      return NextResponse.json(
        { error: 'Citation verification is only available for personal injury, debt collection, and landlord/tenant cases' },
        { status: 422 }
      )
    }

    const body = await request.json()
    const { documentText } = body

    if (!documentText || typeof documentText !== 'string') {
      return NextResponse.json(
        { error: 'documentText is required and must be a string' },
        { status: 422 }
      )
    }

    if (documentText.length > 100_000) {
      return NextResponse.json(
        { error: 'documentText exceeds maximum length of 100,000 characters' },
        { status: 422 }
      )
    }

    const citations = await verifyCitations(documentText)

    return NextResponse.json({ citations })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
