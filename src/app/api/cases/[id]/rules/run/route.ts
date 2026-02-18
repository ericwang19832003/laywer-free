import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { runGatekeeperSchema } from '@/lib/schemas/gatekeeper'
import { runAndApplyGatekeeper } from '@/lib/rules/apply-gatekeeper'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const { supabase, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    // Parse optional body (may be empty)
    let now: Date | undefined
    try {
      const body = await request.json()
      const parsed = runGatekeeperSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Validation failed', details: parsed.error.issues },
          { status: 422 }
        )
      }
      if (parsed.data.now) {
        now = new Date(parsed.data.now)
      }
    } catch {
      // Empty body is fine — use server time
    }

    // Verify case exists (RLS handles ownership)
    const { data: caseData, error: caseError } = await supabase!
      .from('cases')
      .select('id')
      .eq('id', caseId)
      .single()

    if (caseError || !caseData) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      )
    }

    const result = await runAndApplyGatekeeper(supabase!, caseId, now)

    return NextResponse.json(result)
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
