import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { WORKFLOW_PHASES } from '@/lib/workflow-phases'

interface FunnelStep {
  taskKey: string
  title: string
  started: number
  completed: number
  skipped: number
  completionRate: number
  dropOffFromPrevious: number
}

interface DropOffPoint {
  taskKey: string
  title: string
  dropOff: number
}

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase } = auth

    const { searchParams } = request.nextUrl
    const disputeType = searchParams.get('dispute_type')
    const days = parseInt(searchParams.get('days') ?? '30', 10)

    if (!disputeType) {
      return NextResponse.json(
        { error: 'dispute_type query parameter is required' },
        { status: 400 }
      )
    }

    // Get the workflow sequence for this dispute type
    const phases = WORKFLOW_PHASES[disputeType]
    if (!phases) {
      return NextResponse.json(
        { error: `Unknown dispute type: ${disputeType}` },
        { status: 400 }
      )
    }

    // Flatten task keys in workflow order
    const orderedTaskKeys = phases.flatMap((p) => p.taskKeys)

    // Calculate the date cutoff
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)

    // Get all cases of this dispute type created within the period
    const { data: cases, error: casesError } = await supabase
      .from('cases')
      .select('id')
      .eq('dispute_type', disputeType)
      .gte('created_at', cutoff.toISOString())

    if (casesError) {
      return NextResponse.json(
        { error: 'Failed to query cases', details: casesError.message },
        { status: 500 }
      )
    }

    const caseIds = (cases ?? []).map((c: { id: string }) => c.id)
    const totalCases = caseIds.length

    if (totalCases === 0) {
      return NextResponse.json({
        disputeType,
        totalCases: 0,
        period: { days },
        funnel: orderedTaskKeys.map((key) => ({
          taskKey: key,
          title: key,
          started: 0,
          completed: 0,
          skipped: 0,
          completionRate: 0,
          dropOffFromPrevious: 0,
        })),
        dropOffPoints: [],
      })
    }

    // Query tasks for these cases, grouped by task_key and status
    // Supabase JS doesn't support GROUP BY, so fetch raw and aggregate in-memory
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('task_key, title, status')
      .in('case_id', caseIds)
      .in('task_key', orderedTaskKeys)

    if (tasksError) {
      return NextResponse.json(
        { error: 'Failed to query tasks', details: tasksError.message },
        { status: 500 }
      )
    }

    // Aggregate by task_key
    const aggregated = new Map<
      string,
      { title: string; started: number; completed: number; skipped: number }
    >()

    for (const task of tasks ?? []) {
      const existing = aggregated.get(task.task_key) ?? {
        title: task.title,
        started: 0,
        completed: 0,
        skipped: 0,
      }

      // "started" = any status except 'locked'
      if (task.status !== 'locked') {
        existing.started++
      }
      if (task.status === 'completed') {
        existing.completed++
      }
      if (task.status === 'skipped') {
        existing.skipped++
      }

      aggregated.set(task.task_key, existing)
    }

    // Build funnel in workflow order
    const funnel: FunnelStep[] = []
    let previousStarted = totalCases // first step baseline is total cases

    for (const taskKey of orderedTaskKeys) {
      const data = aggregated.get(taskKey)
      const started = data?.started ?? 0
      const completed = data?.completed ?? 0
      const skipped = data?.skipped ?? 0
      const completionRate = started > 0 ? Math.round((completed / started) * 100) : 0

      const dropOffFromPrevious =
        previousStarted > 0
          ? Math.round(((previousStarted - started) / previousStarted) * 100)
          : 0

      funnel.push({
        taskKey,
        title: data?.title ?? taskKey,
        started,
        completed,
        skipped,
        completionRate,
        dropOffFromPrevious,
      })

      previousStarted = started
    }

    // Identify drop-off points (>20% drop from previous step)
    const dropOffPoints: DropOffPoint[] = funnel
      .filter((step) => step.dropOffFromPrevious > 20)
      .map((step) => ({
        taskKey: step.taskKey,
        title: step.title,
        dropOff: step.dropOffFromPrevious,
      }))

    return NextResponse.json({
      disputeType,
      totalCases,
      period: { days },
      funnel,
      dropOffPoints,
    })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
