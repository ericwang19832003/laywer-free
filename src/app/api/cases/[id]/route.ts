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
    const { court_type, county, description } = body

    // Build partial update object — only include provided fields
    const updates: Record<string, unknown> = {}

    if (court_type !== undefined) {
      if (!['jp', 'county', 'district', 'federal'].includes(court_type)) {
        return NextResponse.json(
          { error: 'Invalid court_type' },
          { status: 422 }
        )
      }
      updates.court_type = court_type
    }

    if (county !== undefined) {
      if (county !== null && typeof county !== 'string') {
        return NextResponse.json(
          { error: 'Invalid county' },
          { status: 422 }
        )
      }
      updates.county = county
    }

    if (description !== undefined) {
      if (description !== null && typeof description !== 'string') {
        return NextResponse.json(
          { error: 'Invalid description' },
          { status: 422 }
        )
      }
      updates.description = description
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 422 }
      )
    }

    const { data, error } = await supabase
      .from('cases')
      .update(updates)
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
