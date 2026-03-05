import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase } = auth

    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('id')
      .eq('id', id)
      .single()

    if (caseError || !caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    const { error } = await supabase
      .from('cases')
      .update({ status: 'archived' })
      .eq('id', id)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete case', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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
    const { court_type } = body

    if (!court_type || !['jp', 'county', 'district', 'federal'].includes(court_type)) {
      return NextResponse.json(
        { error: 'Invalid court_type' },
        { status: 422 }
      )
    }

    const { data, error } = await supabase
      .from('cases')
      .update({ court_type })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update case', details: error.message },
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
