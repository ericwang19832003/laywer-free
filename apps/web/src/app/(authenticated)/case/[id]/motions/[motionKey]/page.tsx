import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { MOTION_CONFIGS } from '@lawyer-free/shared/motions/registry'
import { MotionBuilder } from '@/components/step/motion-builder'

export default async function MotionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; motionKey: string }>
  searchParams: Promise<{ motionId?: string }>
}) {
  const { id, motionKey } = await params
  const { motionId } = await searchParams

  // Validate motionKey exists in registry
  const config = MOTION_CONFIGS[motionKey]
  if (!config) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link
          href={`/case/${id}/motions`}
          className="text-sm text-warm-muted hover:text-warm-text mb-6 inline-block"
        >
          &larr; Back to Motions Hub
        </Link>
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <h2 className="text-lg font-semibold text-warm-text mb-2">
              Motion type not found
            </h2>
            <p className="text-sm text-warm-muted">
              We couldn&apos;t find a motion type matching &ldquo;{motionKey}
              &rdquo;. Please go back and try again.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const supabase = await createClient()

  // Fetch case data
  const { data: caseRow } = await supabase
    .from('cases')
    .select('court_type, county, role')
    .eq('id', id)
    .single()

  // If motionId is provided, fetch existing motion to resume
  let existingMotion: { facts?: Record<string, unknown> } | null = null
  if (motionId) {
    const { data } = await supabase
      .from('motions')
      .select('id, facts')
      .eq('id', motionId)
      .eq('case_id', id)
      .single()
    existingMotion = data
  }

  // If config has a taskKey, check if gatekeeper created a task for this case
  let gatekeeperTaskId: string | undefined
  if (config.taskKey) {
    const { data: task } = await supabase
      .from('tasks')
      .select('id, status')
      .eq('case_id', id)
      .eq('task_key', config.taskKey)
      .eq('status', 'todo')
      .maybeSingle()

    if (task) {
      gatekeeperTaskId = task.id
    }
  }

  return (
    <MotionBuilder
      config={config}
      caseId={id}
      taskId={gatekeeperTaskId}
      existingMetadata={
        (existingMotion?.facts as Record<string, unknown>) ?? undefined
      }
      caseData={caseRow ?? undefined}
    />
  )
}
