import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { getMilestoneByID, getTasksToSkip } from '@/lib/rules/milestones'
import type { DisputeType } from '@/lib/rules/court-recommendation'

const importSchema = z.object({
  milestone: z.string().min(1),
  disputeType: z.string().min(1),
  catchUp: z
    .object({
      caseNumber: z.string().optional().default(''),
      opposingParty: z.string().optional().default(''),
      filingDate: z.string().optional().default(''),
      serviceDate: z.string().optional().default(''),
      upcomingDeadlineLabel: z.string().optional().default(''),
      upcomingDeadlineDate: z.string().optional().default(''),
    })
    .optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase } = auth

    // 1. Verify case ownership via RLS
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('id')
      .eq('id', id)
      .single()

    if (caseError || !caseData) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      )
    }

    // 2. Parse & validate request body
    const body = await request.json()
    const parsed = importSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 422 }
      )
    }

    const { milestone: milestoneId, disputeType, catchUp } = parsed.data

    // 3. Look up milestone definition
    const milestone = getMilestoneByID(
      disputeType as DisputeType,
      milestoneId
    )

    if (!milestone) {
      return NextResponse.json(
        { error: 'Unknown milestone', details: `Milestone "${milestoneId}" not found for dispute type "${disputeType}"` },
        { status: 422 }
      )
    }

    // 4. Get tasks to skip
    const tasksToSkip = getTasksToSkip(
      disputeType as DisputeType,
      milestoneId
    )

    const { firstUnlockedTask } = milestone

    // 5. Bulk update: skip prior tasks
    let tasksSkipped = 0
    if (tasksToSkip.length > 0) {
      const { data: skippedRows, error: skipError } = await supabase
        .from('tasks')
        .update({ status: 'skipped' })
        .eq('case_id', id)
        .in('task_key', tasksToSkip)
        .in('status', ['locked', 'todo'])
        .select('id')

      if (skipError) {
        return NextResponse.json(
          { error: 'Failed to skip tasks', details: skipError.message },
          { status: 500 }
        )
      }

      tasksSkipped = skippedRows?.length ?? 0
    }

    // 6. Unlock the milestone task
    const { error: unlockError } = await supabase
      .from('tasks')
      .update({
        status: 'todo',
        unlocked_at: new Date().toISOString(),
      })
      .eq('case_id', id)
      .eq('task_key', firstUnlockedTask)
      .eq('status', 'locked')

    if (unlockError) {
      return NextResponse.json(
        { error: 'Failed to unlock milestone task', details: unlockError.message },
        { status: 500 }
      )
    }

    // 7. Write task_events entry
    await supabase.from('task_events').insert({
      case_id: id,
      kind: 'bulk_import_skip',
      payload: {
        milestone: milestoneId,
        disputeType,
        tasksSkipped,
        firstUnlockedTask,
        catchUp: catchUp ?? null,
      },
    })

    // 8. If catch-up has a deadline (label + date), create a deadline row
    if (catchUp?.upcomingDeadlineLabel && catchUp?.upcomingDeadlineDate) {
      const { error: deadlineError } = await supabase
        .from('deadlines')
        .insert({
          case_id: id,
          key: catchUp.upcomingDeadlineLabel,
          due_at: catchUp.upcomingDeadlineDate,
          source: 'import',
          rationale: `Imported during mid-litigation onboarding at milestone "${milestone.label}"`,
        })

      if (deadlineError) {
        // Non-fatal: the import succeeded, just log the deadline failure
        console.error('Failed to create imported deadline:', deadlineError.message)
      }
    }

    // 9. Return success response
    return NextResponse.json({
      success: true,
      tasksSkipped,
      firstUnlockedTask,
    })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
