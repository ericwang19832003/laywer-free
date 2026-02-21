import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { createExhibitSetSchema } from '@/lib/schemas/exhibits'

export const runtime = 'nodejs'

// POST /api/cases/:caseId/exhibit-sets — create an exhibit set
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const { supabase, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    const body = await request.json()
    const parsed = createExhibitSetSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 422 }
      )
    }

    // Verify case exists (RLS handles ownership)
    const { data: caseData, error: caseError } = await supabase!
      .from('cases')
      .select('id')
      .eq('id', caseId)
      .single()

    if (caseError || !caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    const title = parsed.data.name || null
    const numberingStyle = parsed.data.numbering_style || 'numeric'

    const { data: exhibitSet, error: insertError } = await supabase!
      .from('exhibit_sets')
      .insert({
        case_id: caseId,
        title,
        numbering_style: numberingStyle,
      })
      .select()
      .single()

    if (insertError) {
      // Unique constraint: one exhibit set per case
      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: 'An exhibit set already exists for this case' },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to create exhibit set', details: insertError.message },
        { status: 500 }
      )
    }

    // Write timeline event
    await supabase!.from('task_events').insert({
      case_id: caseId,
      kind: 'exhibit_set_created',
      payload: {
        exhibit_set_id: exhibitSet.id,
        title,
        numbering_style: numberingStyle,
      },
    })

    return NextResponse.json({ exhibit_set: exhibitSet }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/cases/:caseId/exhibit-sets — list exhibit sets for a case
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const { supabase, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    const { data, error } = await supabase!
      .from('exhibit_sets')
      .select('*')
      .eq('case_id', caseId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch exhibit sets', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ exhibit_sets: data })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
