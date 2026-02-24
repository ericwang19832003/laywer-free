import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { createBinderSchema } from '@/lib/schemas/trial-binders'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const { supabase, user, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

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

    // Validate body
    const body = await request.json()
    const parsed = createBinderSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 422 }
      )
    }

    // Verify exhibit set exists and belongs to this case
    const { data: exhibitSet, error: setError } = await supabase!
      .from('exhibit_sets')
      .select('id')
      .eq('id', parsed.data.exhibit_set_id)
      .eq('case_id', caseId)
      .single()

    if (setError || !exhibitSet) {
      return NextResponse.json(
        { error: 'Exhibit set not found for this case' },
        { status: 404 }
      )
    }

    // Guard: return existing binder if one is already queued or building
    const { data: existing } = await supabase!
      .from('trial_binders')
      .select('*')
      .eq('exhibit_set_id', parsed.data.exhibit_set_id)
      .in('status', ['queued', 'building'])
      .limit(1)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ binder: existing }, { status: 200 })
    }

    // Create trial_binders row
    const { data: binder, error: insertError } = await supabase!
      .from('trial_binders')
      .insert({
        case_id: caseId,
        exhibit_set_id: parsed.data.exhibit_set_id,
        title: parsed.data.title ?? 'Trial Binder',
        options: parsed.data.options,
        created_by: user!.id,
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json(
        { error: 'Failed to create binder', details: insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ binder }, { status: 201 })
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
    const { id: caseId } = await params
    const { supabase, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    const { data, error } = await supabase!
      .from('trial_binders')
      .select('*')
      .eq('case_id', caseId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch binders', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ binders: data })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
