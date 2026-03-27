import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { processClusterOpinions } from '@/lib/courtlistener/pipeline'
import { computeJobBackoffMs } from '@/lib/courtlistener/job-utils'
import { safeError } from '@/lib/security/safe-log'
import { safeEquals } from '@/lib/security/timing-safe'

const BATCH_SIZE = 5

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 })
  }
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !safeEquals(authHeader, `Bearer ${cronSecret}`)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const now = new Date().toISOString()

  const { data: jobs, error } = await supabase
    .from('cl_authority_jobs')
    .select('id, case_id, cluster_id, attempts')
    .eq('status', 'pending')
    .lte('next_run_at', now)
    .order('created_at', { ascending: true })
    .limit(BATCH_SIZE)

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch jobs', details: error.message }, { status: 500 })
  }

  if (!jobs || jobs.length === 0) {
    return NextResponse.json({ processed: 0, succeeded: 0, failed: 0 })
  }

  let succeeded = 0
  let failed = 0

  for (const job of jobs) {
    const attempts = (job.attempts ?? 0) + 1
    await supabase
      .from('cl_authority_jobs')
      .update({ status: 'processing', attempts, updated_at: new Date().toISOString() })
      .eq('id', job.id)

    try {
      await processClusterOpinions(supabase, job.cluster_id)

      await supabase
        .from('case_authorities')
        .update({ status: 'ready' })
        .eq('case_id', job.case_id)
        .eq('cluster_id', job.cluster_id)

      await supabase
        .from('cl_authority_jobs')
        .update({ status: 'completed', updated_at: new Date().toISOString() })
        .eq('id', job.id)

      succeeded += 1
    } catch (err) {
      safeError('cron/research-precompute', err)
      const nextRunAt = new Date(Date.now() + computeJobBackoffMs(attempts)).toISOString()

      await supabase
        .from('cl_authority_jobs')
        .update({
          status: 'failed',
          last_error: err instanceof Error ? err.message : String(err),
          next_run_at: nextRunAt,
          updated_at: new Date().toISOString(),
        })
        .eq('id', job.id)

      await supabase
        .from('case_authorities')
        .update({ status: 'failed' })
        .eq('case_id', job.case_id)
        .eq('cluster_id', job.cluster_id)

      failed += 1
    }
  }

  return NextResponse.json({ processed: jobs.length, succeeded, failed })
}
