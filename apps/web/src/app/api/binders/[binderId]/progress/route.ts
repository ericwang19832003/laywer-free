import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ binderId: string }> }
) {
  try {
    const { binderId } = await params
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase } = auth

    const { data: steps, error: queryError } = await supabase
      .from('binder_build_steps')
      .select('*')
      .eq('binder_id', binderId)
      .order('started_at', { ascending: true })

    if (queryError) {
      return NextResponse.json(
        { error: 'Failed to fetch build steps' },
        { status: 500 }
      )
    }

    const total = steps?.length ?? 0
    const done = steps?.filter((s) => s.status === 'done').length ?? 0
    const failed = steps?.find((s) => s.status === 'failed') ?? null
    const percentage = total > 0 ? Math.round((done / total) * 100) : 0

    return NextResponse.json({
      steps,
      percentage,
      is_complete: done === total && total > 0,
      has_error: !!failed,
      error_step: failed?.step_key || null,
      error_message: failed?.error || null,
    })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
