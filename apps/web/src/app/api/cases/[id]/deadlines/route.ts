import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { createDeadlineSchema } from '@lawyer-free/shared/schemas/deadline'
import { calculateSol } from '@lawyer-free/shared/rules/statute-of-limitations'
import { calculateAppealDeadline } from '@lawyer-free/shared/rules/appeal-deadline'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase } = auth

    const body = await request.json()
    const parsed = createDeadlineSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 422 }
      )
    }

    const { key, due_at, source, rationale } = parsed.data

    // Verify case exists (RLS handles ownership); fetch state + dispute_type for auto-calculations
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('id, state, dispute_type')
      .eq('id', id)
      .single()

    if (caseError || !caseData) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      )
    }

    // Insert the deadline
    const { data: deadline, error: deadlineError } = await supabase
      .from('deadlines')
      .insert({
        case_id: id,
        key,
        due_at,
        source,
        rationale,
      })
      .select()
      .single()

    if (deadlineError) {
      return NextResponse.json(
        { error: 'Failed to create deadline', details: deadlineError.message },
        { status: 500 }
      )
    }

    // Special key: incident_date — store on case + auto-create SOL warning deadline
    if (key === 'incident_date') {
      const incidentDate = new Date(due_at).toISOString().slice(0, 10)
      await supabase.from('cases').update({ incident_date: incidentDate }).eq('id', id)

      if (caseData.dispute_type) {
        const sol = calculateSol(caseData.state ?? 'TX', caseData.dispute_type, null, incidentDate)
        if (sol.expiresAt && sol.years !== null) {
          await supabase.from('deadlines').upsert({
            case_id: id,
            key: 'sol_warning',
            label: `Statute of Limitations (${sol.years}-year)`,
            due_at: sol.expiresAt.toISOString(),
            source: 'system',
            rationale: sol.notes ?? `${sol.years}-year statute of limitations based on ${caseData.dispute_type} in ${caseData.state ?? 'TX'}.`,
            consequence: 'Filing after this date may permanently bar your claims.',
            auto_generated: true,
          }, { onConflict: 'case_id,key' })
        }
      }
    }

    // Special key: judgment_entered — auto-create appeal deadline
    if (key === 'judgment_entered') {
      const appealDate = calculateAppealDeadline(due_at, caseData.state ?? 'TX')
      await supabase.from('deadlines').upsert({
        case_id: id,
        key: 'appeal_deadline',
        label: 'Notice of Appeal Deadline',
        due_at: appealDate.toISOString(),
        source: 'system',
        rationale: 'Appeal deadline calculated from judgment date.',
        consequence: 'Missing this deadline forfeits your right to appeal. Courts rarely grant extensions.',
        auto_generated: true,
      }, { onConflict: 'case_id,key' })
    }

    // Auto-create reminders at -7d, -3d, -1d from due_at (skip if in the past)
    const dueDate = new Date(due_at)
    const now = new Date()
    const reminderOffsets = [
      { days: 7, label: '7d before' },
      { days: 3, label: '3d before' },
      { days: 1, label: '1d before' },
    ]

    const remindersToInsert = reminderOffsets
      .map(({ days }) => {
        const sendAt = new Date(dueDate.getTime() - days * 24 * 60 * 60 * 1000)
        return { send_at: sendAt }
      })
      .filter(({ send_at }) => send_at > now)
      .map(({ send_at }) => ({
        case_id: id,
        deadline_id: deadline.id,
        channel: 'email' as const,
        send_at: send_at.toISOString(),
        status: 'scheduled' as const,
      }))

    let reminders: unknown[] = []
    if (remindersToInsert.length > 0) {
      const { data: createdReminders, error: remindersError } = await supabase
        .from('reminders')
        .insert(remindersToInsert)
        .select()

      if (remindersError) {
        // Non-fatal: deadline was created, just log the reminder failure
        console.error('Failed to create reminders:', remindersError.message)
      } else {
        reminders = createdReminders || []
      }
    }

    // Write timeline event
    await supabase.from('task_events').insert({
      case_id: id,
      kind: 'deadline_created',
      payload: {
        deadline_id: deadline.id,
        key,
        due_at,
        source,
        reminders_created: reminders.length,
      },
    })

    // Fetch the created reminders for the response
    const { data: fetchedReminders } = await supabase
      .from('reminders')
      .select()
      .eq('deadline_id', deadline.id)
      .order('send_at', { ascending: true })

    return NextResponse.json(
      { deadline, reminders: fetchedReminders || [] },
      { status: 201 }
    )
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase } = auth

    // Fetch deadlines with their reminders, ordered by due_at asc
    const { data: deadlines, error } = await supabase
      .from('deadlines')
      .select('*, reminders(*)')
      .eq('case_id', id)
      .order('due_at', { ascending: true })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch deadlines', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ deadlines: deadlines || [] })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
