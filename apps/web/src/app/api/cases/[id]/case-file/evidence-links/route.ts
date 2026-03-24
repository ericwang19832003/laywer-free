import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { createEvidenceLinkSchema } from '@/lib/schemas/case-file'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase } = auth

    await params

    const body = await request.json()
    const parsed = createEvidenceLinkSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 422 }
      )
    }

    const { data: link, error } = await supabase
      .from('discovery_item_evidence_links')
      .insert(parsed.data)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Link already exists' },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to create link', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ link }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase } = auth

    await params

    const link_id = request.nextUrl.searchParams.get('link_id')
    if (!link_id) {
      return NextResponse.json(
        { error: 'link_id is required' },
        { status: 422 }
      )
    }

    const { error } = await supabase
      .from('discovery_item_evidence_links')
      .delete()
      .eq('id', link_id)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete link', details: error.message },
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
