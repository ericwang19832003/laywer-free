import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { computeAndStoreCaseHealth } from '@/lib/rules/compute-case-health'
import { evaluateHealthAlert, insertHealthAlertIfNeeded } from '@/lib/rules/health-alert'

const BATCH_SIZE = 5
const PAGE_SIZE = 1000

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

  // Load all active cases with pagination to avoid Supabase row limits
  const allCases: { id: string }[] = []
  let from = 0
  while (true) {
    const { data, error } = await supabase
      .from('cases')
      .select('id')
      .eq('status', 'active')
      .range(from, from + PAGE_SIZE - 1)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch cases', details: error.message },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) break
    allCases.push(...data)
    if (data.length < PAGE_SIZE) break
    from += PAGE_SIZE
  }

  if (allCases.length === 0) {
    return NextResponse.json({ processed: 0, succeeded: 0, failed: 0, errors: [] })
  }

  // Process in batches of BATCH_SIZE for bounded concurrency
  let succeeded = 0
  let failed = 0
  let healthAlertsTriggered = 0
  const errors: { case_id: string; message: string }[] = []

  for (let i = 0; i < allCases.length; i += BATCH_SIZE) {
    const batch = allCases.slice(i, i + BATCH_SIZE)
    const results = await Promise.allSettled(
      batch.map((c) => computeAndStoreCaseHealth(supabase, c.id, now))
    )

    for (let j = 0; j < results.length; j++) {
      const result = results[j]
      if (result.status === 'fulfilled') {
        succeeded++

        // Evaluate and insert health alert if score is concerning
        try {
          const action = evaluateHealthAlert(batch[j].id, result.value.overall_score, now)
          if (action) {
            const inserted = await insertHealthAlertIfNeeded(supabase, action)
            if (inserted) {
              healthAlertsTriggered++
              await supabase.from('task_events').insert({
                case_id: batch[j].id,
                kind: 'health_alert_triggered',
                payload: {
                  escalation_level: action.escalation_level,
                  overall_score: result.value.overall_score,
                },
              })
            }
          }
        } catch (alertErr) {
          console.error(`[cron/health] Health alert failed for case ${batch[j].id}:`, alertErr)
        }
      } else {
        failed++
        const err = result.reason
        errors.push({
          case_id: batch[j].id,
          message: err instanceof Error ? err.message : String(err),
        })
        console.error(`[cron/health] Failed for case ${batch[j].id}:`, err)
      }
    }
  }

  return NextResponse.json({
    processed: allCases.length,
    succeeded,
    failed,
    healthAlertsTriggered,
    errors,
  })
}
