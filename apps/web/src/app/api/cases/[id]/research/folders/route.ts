import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { isUuid } from '@/lib/security/uuid'

export const runtime = 'nodejs'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase } = auth

    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('id')
      .eq('id', caseId)
      .single()

    if (caseError || !caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    const { data: folders, error } = await supabase
      .from('authority_folders')
      .select('id, name, created_at')
      .eq('case_id', caseId)
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch folders' }, { status: 500 })
    }

    return NextResponse.json({ folders: folders ?? [] })
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

    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('id')
      .eq('id', caseId)
      .single()

    if (caseError || !caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    const body = await request.json()
    const { name } = body as { name?: string }

    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: 'Folder name must be at least 2 characters' }, { status: 400 })
    }

    const { data: folder, error } = await supabase
      .from('authority_folders')
      .insert({ case_id: caseId, name: name.trim() })
      .select('id, name, created_at')
      .single()

    if (error || !folder) {
      return NextResponse.json({ error: 'Failed to create folder' }, { status: 500 })
    }

    return NextResponse.json({ folder }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase } = auth

    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('id')
      .eq('id', caseId)
      .single()

    if (caseError || !caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    const body = await request.json()
    const { folder_id } = body as { folder_id?: string }

    if (!folder_id || !isUuid(folder_id)) {
      return NextResponse.json({ error: 'Valid folder_id is required' }, { status: 400 })
    }

    await supabase
      .from('authority_folders')
      .delete()
      .eq('id', folder_id)
      .eq('case_id', caseId)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
