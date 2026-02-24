import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ binderId: string }> }
) {
  try {
    const { binderId } = await params
    const { supabase, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    // Fetch binder (RLS ensures ownership via case)
    const { data: binder, error: fetchError } = await supabase!
      .from('trial_binders')
      .select('storage_path, title')
      .eq('id', binderId)
      .eq('status', 'ready')
      .single()

    if (fetchError || !binder || !binder.storage_path) {
      return NextResponse.json(
        { error: 'Binder not found or not ready' },
        { status: 404 }
      )
    }

    const { data: signedUrl, error: urlError } = await supabase!.storage
      .from('case-documents')
      .createSignedUrl(binder.storage_path, 60, {
        download: `${binder.title || 'Trial_Binder'}.zip`,
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
