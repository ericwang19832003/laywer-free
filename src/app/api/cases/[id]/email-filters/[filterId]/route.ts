import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; filterId: string }> }
) {
  const auth = await getAuthenticatedClient()
  if (!auth.ok) return auth.error
  const { supabase } = auth
  const { filterId } = await params

  const { error } = await supabase
    .from('case_email_filters')
    .delete()
    .eq('id', filterId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
