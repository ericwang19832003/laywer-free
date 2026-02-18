import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { confirmAnswerDeadlineSchema } from '@/lib/schemas/deadline'
import { calculateReminderDates } from '@/lib/rules/reminders'
import { runAndApplyGatekeeper } from '@/lib/rules/apply-gatekeeper'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const { supabase, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    const body = await request.json()
    const parsed = confirmAnswerDeadlineSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 422 }
      )
    }

    const { confirmed_due_at } = parsed.data

    // Verify case exists (RLS handles ownership)
    const { data: caseData, error: caseError } = await supabase!
      .from('cases')
      .select('id')
      .eq('id', caseId)
      .single()

    if (caseError || !caseData) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      )
    }

    // Delete existing answer deadline rows (estimated + any previous confirmed).
    // FK cascade on reminders table deletes associated reminders automatically.
    await supabase!
      .from('deadlines')
      .delete()
      .eq('case_id', caseId)
      .in('key', ['answer_deadline_estimated', 'answer_deadline_confirmed'])

    // Insert confirmed answer deadline
    const { data: deadline, error: dlError } = await supabase!
      .from('deadlines')
      .insert({
        case_id: caseId,
        key: 'answer_deadline_confirmed',
        due_at: confirmed_due_at,
        source: 'user_confirmed',
        rationale:
          'Exact answer deadline confirmed by user from their citation.',
      })
      .select()
      .single()

    if (dlError || !deadline) {
      return NextResponse.json(
        { error: 'Failed to create deadline', details: dlError?.message },
        { status: 500 }
      )
    }

    // Create reminders at -7d, -3d, -1d (only future dates)
    const reminderDates = calculateReminderDates(confirmed_due_at)
    let reminders: unknown[] = []

    if (reminderDates.length > 0) {
      const remindersToInsert = reminderDates.map((sendAt) => ({
        case_id: caseId,
        deadline_id: deadline.id,
        channel: 'email' as const,
        send_at: sendAt.toISOString(),
        status: 'scheduled' as const,
      }))

      const { data: createdReminders, error: remErr } = await supabase!
        .from('reminders')
        .insert(remindersToInsert)
        .select()

      if (remErr) {
        console.error('Failed to create reminders:', remErr.message)
      } else {
        reminders = createdReminders || []
      }
    }

    // Write timeline event
    await supabase!.from('task_events').insert({
      case_id: caseId,
      kind: 'answer_deadline_confirmed',
      payload: {
        deadline_id: deadline.id,
        confirmed_due_at,
        reminders_created: reminders.length,
      },
    })

    // Run gatekeeper to unlock wait_for_answer immediately
    await runAndApplyGatekeeper(supabase!, caseId)

    return NextResponse.json(
      { deadline, reminders },
      { status: 201 }
    )
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
