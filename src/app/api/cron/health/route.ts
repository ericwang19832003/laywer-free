import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { computeAndStoreCaseHealth } from '@/lib/rules/compute-case-health'

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 })
  }
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const now = new Date()

  // Load all active cases
  const { data: cases, error: casesError } = await supabase
    .from('cases')
    .select('id')
    .eq('status', 'active')

  if (casesError) {
    return NextResponse.json(
      { error: 'Failed to fetch cases', details: casesError.message },
      { status: 500 }
    )
  }

  if (!cases || cases.length === 0) {
    return NextResponse.json({ processed: 0, succeeded: 0, failed: 0, errors: [] })
  }

  // Process sequentially to avoid overwhelming Supabase with concurrent queries
  let succeeded = 0
  let failed = 0
  const errors: { case_id: string; message: string }[] = []

  for (const c of cases) {
    try {
      await computeAndStoreCaseHealth(supabase, c.id, now)
      succeeded++
    } catch (err) {
      failed++
      errors.push({
        case_id: c.id,
        message: err instanceof Error ? err.message : String(err),
      })
      console.error(`[cron/health] Failed for case ${c.id}:`, err)
    }
  }

  return NextResponse.json({
    processed: cases.length,
    succeeded,
    failed,
    errors,
  })
}
