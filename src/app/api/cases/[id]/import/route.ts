import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { getMilestoneByID, getTasksToSkip } from '@/lib/rules/milestones'
import type { DisputeType } from '@/lib/rules/court-recommendation'
import { seedDeadlinesFromDates } from '@/lib/rules/deadline-generator'
import { insertDeadlineWithReminders } from '@/lib/rules/insert-deadlines'

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

    // 1. Verify case ownership via RLS and get dispute_type from DB
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('id, dispute_type')
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

    const { milestone: milestoneId, catchUp } = parsed.data
    // Use the case's actual dispute_type from DB, not the request body
    const disputeType = (caseData.dispute_type ?? parsed.data.disputeType) as string

    // For family cases, look up sub-type to get correct milestones
    let familySubType: string | undefined
    if (disputeType === 'family') {
      const { data: familyDetails } = await supabase
        .from('family_case_details')
        .select('family_sub_type')
        .eq('case_id', id)
        .maybeSingle()
      familySubType = familyDetails?.family_sub_type ?? undefined
    }

    // For business cases, look up sub-type to get correct milestones
    let businessSubType: string | undefined
    if (disputeType === 'business') {
      const { data: bizDetails } = await supabase
        .from('business_details')
        .select('business_sub_type')
        .eq('case_id', id)
        .maybeSingle()
      businessSubType = bizDetails?.business_sub_type ?? undefined
    }

    // 3. Look up milestone definition
    const milestone = getMilestoneByID(
      disputeType as DisputeType,
      milestoneId,
      familySubType,
      businessSubType
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
      milestoneId,
      familySubType,
      businessSubType
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

    // 7. Persist catch-up data on the welcome task's metadata for later access
    if (catchUp) {
      const catchUpMeta: Record<string, unknown> = {}
      if (catchUp.caseNumber) catchUpMeta.case_number = catchUp.caseNumber
      if (catchUp.opposingParty) catchUpMeta.opposing_party = catchUp.opposingParty
      if (catchUp.filingDate) catchUpMeta.filing_date = catchUp.filingDate
      if (catchUp.serviceDate) catchUpMeta.service_date = catchUp.serviceDate

      if (Object.keys(catchUpMeta).length > 0) {
        await supabase
          .from('tasks')
          .update({ metadata: catchUpMeta })
          .eq('case_id', id)
          .eq('task_key', 'welcome')
      }
    }

    // 8. Write audit event
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

    // 9. If catch-up has a deadline (label + date), create a deadline row
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

    // 10. Seed deadlines from filing/service dates provided during import
    let deadlinesCreated = 0
    if (catchUp?.filingDate || catchUp?.serviceDate) {
      // Fetch existing deadline keys for deduplication
      const { data: existingDeadlines } = await supabase
        .from('deadlines')
        .select('key')
        .eq('case_id', id)

      const existingKeys = (existingDeadlines ?? []).map(
        (d: { key: string }) => d.key
      )

      const seeded = seedDeadlinesFromDates({
        caseId: id,
        disputeType,
        businessSubType: businessSubType,
        filingDate: catchUp.filingDate || undefined,
        serviceDate: catchUp.serviceDate || undefined,
        existingDeadlineKeys: existingKeys,
      })

      for (const deadline of seeded) {
        const insertedId = await insertDeadlineWithReminders(
          supabase,
          deadline,
          { triggerSource: `import:${milestoneId}` }
        )
        if (insertedId) deadlinesCreated++
      }
    }

    // 11. Return success response
    return NextResponse.json({
      success: true,
      tasksSkipped,
      firstUnlockedTask,
      deadlinesCreated,
    })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
