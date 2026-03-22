import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { z } from 'zod'

const outcomeSchema = z.object({
  outcome: z.enum(['won', 'settled', 'lost', 'dropped', 'ongoing']),
  outcome_notes: z.string().max(2000).optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase } = auth

    const body = await request.json()
    const parsed = outcomeSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 422 }
      )
    }

    const { outcome, outcome_notes } = parsed.data

    const { data, error } = await supabase
      .from('cases')
      .update({
        outcome,
        outcome_notes: outcome_notes ?? null,
        outcome_reported_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('id, outcome, outcome_reported_at, outcome_notes')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update outcome', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ case: data })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase } = auth

    const { data, error } = await supabase
      .from('cases')
      .select('id, outcome, outcome_reported_at, outcome_notes')
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Case not found', details: error.message },
        { status: 404 }
      )
    }

    return NextResponse.json({ case: data })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
