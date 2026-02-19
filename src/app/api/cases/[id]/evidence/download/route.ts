import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const { supabase, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    const evidenceId = request.nextUrl.searchParams.get('id')
    if (!evidenceId) {
      return NextResponse.json(
        { error: 'Evidence id is required' },
        { status: 422 }
      )
    }

    // Fetch evidence item (RLS ensures ownership)
    const { data: item, error: fetchError } = await supabase!
      .from('evidence_items')
      .select('storage_path, file_name')
      .eq('id', evidenceId)
      .eq('case_id', caseId)
      .single()

    if (fetchError || !item) {
      return NextResponse.json(
        { error: 'Evidence item not found' },
        { status: 404 }
      )
    }

    // Create a signed URL (valid for 60 seconds)
    const { data: signedUrl, error: urlError } = await supabase!.storage
      .from('case-documents')
      .createSignedUrl(item.storage_path, 60, {
        download: item.file_name,
      })

    if (urlError || !signedUrl) {
      return NextResponse.json(
        { error: 'Failed to generate download link' },
        { status: 500 }
      )
    }

    return NextResponse.json({ url: signedUrl.signedUrl })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
